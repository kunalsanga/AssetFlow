import sys
from datetime import datetime, date
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.asset import Asset, AssetStatus
from app.models.maintenance_request import MaintenanceRequest
from app import crud, schemas

def run_verification():
    db = SessionLocal()
    try:
        print("Starting programatic verification of Maintenance Management business rules...")
        
        # 1. Setup clean assets and users for test
        test_user = db.query(User).filter(User.email == "maint_user@example.com").first()
        if not test_user:
            test_user = User(email="maint_user@example.com", hashed_password="pw", full_name="Maintenance Employee", role=UserRole.EMPLOYEE)
            db.add(test_user)
            
        test_manager = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not test_manager:
            test_manager = User(email="maint_mgr@example.com", hashed_password="pw", full_name="Maintenance Manager", role=UserRole.ADMIN)
            db.add(test_manager)
            
        db.commit()
        db.refresh(test_user)
        
        # Create test asset
        asset_sn = f"MAINT-SN-{int(datetime.utcnow().timestamp())}"
        test_asset = Asset(name="Laser Printer", serial_number=asset_sn, model="HP Laserjet", status=AssetStatus.available)
        db.add(test_asset)
        db.commit()
        db.refresh(test_asset)
        
        print(f"Created test asset ID {test_asset.id} with Serial Number {test_asset.serial_number}.")

        # 2. Test Rule: Raise maintenance request (starts as PENDING, asset available)
        req_in = schemas.MaintenanceRequestCreate(
            asset_id=test_asset.id,
            description="Paper jam and scanning light defective.",
            priority="MEDIUM"
        )
        maint_req = crud.maintenance_request.create_request(db, obj_in=req_in, requester_id=test_user.id)
        assert maint_req is not None, "Failed to create maintenance request!"
        assert maint_req.status == "PENDING", f"Expected PENDING status, got {maint_req.status}"
        
        db.refresh(test_asset)
        assert test_asset.status == AssetStatus.available, f"Asset status should remain available, got {test_asset.status}"
        print("Rule 1 Check Passed: Request raised. Status is PENDING, asset is AVAILABLE.")

        # 3. Test Rule: Approve request (sets request to APPROVED, asset to UNDER_MAINTENANCE)
        approved = crud.maintenance_request.approve_request(db, db_obj=maint_req)
        assert approved.status == "APPROVED", f"Expected APPROVED, got {approved.status}"
        
        db.refresh(test_asset)
        assert test_asset.status == AssetStatus.under_maintenance, f"Asset status should transition to UNDER_MAINTENANCE, got {test_asset.status}"
        print("Rule 2 Check Passed: Request approved. Status is APPROVED, asset transitions to UNDER_MAINTENANCE.")

        # 4. Test Rule: Assign technician schedule (sets status to ASSIGNED)
        today_date = date.today()
        assigned = crud.maintenance_request.assign_technician(db, db_obj=maint_req, scheduled_date=today_date, technician_name="R. Varma")
        assert assigned.status == "ASSIGNED", f"Expected ASSIGNED, got {assigned.status}"
        assert assigned.scheduled_date == today_date, "Scheduled date not matching!"
        assert assigned.technician_name == "R. Varma", "Technician name not matching!"
        print("Rule 3 Check Passed: Technician assigned. Status is ASSIGNED, scheduled date and technician logged.")

        # 4.5. Test Rule: Start work (sets status to IN_PROGRESS)
        in_progress = crud.maintenance_request.start_work(db, db_obj=maint_req)
        assert in_progress.status == "IN_PROGRESS", f"Expected IN_PROGRESS, got {in_progress.status}"
        print("Rule 3.5 Check Passed: Work started. Status is IN_PROGRESS.")

        # 5. Test Rule: Resolve request (sets request to RESOLVED, asset back to AVAILABLE)
        resolved = crud.maintenance_request.resolve_request(db, db_obj=maint_req, resolution_condition="AVAILABLE")
        assert resolved.status == "RESOLVED", f"Expected RESOLVED, got {resolved.status}"
        
        db.refresh(test_asset)
        assert test_asset.status == AssetStatus.available, f"Asset status should revert to AVAILABLE, got {test_asset.status}"
        print("Rule 4 Check Passed: Request resolved. Status is RESOLVED, asset reverts to AVAILABLE.")

        # Clean up test data
        db.delete(maint_req)
        db.delete(test_asset)
        db.commit()
        print("Test data cleaned up successfully.")
        print("All Maintenance Management verification checks PASSED successfully!")
        
    except Exception as e:
        print(f"Verification Failed with error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_verification()

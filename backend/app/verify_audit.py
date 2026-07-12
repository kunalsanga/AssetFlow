import sys
from datetime import datetime, date
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.asset import Asset, AssetStatus
from app.models.audit import AuditCycle, AuditCycleStatus, AuditItem, AuditItemStatus
from app.models.activity_log import ActivityLog
from app.models.maintenance_request import MaintenanceRequest
from app import crud, schemas

def run_verification():
    db = SessionLocal()
    try:
        print("Starting programatic verification of Asset Audit business rules...")
        
        # 1. Setup clean assets and users for test
        test_user = db.query(User).filter(User.email == "audit_user@example.com").first()
        if not test_user:
            test_user = User(email="audit_user@example.com", hashed_password="pw", full_name="Auditor Employee", role=UserRole.employee)
            db.add(test_user)
            
        test_manager = db.query(User).filter(User.role == UserRole.admin).first()
        if not test_manager:
            test_manager = User(email="audit_mgr@example.com", hashed_password="pw", full_name="Audit Manager", role=UserRole.admin)
            db.add(test_manager)
            
        db.commit()
        db.refresh(test_user)
        
        # Create test assets
        asset_sn1 = f"AUD-SN-1-{int(datetime.utcnow().timestamp())}"
        asset_sn2 = f"AUD-SN-2-{int(datetime.utcnow().timestamp())}"
        asset_sn3 = f"AUD-SN-3-{int(datetime.utcnow().timestamp())}"
        
        test_asset1 = Asset(name="Monitor A", serial_number=asset_sn1, model="Dell UltraSharp", status=AssetStatus.available)
        test_asset2 = Asset(name="Keychron K2 Keyboard", serial_number=asset_sn2, model="Keychron Mechanical", status=AssetStatus.available)
        test_asset3 = Asset(name="Whiteboard", serial_number=asset_sn3, model="Standard Office Whiteboard", status=AssetStatus.available)
        
        db.add(test_asset1)
        db.add(test_asset2)
        db.add(test_asset3)
        db.commit()
        db.refresh(test_asset1)
        db.refresh(test_asset2)
        db.refresh(test_asset3)
        
        print("Created test assets for auditing.")

        # 2. Create Audit Cycle
        cycle_in = schemas.AuditCycleCreate(
            name="Q4 2026 Verification",
            start_date=date.today(),
            auditor_id=test_user.id
        )
        cycle = crud.audit.create_cycle(db, obj_in=cycle_in)
        assert cycle is not None, "Failed to create audit cycle!"
        assert cycle.status == AuditCycleStatus.planned, f"Expected PLANNED, got {cycle.status}"
        print("Rule 1 Check Passed: Audit Cycle created with status PLANNED.")

        # Verify items were automatically populated for all assets in system
        items = db.query(AuditItem).filter(AuditItem.cycle_id == cycle.id).all()
        assert len(items) >= 3, f"Expected at least 3 audit items in cycle, got {len(items)}"
        print(f"Rule 2 Check Passed: Audit items automatically populated for {len(items)} assets.")

        # 3. Verify specific items
        # Find item for asset1, asset2, asset3
        item1 = next(i for i in items if i.asset_id == test_asset1.id)
        item2 = next(i for i in items if i.asset_id == test_asset2.id)
        item3 = next(i for i in items if i.asset_id == test_asset3.id)

        # Mark item1 as VERIFIED
        update1 = schemas.AuditItemUpdate(status=AuditItemStatus.verified, notes="Asset is in perfect shape.")
        updated_item1 = crud.audit.update_item(db, item_id=item1.id, obj_in=update1)
        assert updated_item1.status == AuditItemStatus.verified, "Status update failed for VERIFIED"
        assert updated_item1.verified_at is not None, "Expected verified_at timestamp to be logged"
        print("Rule 3 Check Passed: Item marked VERIFIED, verified_at timestamp logged.")

        # Mark item2 as MISSING
        update2 = schemas.AuditItemUpdate(status=AuditItemStatus.missing, notes="Asset not present at desk.")
        updated_item2 = crud.audit.update_item(db, item_id=item2.id, obj_in=update2)
        assert updated_item2.status == AuditItemStatus.missing, "Status update failed for MISSING"
        print("Rule 4 Check Passed: Item marked MISSING.")

        # Mark item3 as DAMAGED
        update3 = schemas.AuditItemUpdate(status=AuditItemStatus.damaged, notes="Leg broken, stands unstable.")
        updated_item3 = crud.audit.update_item(db, item_id=item3.id, obj_in=update3)
        assert updated_item3.status == AuditItemStatus.damaged, "Status update failed for DAMAGED"
        print("Rule 5 Check Passed: Item marked DAMAGED.")

        # 4. Close cycle and verify discrepancies are processed
        closed_cycle = crud.audit.close_cycle(db, cycle_id=cycle.id, resolver_id=test_manager.id)
        assert closed_cycle.status == AuditCycleStatus.closed, f"Expected status CLOSED, got {closed_cycle.status}"
        assert closed_cycle.end_date == date.today(), "End date not populated on closure!"
        print("Rule 6 Check Passed: Audit Cycle closed and locked.")

        # Verify discrepancy processing:
        # Asset 1 (Verified) should still be available
        db.refresh(test_asset1)
        assert test_asset1.status == AssetStatus.available, f"Verified asset should remain available, got {test_asset1.status}"
        
        # Asset 2 (Missing) should now be LOST
        db.refresh(test_asset2)
        assert test_asset2.status == AssetStatus.lost, f"Missing asset status should update to LOST, got {test_asset2.status}"
        print("Rule 7 Check Passed: Missing asset automatically transitioned status to LOST.")

        # Asset 3 (Damaged) should now be UNDER_MAINTENANCE
        db.refresh(test_asset3)
        assert test_asset3.status == AssetStatus.under_maintenance, f"Damaged asset status should update to UNDER_MAINTENANCE, got {test_asset3.status}"
        
        # And a MaintenanceRequest should be auto-raised for Asset 3
        maint_req = db.query(MaintenanceRequest).filter(MaintenanceRequest.asset_id == test_asset3.id).first()
        assert maint_req is not None, "Failed to auto-generate maintenance request for damaged item!"
        assert maint_req.status == "PENDING", "Auto-generated maintenance should start as PENDING"
        assert "stands unstable" in maint_req.description, "Discrepancy notes not carried over to maintenance request!"
        print("Rule 8 Check Passed: Damaged asset transitioned to UNDER_MAINTENANCE and auto-generated pending maintenance request.")

        # 5. Lock check: Attempting to edit closed cycle items should fail
        try:
            crud.audit.update_item(db, item_id=item1.id, obj_in=update1)
            assert False, "Verification locking check failed: Allowed edits in closed audit cycle!"
        except ValueError as e:
            assert "closed audit cycle" in str(e), f"Unexpected exception: {e}"
            print("Rule 9 Check Passed: Locked state verified. Edits blocked in closed audit cycles.")

        # 6. Verify activity logs
        logs = db.query(ActivityLog).filter(ActivityLog.type == "AUDIT_CYCLE").all()
        assert len(logs) >= 2, f"Expected at least 2 audit cycle logs, got {len(logs)}"
        print("Rule 10 Check Passed: Audit Cycle actions correctly populated in ActivityLog.")

        # Clean up test data
        db.delete(maint_req)
        for item in items:
            db.delete(item)
        db.delete(cycle)
        db.delete(test_asset1)
        db.delete(test_asset2)
        db.delete(test_asset3)
        
        # Delete activity logs
        for log in logs:
            db.delete(log)
            
        db.commit()
        print("Test data cleaned up successfully.")
        print("All Asset Audit verification checks PASSED successfully!")
        
    except Exception as e:
        print(f"Verification Failed with error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_verification()

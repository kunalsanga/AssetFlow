import sys
from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.asset import Asset, AssetStatus
from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.transfer import TransferRequest, TransferRequestStatus
from app import crud, schemas

def run_verification():
    db = SessionLocal()
    try:
        print("Starting programatic verification of Asset Allocation business rules...")
        
        # 1. Setup clean assets and users for test
        test_user1 = db.query(User).filter(User.email == "test_user1@example.com").first()
        if not test_user1:
            test_user1 = User(email="test_user1@example.com", hashed_password="pw", full_name="User One", role=UserRole.EMPLOYEE)
            db.add(test_user1)
        
        test_user2 = db.query(User).filter(User.email == "test_user2@example.com").first()
        if not test_user2:
            test_user2 = User(email="test_user2@example.com", hashed_password="pw", full_name="User Two", role=UserRole.EMPLOYEE)
            db.add(test_user2)
            
        test_manager = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not test_manager:
            test_manager = User(email="test_mgr@example.com", hashed_password="pw", full_name="Test Manager", role=UserRole.ADMIN)
            db.add(test_manager)
            
        db.commit()
        db.refresh(test_user1)
        db.refresh(test_user2)
        db.refresh(test_manager)
        
        # Create test asset
        asset_sn = f"TEST-SN-{int(datetime.utcnow().timestamp())}"
        test_asset = Asset(name="Verification Macbook", serial_number=asset_sn, model="Apple MBP", status=AssetStatus.available)
        db.add(test_asset)
        db.commit()
        db.refresh(test_asset)
        
        print(f"Created test asset ID {test_asset.id} with Serial Number {test_asset.serial_number}.")

        # 2. Test Rule: Allocate asset and prevent double allocation
        alloc_in = schemas.AllocationCreate(
            asset_id=test_asset.id,
            allocated_to_type=AllocationToType.user,
            allocated_to_id=test_user1.id,
            due_date=datetime.utcnow() + timedelta(days=5)
        )
        
        alloc1 = crud.allocation.create_allocation(db, obj_in=alloc_in, allocated_by_id=test_manager.id)
        assert alloc1 is not None, "Failed to create first allocation!"
        print(f"Rule 1 Check Passed: Successfully allocated asset to User One.")
        
        # Verify asset status is 'allocated'
        db.refresh(test_asset)
        assert test_asset.status == AssetStatus.allocated, f"Expected status allocated, got {test_asset.status}"
        print("Rule 2 Check Passed: Asset status correctly set to 'allocated'.")

        # Try to allocate again
        alloc2 = crud.allocation.create_allocation(db, obj_in=alloc_in, allocated_by_id=test_manager.id)
        assert alloc2 is None, "Double allocation check failed: allowed second allocation!"
        print("Rule 3 Check Passed: Double allocation request correctly blocked.")

        # 3. Test Transfer Request Flow
        transfer_in = schemas.TransferRequestCreate(
            allocation_id=alloc1.id,
            target_type="user",
            target_id=test_user2.id
        )
        
        transfer_req = crud.transfer_request.create_transfer(db, obj_in=transfer_in, requested_by_id=test_user1.id)
        assert transfer_req is not None, "Failed to create transfer request!"
        assert transfer_req.status == TransferRequestStatus.pending, "Transfer request should start as pending"
        print("Rule 4 Check Passed: Transfer request raised successfully with pending status.")

        # Approve Transfer Request
        new_alloc = crud.transfer_request.approve_transfer(db, transfer_req=transfer_req, resolved_by_id=test_manager.id)
        assert new_alloc is not None, "Failed to approve transfer request!"
        
        # Verify old allocation is marked as transferred
        db.refresh(alloc1)
        assert alloc1.status == AllocationStatus.transferred, "Old allocation status should be transferred"
        assert alloc1.returned_at is not None, "Old allocation returned_at should be populated"
        
        # Verify new allocation is active
        assert new_alloc.status == AllocationStatus.active, "New allocation status should be active"
        assert new_alloc.allocated_to_id == test_user2.id, "New allocation should be assigned to User Two"
        print("Rule 5 Check Passed: Transfer request approved. Old allocation transferred, new allocation active.")

        # 4. Test Return Asset Flow
        resolved_alloc = crud.allocation.return_allocation(db, db_obj=new_alloc, return_condition="Perfect Condition")
        assert resolved_alloc.status == AllocationStatus.returned, "Allocation status should be returned"
        
        # Verify asset status is available again
        db.refresh(test_asset)
        assert test_asset.status == AssetStatus.available, f"Expected status available, got {test_asset.status}"
        print("Rule 6 Check Passed: Return asset resolved. Asset status is 'available' again.")
        
        # Clean up test data
        db.delete(transfer_req)
        db.delete(alloc1)
        db.delete(resolved_alloc)
        db.delete(test_asset)
        db.commit()
        print("Test data cleaned up successfully.")
        print("All verification checks PASSED successfully!")
        
    except Exception as e:
        print(f"Verification Failed with error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_verification()

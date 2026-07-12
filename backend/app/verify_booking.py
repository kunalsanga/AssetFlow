import sys
from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.asset import Asset, AssetStatus
from app.models.booking import ResourceBooking
from app import crud, schemas

def run_verification():
    db = SessionLocal()
    try:
        print("Starting programatic verification of Resource Booking business rules...")
        
        # 1. Setup clean assets and users for test
        test_user = db.query(User).filter(User.email == "booking_user@example.com").first()
        if not test_user:
            test_user = User(email="booking_user@example.com", hashed_password="pw", full_name="Booking Employee", role=UserRole.EMPLOYEE)
            db.add(test_user)
            
        test_manager = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not test_manager:
            test_manager = User(email="booking_mgr@example.com", hashed_password="pw", full_name="Booking Manager", role=UserRole.ADMIN)
            db.add(test_manager)
            
        db.commit()
        db.refresh(test_user)
        
        # Create test asset
        asset_sn = f"BOOK-SN-{int(datetime.utcnow().timestamp())}"
        test_asset = Asset(name="Conference Room A", serial_number=asset_sn, model="Conference Pod", status=AssetStatus.available, is_shared=True)
        db.add(test_asset)
        db.commit()
        db.refresh(test_asset)
        
        print(f"Created test shared asset ID {test_asset.id} with Serial Number {test_asset.serial_number}.")

        # 2. Test Rule: Book slot and check overlap
        now = datetime.utcnow()
        base_start = now + timedelta(days=1)
        base_start = base_start.replace(hour=10, minute=0, second=0, microsecond=0)
        base_end = base_start + timedelta(hours=2) # 10:00 - 12:00
        
        booking_in = schemas.BookingCreate(
            asset_id=test_asset.id,
            start_time=base_start,
            end_time=base_end
        )
        
        booking1 = crud.booking.create_booking(db, obj_in=booking_in, user_id=test_user.id)
        assert booking1 is not None, "Failed to create first booking!"
        print(f"Rule 1 Check Passed: Successfully booked 10:00 - 12:00.")

        # Test overlap: 11:00 - 13:00 (should fail)
        overlap_in = schemas.BookingCreate(
            asset_id=test_asset.id,
            start_time=base_start + timedelta(hours=1),
            end_time=base_end + timedelta(hours=1)
        )
        booking_fail1 = crud.booking.create_booking(db, obj_in=overlap_in, user_id=test_user.id)
        assert booking_fail1 is None, "Failed: Overlap check allowed 11:00 - 13:00!"
        print("Rule 2 Check Passed: Intersecting slot (11:00 - 13:00) blocked.")

        # Test overlap: 09:00 - 11:00 (should fail)
        overlap_in2 = schemas.BookingCreate(
            asset_id=test_asset.id,
            start_time=base_start - timedelta(hours=1),
            end_time=base_start + timedelta(hours=1)
        )
        booking_fail2 = crud.booking.create_booking(db, obj_in=overlap_in2, user_id=test_user.id)
        assert booking_fail2 is None, "Failed: Overlap check allowed 09:00 - 11:00!"
        print("Rule 3 Check Passed: Pre-intersecting slot (09:00 - 11:00) blocked.")

        # Test adjacent: 12:00 - 14:00 (should pass!)
        adjacent_in = schemas.BookingCreate(
            asset_id=test_asset.id,
            start_time=base_end,
            end_time=base_end + timedelta(hours=2)
        )
        booking2 = crud.booking.create_booking(db, obj_in=adjacent_in, user_id=test_user.id)
        assert booking2 is not None, "Failed adjacent slot booking (12:00 - 14:00)!"
        print("Rule 4 Check Passed: Adjacent slot (12:00 - 14:00) successfully booked.")

        # 3. Test Reschedule
        # Try to reschedule booking1 (10:00-12:00) to 11:00-13:00 (should fail due to overlap with booking2 at 12:00-14:00)
        rescheduled_fail = crud.booking.reschedule_booking(
            db, db_obj=booking1, start_time=base_start + timedelta(hours=1), end_time=base_end + timedelta(hours=1)
        )
        assert rescheduled_fail is None, "Failed: Allowed rescheduling into overlap!"
        print("Rule 5 Check Passed: Rescheduling into overlap blocked.")

        # Try to reschedule booking1 to 08:00-10:00 (should succeed since it is adjacent and free)
        rescheduled_ok = crud.booking.reschedule_booking(
            db, db_obj=booking1, start_time=base_start - timedelta(hours=2), end_time=base_start
        )
        assert rescheduled_ok is not None, "Failed: Blocked rescheduling into valid free slot!"
        assert rescheduled_ok.start_time.hour == 8, "Expected rescheduled start time to be 8:00"
        print("Rule 6 Check Passed: Rescheduling to free slot (08:00 - 10:00) succeeded.")

        # 4. Test Cancel
        cancelled = crud.booking.cancel_booking(db, db_obj=booking2)
        assert cancelled.status == "CANCELLED", "Booking should be marked as CANCELLED!"
        print("Rule 7 Check Passed: Booking cancelled successfully.")

        # Try booking 12:00 - 14:00 again (should succeed since the previous is cancelled)
        booking3 = crud.booking.create_booking(db, obj_in=adjacent_in, user_id=test_user.id)
        assert booking3 is not None, "Failed: Overlap check blocked slot from cancelled booking!"
        print("Rule 8 Check Passed: Booked slot previously held by cancelled booking.")

        # Clean up test data
        db.delete(booking1)
        db.delete(booking3)
        db.delete(cancelled)
        db.delete(test_asset)
        db.commit()
        print("Test data cleaned up successfully.")
        print("All Resource Booking verification checks PASSED successfully!")
        
    except Exception as e:
        print(f"Verification Failed with error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_verification()

import pytest
from datetime import datetime, timedelta
from sqlalchemy.future import select
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.category import Category
from app.models.asset import Asset, AssetStatus
from app.models.booking import (
    BookableResource, ResourceBooking, BookingStatus, BookingHistory,
    BookingActivityLog, BookingAction, BookingNotification, NotificationType
)

@pytest.mark.asyncio
async def test_booking_schema_creation(db):
    # 1. Create prerequisites
    dept = Department(name="IT", code="IT01")
    cat = Category(name="Electronics", code="ELEC")
    user = User(email="test@example.com", full_name="Test User", hashed_password="pw", role=UserRole.EMPLOYEE, is_active=True)
    db.add_all([dept, cat, user])
    await db.commit()

    asset = Asset(
        asset_tag="AST-001", name="MacBook Pro", status=AssetStatus.available,
        department_id=dept.id, category_id=cat.id, is_shared=True
    )
    db.add(asset)
    await db.commit()

    # 2. Create BookableResource
    resource = BookableResource(asset_id=asset.id, is_bookable=True, capacity=1)
    db.add(resource)
    await db.commit()
    
    # 3. Create ResourceBooking
    start_t = datetime.utcnow() + timedelta(days=1)
    end_t = start_t + timedelta(hours=2)
    booking = ResourceBooking(
        resource_id=resource.id,
        user_id=user.id,
        start_time=start_t,
        end_time=end_t,
        purpose="Project meeting",
        status=BookingStatus.UPCOMING
    )
    db.add(booking)
    await db.commit()

    # 4. Create BookingHistory
    history = BookingHistory(
        booking_id=booking.id,
        original_start_time=start_t,
        original_end_time=end_t,
        final_status=BookingStatus.COMPLETED.value
    )
    db.add(history)
    
    # 5. Create BookingActivityLog
    log = BookingActivityLog(
        booking_id=booking.id,
        action_by=user.id,
        action_type=BookingAction.CREATED,
        new_values={"start_time": start_t.isoformat(), "end_time": end_t.isoformat()}
    )
    db.add(log)

    # 6. Create BookingNotification
    notification = BookingNotification(
        user_id=user.id,
        booking_id=booking.id,
        message="Booking confirmed",
        notification_type=NotificationType.CREATED
    )
    db.add(notification)
    await db.commit()

    # 7. Query and Assert
    result = await db.execute(select(BookableResource).where(BookableResource.id == resource.id))
    fetched_res = result.scalar_one()
    assert fetched_res.asset_id == asset.id

    result = await db.execute(select(ResourceBooking).where(ResourceBooking.id == booking.id))
    fetched_booking = result.scalar_one()
    assert fetched_booking.status == BookingStatus.UPCOMING
    
    result = await db.execute(select(BookingHistory).where(BookingHistory.booking_id == booking.id))
    fetched_history = result.scalar_one()
    assert fetched_history.final_status == "COMPLETED"

    result = await db.execute(select(BookingActivityLog).where(BookingActivityLog.booking_id == booking.id))
    fetched_log = result.scalar_one()
    assert fetched_log.action_type == BookingAction.CREATED
    assert "start_time" in fetched_log.new_values

    result = await db.execute(select(BookingNotification).where(BookingNotification.booking_id == booking.id))
    fetched_notif = result.scalar_one()
    assert fetched_notif.notification_type == NotificationType.CREATED
    assert fetched_notif.is_read is False

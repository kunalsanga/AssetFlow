from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base_class import Base

class BookingStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class BookingAction(str, enum.Enum):
    CREATED = "CREATED"
    RESCHEDULED = "RESCHEDULED"
    CANCELLED = "CANCELLED"

class NotificationType(str, enum.Enum):
    REMINDER = "REMINDER"
    CONFLICT = "CONFLICT"
    CANCELLED = "CANCELLED"
    CREATED = "CREATED"
    RESCHEDULED = "RESCHEDULED"

class BookableResource(Base):
    __tablename__ = "bookable_resources"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_bookable_resource_asset", ondelete="CASCADE"), nullable=False, unique=True)
    is_bookable = Column(Boolean, default=True, nullable=False)
    capacity = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    asset = relationship("Asset")

class ResourceBooking(Base):
    __tablename__ = "resource_bookings"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("bookable_resources.id", name="fk_resource_booking_resource", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_resource_booking_user", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(String, nullable=True)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.UPCOMING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    resource = relationship("BookableResource")
    user = relationship("User")

class BookingHistory(Base):
    __tablename__ = "booking_history"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("resource_bookings.id", name="fk_booking_history_booking", ondelete="CASCADE"), nullable=False)
    original_start_time = Column(DateTime, nullable=False)
    original_end_time = Column(DateTime, nullable=False)
    final_status = Column(String, nullable=False)
    archived_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    booking = relationship("ResourceBooking")

class BookingActivityLog(Base):
    __tablename__ = "booking_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("resource_bookings.id", name="fk_booking_activity_log_booking", ondelete="CASCADE"), nullable=False)
    action_by = Column(Integer, ForeignKey("users.id", name="fk_booking_activity_log_user", ondelete="SET NULL"), nullable=True)
    action_type = Column(SQLEnum(BookingAction), nullable=False)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    booking = relationship("ResourceBooking")
    user = relationship("User")

class BookingNotification(Base):
    __tablename__ = "booking_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_booking_notification_user", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("resource_bookings.id", name="fk_booking_notification_booking", ondelete="CASCADE"), nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    booking = relationship("ResourceBooking")

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_booking_asset"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_booking_user"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="UPCOMING", nullable=False)

    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    user = relationship("User", foreign_keys=[user_id])

from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingUpdate

class CRUDBooking(CRUDBase[Booking, BookingCreate, BookingUpdate]):
    def check_overlap(
        self, db: Session, *, asset_id: int, start_time: datetime, end_time: datetime, exclude_booking_id: Optional[int] = None
    ) -> bool:
        """
        Returns True if there is an overlapping booking for the asset.
        Overlapping condition: start_time < existing.end_time AND end_time > existing.start_time
        Adjacent bookings are allowed (where B.start == A.end).
        """
        query = db.query(Booking).filter(
            Booking.asset_id == asset_id,
            Booking.status != "CANCELLED",
            Booking.start_time < end_time,
            Booking.end_time > start_time
        )
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)
        
        return query.first() is not None

    def create_booking(self, db: Session, *, obj_in: BookingCreate, user_id: int) -> Optional[Booking]:
        # Check overlap
        if self.check_overlap(db, asset_id=obj_in.asset_id, start_time=obj_in.start_time, end_time=obj_in.end_time):
            return None
        
        db_obj = Booking(
            asset_id=obj_in.asset_id,
            user_id=user_id,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            status="UPCOMING"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def cancel_booking(self, db: Session, *, db_obj: Booking) -> Booking:
        db_obj.status = "CANCELLED"
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def reschedule_booking(
        self, db: Session, *, db_obj: Booking, start_time: datetime, end_time: datetime
    ) -> Optional[Booking]:
        # Check overlap (excluding the current booking)
        if self.check_overlap(db, asset_id=db_obj.asset_id, start_time=start_time, end_time=end_time, exclude_booking_id=db_obj.id):
            return None
        
        db_obj.start_time = start_time
        db_obj.end_time = end_time
        db_obj.status = "UPCOMING"
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

booking = CRUDBooking(Booking)

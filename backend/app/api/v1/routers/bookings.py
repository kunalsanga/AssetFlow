from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.BookingResponse])
def read_bookings(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve bookings. Filter according to user role (Employees only see their own)."""
    if current_user.role == models.UserRole.employee:
        bookings = db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()
    else:
        bookings = db.query(models.Booking).all()
    return bookings

@router.post("/", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_in: schemas.BookingCreate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Create a new booking. Validates overlap first."""
    # Check if asset exists and is available/shared
    asset = crud.asset.get(db, id=booking_in.asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found."
        )

    # Perform creation
    db_booking = crud.booking.create_booking(
        db, obj_in=booking_in, user_id=current_user.id
    )
    if not db_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking conflict: The requested time slot overlaps with an existing booking."
        )
    return db_booking

@router.post("/{id}/cancel", response_model=schemas.BookingResponse)
def cancel_booking(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Cancel a booking."""
    booking_obj = crud.booking.get(db, id=id)
    if not booking_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found."
        )
    
    # Access control: employees can only cancel their own bookings
    if current_user.role == models.UserRole.employee and booking_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to cancel this booking."
        )

    return crud.booking.cancel_booking(db, db_obj=booking_obj)

@router.post("/{id}/reschedule", response_model=schemas.BookingResponse)
def reschedule_booking(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    booking_in: schemas.BookingUpdate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Reschedule an existing booking to a new time slot."""
    booking_obj = crud.booking.get(db, id=id)
    if not booking_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found."
        )

    # Access control: employees can only reschedule their own bookings
    if current_user.role == models.UserRole.employee and booking_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to reschedule this booking."
        )

    if not booking_in.start_time or not booking_in.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time and end time are required for rescheduling."
        )

    rescheduled = crud.booking.reschedule_booking(
        db, db_obj=booking_obj, start_time=booking_in.start_time, end_time=booking_in.end_time
    )
    if not rescheduled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rescheduling conflict: The new time slot overlaps with an existing booking."
        )
    return rescheduled

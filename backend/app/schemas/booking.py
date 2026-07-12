from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.asset import Asset
from app.schemas.user import User

class BookingBase(BaseModel):
    asset_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = "UPCOMING"

class BookingCreate(BaseModel):
    asset_id: int
    start_time: datetime
    end_time: datetime

class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None

class BookingInDBBase(BookingBase):
    id: Optional[int] = None
    user_id: Optional[int] = None

    model_config = {"from_attributes": True}

class BookingResponse(BookingInDBBase):
    asset: Optional[Asset] = None
    user: Optional[User] = None

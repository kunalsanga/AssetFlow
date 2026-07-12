from typing import Optional
from datetime import date
from pydantic import BaseModel
from app.schemas.asset import Asset
from app.schemas.user import User

class MaintenanceRequestBase(BaseModel):
    asset_id: Optional[int] = None
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "PENDING"
    scheduled_date: Optional[date] = None
    technician_name: Optional[str] = None

class MaintenanceRequestCreate(BaseModel):
    asset_id: int
    description: str
    priority: Optional[str] = "MEDIUM"
    scheduled_date: Optional[date] = None
    technician_name: Optional[str] = None

class MaintenanceRequestUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    scheduled_date: Optional[date] = None
    description: Optional[str] = None
    technician_name: Optional[str] = None

class MaintenanceRequestInDBBase(MaintenanceRequestBase):
    id: Optional[int] = None
    requester_id: Optional[int] = None

    model_config = {"from_attributes": True}

class MaintenanceRequestResponse(MaintenanceRequestInDBBase):
    asset: Optional[Asset] = None
    requester: Optional[User] = None

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel
from app.models.allocation import AllocationToType, AllocationStatus
from app.schemas.asset import Asset
from app.schemas.user import User

# Shared properties
class AllocationBase(BaseModel):
    asset_id: Optional[int] = None
    allocated_to_type: Optional[AllocationToType] = None
    allocated_to_id: Optional[int] = None
    due_date: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    return_condition: Optional[str] = None
    status: Optional[AllocationStatus] = AllocationStatus.active

# Properties to receive via API on creation
class AllocationCreate(BaseModel):
    asset_id: int
    allocated_to_type: AllocationToType
    allocated_to_id: int
    due_date: datetime

# Properties to receive via API on update
class AllocationUpdate(BaseModel):
    pass

# Properties to receive via API on return
class AllocationReturn(BaseModel):
    return_condition: Optional[str] = None

# Properties shared by models stored in DB
class AllocationInDBBase(AllocationBase):
    id: Optional[int] = None
    allocated_by_id: Optional[int] = None
    allocated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

# Properties to return to client
class AllocationResponse(AllocationInDBBase):
    asset: Optional[Asset] = None
    allocated_by: Optional[User] = None

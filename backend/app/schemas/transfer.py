from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.transfer import TransferRequestStatus
from app.schemas.user import User
from app.schemas.allocation import AllocationResponse

class TransferRequestBase(BaseModel):
    allocation_id: Optional[int] = None
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    status: Optional[TransferRequestStatus] = TransferRequestStatus.pending
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

class TransferRequestCreate(BaseModel):
    allocation_id: int
    target_type: str  # "user" or "department"
    target_id: int

class TransferRequestUpdate(BaseModel):
    pass

class TransferRequestResponse(TransferRequestBase):
    id: Optional[int] = None
    requested_by_id: Optional[int] = None
    requested_by: Optional[User] = None
    allocation: Optional[AllocationResponse] = None

    model_config = {"from_attributes": True}

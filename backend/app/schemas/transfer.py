from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.transfer import TransferRequestStatus

class TransferRequestCreate(BaseModel):
    asset_id: int
    requested_holder: int          # target employee ID
    reason: Optional[str] = None
    allocation_id: Optional[int] = None  # filled server-side if omitted

class TransferApproveReject(BaseModel):
    notes: Optional[str] = None

class TransferApproval(BaseModel):
    reason: Optional[str] = None

class TransferRejection(BaseModel):
    reason: Optional[str] = None

class TransferCancellation(BaseModel):
    reason: Optional[str] = None

class TransferRequestResponse(BaseModel):
    id: int
    asset_id: Optional[int] = None
    allocation_id: Optional[int] = None
    current_holder: Optional[int] = None
    requested_holder: Optional[int] = None
    requested_by: Optional[int] = None
    requested_by_id: Optional[int] = None
    approved_by: Optional[int] = None
    reason: Optional[str] = None
    status: TransferRequestStatus
    requested_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class TransferListResponse(BaseModel):
    items: List[TransferRequestResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class TransferDetailResponse(BaseModel):
    success: bool
    message: str
    data: Optional[TransferRequestResponse] = None

# Keep backward-compat alias used in old CRUD
class TransferRequestCreate_Legacy(BaseModel):
    allocation_id: int
    target_type: str
    target_id: int

class TransferRequestUpdate(BaseModel):
    pass


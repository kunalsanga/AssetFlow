from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.allocation import AllocationToType, AllocationStatus

# Properties to receive via API on creation
class AllocationCreate(BaseModel):
    asset_id: int
    employee_id: Optional[int] = None
    department_id: Optional[int] = None
    allocated_to_type: AllocationToType = AllocationToType.user
    allocated_to_id: Optional[int] = None
    expected_return: datetime
    notes: Optional[str] = None

class AllocationUpdate(BaseModel):
    expected_return: Optional[datetime] = None
    notes: Optional[str] = None

# Properties to receive via API on return
class AllocationReturn(BaseModel):
    return_notes: Optional[str] = None
    condition_on_return: Optional[str] = None

# Properties shared by models stored in DB
class AllocationResponse(BaseModel):
    id: int
    asset_id: int
    employee_id: Optional[int] = None
    department_id: Optional[int] = None
    allocated_to_type: AllocationToType
    allocated_to_id: int
    allocated_by_id: int
    allocated_at: datetime
    due_date: datetime
    expected_return: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    return_condition: Optional[str] = None
    return_notes: Optional[str] = None
    condition_on_return: Optional[str] = None
    status: AllocationStatus

    model_config = {"from_attributes": True}

class AllocationListResponse(BaseModel):
    items: List[AllocationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class AllocationDetailResponse(BaseModel):
    success: bool
    message: str
    data: Optional[AllocationResponse] = None


from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel
from app.models.asset import AssetStatus, AssetCondition
from app.schemas.department import DepartmentResponse
from app.schemas.category import CategoryResponse
from app.schemas.employee import EmployeeResponse

# Shared properties
class AssetBase(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    model: Optional[str] = None
    status: Optional[AssetStatus] = AssetStatus.available
    condition: Optional[AssetCondition] = AssetCondition.GOOD
    location: Optional[str] = None
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    purchase_date: Optional[date] = None
    purchase_cost: Optional[float] = None
    photo_url: Optional[str] = None
    document_url: Optional[str] = None
    is_bookable: Optional[bool] = False
    description: Optional[str] = None
    location: Optional[str] = None

# Properties to receive via API on creation
class AssetCreate(AssetBase):
    name: str
    serial_number: str
    category_id: int
    purchase_cost: float

# Properties to receive via API on update
class AssetUpdate(AssetBase):
    pass

# Properties shared by models stored in DB
class AssetInDBBase(AssetBase):
    id: Optional[int] = None
    asset_tag: Optional[str] = None
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# Properties to return to client for basic responses
class Asset(AssetInDBBase):
    pass

# Optimized Directory Response details
class AssetDetailResponse(BaseModel):
    id: int
    asset_tag: Optional[str]
    name: str
    serial_number: Optional[str]
    model: Optional[str]
    status: AssetStatus
    condition: AssetCondition
    location: Optional[str]
    purchase_date: Optional[date]
    purchase_cost: Optional[float]
    photo_url: Optional[str]
    document_url: Optional[str]
    is_bookable: bool
    description: Optional[str]
    category_id: Optional[int]
    department_id: Optional[int]
    created_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    category: Optional[CategoryResponse] = None
    department: Optional[DepartmentResponse] = None
    holder: Optional[EmployeeResponse] = None
    history_count: int = 0
    allocation_count: int = 0
    latest_maintenance: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}

class AssetListResponse(BaseModel):
    items: List[AssetDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


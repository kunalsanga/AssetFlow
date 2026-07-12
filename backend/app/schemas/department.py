from pydantic import BaseModel, Field
from typing import Optional, List

class PaginationMetadata(BaseModel):
    currentPage: int
    pageSize: int
    totalItems: int
    totalPages: int

class DepartmentBase(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    head_id: Optional[int] = None
    status: Optional[str] = "Active"
    parent_id: Optional[int] = None

class DepartmentCreate(BaseModel):
    name: str
    code: str
    head_id: Optional[int] = None
    parent_id: Optional[int] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    head_id: Optional[int] = None
    parent_id: Optional[int] = None
    status: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    head_id: Optional[int] = None
    status: str
    parent_id: Optional[int] = None

    model_config = {"from_attributes": True}

class DepartmentDropdownResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

class DepartmentDetailResponse(BaseModel):
    success: bool
    message: str
    data: Optional[DepartmentResponse] = None

class DepartmentListData(BaseModel):
    items: List[DepartmentResponse]
    pagination: PaginationMetadata

class DepartmentListResponse(BaseModel):
    success: bool
    message: str
    data: DepartmentListData

class DepartmentDropdownListResponse(BaseModel):
    success: bool
    message: str
    data: List[DepartmentDropdownResponse]

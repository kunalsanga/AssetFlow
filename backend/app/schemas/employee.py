from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.models.user import UserRole
from app.schemas.department import PaginationMetadata

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None

class EmployeeRoleUpdate(BaseModel):
    role: UserRole

class EmployeeResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: str
    role: UserRole
    department_id: Optional[int] = None
    is_active: bool

    model_config = {"from_attributes": True}

class EmployeeDropdownResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

class EmployeeDetailResponse(BaseModel):
    success: bool
    message: str
    data: Optional[EmployeeResponse] = None

class EmployeeListData(BaseModel):
    items: List[EmployeeResponse]
    pagination: PaginationMetadata

class EmployeeListResponse(BaseModel):
    success: bool
    message: str
    data: EmployeeListData

class EmployeeDropdownListResponse(BaseModel):
    success: bool
    message: str
    data: List[EmployeeDropdownResponse]

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.schemas.department import PaginationMetadata

class CategoryBase(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Active"
    custom_fields: Optional[Dict[str, Any]] = None

class CategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    status: str
    custom_fields: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}

class CategoryDropdownResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

class CategoryDetailResponse(BaseModel):
    success: bool
    message: str
    data: Optional[CategoryResponse] = None

class CategoryListData(BaseModel):
    items: List[CategoryResponse]
    pagination: PaginationMetadata

class CategoryListResponse(BaseModel):
    success: bool
    message: str
    data: CategoryListData

class CategoryDropdownListResponse(BaseModel):
    success: bool
    message: str
    data: List[CategoryDropdownResponse]

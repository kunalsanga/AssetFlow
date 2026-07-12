"""
Dropdown APIs — shared lookup endpoints for all form selects.

GET /dropdown/departments
GET /dropdown/categories
GET /dropdown/employees
GET /dropdown/department-heads
GET /dropdown/asset-managers
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api import deps
from app.models.user import User
from app.services.department_service import department_service
from app.services.category_service import category_service
from app.services.employee_service import employee_service

router = APIRouter()

# --------------------------------------------------------------------- #

class DropdownItem:
    def __init__(self, id: int, label: str):
        self.id = id
        self.label = label

from pydantic import BaseModel

class DropdownResponse(BaseModel):
    id: int
    label: str

# --------------------------------------------------------------------- #

@router.get(
    "/departments",
    response_model=List[DropdownResponse],
    summary="Departments Dropdown",
)
async def get_departments_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    depts = await department_service.get_dropdown(db)
    return [DropdownResponse(id=d.id, label=d.name) for d in depts]


@router.get(
    "/categories",
    response_model=List[DropdownResponse],
    summary="Categories Dropdown",
)
async def get_categories_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    cats = await category_service.get_dropdown(db)
    return [DropdownResponse(id=c.id, label=c.name) for c in cats]


@router.get(
    "/employees",
    response_model=List[DropdownResponse],
    summary="Employees Dropdown (active only)",
)
async def get_employees_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    users = await employee_service.get_dropdown(db)
    return [DropdownResponse(id=u.id, label=u.full_name or u.email) for u in users]


@router.get(
    "/department-heads",
    response_model=List[DropdownResponse],
    summary="Department Heads Dropdown",
)
async def get_department_heads_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    users = await employee_service.get_department_heads_dropdown(db)
    return [DropdownResponse(id=u.id, label=u.full_name or u.email) for u in users]


@router.get(
    "/asset-managers",
    response_model=List[DropdownResponse],
    summary="Asset Managers Dropdown",
)
async def get_asset_managers_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    users = await employee_service.get_asset_managers_dropdown(db)
    return [DropdownResponse(id=u.id, label=u.full_name or u.email) for u in users]

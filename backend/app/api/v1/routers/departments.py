from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.models.user import User, UserRole
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDetailResponse,
    DepartmentListResponse,
    DepartmentDropdownListResponse,
    DepartmentResponse,
    DepartmentListData,
)
from app.services.department_service import department_service

router = APIRouter()

from app.security.permissions import require_role
admin_permission = require_role(UserRole.ADMIN)

@router.post(
    "",
    response_model=DepartmentDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Department",
    description="Registers a new department. Requires administrator privileges.",
)
async def create_department(
    obj_in: DepartmentCreate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    dept = await department_service.create_department(db, obj_in, current_user)
    return DepartmentDetailResponse(
        success=True,
        message="Department created successfully.",
        data=DepartmentResponse.model_validate(dept),
    )

@router.get(
    "/dropdown",
    response_model=DepartmentDropdownListResponse,
    summary="Get Department Dropdown List",
    description="Fetches a list of all active departments for selection dropdowns. Accessible to any logged-in user.",
)
async def get_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    depts = await department_service.get_dropdown(db)
    return DepartmentDropdownListResponse(
        success=True,
        message="Dropdown list loaded successfully.",
        data=depts,
    )

@router.get(
    "",
    response_model=DepartmentListResponse,
    summary="List Departments",
    description="Returns a paginated list of departments. Accessible to administrators.",
)
async def get_departments(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    departments, pagination = await department_service.get_departments_list(
        db, page=page, page_size=pageSize, search=search
    )
    return DepartmentListResponse(
        success=True,
        message="Departments loaded successfully.",
        data=DepartmentListData(
            items=[DepartmentResponse.model_validate(d) for d in departments],
            pagination=pagination,
        ),
    )

@router.get(
    "/{id}",
    response_model=DepartmentDetailResponse,
    summary="Get Department Details",
    description="Fetches detailed information for a single department. Accessible to administrators.",
)
async def get_department(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    dept = await department_service.get_department(db, id)
    return DepartmentDetailResponse(
        success=True,
        message="Department details loaded successfully.",
        data=DepartmentResponse.model_validate(dept),
    )

@router.put(
    "/{id}",
    response_model=DepartmentDetailResponse,
    summary="Update Department",
    description="Updates department attributes, hierarchy parent, or manager. Requires administrator privileges.",
)
async def update_department(
    id: int,
    obj_in: DepartmentUpdate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    dept = await department_service.update_department(db, id, obj_in, current_user)
    return DepartmentDetailResponse(
        success=True,
        message="Department updated successfully.",
        data=DepartmentResponse.model_validate(dept),
    )

@router.patch(
    "/{id}/status",
    response_model=DepartmentDetailResponse,
    summary="Change Department Status",
    description="Activates or deactivates a department. Requires administrator privileges.",
)
async def update_status(
    id: int,
    status_val: str = Query(..., alias="status", description="New status (e.g. Active, Inactive)"),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    dept = await department_service.update_status(db, id, status_val, current_user)
    return DepartmentDetailResponse(
        success=True,
        message=f"Department status changed to '{status_val}' successfully.",
        data=DepartmentResponse.model_validate(dept),
    )

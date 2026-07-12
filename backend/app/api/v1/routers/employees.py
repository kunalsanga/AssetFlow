from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.models.user import User, UserRole
from app.schemas.employee import (
    EmployeeUpdate,
    EmployeeRoleUpdate,
    EmployeeDetailResponse,
    EmployeeListResponse,
    EmployeeDropdownListResponse,
    EmployeeResponse,
    EmployeeDropdownResponse,
    EmployeeListData,
)
from app.services.employee_service import employee_service

router = APIRouter()

# Admin-only permissions for promotions and listing
admin_permission = deps.require_role_async([UserRole.super_admin, UserRole.ADMIN])

@router.get(
    "/dropdown",
    response_model=EmployeeDropdownListResponse,
    summary="Get Employee Dropdown List",
    description="Fetches a list of all active employees for selection dropdowns. Accessible to any logged-in user.",
)
async def get_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    users = await employee_service.get_dropdown(db)
    # Map User objects to EmployeeDropdownResponse
    dropdown_list = [
        EmployeeDropdownResponse(id=u.id, name=u.full_name or u.email)
        for u in users
    ]
    return EmployeeDropdownListResponse(
        success=True,
        message="Dropdown list loaded successfully.",
        data=dropdown_list,
    )

@router.get(
    "",
    response_model=EmployeeListResponse,
    summary="List Employees",
    description="Returns a paginated list of employees. Accessible to administrators.",
)
async def get_employees(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department: Optional[int] = Query(None, description="Department ID to filter by"),
    role: Optional[UserRole] = Query(None, description="User role to filter by"),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    employees, pagination = await employee_service.get_employees_list(
        db, page=page, page_size=pageSize, search=search, department_id=department, role=role
    )
    return EmployeeListResponse(
        success=True,
        message="Employee directory loaded successfully.",
        data=EmployeeListData(
            items=[EmployeeResponse.model_validate(e) for e in employees],
            pagination=pagination,
        ),
    )

@router.get(
    "/{id}",
    response_model=EmployeeDetailResponse,
    summary="Get Employee Details",
    description="Fetches detailed information for a single employee. Accessible to administrators.",
)
async def get_employee(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    user = await employee_service.get_employee(db, id)
    return EmployeeDetailResponse(
        success=True,
        message="Employee details loaded successfully.",
        data=EmployeeResponse.model_validate(user),
    )

@router.put(
    "/{id}",
    response_model=EmployeeDetailResponse,
    summary="Update Employee Details",
    description="Updates employee name, email, or department. Requires administrator privileges.",
)
async def update_employee(
    id: int,
    obj_in: EmployeeUpdate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    user = await employee_service.update_employee(db, id, obj_in, current_user)
    return EmployeeDetailResponse(
        success=True,
        message="Employee details updated successfully.",
        data=EmployeeResponse.model_validate(user),
    )

@router.patch(
    "/{id}/status",
    response_model=EmployeeDetailResponse,
    summary="Change Employee Activation Status",
    description="Activates or deactivates an employee account. Requires administrator privileges.",
)
async def update_status(
    id: int,
    isActive: bool = Query(..., alias="isActive", description="Set to true to activate, false to deactivate"),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    user = await employee_service.update_status(db, id, isActive, current_user)
    action_str = "activated" if isActive else "deactivated"
    return EmployeeDetailResponse(
        success=True,
        message=f"Employee account {action_str} successfully.",
        data=EmployeeResponse.model_validate(user),
    )

@router.patch(
    "/{id}/role",
    response_model=EmployeeDetailResponse,
    summary="Change Employee Role",
    description="Promotes or demotes employee role. Requires administrator privileges and prevents self-promotion.",
)
async def update_role(
    id: int,
    obj_in: EmployeeRoleUpdate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    user = await employee_service.update_role(db, id, obj_in, current_user)
    return EmployeeDetailResponse(
        success=True,
        message="Employee role modified successfully.",
        data=EmployeeResponse.model_validate(user),
    )

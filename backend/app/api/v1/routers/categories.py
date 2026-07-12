from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.models.user import User, UserRole
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryDetailResponse,
    CategoryListResponse,
    CategoryDropdownListResponse,
    CategoryResponse,
    CategoryListData,
)
from app.services.category_service import category_service

router = APIRouter()

# Admin-only permissions for CRUD operations
admin_permission = deps.require_role_async([UserRole.super_admin, UserRole.ADMIN])

@router.post(
    "",
    response_model=CategoryDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Category",
    description="Registers a new asset category. Requires administrator privileges.",
)
async def create_category(
    obj_in: CategoryCreate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    cat = await category_service.create_category(db, obj_in, current_user)
    return CategoryDetailResponse(
        success=True,
        message="Asset category created successfully.",
        data=CategoryResponse.model_validate(cat),
    )

@router.get(
    "/dropdown",
    response_model=CategoryDropdownListResponse,
    summary="Get Category Dropdown List",
    description="Fetches a list of all active asset categories for selection dropdowns. Accessible to any logged-in user.",
)
async def get_dropdown(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    cats = await category_service.get_dropdown(db)
    return CategoryDropdownListResponse(
        success=True,
        message="Dropdown list loaded successfully.",
        data=cats,
    )

@router.get(
    "",
    response_model=CategoryListResponse,
    summary="List Categories",
    description="Returns a paginated list of asset categories. Accessible to administrators.",
)
async def get_categories(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    categories, pagination = await category_service.get_categories_list(
        db, page=page, page_size=pageSize, search=search
    )
    return CategoryListResponse(
        success=True,
        message="Asset categories loaded successfully.",
        data=CategoryListData(
            items=[CategoryResponse.model_validate(c) for c in categories],
            pagination=pagination,
        ),
    )

@router.get(
    "/{id}",
    response_model=CategoryDetailResponse,
    summary="Get Category Details",
    description="Fetches detailed information for a single category. Accessible to administrators.",
)
async def get_category(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    cat = await category_service.get_category(db, id)
    return CategoryDetailResponse(
        success=True,
        message="Asset category loaded successfully.",
        data=CategoryResponse.model_validate(cat),
    )

@router.put(
    "/{id}",
    response_model=CategoryDetailResponse,
    summary="Update Category",
    description="Updates asset category name, code, or custom fields. Requires administrator privileges.",
)
async def update_category(
    id: int,
    obj_in: CategoryUpdate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    cat = await category_service.update_category(db, id, obj_in, current_user)
    return CategoryDetailResponse(
        success=True,
        message="Asset category updated successfully.",
        data=CategoryResponse.model_validate(cat),
    )

@router.patch(
    "/{id}/status",
    response_model=CategoryDetailResponse,
    summary="Change Category Status",
    description="Activates or deactivates an asset category. Requires administrator privileges.",
)
async def update_status(
    id: int,
    status_val: str = Query(..., alias="status", description="New status (e.g. Active, Inactive)"),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    cat = await category_service.update_status(db, id, status_val, current_user)
    return CategoryDetailResponse(
        success=True,
        message=f"Asset category status changed to '{status_val}' successfully.",
        data=CategoryResponse.model_validate(cat),
    )

@router.delete(
    "/{id}",
    response_model=CategoryDetailResponse,
    summary="Soft Delete Category",
    description="Triggers a soft delete by marking category as deleted. Requires administrator privileges.",
)
async def delete_category(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(admin_permission),
):
    cat = await category_service.delete_category(db, id, current_user)
    return CategoryDetailResponse(
        success=True,
        message="Asset category soft-deleted successfully.",
        data=CategoryResponse.model_validate(cat),
    )

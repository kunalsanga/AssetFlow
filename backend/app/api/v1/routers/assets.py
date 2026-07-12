"""
Assets Router — Screen 4 (Asset Registration & Directory).

All endpoints are async and require JWT authentication.
Role permissions:
  - Admin:          Full CRUD
  - Asset Manager:  Full CRUD
  - Dept Head:      Read (own department)
  - Employee:       Read
"""
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User, UserRole
from app.models.asset import AssetStatus, AssetCondition
from app.schemas.asset import (
    AssetCreate, AssetUpdate, AssetDetailResponse, AssetListResponse, Asset,
)
from app.services.asset_service import asset_service
from app.repositories.asset_repository import asset_repo

router = APIRouter()

_rw_roles = deps.require_role_async([UserRole.admin, UserRole.asset_manager])
_any_auth  = deps.get_current_active_user_async

def _build_detail(asset, holder=None, history_count=0, alloc_count=0, maint=None) -> AssetDetailResponse:
    return AssetDetailResponse(
        id=asset.id,
        asset_tag=asset.asset_tag,
        name=asset.name,
        serial_number=asset.serial_number,
        model=asset.model,
        status=asset.status,
        condition=asset.condition,
        location=asset.location,
        purchase_date=asset.purchase_date,
        purchase_cost=asset.purchase_cost,
        photo_url=asset.photo_url,
        document_url=asset.document_url,
        is_bookable=asset.is_bookable,
        description=asset.description,
        category_id=asset.category_id,
        department_id=asset.department_id,
        created_by_id=asset.created_by_id,
        created_at=asset.created_at,
        updated_at=asset.updated_at,
        holder=None,
        history_count=history_count,
        allocation_count=alloc_count,
        latest_maintenance=None,
    )


# ------------------------------------------------------------------ #
#  POST /assets — register new asset                                   #
# ------------------------------------------------------------------ #
@router.post(
    "",
    response_model=AssetDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Asset",
    description="Register a new asset. Admin / Asset Manager only.",
)
async def create_asset(
    obj_in: AssetCreate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    asset = await asset_service.create_asset(db, obj_in, current_user)
    return _build_detail(asset)


# ------------------------------------------------------------------ #
#  GET /assets — paginated directory                                   #
# ------------------------------------------------------------------ #
@router.get(
    "",
    response_model=AssetListResponse,
    summary="List Assets",
    description="Returns a paginated, searchable, filterable asset directory.",
)
async def list_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search name, serial, tag, location"),
    status: Optional[AssetStatus] = Query(None),
    condition: Optional[AssetCondition] = Query(None),
    category_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    sort: str = Query("created_at"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    assets, total = await asset_service.get_assets_paginated(
        db,
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        condition=condition,
        category_id=category_id,
        department_id=department_id,
        sort=sort,
        order=order,
        current_user=current_user,
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    items = []
    for a in assets:
        hc = await asset_repo.get_history_count(db, a.id)
        ac = await asset_repo.get_allocation_count(db, a.id)
        items.append(_build_detail(a, history_count=hc, alloc_count=ac))

    return AssetListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ------------------------------------------------------------------ #
#  GET /assets/{id}                                                    #
# ------------------------------------------------------------------ #
@router.get(
    "/{id}",
    response_model=AssetDetailResponse,
    summary="Get Asset Details",
)
async def get_asset(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    asset = await asset_service.get_asset(db, id)
    hc = await asset_repo.get_history_count(db, id)
    ac = await asset_repo.get_allocation_count(db, id)
    return _build_detail(asset, history_count=hc, alloc_count=ac)


# ------------------------------------------------------------------ #
#  PATCH /assets/{id}                                                  #
# ------------------------------------------------------------------ #
@router.patch(
    "/{id}",
    response_model=AssetDetailResponse,
    summary="Update Asset",
)
async def update_asset(
    id: int,
    obj_in: AssetUpdate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    asset = await asset_service.update_asset(db, id, obj_in, current_user)
    return _build_detail(asset)


# ------------------------------------------------------------------ #
#  DELETE /assets/{id} — soft delete (status → RETIRED)               #
# ------------------------------------------------------------------ #
@router.delete(
    "/{id}",
    response_model=AssetDetailResponse,
    summary="Soft-Delete Asset (Retire)",
)
async def delete_asset(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    asset = await asset_service.delete_asset(db, id, current_user)
    return _build_detail(asset)


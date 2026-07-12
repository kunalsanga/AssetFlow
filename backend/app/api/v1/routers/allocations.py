"""
Allocations Router — Screen 5 (Asset Allocation & Transfer).

Endpoints:
  POST   /allocations                      — allocate asset
  GET    /allocations                      — list allocations (paginated)
  GET    /allocations/{id}                 — get allocation detail
  POST   /allocations/{id}/return          — return allocated asset
  GET    /allocations/overdue              — list overdue allocations

  POST   /allocations/transfers            — raise transfer request
  GET    /allocations/transfers            — list transfer requests
  GET    /allocations/transfers/{id}       — transfer request detail
  POST   /allocations/transfers/{id}/approve
  POST   /allocations/transfers/{id}/reject
  POST   /allocations/transfers/{id}/cancel
"""
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User, UserRole
from app.models.allocation import AllocationStatus
from app.models.transfer import TransferRequestStatus
from app.schemas.allocation import (
    AllocationCreate, AllocationReturn, AllocationResponse, AllocationListResponse,
)
from app.schemas.transfer import (
    TransferRequestCreate, TransferApproveReject, TransferRequestResponse, TransferListResponse,
)
from app.services.allocation_service import allocation_service
from app.services.transfer_service import transfer_service

router = APIRouter()

_rw_roles = deps.require_role_async([UserRole.admin, UserRole.asset_manager])
_any_auth  = deps.get_current_active_user_async


# ================================================================== #
#  ALLOCATIONS                                                         #
# ================================================================== #

@router.post(
    "",
    response_model=AllocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Allocate Asset",
)
async def allocate_asset(
    obj_in: AllocationCreate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    return await allocation_service.allocate(db, obj_in, current_user)

@router.get(
    "",
    response_model=AllocationListResponse,
    summary="List Allocations",
)
async def list_allocations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[AllocationStatus] = Query(None),
    asset_id: Optional[int] = Query(None),
    employee_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    await allocation_service.sync_overdue(db)
    allocs, total = await allocation_service.list_allocations(
        db,
        page=page,
        page_size=page_size,
        status=status,
        asset_id=asset_id,
        employee_id=employee_id,
        department_id=department_id,
        current_user=current_user,
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return AllocationListResponse(
        items=allocs, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.get(
    "/overdue",
    response_model=List[AllocationResponse],
    summary="List Overdue Allocations",
)
async def list_overdue_allocations(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    await allocation_service.sync_overdue(db)
    return await allocation_service.get_overdue_list(db)


@router.get(
    "/{id}",
    response_model=AllocationResponse,
    summary="Get Allocation Detail",
)
async def get_allocation(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    return await allocation_service.get_allocation(db, id)


@router.post(
    "/{id}/return",
    response_model=AllocationResponse,
    summary="Return Asset",
)
async def return_asset(
    id: int,
    obj_in: AllocationReturn,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    return await allocation_service.return_asset(db, id, obj_in, current_user)


# ================================================================== #
#  TRANSFERS                                                           #
# ================================================================== #

@router.post(
    "/transfers",
    response_model=TransferRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request Asset Transfer",
)
async def request_transfer(
    obj_in: TransferRequestCreate,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    return await transfer_service.request_transfer(db, obj_in, current_user)


@router.get(
    "/transfers",
    response_model=TransferListResponse,
    summary="List Transfer Requests",
)
async def list_transfers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[TransferRequestStatus] = Query(None),
    asset_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    items, total = await transfer_service.list_transfers(
        db, page=page, page_size=page_size, status=status, asset_id=asset_id, current_user=current_user
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return TransferListResponse(
        items=items, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.get(
    "/transfers/{id}",
    response_model=TransferRequestResponse,
    summary="Get Transfer Request Detail",
)
async def get_transfer(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    from app.repositories.transfer_repository import transfer_repo
    tr = await transfer_repo.get(db, id)
    if not tr:
        raise HTTPException(status_code=404, detail="Transfer request not found.")
    return tr


@router.post(
    "/transfers/{id}/approve",
    response_model=TransferRequestResponse,
    summary="Approve Transfer Request",
)
async def approve_transfer(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    return await transfer_service.approve_transfer(db, id, current_user)


@router.post(
    "/transfers/{id}/reject",
    response_model=TransferRequestResponse,
    summary="Reject Transfer Request",
)
async def reject_transfer(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_rw_roles),
) -> Any:
    return await transfer_service.reject_transfer(db, id, current_user)


@router.post(
    "/transfers/{id}/cancel",
    response_model=TransferRequestResponse,
    summary="Cancel Transfer Request",
)
async def cancel_transfer(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(_any_auth),
) -> Any:
    return await transfer_service.cancel_transfer(db, id, current_user)

from typing import Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_current_user, get_db
from app.core.exceptions import PermissionDeniedException
from app.models.user import User, UserRole
from app.schemas.transfer import (
    TransferRequestResponse, 
    TransferRequestCreate, 
    TransferListResponse,
    TransferApproval,
    TransferRejection,
    TransferCancellation
)
from app.services.transfer_service import TransferService

router = APIRouter()

def get_transfer_service(db: AsyncSession = Depends(get_db)):
    return TransferService(db)

@router.post("", response_model=TransferRequestResponse)
async def create_transfer_request(
    request: TransferRequestCreate,
    current_user: User = Depends(get_current_user),
    service: TransferService = Depends(get_transfer_service),
) -> Any:
    """
    Create a new transfer request.
    Employees can request transfer for assets they currently hold.
    """
    if current_user.role == UserRole.employee and str(current_user.id) != str(request.current_holder):
         raise PermissionDeniedException("You can only request transfers for your own assets")
    
    return await service.create_transfer_request(request, current_user.id)

@router.get("", response_model=TransferListResponse)
async def list_transfers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    sort_by: str = "requested_at",
    sort_order: str = "desc",
    current_user: User = Depends(get_current_user),
    service: TransferService = Depends(get_transfer_service),
) -> Any:
    """
    List transfer requests with pagination.
    """
    return await service.get_transfers(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        user=current_user
    )

@router.patch("/{id}/approve", response_model=TransferRequestResponse)
async def approve_transfer(
    id: UUID,
    request: TransferApproval,
    current_user: User = Depends(get_current_user),
    service: TransferService = Depends(get_transfer_service),
) -> Any:
    """
    Approve a transfer request.
    Only Asset Managers or Admin can approve any transfer. 
    Department Heads can approve transfers within their department.
    """
    if current_user.role == UserRole.employee:
        raise PermissionDeniedException("Employees cannot approve transfers")
    
    return await service.approve_transfer(id, request.reason, current_user)

@router.patch("/{id}/reject", response_model=TransferRequestResponse)
async def reject_transfer(
    id: UUID,
    request: TransferRejection,
    current_user: User = Depends(get_current_user),
    service: TransferService = Depends(get_transfer_service),
) -> Any:
    """
    Reject a transfer request.
    Only Asset Managers, Admins or the relevant Department Head can reject.
    """
    if current_user.role == UserRole.employee:
        raise PermissionDeniedException("Employees cannot reject transfers")

    return await service.reject_transfer(id, request.reason, current_user)

@router.patch("/{id}/cancel", response_model=TransferRequestResponse)
async def cancel_transfer(
    id: UUID,
    request: TransferCancellation,
    current_user: User = Depends(get_current_user),
    service: TransferService = Depends(get_transfer_service),
) -> Any:
    """
    Cancel a transfer request.
    Can be done by the requester (employee) or an admin/manager.
    """
    return await service.cancel_transfer(id, request.reason, current_user)

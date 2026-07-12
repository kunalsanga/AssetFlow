from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.AllocationResponse])
def read_allocations(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve allocations. Runs check for overdue records first."""
    crud.allocation.check_and_update_overdue(db)
    allocations = db.query(models.Allocation).all()
    return allocations

@router.post("/", response_model=schemas.AllocationResponse, status_code=status.HTTP_201_CREATED)
def create_allocation(
    *,
    db: Session = Depends(deps.get_db),
    allocation_in: schemas.AllocationCreate,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Create a new allocation (Allocate asset). Check double allocation conflict."""
    # Check if asset exists
    asset = crud.asset.get(db, id=allocation_in.asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found."
        )

    # Prevent double allocation
    active_alloc = crud.allocation.get_active_by_asset(db, asset_id=allocation_in.asset_id)
    if active_alloc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict: This asset is already allocated and cannot be re-allocated."
        )

    # Check availability status
    if asset.status != models.AssetStatus.available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset is not available for allocation. Current status: {asset.status.value}"
        )

    # Perform allocation
    db_allocation = crud.allocation.create_allocation(
        db, obj_in=allocation_in, allocated_by_id=current_user.id
    )
    if not db_allocation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create allocation."
        )
    return db_allocation

@router.post("/{id}/return", response_model=schemas.AllocationResponse)
def return_asset(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    return_in: schemas.AllocationReturn,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Return an allocated asset."""
    allocation_obj = crud.allocation.get(db, id=id)
    if not allocation_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allocation record not found."
        )
    
    if allocation_obj.status not in [models.AllocationStatus.active, models.AllocationStatus.overdue]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This allocation has already been resolved or returned."
        )

    return crud.allocation.return_allocation(
        db, db_obj=allocation_obj, return_condition=return_in.return_condition
    )

@router.post("/transfer", response_model=schemas.TransferRequestResponse, status_code=status.HTTP_201_CREATED)
def raise_transfer_request(
    *,
    db: Session = Depends(deps.get_db),
    transfer_in: schemas.TransferRequestCreate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Raise a transfer request for an allocated asset."""
    # Verify allocation exists and is active/overdue
    allocation_obj = crud.allocation.get(db, id=transfer_in.allocation_id)
    if not allocation_obj or allocation_obj.status not in [models.AllocationStatus.active, models.AllocationStatus.overdue]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active allocation not found for transfer."
        )

    transfer_req = crud.transfer_request.create_transfer(
        db, obj_in=transfer_in, requested_by_id=current_user.id
    )
    if not transfer_req:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create transfer request."
        )
    return transfer_req

@router.get("/transfers", response_model=List[schemas.TransferRequestResponse])
def get_transfer_requests(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """List all transfer requests."""
    transfers = db.query(models.TransferRequest).all()
    return transfers

@router.post("/transfers/{id}/approve", response_model=schemas.AllocationResponse)
def approve_transfer_request(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Approve a transfer request. Re-allocates the asset to the new holder. Admin/Manager only."""
    transfer_req = crud.transfer_request.get(db, id=id)
    if not transfer_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer request not found."
        )
    
    if transfer_req.status != models.TransferRequestStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer request is already resolved."
        )

    new_alloc = crud.transfer_request.approve_transfer(
        db, transfer_req=transfer_req, resolved_by_id=current_user.id
    )
    if not new_alloc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not approve transfer. Source allocation might be inactive."
        )
    return new_alloc

@router.post("/transfers/{id}/reject", response_model=schemas.TransferRequestResponse)
def reject_transfer_request(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Reject a transfer request. Admin/Manager only."""
    transfer_req = crud.transfer_request.get(db, id=id)
    if not transfer_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer request not found."
        )

    if transfer_req.status != models.TransferRequestStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer request is already resolved."
        )

    return crud.transfer_request.reject_transfer(db, transfer_req=transfer_req)

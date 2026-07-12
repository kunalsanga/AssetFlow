from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.MaintenanceRequestResponse])
def read_maintenance_requests(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve maintenance requests. Employees only see requests they raised."""
    if current_user.role == models.UserRole.employee:
        requests = db.query(models.MaintenanceRequest).filter(
            models.MaintenanceRequest.requester_id == current_user.id
        ).all()
    else:
        requests = db.query(models.MaintenanceRequest).all()
    return requests

@router.post("/", response_model=schemas.MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED)
def raise_maintenance_request(
    *,
    db: Session = Depends(deps.get_db),
    request_in: schemas.MaintenanceRequestCreate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Raise a new maintenance request."""
    # Check if asset exists
    asset = crud.asset.get(db, id=request_in.asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found."
        )

    return crud.maintenance_request.create_request(
        db, obj_in=request_in, requester_id=current_user.id
    )

@router.post("/{id}/approve", response_model=schemas.MaintenanceRequestResponse)
def approve_maintenance_request(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Approve a maintenance request. Changes asset status to UNDER_MAINTENANCE."""
    maint_req = crud.maintenance_request.get(db, id=id)
    if not maint_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found."
        )
    
    if maint_req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maintenance request is already approved, rejected, or resolved."
        )

    return crud.maintenance_request.approve_request(db, db_obj=maint_req)

@router.post("/{id}/assign", response_model=schemas.MaintenanceRequestResponse)
def assign_technician(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    request_in: schemas.MaintenanceRequestUpdate,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Assign technician schedule and start progress (changes request status to IN_PROGRESS)."""
    maint_req = crud.maintenance_request.get(db, id=id)
    if not maint_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found."
        )
    
    if maint_req.status not in ["APPROVED", "PENDING"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician can only be assigned to pending or approved requests."
        )

    if not request_in.scheduled_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled date is required for technician assignment."
        )

    return crud.maintenance_request.assign_technician(
        db, db_obj=maint_req, scheduled_date=request_in.scheduled_date
    )

@router.post("/{id}/resolve", response_model=schemas.MaintenanceRequestResponse)
def resolve_maintenance(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    request_in: schemas.MaintenanceRequestUpdate,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Resolve a maintenance request. Restores asset status (default is AVAILABLE)."""
    maint_req = crud.maintenance_request.get(db, id=id)
    if not maint_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found."
        )

    if maint_req.status not in ["IN_PROGRESS", "APPROVED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request must be approved or in progress to resolve."
        )

    # Resolution condition note can be sent in the request description or passed as status
    resolution_condition = request_in.status or "AVAILABLE"

    return crud.maintenance_request.resolve_request(
        db, db_obj=maint_req, resolution_condition=resolution_condition
    )

@router.post("/{id}/reject", response_model=schemas.MaintenanceRequestResponse)
def reject_maintenance_request(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Reject a maintenance request."""
    maint_req = crud.maintenance_request.get(db, id=id)
    if not maint_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found."
        )

    if maint_req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending maintenance requests can be rejected."
        )

    return crud.maintenance_request.reject_request(db, db_obj=maint_req)

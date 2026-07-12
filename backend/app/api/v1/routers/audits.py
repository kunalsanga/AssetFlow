from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.models.audit import AuditCycle, AuditItem

router = APIRouter()

@router.get("/cycles", response_model=List[schemas.AuditCycleResponse])
def read_audit_cycles(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve audit cycles."""
    # Employees only see cycles assigned to them as auditor
    if current_user.role == models.UserRole.EMPLOYEE:
        cycles = db.query(AuditCycle).filter(AuditCycle.auditor_id == current_user.id).all()
    else:
        cycles = db.query(AuditCycle).all()
    return cycles

@router.post("/cycles", response_model=schemas.AuditCycleResponse, status_code=status.HTTP_201_CREATED)
def create_audit_cycle(
    *,
    db: Session = Depends(deps.get_db),
    cycle_in: schemas.AuditCycleCreate,
    current_user: models.User = Depends(deps.require_permission("create:audit_cycles"))
) -> Any:
    """Create a new audit cycle. Automatically populates item records for all assets."""
    return crud.audit.create_cycle(db, obj_in=cycle_in)

@router.get("/cycles/{id}/items", response_model=List[schemas.AuditItemResponse])
def read_audit_items(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve audit items for a specific cycle."""
    # Verify cycle exists
    cycle = db.query(AuditCycle).filter(AuditCycle.id == id).first()
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit cycle not found."
        )

    # Access control: employees can only view items for cycles where they are the auditor
    if current_user.role == models.UserRole.EMPLOYEE and cycle.auditor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view items in this cycle."
        )

    items = db.query(AuditItem).filter(AuditItem.cycle_id == id).all()
    return items

@router.post("/cycles/{id}/items/{item_id}", response_model=schemas.AuditItemResponse)
def verify_audit_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    item_id: int,
    item_in: schemas.AuditItemUpdate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Verify and update status of a specific audit item in a cycle. Prevents editing in closed cycles."""
    # Verify item exists and matches cycle
    db_item = db.query(AuditItem).filter(AuditItem.id == item_id, AuditItem.cycle_id == id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit item not found in this cycle."
        )

    # Access control: only auditor, asset managers, or admins can update
    if current_user.role == models.UserRole.EMPLOYEE and db_item.cycle.auditor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned as the auditor for this cycle."
        )

    try:
        updated_item = crud.audit.update_item(db, item_id=item_id, obj_in=item_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to update audit item."
        )
    return updated_item

@router.post("/cycles/{id}/close", response_model=schemas.AuditCycleResponse)
def close_audit_cycle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.require_role([models.UserRole.super_admin, models.UserRole.ADMIN, models.UserRole.ASSET_MANAGER]))
) -> Any:
    """Close and lock an audit cycle. Updates asset statuses and logs activity. Admin/Manager only."""
    try:
        closed_cycle = crud.audit.close_cycle(db, cycle_id=id, resolver_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not closed_cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit cycle not found."
        )
    return closed_cycle

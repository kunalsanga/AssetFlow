from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Asset])
def read_assets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve assets."""
    assets = crud.asset.get_multi(db, skip=skip, limit=limit)
    return assets

@router.post("/", response_model=schemas.Asset, status_code=status.HTTP_201_CREATED)
def create_asset(
    *,
    db: Session = Depends(deps.get_db),
    asset_in: schemas.AssetCreate,
    current_user: models.User = Depends(deps.require_role([models.UserRole.admin, models.UserRole.asset_manager]))
) -> Any:
    """Create a new asset. Admin/Asset Manager only."""
    db_asset = crud.asset.get_by_serial_number(db, serial_number=asset_in.serial_number)
    if db_asset:
        raise HTTPException(
            status_code=400,
            detail="Asset with this serial number already exists."
        )
    return crud.asset.create(db, obj_in=asset_in)

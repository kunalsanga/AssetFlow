from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate

class CRUDAsset(CRUDBase[Asset, AssetCreate, AssetUpdate]):
    def get_by_serial_number(self, db: Session, *, serial_number: str) -> Optional[Asset]:
        return db.query(Asset).filter(Asset.serial_number == serial_number).first()

asset = CRUDAsset(Asset)

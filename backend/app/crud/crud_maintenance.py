from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.maintenance_request import MaintenanceRequest
from app.models.asset import Asset, AssetStatus
from app.schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestUpdate

class CRUDMaintenanceRequest(CRUDBase[MaintenanceRequest, MaintenanceRequestCreate, MaintenanceRequestUpdate]):
    def create_request(
        self, db: Session, *, obj_in: MaintenanceRequestCreate, requester_id: int
    ) -> MaintenanceRequest:
        db_obj = MaintenanceRequest(
            asset_id=obj_in.asset_id,
            requester_id=requester_id,
            description=obj_in.description,
            priority=obj_in.priority or "MEDIUM",
            scheduled_date=obj_in.scheduled_date,
            status="PENDING"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def approve_request(self, db: Session, *, db_obj: MaintenanceRequest) -> MaintenanceRequest:
        db_obj.status = "APPROVED"
        
        # Set asset status to UNDER_MAINTENANCE
        asset_obj = db.query(Asset).filter(Asset.id == db_obj.asset_id).first()
        if asset_obj:
            asset_obj.status = AssetStatus.under_maintenance
            db.add(asset_obj)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def assign_technician(self, db: Session, *, db_obj: MaintenanceRequest, scheduled_date: date) -> MaintenanceRequest:
        db_obj.status = "IN_PROGRESS"
        db_obj.scheduled_date = scheduled_date
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def resolve_request(self, db: Session, *, db_obj: MaintenanceRequest, resolution_condition: Optional[str] = "AVAILABLE") -> MaintenanceRequest:
        db_obj.status = "RESOLVED"
        
        # Set asset status back to AVAILABLE or the requested condition
        asset_obj = db.query(Asset).filter(Asset.id == db_obj.asset_id).first()
        if asset_obj:
            if resolution_condition in [AssetStatus.available, AssetStatus.retired, AssetStatus.lost]:
                asset_obj.status = resolution_condition
            else:
                asset_obj.status = AssetStatus.available
            db.add(asset_obj)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def reject_request(self, db: Session, *, db_obj: MaintenanceRequest) -> MaintenanceRequest:
        db_obj.status = "REJECTED"
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

maintenance_request = CRUDMaintenanceRequest(MaintenanceRequest)

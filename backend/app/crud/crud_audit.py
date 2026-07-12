from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.audit import AuditCycle, AuditCycleStatus, AuditItem, AuditItemStatus
from app.models.asset import Asset, AssetStatus
from app.models.activity_log import ActivityLog
from app.models.maintenance_request import MaintenanceRequest
from app.schemas.audit import AuditCycleCreate, AuditItemUpdate

class CRUDAudit(CRUDBase[AuditCycle, AuditCycleCreate, None]):
    def create_cycle(self, db: Session, *, obj_in: AuditCycleCreate) -> AuditCycle:
        # Create the cycle
        db_cycle = AuditCycle(
            name=obj_in.name,
            start_date=obj_in.start_date,
            status=AuditCycleStatus.planned,
            auditor_id=obj_in.auditor_id
        )
        db.add(db_cycle)
        db.commit()
        db.refresh(db_cycle)

        # Retrieve all assets and seed the audit_items table
        assets = db.query(Asset).all()
        for asset in assets:
            db_item = AuditItem(
                cycle_id=db_cycle.id,
                asset_id=asset.id,
                status=AuditItemStatus.pending
            )
            db.add(db_item)
        
        # Log the activity
        db_log = ActivityLog(
            title=f"Audit Cycle '{db_cycle.name}' initiated",
            type="AUDIT_CYCLE"
        )
        db.add(db_log)
        
        db.commit()
        db.refresh(db_cycle)
        return db_cycle

    def update_item(self, db: Session, *, item_id: int, obj_in: AuditItemUpdate) -> Optional[AuditItem]:
        db_item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
        if not db_item:
            return None
        
        # Lock check: if cycle is already closed, prevent edits
        cycle = db_item.cycle
        if cycle.status == AuditCycleStatus.closed:
            raise ValueError("Cannot update audit items in a closed audit cycle.")
        
        db_item.status = obj_in.status
        db_item.notes = obj_in.notes
        
        if obj_in.status == AuditItemStatus.verified:
            db_item.verified_at = datetime.utcnow()
        else:
            db_item.verified_at = None
            
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    def close_cycle(self, db: Session, *, cycle_id: int, resolver_id: int) -> Optional[AuditCycle]:
        db_cycle = db.query(AuditCycle).filter(AuditCycle.id == cycle_id).first()
        if not db_cycle:
            return None
        
        if db_cycle.status == AuditCycleStatus.closed:
            raise ValueError("Audit cycle is already closed.")
            
        db_cycle.status = AuditCycleStatus.closed
        db_cycle.end_date = date.today()
        db.add(db_cycle)
        
        # Process discrepancies (Missing/Damaged assets)
        audit_items = db.query(AuditItem).filter(AuditItem.cycle_id == cycle_id).all()
        for item in audit_items:
            asset = db.query(Asset).filter(Asset.id == item.asset_id).first()
            if not asset:
                continue
                
            if item.status == AuditItemStatus.missing:
                # Missing asset status updates to LOST
                asset.status = AssetStatus.lost
                db.add(asset)
            elif item.status == AuditItemStatus.damaged:
                # Damaged asset status updates to UNDER_MAINTENANCE and raises maintenance request
                asset.status = AssetStatus.under_maintenance
                db.add(asset)
                
                # Check if a maintenance request is already raised for this asset in pending state
                existing_req = db.query(MaintenanceRequest).filter(
                    MaintenanceRequest.asset_id == asset.id,
                    MaintenanceRequest.status.in_(["PENDING", "APPROVED", "IN_PROGRESS"])
                ).first()
                
                if not existing_req:
                    db_maint = MaintenanceRequest(
                        asset_id=asset.id,
                        requester_id=resolver_id,
                        description=f"Auto-generated from Audit Cycle discrepancy notes: {item.notes or 'No details provided.'}",
                        priority="MEDIUM",
                        status="PENDING"
                    )
                    db.add(db_maint)
                    
        # Log the activity
        db_log = ActivityLog(
            title=f"Audit Cycle '{db_cycle.name}' closed",
            type="AUDIT_CYCLE",
            user_id=resolver_id
        )
        db.add(db_log)
        
        db.commit()
        db.refresh(db_cycle)
        return db_cycle

audit = CRUDAudit(AuditCycle)

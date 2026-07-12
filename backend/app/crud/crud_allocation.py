from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.allocation import Allocation, AllocationStatus
from app.models.asset import Asset, AssetStatus
from app.schemas.allocation import AllocationCreate

class CRUDAllocation(CRUDBase[Allocation, AllocationCreate, Any := None]):
    def get_active_by_asset(self, db: Session, *, asset_id: int) -> Optional[Allocation]:
        return db.query(Allocation).filter(
            Allocation.asset_id == asset_id,
            Allocation.status.in_([AllocationStatus.active, AllocationStatus.overdue])
        ).first()

    def get_all_active(self, db: Session) -> List[Allocation]:
        # Proactively check overdue statuses first
        self.check_and_update_overdue(db)
        return db.query(Allocation).filter(
            Allocation.status.in_([AllocationStatus.active, AllocationStatus.overdue])
        ).all()

    def get_history(self, db: Session) -> List[Allocation]:
        return db.query(Allocation).all()

    def create_allocation(self, db: Session, *, obj_in: AllocationCreate, allocated_by_id: int) -> Optional[Allocation]:
        # Check active double allocation
        active_alloc = self.get_active_by_asset(db, asset_id=obj_in.asset_id)
        if active_alloc:
            return None

        # Check if asset exists and is available
        asset_obj = db.query(Asset).filter(Asset.id == obj_in.asset_id).first()
        if not asset_obj or asset_obj.status != AssetStatus.available:
            return None

        # Create allocation
        db_obj = Allocation(
            asset_id=obj_in.asset_id,
            allocated_to_type=obj_in.allocated_to_type,
            allocated_to_id=obj_in.allocated_to_id,
            allocated_by_id=allocated_by_id,
            allocated_at=datetime.utcnow(),
            due_date=obj_in.due_date,
            status=AllocationStatus.active
        )
        
        # Update asset status
        asset_obj.status = AssetStatus.allocated
        
        db.add(db_obj)
        db.add(asset_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def return_allocation(self, db: Session, *, db_obj: Allocation, return_condition: Optional[str] = None) -> Allocation:
        db_obj.returned_at = datetime.utcnow()
        db_obj.return_condition = return_condition
        db_obj.status = AllocationStatus.returned

        # Revert asset status to available
        asset_obj = db.query(Asset).filter(Asset.id == db_obj.asset_id).first()
        if asset_obj:
            asset_obj.status = AssetStatus.available
            db.add(asset_obj)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def check_and_update_overdue(self, db: Session) -> int:
        now = datetime.utcnow()
        overdue_allocs = db.query(Allocation).filter(
            Allocation.status == AllocationStatus.active,
            Allocation.due_date < now
        ).all()
        
        count = 0
        for alloc in overdue_allocs:
            alloc.status = AllocationStatus.overdue
            db.add(alloc)
            count += 1
            
        if count > 0:
            db.commit()
        return count

allocation = CRUDAllocation(Allocation)

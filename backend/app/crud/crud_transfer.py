from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.transfer import TransferRequest, TransferRequestStatus
from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.asset import Asset, AssetStatus
from app.schemas.transfer import TransferRequestCreate

class CRUDTransferRequest(CRUDBase[TransferRequest, TransferRequestCreate, Any := None]):
    def get_pending(self, db: Session) -> List[TransferRequest]:
        return db.query(TransferRequest).filter(TransferRequest.status == TransferRequestStatus.pending).all()

    def get_by_allocation(self, db: Session, *, allocation_id: int) -> List[TransferRequest]:
        return db.query(TransferRequest).filter(TransferRequest.allocation_id == allocation_id).all()

    def create_transfer(self, db: Session, *, obj_in: TransferRequestCreate, requested_by_id: int) -> Optional[TransferRequest]:
        # Verify allocation exists and is active/overdue
        alloc = db.query(Allocation).filter(
            Allocation.id == obj_in.allocation_id,
            Allocation.status.in_([AllocationStatus.active, AllocationStatus.overdue])
        ).first()
        if not alloc:
            return None

        db_obj = TransferRequest(
            allocation_id=obj_in.allocation_id,
            requested_by_id=requested_by_id,
            target_type=obj_in.target_type,
            target_id=obj_in.target_id,
            status=TransferRequestStatus.pending,
            created_at=datetime.utcnow()
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def approve_transfer(self, db: Session, *, transfer_req: TransferRequest, resolved_by_id: int) -> Optional[Allocation]:
        # Get old allocation
        old_alloc = db.query(Allocation).filter(Allocation.id == transfer_req.allocation_id).first()
        if not old_alloc or old_alloc.status not in [AllocationStatus.active, AllocationStatus.overdue]:
            return None

        # Mark transfer approved
        transfer_req.status = TransferRequestStatus.approved
        transfer_req.resolved_at = datetime.utcnow()
        db.add(transfer_req)

        # Mark old allocation as transferred
        old_alloc.status = AllocationStatus.transferred
        old_alloc.returned_at = datetime.utcnow()
        old_alloc.return_condition = f"Transferred to {transfer_req.target_type} ID {transfer_req.target_id}"
        db.add(old_alloc)

        # Create new allocation
        new_alloc = Allocation(
            asset_id=old_alloc.asset_id,
            allocated_to_type=AllocationToType.user if transfer_req.target_type == "user" else AllocationToType.department,
            allocated_to_id=transfer_req.target_id,
            allocated_by_id=resolved_by_id,
            allocated_at=datetime.utcnow(),
            due_date=old_alloc.due_date,
            status=AllocationStatus.active
        )
        db.add(new_alloc)
        db.commit()
        db.refresh(new_alloc)
        return new_alloc

    def reject_transfer(self, db: Session, *, transfer_req: TransferRequest) -> TransferRequest:
        transfer_req.status = TransferRequestStatus.rejected
        transfer_req.resolved_at = datetime.utcnow()
        db.add(transfer_req)
        db.commit()
        db.refresh(transfer_req)
        return transfer_req

transfer_request = CRUDTransferRequest(TransferRequest)

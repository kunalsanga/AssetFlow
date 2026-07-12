"""
Transfer Service — business logic for transfer request workflow.

Workflow: PENDING → APPROVED / REJECTED / CANCELLED

On APPROVE:
  - Old allocation → TRANSFERRED
  - New allocation created → ACTIVE
  - Asset status unchanged (stays ALLOCATED)

On REJECT / CANCEL:
  - Transfer status updated, no allocation change.

Notifications and activity logs are generated on every state change.
"""
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transfer import TransferRequest, TransferRequestStatus
from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.asset import Asset, AssetStatus
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.repositories.transfer_repository import transfer_repo
from app.repositories.allocation_repository import allocation_repo
from app.repositories.asset_repository import asset_repo
from app.repositories.employee_repository import employee_repo
from app.schemas.transfer import TransferRequestCreate, TransferRequestResponse
from app.services.notification_service import notification_service
from app.exceptions import (
    ResourceNotFoundException,
    ValidationException,
)


class TransferService:

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    async def _log(
        self,
        db: AsyncSession,
        user_id: int,
        asset_id: Optional[int],
        title: str,
        log_type: str,
    ) -> None:
        log = ActivityLog(user_id=user_id, asset_id=asset_id, title=title, type=log_type)
        db.add(log)
        await db.commit()

    # ------------------------------------------------------------------ #
    #  Create transfer request                                             #
    # ------------------------------------------------------------------ #

    async def request_transfer(
        self, db: AsyncSession, obj_in: TransferRequestCreate, current_user: User
    ) -> TransferRequest:
        # Validate asset exists
        asset = await asset_repo.get(db, obj_in.asset_id)
        if not asset:
            raise ResourceNotFoundException("Asset not found.")

        # Get active allocation on this asset
        active_alloc = await allocation_repo.get_active_by_asset(db, obj_in.asset_id)
        if not active_alloc:
            raise ValidationException(
                "Asset has no active allocation. Allocate it directly instead of transferring."
            )

        # Validate requested holder exists and is active
        target = await employee_repo.get(db, obj_in.requested_holder)
        if not target:
            raise ResourceNotFoundException("Target employee not found.")
        if not target.is_active:
            raise ValidationException("Cannot transfer asset to an inactive employee.")

        # Resolve allocation_id
        allocation_id = obj_in.allocation_id or active_alloc.id

        tr = TransferRequest(
            allocation_id=allocation_id,
            requested_by_id=current_user.id,
            target_type="user",
            target_id=obj_in.requested_holder,
            status=TransferRequestStatus.pending,
            created_at=datetime.utcnow(),
            asset_id=obj_in.asset_id,
            current_holder=active_alloc.employee_id or active_alloc.allocated_to_id,
            requested_holder=obj_in.requested_holder,
            requested_by=current_user.id,
            reason=obj_in.reason,
            requested_at=datetime.utcnow(),
        )
        created = await transfer_repo.create(db, obj_in=tr)

        await self._log(
            db, current_user.id, obj_in.asset_id,
            f"Transfer requested for asset '{asset.name}' to user #{obj_in.requested_holder}.",
            "TRANSFER_REQUESTED",
        )
        await notification_service.create(
            db,
            user_id=obj_in.requested_holder,
            title="Transfer Request Received",
            message=f"Asset '{asset.name}' ({asset.asset_tag}) has been requested for transfer to you.",
        )
        return created

    # ------------------------------------------------------------------ #
    #  Approve                                                             #
    # ------------------------------------------------------------------ #

    async def approve_transfer(
        self, db: AsyncSession, transfer_id: int, current_user: User
    ) -> TransferRequest:
        tr = await self._get_or_404(db, transfer_id)

        if tr.status != TransferRequestStatus.pending:
            raise ValidationException("Only pending transfer requests can be approved.")

        # Permission check
        self._check_approve_permission(tr, current_user)

        # Close old allocation
        old_alloc = await allocation_repo.get(db, tr.allocation_id)
        if old_alloc and old_alloc.status in (AllocationStatus.active, AllocationStatus.overdue):
            old_alloc.status = AllocationStatus.transferred
            old_alloc.returned_at = datetime.utcnow()
            old_alloc.return_condition = f"Transferred to user ID {tr.requested_holder}"
            db.add(old_alloc)

        # Create new allocation
        new_alloc = Allocation(
            asset_id=tr.asset_id,
            employee_id=tr.requested_holder,
            allocated_to_type=AllocationToType.user,
            allocated_to_id=tr.requested_holder,
            allocated_by_id=current_user.id,
            allocated_at=datetime.utcnow(),
            due_date=old_alloc.due_date if old_alloc else datetime.utcnow(),
            expected_return=old_alloc.expected_return if old_alloc else None,
            status=AllocationStatus.active,
        )
        db.add(new_alloc)

        # Update transfer
        tr.status = TransferRequestStatus.approved
        tr.approved_by = current_user.id
        tr.approved_at = datetime.utcnow()
        tr.resolved_at = datetime.utcnow()
        updated = await transfer_repo.update(db, db_obj=tr)

        # Asset stays ALLOCATED (holder changed)
        await db.commit()

        await self._log(
            db, current_user.id, tr.asset_id,
            f"Transfer #{transfer_id} approved by {current_user.full_name or current_user.email}.",
            "TRANSFER_APPROVED",
        )
        asset = await asset_repo.get(db, tr.asset_id)
        await notification_service.create(
            db,
            user_id=tr.requested_holder,
            title="Transfer Approved",
            message=f"Your transfer request for asset '{asset.name if asset else ''}' has been approved.",
        )
        if tr.current_holder:
            await notification_service.create(
                db,
                user_id=tr.current_holder,
                title="Transfer Approved",
                message=f"Asset '{asset.name if asset else ''}' has been transferred away from you.",
            )
        return updated

    # ------------------------------------------------------------------ #
    #  Reject                                                              #
    # ------------------------------------------------------------------ #

    async def reject_transfer(
        self, db: AsyncSession, transfer_id: int, current_user: User
    ) -> TransferRequest:
        tr = await self._get_or_404(db, transfer_id)

        if tr.status != TransferRequestStatus.pending:
            raise ValidationException("Only pending transfer requests can be rejected.")

        self._check_approve_permission(tr, current_user)

        tr.status = TransferRequestStatus.rejected
        tr.approved_by = current_user.id
        tr.resolved_at = datetime.utcnow()
        updated = await transfer_repo.update(db, db_obj=tr)

        await self._log(
            db, current_user.id, tr.asset_id,
            f"Transfer #{transfer_id} rejected.", "TRANSFER_REJECTED"
        )
        if tr.requested_by:
            await notification_service.create(
                db,
                user_id=tr.requested_by,
                title="Transfer Rejected",
                message=f"Your transfer request #{transfer_id} has been rejected.",
            )
        return updated

    # ------------------------------------------------------------------ #
    #  Cancel                                                              #
    # ------------------------------------------------------------------ #

    async def cancel_transfer(
        self, db: AsyncSession, transfer_id: int, current_user: User
    ) -> TransferRequest:
        tr = await self._get_or_404(db, transfer_id)

        if tr.status != TransferRequestStatus.pending:
            raise ValidationException("Only pending transfer requests can be cancelled.")

        # Only the requester, admin, or asset manager can cancel
        if current_user.role not in (UserRole.admin, UserRole.asset_manager):
            if tr.requested_by != current_user.id and tr.requested_by_id != current_user.id:
                raise ValidationException("You are not authorized to cancel this transfer.")

        tr.status = TransferRequestStatus.cancelled
        tr.resolved_at = datetime.utcnow()
        updated = await transfer_repo.update(db, db_obj=tr)

        await self._log(
            db, current_user.id, tr.asset_id,
            f"Transfer #{transfer_id} cancelled.", "TRANSFER_CANCELLED"
        )
        return updated

    # ------------------------------------------------------------------ #
    #  List                                                                #
    # ------------------------------------------------------------------ #

    async def list_transfers(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        status=None,
        asset_id=None,
        current_user: Optional[User] = None,
    ) -> Tuple[List[TransferRequest], int]:
        requested_by = None
        if current_user and current_user.role == UserRole.employee:
            requested_by = current_user.id

        return await transfer_repo.get_paginated(
            db,
            page=page,
            page_size=page_size,
            status=status,
            asset_id=asset_id,
            requested_by=requested_by,
        )

    # ------------------------------------------------------------------ #
    #  Private utilities                                                   #
    # ------------------------------------------------------------------ #

    async def _get_or_404(self, db: AsyncSession, transfer_id: int) -> TransferRequest:
        tr = await transfer_repo.get(db, transfer_id)
        if not tr:
            raise ResourceNotFoundException("Transfer request not found.")
        return tr

    def _check_approve_permission(self, tr: TransferRequest, current_user: User) -> None:
        if current_user.role not in (UserRole.admin, UserRole.asset_manager, UserRole.department_head):
            raise ValidationException("You do not have permission to approve/reject transfers.")


transfer_service = TransferService()

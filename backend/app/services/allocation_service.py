"""
Allocation Service — business logic for Screen 5 (Asset Allocation & Transfer).

Business rules enforced here:
1. Only one active allocation per asset (409 Conflict otherwise).
2. expected_return must be in the future.
3. Return marks asset AVAILABLE and allocation RETURNED.
4. Overdue assets are auto-detected.
5. Every action persists an ActivityLog and a Notification.
"""
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.asset import Asset, AssetStatus
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.repositories.allocation_repository import allocation_repo
from app.repositories.asset_repository import asset_repo
from app.repositories.employee_repository import employee_repo
from app.schemas.allocation import AllocationCreate, AllocationReturn
from app.services.notification_service import notification_service
from app.exceptions import (
    ResourceNotFoundException,
    ValidationException,
    DoubleAllocationException,
)


class AllocationService:

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
    #  Allocate                                                            #
    # ------------------------------------------------------------------ #

    async def allocate(
        self, db: AsyncSession, obj_in: AllocationCreate, current_user: User
    ) -> Allocation:
        # Validate asset exists
        asset = await asset_repo.get(db, obj_in.asset_id)
        if not asset:
            raise ResourceNotFoundException("Asset not found.")

        # Check no active allocation
        active = await allocation_repo.get_active_by_asset(db, obj_in.asset_id)
        if active:
            raise DoubleAllocationException(
                f"Asset '{asset.name}' is already allocated. "
                "Raise a transfer request to re-assign it."
            )

        # Asset must be available
        if asset.status != AssetStatus.available:
            raise ValidationException(
                f"Asset is currently '{asset.status.value}' and cannot be allocated."
            )

        # Validate employee if provided
        employee_id = obj_in.employee_id
        if employee_id:
            emp = await employee_repo.get(db, employee_id)
            if not emp:
                raise ResourceNotFoundException("Employee not found.")
            if not emp.is_active:
                raise ValidationException("Cannot allocate asset to an inactive employee.")

        # Validate expected_return is in the future
        if obj_in.expected_return <= datetime.utcnow():
            raise ValidationException("Expected return date must be in the future.")

        # Build allocation
        allocated_to_id = employee_id or obj_in.allocated_to_id or employee_id or current_user.id
        allocation = Allocation(
            asset_id=obj_in.asset_id,
            employee_id=employee_id,
            department_id=obj_in.department_id,
            allocated_to_type=obj_in.allocated_to_type or AllocationToType.user,
            allocated_to_id=allocated_to_id,
            allocated_by_id=current_user.id,
            allocated_at=datetime.utcnow(),
            due_date=obj_in.expected_return,
            expected_return=obj_in.expected_return,
            status=AllocationStatus.active,
        )

        # Mark asset as allocated
        asset.status = AssetStatus.allocated
        db.add(asset)

        created = await allocation_repo.create(db, obj_in=allocation)

        await self._log(
            db, current_user.id, asset.id,
            f"Asset '{asset.name}' allocated to user/dept ID {allocated_to_id}.", "ASSET_ALLOCATED"
        )
        await notification_service.create(
            db,
            user_id=employee_id or current_user.id,
            title="Asset Allocated",
            message=f"Asset '{asset.name}' ({asset.asset_tag}) has been allocated to you.",
        )
        return created

    # ------------------------------------------------------------------ #
    #  Return                                                              #
    # ------------------------------------------------------------------ #

    async def return_asset(
        self,
        db: AsyncSession,
        allocation_id: int,
        obj_in: AllocationReturn,
        current_user: User,
    ) -> Allocation:
        alloc = await allocation_repo.get(db, allocation_id)
        if not alloc:
            raise ResourceNotFoundException("Allocation not found.")

        # Permission: admin/asset_manager or the holder themselves
        if current_user.role not in (UserRole.admin, UserRole.asset_manager):
            if alloc.employee_id != current_user.id and alloc.allocated_to_id != current_user.id:
                raise ValidationException("You are not the holder of this allocation.")

        if alloc.status not in (AllocationStatus.active, AllocationStatus.overdue):
            raise ValidationException("Allocation is not active.")

        alloc.returned_at = datetime.utcnow()
        alloc.return_notes = obj_in.return_notes
        alloc.condition_on_return = obj_in.condition_on_return
        alloc.return_condition = obj_in.condition_on_return
        alloc.status = AllocationStatus.returned

        # Mark asset available
        asset = await asset_repo.get(db, alloc.asset_id)
        if asset:
            asset.status = AssetStatus.available
            db.add(asset)

        updated = await allocation_repo.update(db, db_obj=alloc)

        await self._log(
            db, current_user.id, alloc.asset_id,
            f"Asset returned (Allocation #{allocation_id}).", "ASSET_RETURNED"
        )
        await notification_service.create(
            db,
            user_id=alloc.allocated_by_id,
            title="Asset Returned",
            message=f"Asset (Allocation #{allocation_id}) has been returned successfully.",
        )
        return updated

    # ------------------------------------------------------------------ #
    #  Overdue detection                                                   #
    # ------------------------------------------------------------------ #

    async def sync_overdue(self, db: AsyncSession) -> int:
        overdue = await allocation_repo.get_overdue(db)
        count = 0
        for alloc in overdue:
            if alloc.status == AllocationStatus.active:
                alloc.status = AllocationStatus.overdue
                db.add(alloc)
                count += 1
        if count:
            await db.commit()
        return count

    # ------------------------------------------------------------------ #
    #  Paginated listing                                                   #
    # ------------------------------------------------------------------ #

    async def list_allocations(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        status=None,
        asset_id=None,
        employee_id=None,
        department_id=None,
        current_user: Optional[User] = None,
    ) -> Tuple[List[Allocation], int]:
        # Employees only see their own
        if current_user and current_user.role == UserRole.employee:
            employee_id = current_user.id

        return await allocation_repo.get_paginated(
            db,
            page=page,
            page_size=page_size,
            status=status,
            asset_id=asset_id,
            employee_id=employee_id,
            department_id=department_id,
        )

    async def get_overdue_list(self, db: AsyncSession) -> List[Allocation]:
        return await allocation_repo.get_overdue(db)

    async def get_allocation(self, db: AsyncSession, id: int) -> Allocation:
        alloc = await allocation_repo.get(db, id)
        if not alloc:
            raise ResourceNotFoundException("Allocation not found.")
        return alloc


allocation_service = AllocationService()

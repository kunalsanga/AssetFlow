"""
Allocation Repository — async SQLAlchemy queries for allocation management.
"""
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_

from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.asset import Asset


class AllocationRepository:

    async def get(self, db: AsyncSession, id: int) -> Optional[Allocation]:
        result = await db.execute(select(Allocation).where(Allocation.id == id))
        return result.scalars().first()

    async def get_active_by_asset(self, db: AsyncSession, asset_id: int) -> Optional[Allocation]:
        result = await db.execute(
            select(Allocation).where(
                and_(
                    Allocation.asset_id == asset_id,
                    Allocation.status.in_([AllocationStatus.active, AllocationStatus.overdue]),
                )
            )
        )
        return result.scalars().first()

    async def get_paginated(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        status: Optional[AllocationStatus] = None,
        asset_id: Optional[int] = None,
        employee_id: Optional[int] = None,
        department_id: Optional[int] = None,
    ) -> Tuple[List[Allocation], int]:
        stmt = select(Allocation)
        count_stmt = select(func.count(Allocation.id))

        if status:
            stmt = stmt.where(Allocation.status == status)
            count_stmt = count_stmt.where(Allocation.status == status)
        if asset_id:
            stmt = stmt.where(Allocation.asset_id == asset_id)
            count_stmt = count_stmt.where(Allocation.asset_id == asset_id)
        if employee_id:
            stmt = stmt.where(
                or_(
                    Allocation.employee_id == employee_id,
                    and_(Allocation.allocated_to_type == AllocationToType.user,
                         Allocation.allocated_to_id == employee_id)
                )
            )
            count_stmt = count_stmt.where(
                or_(
                    Allocation.employee_id == employee_id,
                    and_(Allocation.allocated_to_type == AllocationToType.user,
                         Allocation.allocated_to_id == employee_id)
                )
            )
        if department_id:
            stmt = stmt.where(Allocation.department_id == department_id)
            count_stmt = count_stmt.where(Allocation.department_id == department_id)

        total = await db.scalar(count_stmt) or 0
        stmt = stmt.order_by(Allocation.allocated_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    async def get_overdue(self, db: AsyncSession) -> List[Allocation]:
        now = datetime.utcnow()
        result = await db.execute(
            select(Allocation).where(
                and_(
                    Allocation.returned_at.is_(None),
                    Allocation.due_date < now,
                    Allocation.status.in_([AllocationStatus.active, AllocationStatus.overdue]),
                )
            )
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, *, obj_in: Allocation) -> Allocation:
        db.add(obj_in)
        await db.commit()
        await db.refresh(obj_in)
        return obj_in

    async def update(self, db: AsyncSession, *, db_obj: Allocation) -> Allocation:
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


allocation_repo = AllocationRepository()

"""
Asset Repository — async SQLAlchemy queries for asset management.
Supports pagination, search, filtering, and QR/asset-tag lookup.
"""
from typing import List, Optional, Tuple
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, desc

from app.models.asset import Asset, AssetStatus, AssetCondition
from app.models.allocation import Allocation, AllocationStatus
from app.models.maintenance_request import MaintenanceRequest
from app.models.activity_log import ActivityLog


class AssetRepository:

    # ------------------------------------------------------------------ #
    #  Single-record lookups                                               #
    # ------------------------------------------------------------------ #

    async def get(self, db: AsyncSession, id: int) -> Optional[Asset]:
        result = await db.execute(select(Asset).where(Asset.id == id))
        return result.scalars().first()

    async def get_by_serial(self, db: AsyncSession, serial_number: str) -> Optional[Asset]:
        result = await db.execute(
            select(Asset).where(Asset.serial_number == serial_number)
        )
        return result.scalars().first()

    async def get_by_asset_tag(self, db: AsyncSession, asset_tag: str) -> Optional[Asset]:
        result = await db.execute(
            select(Asset).where(Asset.asset_tag == asset_tag)
        )
        return result.scalars().first()

    # ------------------------------------------------------------------ #
    #  Auto-generate next asset tag (format AF-000001)                     #
    # ------------------------------------------------------------------ #

    async def get_next_asset_tag(self, db: AsyncSession) -> str:
        result = await db.execute(
            select(func.count(Asset.id))
        )
        count = result.scalar() or 0
        return f"AF-{(count + 1):06d}"

    # ------------------------------------------------------------------ #
    #  Paginated directory listing with all optional filters               #
    # ------------------------------------------------------------------ #

    async def get_paginated(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        status: Optional[AssetStatus] = None,
        condition: Optional[AssetCondition] = None,
        category_id: Optional[int] = None,
        department_id: Optional[int] = None,
        sort: str = "created_at",
        order: str = "desc",
    ) -> Tuple[List[Asset], int]:
        stmt = select(Asset)
        count_stmt = select(func.count(Asset.id))

        # Search
        if search:
            search_filter = or_(
                Asset.name.ilike(f"%{search}%"),
                Asset.serial_number.ilike(f"%{search}%"),
                Asset.asset_tag.ilike(f"%{search}%"),
                Asset.location.ilike(f"%{search}%"),
            )
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        # Filters
        if status:
            stmt = stmt.where(Asset.status == status)
            count_stmt = count_stmt.where(Asset.status == status)
        if condition:
            stmt = stmt.where(Asset.condition == condition)
            count_stmt = count_stmt.where(Asset.condition == condition)
        if category_id:
            stmt = stmt.where(Asset.category_id == category_id)
            count_stmt = count_stmt.where(Asset.category_id == category_id)
        if department_id:
            stmt = stmt.where(Asset.department_id == department_id)
            count_stmt = count_stmt.where(Asset.department_id == department_id)

        # Sort
        sort_col = getattr(Asset, sort, Asset.created_at)
        if order.lower() == "asc":
            stmt = stmt.order_by(sort_col.asc())
        else:
            stmt = stmt.order_by(sort_col.desc())

        # Pagination
        total = await db.scalar(count_stmt) or 0
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    # ------------------------------------------------------------------ #
    #  Activity history count & allocation count                           #
    # ------------------------------------------------------------------ #

    async def get_history_count(self, db: AsyncSession, asset_id: int) -> int:
        result = await db.execute(
            select(func.count(ActivityLog.id)).where(ActivityLog.asset_id == asset_id)
        )
        return result.scalar() or 0

    async def get_allocation_count(self, db: AsyncSession, asset_id: int) -> int:
        result = await db.execute(
            select(func.count(Allocation.id)).where(Allocation.asset_id == asset_id)
        )
        return result.scalar() or 0

    async def get_latest_maintenance(
        self, db: AsyncSession, asset_id: int
    ) -> Optional[MaintenanceRequest]:
        result = await db.execute(
            select(MaintenanceRequest)
            .where(MaintenanceRequest.asset_id == asset_id)
            .order_by(desc(MaintenanceRequest.id))
            .limit(1)
        )
        return result.scalars().first()

    async def get_active_holder(self, db: AsyncSession, asset_id: int) -> Optional[Allocation]:
        result = await db.execute(
            select(Allocation).where(
                and_(
                    Allocation.asset_id == asset_id,
                    Allocation.status.in_([AllocationStatus.active, AllocationStatus.overdue]),
                )
            )
        )
        return result.scalars().first()

    # ------------------------------------------------------------------ #
    #  CRUD helpers                                                        #
    # ------------------------------------------------------------------ #

    async def create(self, db: AsyncSession, *, obj_in: Asset) -> Asset:
        db.add(obj_in)
        await db.commit()
        await db.refresh(obj_in)
        return obj_in

    async def update(self, db: AsyncSession, *, db_obj: Asset) -> Asset:
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, db_obj: Asset) -> Asset:
        await db.delete(db_obj)
        await db.commit()
        return db_obj


asset_repo = AssetRepository()

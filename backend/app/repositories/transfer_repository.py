"""
Transfer Repository — async SQLAlchemy queries for transfer request management.
"""
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_

from app.models.transfer import TransferRequest, TransferRequestStatus


class TransferRepository:

    async def get(self, db: AsyncSession, id: int) -> Optional[TransferRequest]:
        result = await db.execute(select(TransferRequest).where(TransferRequest.id == id))
        return result.scalars().first()

    async def get_paginated(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        status: Optional[TransferRequestStatus] = None,
        asset_id: Optional[int] = None,
        requested_by: Optional[int] = None,
    ) -> Tuple[List[TransferRequest], int]:
        stmt = select(TransferRequest)
        count_stmt = select(func.count(TransferRequest.id))

        if status:
            stmt = stmt.where(TransferRequest.status == status)
            count_stmt = count_stmt.where(TransferRequest.status == status)
        if asset_id:
            stmt = stmt.where(TransferRequest.asset_id == asset_id)
            count_stmt = count_stmt.where(TransferRequest.asset_id == asset_id)
        if requested_by:
            stmt = stmt.where(
                or_(TransferRequest.requested_by == requested_by,
                    TransferRequest.requested_by_id == requested_by)
            )
            count_stmt = count_stmt.where(
                or_(TransferRequest.requested_by == requested_by,
                    TransferRequest.requested_by_id == requested_by)
            )

        total = await db.scalar(count_stmt) or 0
        stmt = stmt.order_by(TransferRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    async def create(self, db: AsyncSession, *, obj_in: TransferRequest) -> TransferRequest:
        db.add(obj_in)
        await db.commit()
        await db.refresh(obj_in)
        return obj_in

    async def update(self, db: AsyncSession, *, db_obj: TransferRequest) -> TransferRequest:
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


transfer_repo = TransferRepository()

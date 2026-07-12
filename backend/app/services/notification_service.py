"""
Notification Service — create and retrieve persistent notifications.
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.notification import Notification
from app.models.user import User


class NotificationService:

    async def create(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[int],
        title: str,
        message: str,
    ) -> Notification:
        notif = Notification(user_id=user_id, title=title, message=message)
        db.add(notif)
        await db.commit()
        await db.refresh(notif)
        return notif

    async def get_for_user(
        self, db: AsyncSession, user_id: int, unread_only: bool = False
    ) -> List[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Notification.is_read == False)
        stmt = stmt.order_by(Notification.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def mark_read(self, db: AsyncSession, notification_id: int, user_id: int) -> Optional[Notification]:
        result = await db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        notif = result.scalars().first()
        if notif:
            notif.is_read = True
            db.add(notif)
            await db.commit()
            await db.refresh(notif)
        return notif

    async def mark_all_read(self, db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
        )
        notifs = list(result.scalars().all())
        for n in notifs:
            n.is_read = True
            db.add(n)
        if notifs:
            await db.commit()
        return len(notifs)


notification_service = NotificationService()

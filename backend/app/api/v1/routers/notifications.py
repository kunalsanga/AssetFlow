"""
Notifications Router — persist and retrieve user notifications.

GET  /notifications          – list current user's notifications
PATCH /notifications/{id}/read – mark one notification read
PATCH /notifications/read-all  – mark all read
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api import deps
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import notification_service

router = APIRouter()


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="List My Notifications",
    description="Returns all notifications for the authenticated user, newest first.",
)
async def list_notifications(
    unread_only: bool = False,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    return await notification_service.get_for_user(db, current_user.id, unread_only=unread_only)


@router.patch(
    "/{id}/read",
    response_model=NotificationResponse,
    summary="Mark Notification as Read",
)
async def mark_notification_read(
    id: int,
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    notif = await notification_service.mark_read(db, id, current_user.id)
    if not notif:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notification not found.")
    return notif


@router.patch(
    "/read-all",
    summary="Mark All Notifications as Read",
)
async def mark_all_read(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
):
    count = await notification_service.mark_all_read(db, current_user.id)
    return {"success": True, "message": f"{count} notifications marked as read."}

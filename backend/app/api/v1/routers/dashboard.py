from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.api import deps
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter()

@router.get(
    "",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Dashboard Data",
    description=(
        "Fetches aggregated summary metrics, active alerts, recent activity, quick action "
        "permissions, and user profile metadata based on the authenticated user's "
        "Role-Based Access Control (RBAC) permissions."
    ),
    responses={
        200: {
            "description": "Dashboard data retrieved successfully.",
            "model": DashboardResponse,
        },
        401: {
            "description": "Authentication credentials not provided or invalid.",
        },
        403: {
            "description": "User account is inactive or permission denied.",
        },
        500: {
            "description": "Internal server error occurred while processing the dashboard metrics.",
        },
    },
)
async def get_dashboard(
    db: AsyncSession = Depends(deps.get_async_db),
    current_user: User = Depends(deps.get_current_active_user_async),
) -> DashboardResponse:
    logger.info(f"Dashboard requested by user {current_user.email}")
    return await dashboard_service.get_dashboard_data(db, current_user)

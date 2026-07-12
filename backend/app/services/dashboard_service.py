from datetime import date, datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.models.user import User, UserRole
from app.models.department import Department
from app.repositories.dashboard_repository import dashboard_repo
from app.schemas.dashboard import (
    DashboardResponse,
    DashboardData,
    DashboardSummary,
    DashboardAlert,
    RecentActivity,
    QuickActions,
    DashboardUser,
)
from app.exceptions import DashboardLoadError

class DashboardService:
    async def get_dashboard_data(
        self, db: AsyncSession, user: User, test_today: Optional[date] = None
    ) -> DashboardResponse:
        """
        Coordinates the fetching and structuring of dashboard summary KPIs,
        alerts, recent activity, and permissions.
        """
        try:
            today = test_today or date.today()
            logger.info(
                f"Loading dashboard for user_id={user.id}, role={user.role}, date={today}"
            )

            # Fetch summary counts
            summary_data = await dashboard_repo.get_summary(db, user, today)
            summary = DashboardSummary(**summary_data)

            # Fetch recent activities
            activities_db = await dashboard_repo.get_recent_activities(db, user, limit=10)
            recent_activities = [
                RecentActivity(
                    id=act.id,
                    title=act.title,
                    type=act.type,
                    createdAt=act.created_at,
                )
                for act in activities_db
            ]

            # Fetch alerts counts
            alert_counts = await dashboard_repo.get_alerts_counts(db, user, today)
            alerts: List[DashboardAlert] = []
            alert_id = 1

            # 1. Overdue Returns Alert
            overdue_cnt = alert_counts.get("overdueReturns", 0)
            if overdue_cnt > 0:
                alerts.append(
                    DashboardAlert(
                        id=alert_id,
                        severity="HIGH",
                        title="Overdue Returns",
                        message=f"{overdue_cnt} asset(s) are overdue.",
                    )
                )
                alert_id += 1

            # 2. Pending Maintenance Alert
            pending_maint_cnt = alert_counts.get("pendingMaintenance", 0)
            if pending_maint_cnt > 0:
                alerts.append(
                    DashboardAlert(
                        id=alert_id,
                        severity="MEDIUM",
                        title="Pending Maintenance",
                        message=f"{pending_maint_cnt} maintenance request(s) pending approval.",
                    )
                )
                alert_id += 1

            # 3. Pending Transfers Alert
            pending_trans_cnt = alert_counts.get("pendingTransfers", 0)
            if pending_trans_cnt > 0:
                alerts.append(
                    DashboardAlert(
                        id=alert_id,
                        severity="MEDIUM",
                        title="Pending Transfers",
                        message=f"{pending_trans_cnt} transfer request(s) pending authorization.",
                    )
                )
                alert_id += 1

            # 4. Audit Due Alert (ADMIN and ASSET_MANAGER only, when no audits in last 30 days)
            recent_audits_cnt = alert_counts.get("recentAudits", 0)
            if user.role in [UserRole.ADMIN, UserRole.ASSET_MANAGER] and recent_audits_cnt == 0:
                alerts.append(
                    DashboardAlert(
                        id=alert_id,
                        severity="HIGH",
                        title="Audit Due",
                        message="Monthly asset audit cycle is due.",
                    )
                )
                alert_id += 1

            # 5. Upcoming Maintenance Alert
            upcoming_maint_cnt = alert_counts.get("upcomingMaintenance", 0)
            if upcoming_maint_cnt > 0:
                alerts.append(
                    DashboardAlert(
                        id=alert_id,
                        severity="INFO",
                        title="Upcoming Maintenance",
                        message=f"{upcoming_maint_cnt} maintenance event(s) scheduled in the next 7 days.",
                    )
                )
                alert_id += 1

            # Map Quick Actions based on role
            # ADMIN & ASSET_MANAGER can register assets. Others cannot.
            # All roles can book resources and raise maintenance requests.
            can_register = user.role in [UserRole.ADMIN, UserRole.ASSET_MANAGER]
            quick_actions = QuickActions(
                registerAsset=can_register,
                bookResource=True,
                raiseMaintenance=True,
            )

            # Fetch department name asynchronously to avoid lazy loading issues
            department_name = None
            if user.department_id:
                from sqlalchemy.future import select
                result = await db.execute(
                    select(Department.name).where(Department.id == user.department_id)
                )
                department_name = result.scalar()

            # Format role to uppercase for frontend mapping consistency
            role_display = (
                user.role.value.upper() if hasattr(user.role, "value") else str(user.role).upper()
            )

            dashboard_user = DashboardUser(
                id=user.id,
                name=user.full_name or user.email,
                role=role_display,
                department=department_name,
            )

            dashboard_data = DashboardData(
                summary=summary,
                alerts=alerts,
                recentActivities=recent_activities,
                quickActions=quick_actions,
                user=dashboard_user,
            )

            return DashboardResponse(
                success=True,
                message="Dashboard loaded successfully",
                data=dashboard_data,
            )

        except Exception as e:
            logger.error(f"Error loading dashboard: {str(e)}")
            raise DashboardLoadError(detail=f"Dashboard could not be loaded: {str(e)}")

dashboard_service = DashboardService()

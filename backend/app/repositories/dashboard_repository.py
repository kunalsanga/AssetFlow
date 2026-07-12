from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_

from app.models.user import User, UserRole
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation
from app.models.booking import Booking
from app.models.maintenance_request import MaintenanceRequest
from app.models.transfer_request import TransferRequest
from app.models.activity_log import ActivityLog

class DashboardRepository:
    async def get_summary(
        self, db: AsyncSession, user: User, today: date
    ) -> Dict[str, int]:
        """
        Gathers count aggregations for the dashboard KPIs using database-level COUNT queries,
        taking into account the user's role and scopes.
        """
        role = user.role
        user_id = user.id
        dept_id = user.department_id
        today_dt = datetime.combine(today, datetime.min.time())
        today_plus_7 = today + timedelta(days=7)

        # Base queries definitions with filters
        
        # 1. Assets Available
        available_stmt = select(func.count(Asset.id)).where(Asset.status == "AVAILABLE")
        if role == UserRole.asset_manager:
            available_stmt = available_stmt.where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            available_stmt = available_stmt.where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            available_stmt = available_stmt.where(
                or_(Asset.department_id == dept_id, Asset.is_shared == True)
            )

        # 2. Assets Allocated
        allocated_stmt = select(func.count(Asset.id)).where(Asset.status == "ALLOCATED")
        if role == UserRole.asset_manager:
            allocated_stmt = allocated_stmt.where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            allocated_stmt = allocated_stmt.where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            allocated_stmt = (
                allocated_stmt.join(AssetAllocation, AssetAllocation.asset_id == Asset.id)
                .where(AssetAllocation.user_id == user_id)
                .where(AssetAllocation.returned_at.is_(None))
            )

        # 3. Maintenance Today
        maintenance_stmt = select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.scheduled_date == today
        )
        if role == UserRole.asset_manager:
            maintenance_stmt = maintenance_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            maintenance_stmt = maintenance_stmt.join(Asset).where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            maintenance_stmt = maintenance_stmt.where(MaintenanceRequest.requester_id == user_id)

        # 4. Active Bookings (Booking status = ONGOING)
        bookings_stmt = select(func.count(Booking.id)).where(Booking.status == "ONGOING")
        if role == UserRole.asset_manager:
            bookings_stmt = bookings_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            bookings_stmt = bookings_stmt.join(User, Booking.user_id == User.id).where(
                User.department_id == dept_id
            )
        elif role == UserRole.employee:
            bookings_stmt = bookings_stmt.where(Booking.user_id == user_id)

        # 5. Pending Transfers (Transfer Request status = PENDING)
        transfers_stmt = select(func.count(TransferRequest.id)).where(
            TransferRequest.status == "PENDING"
        )
        if role == UserRole.asset_manager:
            transfers_stmt = transfers_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            transfers_stmt = transfers_stmt.join(Asset).where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            transfers_stmt = transfers_stmt.where(
                or_(
                    TransferRequest.from_user_id == user_id,
                    TransferRequest.to_user_id == user_id,
                )
            )

        # 6. Upcoming Returns
        upcoming_stmt = (
            select(func.count(AssetAllocation.id))
            .where(AssetAllocation.returned_at.is_(None))
            .where(AssetAllocation.expected_return_date >= today)
            .where(AssetAllocation.expected_return_date <= today_plus_7)
        )
        if role == UserRole.asset_manager:
            upcoming_stmt = upcoming_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            upcoming_stmt = upcoming_stmt.join(Asset).where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            upcoming_stmt = upcoming_stmt.where(AssetAllocation.user_id == user_id)

        # 7. Overdue Returns
        overdue_stmt = (
            select(func.count(AssetAllocation.id))
            .where(AssetAllocation.returned_at.is_(None))
            .where(AssetAllocation.expected_return_date < today)
        )
        if role == UserRole.asset_manager:
            overdue_stmt = overdue_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            overdue_stmt = overdue_stmt.join(Asset).where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            overdue_stmt = overdue_stmt.where(AssetAllocation.user_id == user_id)

        # Run counts
        res_available = await db.scalar(available_stmt) or 0
        res_allocated = await db.scalar(allocated_stmt) or 0
        res_maintenance = await db.scalar(maintenance_stmt) or 0
        res_bookings = await db.scalar(bookings_stmt) or 0
        res_transfers = await db.scalar(transfers_stmt) or 0
        res_upcoming = await db.scalar(upcoming_stmt) or 0
        res_overdue = await db.scalar(overdue_stmt) or 0

        return {
            "assetsAvailable": res_available,
            "assetsAllocated": res_allocated,
            "maintenanceToday": res_maintenance,
            "activeBookings": res_bookings,
            "pendingTransfers": res_transfers,
            "upcomingReturns": res_upcoming,
            "overdueReturns": res_overdue,
        }

    async def get_recent_activities(
        self, db: AsyncSession, user: User, limit: int = 10
    ) -> List[ActivityLog]:
        """
        Retrieves the 10 most recent activity logs filtered by role context.
        """
        role = user.role
        user_id = user.id
        dept_id = user.department_id

        stmt = select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit)

        if role == UserRole.asset_manager:
            stmt = stmt.join(Asset, ActivityLog.asset_id == Asset.id, isouter=True).where(
                or_(Asset.managed_by_id == user_id, ActivityLog.user_id == user_id)
            )
        elif role == UserRole.department_head:
            stmt = stmt.join(User, ActivityLog.user_id == User.id, isouter=True).where(
                or_(User.department_id == dept_id, ActivityLog.user_id == user_id)
            )
        elif role == UserRole.employee:
            stmt = stmt.where(ActivityLog.user_id == user_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_alerts_counts(
        self, db: AsyncSession, user: User, today: date
    ) -> Dict[str, int]:
        """
        Gathers count aggregations for dynamic alert generation.
        """
        role = user.role
        user_id = user.id
        dept_id = user.department_id
        today_plus_7 = today + timedelta(days=7)

        # 1. Overdue Returns
        overdue_stmt = (
            select(func.count(AssetAllocation.id))
            .where(AssetAllocation.returned_at.is_(None))
            .where(AssetAllocation.expected_return_date < today)
        )
        if role == UserRole.asset_manager:
            overdue_stmt = overdue_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.department_head:
            overdue_stmt = overdue_stmt.join(Asset).where(Asset.department_id == dept_id)
        elif role == UserRole.employee:
            overdue_stmt = overdue_stmt.where(AssetAllocation.user_id == user_id)

        # 2. Pending Maintenance
        pending_maint_stmt = select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == "PENDING"
        )
        if role == UserRole.asset_manager:
            pending_maint_stmt = pending_maint_stmt.join(Asset).where(
                Asset.managed_by_id == user_id
            )
        elif role == UserRole.department_head:
            pending_maint_stmt = pending_maint_stmt.join(Asset).where(
                Asset.department_id == dept_id
            )
        elif role == UserRole.employee:
            pending_maint_stmt = pending_maint_stmt.where(
                MaintenanceRequest.requester_id == user_id
            )

        # 3. Pending Transfers
        pending_trans_stmt = select(func.count(TransferRequest.id)).where(
            TransferRequest.status == "PENDING"
        )
        if role == UserRole.asset_manager:
            pending_trans_stmt = pending_trans_stmt.join(Asset).where(
                Asset.managed_by_id == user_id
            )
        elif role == UserRole.department_head:
            pending_trans_stmt = pending_trans_stmt.join(Asset).where(
                Asset.department_id == dept_id
            )
        elif role == UserRole.employee:
            pending_trans_stmt = pending_trans_stmt.where(
                or_(
                    TransferRequest.from_user_id == user_id,
                    TransferRequest.to_user_id == user_id,
                )
            )

        # 4. Audit Cycle Activity check (last 30 days)
        audit_stmt = select(func.count(ActivityLog.id))
        # Exclude filter for role if we want general audit cycle status
        # Since audit cycles are admin/manager concerns, we check if any exists
        thirty_days_ago = datetime.combine(today - timedelta(days=30), datetime.min.time())
        audit_stmt = audit_stmt.where(
            ActivityLog.type == "AUDIT_CYCLE", ActivityLog.created_at >= thirty_days_ago
        )

        # 5. Upcoming Maintenance (next 7 days, status in PENDING, APPROVED, TECHNICIAN_ASSIGNED, IN_PROGRESS)
        upcoming_maint_stmt = select(func.count(MaintenanceRequest.id)).where(
            and_(
                MaintenanceRequest.scheduled_date >= today,
                MaintenanceRequest.scheduled_date <= today_plus_7,
                MaintenanceRequest.status.in_(
                    ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"]
                ),
            )
        )
        if role == UserRole.asset_manager:
            upcoming_maint_stmt = upcoming_maint_stmt.join(Asset).where(
                Asset.managed_by_id == user_id
            )
        elif role == UserRole.department_head:
            upcoming_maint_stmt = upcoming_maint_stmt.join(Asset).where(
                Asset.department_id == dept_id
            )
        elif role == UserRole.employee:
            upcoming_maint_stmt = upcoming_maint_stmt.where(
                MaintenanceRequest.requester_id == user_id
            )

        # Run queries
        overdue_cnt = await db.scalar(overdue_stmt) or 0
        pending_maint_cnt = await db.scalar(pending_maint_stmt) or 0
        pending_trans_cnt = await db.scalar(pending_trans_stmt) or 0
        recent_audit_cnt = await db.scalar(audit_stmt) or 0
        upcoming_maint_cnt = await db.scalar(upcoming_maint_stmt) or 0

        return {
            "overdueReturns": overdue_cnt,
            "pendingMaintenance": pending_maint_cnt,
            "pendingTransfers": pending_trans_cnt,
            "recentAudits": recent_audit_cnt,
            "upcomingMaintenance": upcoming_maint_cnt,
        }

dashboard_repo = DashboardRepository()

from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_

from app.models.user import User, UserRole
from app.models.asset import Asset, AssetStatus
from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.booking import ResourceBooking
from app.models.maintenance_request import MaintenanceRequest
from app.models.transfer import TransferRequest, TransferRequestStatus
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
        
        today_start = datetime.combine(today, datetime.min.time())
        today_plus_7_end = datetime.combine(today + timedelta(days=7), datetime.max.time())

        # Base queries definitions with filters
        
        # 1. Assets Available
        available_stmt = select(func.count(Asset.id)).where(Asset.status == AssetStatus.available)
        if role == UserRole.ASSET_MANAGER:
            available_stmt = available_stmt.where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            available_stmt = available_stmt.where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            available_stmt = available_stmt.where(
                or_(Asset.department_id == dept_id, Asset.is_shared == True)
            )

        # 2. Assets Allocated
        allocated_stmt = select(func.count(Asset.id)).where(Asset.status == AssetStatus.allocated)
        if role == UserRole.ASSET_MANAGER:
            allocated_stmt = allocated_stmt.where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            allocated_stmt = allocated_stmt.where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            allocated_stmt = (
                allocated_stmt.join(Allocation, Allocation.asset_id == Asset.id)
                .where(
                    Allocation.allocated_to_type == AllocationToType.user,
                    Allocation.allocated_to_id == user_id,
                    Allocation.returned_at.is_(None)
                )
            )

        # 3. Maintenance Today
        maintenance_stmt = select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.scheduled_date == today
        )
        if role == UserRole.ASSET_MANAGER:
            maintenance_stmt = maintenance_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            maintenance_stmt = maintenance_stmt.join(Asset).where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            maintenance_stmt = maintenance_stmt.where(MaintenanceRequest.requester_id == user_id)

        # 4. Active Bookings (Booking status = ONGOING)
        bookings_stmt = select(func.count(ResourceBooking.id)).where(ResourceBooking.status == "ONGOING")
        if role == UserRole.ASSET_MANAGER:
            bookings_stmt = bookings_stmt.join(Asset).where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            bookings_stmt = bookings_stmt.join(User, ResourceBooking.user_id == User.id).where(
                User.department_id == dept_id
            )
        elif role == UserRole.EMPLOYEE:
            bookings_stmt = bookings_stmt.where(ResourceBooking.user_id == user_id)

        # 5. Pending Transfers (Transfer Request status = pending)
        transfers_stmt = select(func.count(TransferRequest.id)).where(
            TransferRequest.status == TransferRequestStatus.pending
        )
        if role == UserRole.ASSET_MANAGER:
            transfers_stmt = transfers_stmt.join(Allocation, TransferRequest.allocation_id == Allocation.id).join(Asset, Allocation.asset_id == Asset.id).where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            transfers_stmt = transfers_stmt.join(Allocation, TransferRequest.allocation_id == Allocation.id).join(Asset, Allocation.asset_id == Asset.id).where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            transfers_stmt = transfers_stmt.join(Allocation, TransferRequest.allocation_id == Allocation.id).where(
                or_(
                    TransferRequest.requested_by_id == user_id,
                    and_(TransferRequest.target_type == "user", TransferRequest.target_id == user_id),
                )
            )

        # 6. Upcoming Returns
        upcoming_stmt = (
            select(func.count(Allocation.id))
            .where(Allocation.returned_at.is_(None))
            .where(Allocation.due_date >= today_start)
            .where(Allocation.due_date <= today_plus_7_end)
        )
        if role == UserRole.ASSET_MANAGER:
            upcoming_stmt = upcoming_stmt.join(Asset, Allocation.asset_id == Asset.id).where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            upcoming_stmt = upcoming_stmt.join(Asset, Allocation.asset_id == Asset.id).where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            upcoming_stmt = upcoming_stmt.where(
                Allocation.allocated_to_type == AllocationToType.user,
                Allocation.allocated_to_id == user_id
            )

        # 7. Overdue Returns
        overdue_stmt = (
            select(func.count(Allocation.id))
            .where(Allocation.returned_at.is_(None))
            .where(Allocation.due_date < today_start)
        )
        if role == UserRole.ASSET_MANAGER:
            overdue_stmt = overdue_stmt.join(Asset, Allocation.asset_id == Asset.id).where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            overdue_stmt = overdue_stmt.join(Asset, Allocation.asset_id == Asset.id).where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            overdue_stmt = overdue_stmt.where(
                Allocation.allocated_to_type == AllocationToType.user,
                Allocation.allocated_to_id == user_id
            )

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

        if role == UserRole.ASSET_MANAGER:
            stmt = stmt.join(Asset, ActivityLog.asset_id == Asset.id, isouter=True).where(
                or_(Asset.managed_by_id == user_id, ActivityLog.user_id == user_id)
            )
        elif role == UserRole.DEPARTMENT_HEAD:
            stmt = stmt.join(User, ActivityLog.user_id == User.id, isouter=True).where(
                or_(User.department_id == dept_id, ActivityLog.user_id == user_id)
            )
        elif role == UserRole.EMPLOYEE:
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
        
        today_start = datetime.combine(today, datetime.min.time())
        today_plus_7_end = datetime.combine(today + timedelta(days=7), datetime.max.time())

        # 1. Overdue Returns
        overdue_stmt = (
            select(func.count(Allocation.id))
            .where(Allocation.returned_at.is_(None))
            .where(Allocation.due_date < today_start)
        )
        if role == UserRole.ASSET_MANAGER:
            overdue_stmt = overdue_stmt.join(Asset, Allocation.asset_id == Asset.id).where(Asset.managed_by_id == user_id)
        elif role == UserRole.DEPARTMENT_HEAD:
            overdue_stmt = overdue_stmt.join(Asset, Allocation.asset_id == Asset.id).where(Asset.department_id == dept_id)
        elif role == UserRole.EMPLOYEE:
            overdue_stmt = overdue_stmt.where(
                Allocation.allocated_to_type == AllocationToType.user,
                Allocation.allocated_to_id == user_id
            )

        # 2. Pending Maintenance
        pending_maint_stmt = select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == "PENDING"
        )
        if role == UserRole.ASSET_MANAGER:
            pending_maint_stmt = pending_maint_stmt.join(Asset).where(
                Asset.managed_by_id == user_id
            )
        elif role == UserRole.DEPARTMENT_HEAD:
            pending_maint_stmt = pending_maint_stmt.join(Asset).where(
                Asset.department_id == dept_id
            )
        elif role == UserRole.EMPLOYEE:
            pending_maint_stmt = pending_maint_stmt.where(
                MaintenanceRequest.requester_id == user_id
            )

        # 3. Pending Transfers
        pending_trans_stmt = select(func.count(TransferRequest.id)).where(
            TransferRequest.status == TransferRequestStatus.pending
        )
        if role == UserRole.ASSET_MANAGER:
            pending_trans_stmt = pending_trans_stmt.join(Allocation, TransferRequest.allocation_id == Allocation.id).join(Asset, Allocation.asset_id == Asset.id).where(
                Asset.managed_by_id == user_id
            )
        elif role == UserRole.DEPARTMENT_HEAD:
            pending_trans_stmt = pending_trans_stmt.join(Allocation, TransferRequest.allocation_id == Allocation.id).join(Asset, Allocation.asset_id == Asset.id).where(
                Asset.department_id == dept_id
            )
        elif role == UserRole.EMPLOYEE:
            pending_trans_stmt = pending_trans_stmt.join(Allocation, TransferRequest.allocation_id == Allocation.id).where(
                or_(
                    TransferRequest.requested_by_id == user_id,
                    and_(TransferRequest.target_type == "user", TransferRequest.target_id == user_id),
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
                MaintenanceRequest.scheduled_date <= today + timedelta(days=7),
                MaintenanceRequest.status.in_(
                    ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"]
                ),
            )
        )
        if role == UserRole.ASSET_MANAGER:
            upcoming_maint_stmt = upcoming_maint_stmt.join(Asset).where(
                Asset.managed_by_id == user_id
            )
        elif role == UserRole.DEPARTMENT_HEAD:
            upcoming_maint_stmt = upcoming_maint_stmt.join(Asset).where(
                Asset.department_id == dept_id
            )
        elif role == UserRole.EMPLOYEE:
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

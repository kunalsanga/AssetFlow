import pytest
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User, UserRole
from app.models.department import Department
from app.models.asset import Asset, AssetStatus
from app.models.allocation import Allocation, AllocationStatus, AllocationToType
from app.models.booking import BookableResource, ResourceBooking
from app.models.maintenance_request import MaintenanceRequest
from app.models.transfer import TransferRequest, TransferRequestStatus
from app.models.activity_log import ActivityLog
from app.repositories.dashboard_repository import dashboard_repo
from app.services.dashboard_service import dashboard_service
from app.exceptions import DashboardLoadError

pytestmark = pytest.mark.asyncio

async def seed_data(db: AsyncSession):
    # Create Departments
    dept_eng = Department(name="Engineering", code="ENG", status="Active")
    dept_sales = Department(name="Sales", code="SALES", status="Active")
    db.add_all([dept_eng, dept_sales])
    await db.commit()
    await db.refresh(dept_eng)
    await db.refresh(dept_sales)

    # Create Users
    admin_user = User(
        email="admin@example.com",
        hashed_password="hash",
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
    )
    manager_eng = User(
        email="manager_eng@example.com",
        hashed_password="hash",
        full_name="Manager Eng",
        role=UserRole.ASSET_MANAGER,
        department_id=dept_eng.id,
        is_active=True,
    )
    manager_sales = User(
        email="manager_sales@example.com",
        hashed_password="hash",
        full_name="Manager Sales",
        role=UserRole.ASSET_MANAGER,
        department_id=dept_sales.id,
        is_active=True,
    )
    head_eng = User(
        email="head_eng@example.com",
        hashed_password="hash",
        full_name="Head Eng",
        role=UserRole.DEPARTMENT_HEAD,
        department_id=dept_eng.id,
        is_active=True,
    )
    emp_eng = User(
        email="emp_eng@example.com",
        hashed_password="hash",
        full_name="Employee Eng",
        role=UserRole.EMPLOYEE,
        department_id=dept_eng.id,
        is_active=True,
    )
    emp_sales = User(
        email="emp_sales@example.com",
        hashed_password="hash",
        full_name="Employee Sales",
        role=UserRole.EMPLOYEE,
        department_id=dept_sales.id,
        is_active=True,
    )
    db.add_all([admin_user, manager_eng, manager_sales, head_eng, emp_eng, emp_sales])
    await db.commit()
    await db.refresh(admin_user)
    await db.refresh(manager_eng)
    await db.refresh(manager_sales)
    await db.refresh(head_eng)
    await db.refresh(emp_eng)
    await db.refresh(emp_sales)

    # Assign Department Heads
    dept_eng.head_id = head_eng.id
    await db.commit()

    # Create Assets
    # Asset 1: available, Engineering, managed by Manager Eng, not shared
    asset1 = Asset(
        asset_tag="AF-001",
        name="Laptop Eng Available",
        status=AssetStatus.available,
        department_id=dept_eng.id,
        managed_by_id=manager_eng.id,
        is_shared=False,
    )
    # Asset 2: allocated, Engineering, managed by Manager Eng, not shared
    asset2 = Asset(
        asset_tag="AF-002",
        name="Laptop Eng Allocated",
        status=AssetStatus.allocated,
        department_id=dept_eng.id,
        managed_by_id=manager_eng.id,
        is_shared=False,
    )
    # Asset 3: available, Sales, managed by Manager Sales, SHARED
    asset3 = Asset(
        asset_tag="AF-003",
        name="Projector Shared",
        status=AssetStatus.available,
        department_id=dept_sales.id,
        managed_by_id=manager_sales.id,
        is_shared=True,
    )
    # Asset 4: allocated, Sales, managed by Manager Sales, not shared
    asset4 = Asset(
        asset_tag="AF-004",
        name="Laptop Sales Allocated",
        status=AssetStatus.allocated,
        department_id=dept_sales.id,
        managed_by_id=manager_sales.id,
        is_shared=False,
    )
    db.add_all([asset1, asset2, asset3, asset4])
    await db.commit()
    await db.refresh(asset1)
    await db.refresh(asset2)
    await db.refresh(asset3)
    await db.refresh(asset4)

    # Create Allocations
    today = date.today()
    # Allocation 1: Asset 2 allocated to Employee Eng, overdue (due_date = today - 2 days)
    alloc1 = Allocation(
        asset_id=asset2.id,
        allocated_to_type=AllocationToType.user,
        allocated_to_id=emp_eng.id,
        allocated_by_id=admin_user.id,
        allocated_at=datetime.utcnow() - timedelta(days=10),
        due_date=datetime.combine(today - timedelta(days=2), datetime.min.time()),
        status=AllocationStatus.overdue,
    )
    # Allocation 2: Asset 4 allocated to Employee Sales, upcoming return (due_date = today + 3 days)
    alloc2 = Allocation(
        asset_id=asset4.id,
        allocated_to_type=AllocationToType.user,
        allocated_to_id=emp_sales.id,
        allocated_by_id=admin_user.id,
        allocated_at=datetime.utcnow() - timedelta(days=5),
        due_date=datetime.combine(today + timedelta(days=3), datetime.min.time()),
        status=AllocationStatus.active,
    )
    db.add_all([alloc1, alloc2])
    await db.commit()
    await db.refresh(alloc1)
    await db.refresh(alloc2)

    # Create Bookings
    # Create BookableResource first
    resource3 = BookableResource(asset_id=asset3.id, is_bookable=True)
    db.add(resource3)
    await db.commit()
    await db.refresh(resource3)

    # Booking 1: Asset 3 booked by Employee Eng, status ONGOING
    booking1 = ResourceBooking(
        resource_id=resource3.id,
        user_id=emp_eng.id,
        start_time=datetime.utcnow() - timedelta(hours=1),
        end_time=datetime.utcnow() + timedelta(hours=1),
        status="ONGOING",
    )
    # Booking 2: Asset 3 booked by Employee Sales, status UPCOMING
    booking2 = ResourceBooking(
        resource_id=resource3.id,
        user_id=emp_sales.id,
        start_time=datetime.utcnow() + timedelta(hours=3),
        end_time=datetime.utcnow() + timedelta(hours=5),
        status="UPCOMING",
    )
    db.add_all([booking1, booking2])
    await db.commit()

    # Create Maintenance Requests
    # Maintenance 1: Asset 2, requester Employee Eng, priority HIGH, status PENDING, scheduled today
    maint1 = MaintenanceRequest(
        asset_id=asset2.id,
        requester_id=emp_eng.id,
        description="Screen flickering",
        priority="HIGH",
        status="PENDING",
        scheduled_date=today,
    )
    # Maintenance 2: Asset 4, requester Employee Sales, priority LOW, status APPROVED, scheduled tomorrow
    maint2 = MaintenanceRequest(
        asset_id=asset4.id,
        requester_id=emp_sales.id,
        description="Keyboard clean",
        priority="LOW",
        status="APPROVED",
        scheduled_date=today + timedelta(days=1),
    )
    db.add_all([maint1, maint2])
    await db.commit()

    # Create Transfer Requests
    # Transfer 1: Asset 2 from Employee Eng to Employee Sales, status PENDING
    transfer1 = TransferRequest(
        allocation_id=alloc1.id,
        requested_by_id=emp_eng.id,
        target_type="user",
        target_id=emp_sales.id,
        status=TransferRequestStatus.pending,
        created_at=datetime.utcnow(),
    )
    db.add_all([transfer1])
    await db.commit()

    # Create Activity Logs
    # Activity 1: allocation activity (older)
    act1 = ActivityLog(
        user_id=emp_eng.id,
        asset_id=asset2.id,
        title="Laptop AF-002 allocated",
        type="ASSET_ALLOCATION",
        created_at=datetime.utcnow() - timedelta(days=1),
    )
    # Activity 2: Audit cycle completed (45 days ago)
    act2 = ActivityLog(
        user_id=admin_user.id,
        title="Annual physical audit complete",
        type="AUDIT_CYCLE",
        created_at=datetime.utcnow() - timedelta(days=45),
    )
    db.add_all([act1, act2])
    await db.commit()

    return {
        "admin": admin_user,
        "manager_eng": manager_eng,
        "manager_sales": manager_sales,
        "head_eng": head_eng,
        "emp_eng": emp_eng,
        "emp_sales": emp_sales,
        "dept_eng": dept_eng,
        "dept_sales": dept_sales,
        "asset1": asset1,
        "asset2": asset2,
        "asset3": asset3,
        "asset4": asset4,
    }


async def test_repository_summary_admin(db: AsyncSession):
    seeded = await seed_data(db)
    summary = await dashboard_repo.get_summary(db, seeded["admin"], date.today())

    # Admin should see organization-wide metrics
    # Assets available: 2 (AF-001 in Eng, AF-003 in Sales)
    assert summary["assetsAvailable"] == 2
    # Assets allocated: 2 (AF-002 in Eng, AF-004 in Sales)
    assert summary["assetsAllocated"] == 2
    # Maintenance today: 1 (maint1 on asset2, scheduled today)
    assert summary["maintenanceToday"] == 1
    # Active bookings: 1 (booking1 on asset3, status ONGOING)
    assert summary["activeBookings"] == 1
    # Pending transfers: 1 (transfer1, status pending)
    assert summary["pendingTransfers"] == 1
    # Upcoming returns: 1 (alloc2 expected today+3)
    assert summary["upcomingReturns"] == 1
    # Overdue returns: 1 (alloc1 expected today-2)
    assert summary["overdueReturns"] == 1


async def test_repository_summary_manager_scope(db: AsyncSession):
    seeded = await seed_data(db)
    # Manager Eng only manages assets in Engineering (managed_by_id = manager_eng.id)
    # Namely asset1 (AF-001) and asset2 (AF-002)
    summary = await dashboard_repo.get_summary(db, seeded["manager_eng"], date.today())

    # Assets Available: 1 (AF-001)
    assert summary["assetsAvailable"] == 1
    # Assets Allocated: 1 (AF-002)
    assert summary["assetsAllocated"] == 1
    # Maintenance Today: 1 (maint1 is on asset2 which is managed by Manager Eng)
    assert summary["maintenanceToday"] == 1
    # Active Bookings: 0 (booking1 is on asset3 which is managed by Manager Sales)
    assert summary["activeBookings"] == 0
    # Pending Transfers: 1 (transfer1 is on asset2)
    assert summary["pendingTransfers"] == 1
    # Upcoming returns: 0 (alloc2 is for asset4, which is managed by Manager Sales)
    assert summary["upcomingReturns"] == 0
    # Overdue returns: 1 (alloc1 is for asset2)
    assert summary["overdueReturns"] == 1


async def test_repository_summary_dept_head_scope(db: AsyncSession):
    seeded = await seed_data(db)
    # Head Eng should see Eng department assets/users
    summary = await dashboard_repo.get_summary(db, seeded["head_eng"], date.today())

    # Available: 1 (AF-001 Eng)
    assert summary["assetsAvailable"] == 1
    # Allocated: 1 (AF-002 Eng)
    assert summary["assetsAllocated"] == 1
    # Maintenance today: 1 (maint1 on asset2 in Eng)
    assert summary["maintenanceToday"] == 1
    # Active bookings: 1 (booking1 by emp_eng who is in Eng)
    assert summary["activeBookings"] == 1
    # Pending transfers: 1 (transfer1 on asset2 in Eng)
    assert summary["pendingTransfers"] == 1
    # Upcoming returns: 0 (alloc2 is in Sales)
    assert summary["upcomingReturns"] == 0
    # Overdue returns: 1 (alloc1 is in Eng)
    assert summary["overdueReturns"] == 1


async def test_repository_summary_employee_scope(db: AsyncSession):
    seeded = await seed_data(db)
    # emp_eng should only see: their assets, their bookings, their maintenance, their activities.
    summary = await dashboard_repo.get_summary(db, seeded["emp_eng"], date.today())

    # Available assets they can view: available in their department (AF-001) OR shared (AF-003) = 2
    assert summary["assetsAvailable"] == 2
    # Allocated to them: 1 (AF-002)
    assert summary["assetsAllocated"] == 1
    # Maintenance today raised by them: 1 (maint1)
    assert summary["maintenanceToday"] == 1
    # Active bookings by them: 1 (booking1)
    assert summary["activeBookings"] == 1
    # Pending transfers involving them: 1 (transfer1 is from emp_eng)
    assert summary["pendingTransfers"] == 1
    # Upcoming returns: 0 (their expected return alloc1 is overdue, not upcoming)
    assert summary["upcomingReturns"] == 0
    # Overdue returns for them: 1 (alloc1)
    assert summary["overdueReturns"] == 1


async def test_service_dashboard_data_permissions_admin(db: AsyncSession):
    seeded = await seed_data(db)
    response = await dashboard_service.get_dashboard_data(db, seeded["admin"])

    assert response.success is True
    assert response.message == "Dashboard loaded successfully"
    # Admin should have registerAsset = True
    assert response.data.quickActions.registerAsset is True
    assert response.data.quickActions.bookResource is True
    assert response.data.quickActions.raiseMaintenance is True
    assert response.data.user.role == "ADMIN"
    assert response.data.user.department is None


async def test_service_dashboard_data_permissions_employee(db: AsyncSession):
    seeded = await seed_data(db)
    response = await dashboard_service.get_dashboard_data(db, seeded["emp_eng"])

    assert response.success is True
    # Employee should have registerAsset = False
    assert response.data.quickActions.registerAsset is False
    assert response.data.quickActions.bookResource is True
    assert response.data.quickActions.raiseMaintenance is True
    assert response.data.user.role == "EMPLOYEE"
    assert response.data.user.department == "Engineering"


async def test_service_dashboard_alerts_generation(db: AsyncSession):
    seeded = await seed_data(db)
    
    # Test for admin user (should include Overdue Returns, Pending Maintenance, Pending Transfers, and Audit Due)
    # Note: no audit activity in last 30 days, so Audit Due should trigger.
    response = await dashboard_service.get_dashboard_data(db, seeded["admin"])
    alerts = response.data.alerts
    alert_titles = [a.title for a in alerts]
    
    assert "Overdue Returns" in alert_titles
    assert "Pending Maintenance" in alert_titles
    assert "Pending Transfers" in alert_titles
    assert "Audit Due" in alert_titles
    assert "Upcoming Maintenance" in alert_titles

    # Let's seed an audit cycle completed today and check that Audit Due alert disappears
    today_dt = datetime.utcnow()
    new_audit = ActivityLog(
        user_id=seeded["admin"].id,
        title="Monthly physical audit complete",
        type="AUDIT_CYCLE",
        created_at=today_dt,
    )
    db.add(new_audit)
    await db.commit()

    response2 = await dashboard_service.get_dashboard_data(db, seeded["admin"])
    alert_titles2 = [a.title for a in response2.data.alerts]
    assert "Audit Due" not in alert_titles2


async def test_service_error_handling(db: AsyncSession):
    from unittest.mock import AsyncMock
    # Simulate DB error by passing a mock that raises an exception on query execution
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute.side_effect = Exception("Database connection lost")
    mock_db.scalar.side_effect = Exception("Database connection lost")
    
    # We should get a DashboardLoadError exception
    with pytest.raises(DashboardLoadError) as exc_info:
        await dashboard_service.get_dashboard_data(mock_db, User(id=1, email="test@test.com", role=UserRole.EMPLOYEE))
    
    assert "Dashboard could not be loaded" in str(exc_info.value)

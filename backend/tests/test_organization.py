import pytest
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User, UserRole
from app.models.department import Department
from app.models.category import Category
from app.models.activity_log import ActivityLog
from app.services.department_service import department_service
from app.services.category_service import category_service
from app.services.employee_service import employee_service
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.employee import EmployeeUpdate, EmployeeRoleUpdate
from app.exceptions import (
    CircularHierarchyException,
    DuplicateResourceException,
    DepartmentHeadAssignmentException,
    UserRoleModificationException,
    ResourceNotFoundException,
)

pytestmark = pytest.mark.asyncio

async def seed_org_data(db: AsyncSession):
    # Create Admin
    admin_user = User(
        email="admin@example.com",
        hashed_password="hash",
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
    )
    # Create Employee 1
    emp1 = User(
        email="emp1@example.com",
        hashed_password="hash",
        full_name="Employee One",
        role=UserRole.EMPLOYEE,
        is_active=True,
    )
    # Create Employee 2
    emp2 = User(
        email="emp2@example.com",
        hashed_password="hash",
        full_name="Employee Two",
        role=UserRole.EMPLOYEE,
        is_active=True,
    )
    db.add_all([admin_user, emp1, emp2])
    await db.commit()
    await db.refresh(admin_user)
    await db.refresh(emp1)
    await db.refresh(emp2)

    return {
        "admin": admin_user,
        "emp1": emp1,
        "emp2": emp2,
    }


# ==========================================
# 1. Department Management Tests
# ==========================================

async def test_create_department_success(db: AsyncSession):
    users = await seed_org_data(db)
    
    # Create department without head first
    dept_in = DepartmentCreate(name="Engineering", code="ENG", parent_id=None)
    dept = await department_service.create_department(db, dept_in, users["admin"])
    
    assert dept.id is not None
    assert dept.name == "Engineering"
    assert dept.code == "ENG"
    assert dept.status == "Active"

    # Check activity logs
    logs_result = await db.execute(select(ActivityLog).where(ActivityLog.type == "DEPARTMENT_CREATED"))
    logs = logs_result.scalars().all()
    assert len(logs) == 1
    assert "Engineering" in logs[0].title


async def test_create_department_duplicate_fails(db: AsyncSession):
    users = await seed_org_data(db)
    dept_in = DepartmentCreate(name="Engineering", code="ENG")
    await department_service.create_department(db, dept_in, users["admin"])

    # Duplicate Name
    with pytest.raises(DuplicateResourceException):
        await department_service.create_department(
            db, DepartmentCreate(name="Engineering", code="ENG2"), users["admin"]
        )

    # Duplicate Code
    with pytest.raises(DuplicateResourceException):
        await department_service.create_department(
            db, DepartmentCreate(name="Engineering2", code="ENG"), users["admin"]
        )


async def test_circular_hierarchy_fails(db: AsyncSession):
    users = await seed_org_data(db)
    # Dept A
    dept_a = await department_service.create_department(
        db, DepartmentCreate(name="Dept A", code="A"), users["admin"]
    )
    # Dept B under A
    dept_b = await department_service.create_department(
        db, DepartmentCreate(name="Dept B", code="B", parent_id=dept_a.id), users["admin"]
    )
    # Dept C under B
    dept_c = await department_service.create_department(
        db, DepartmentCreate(name="Dept C", code="C", parent_id=dept_b.id), users["admin"]
    )

    # Attempt to set Dept A under Dept C (A -> B -> C -> A)
    with pytest.raises(CircularHierarchyException):
        await department_service.update_department(
            db, dept_a.id, DepartmentUpdate(parent_id=dept_c.id), users["admin"]
        )

    # Cannot set itself as parent
    with pytest.raises(CircularHierarchyException):
        await department_service.update_department(
            db, dept_a.id, DepartmentUpdate(parent_id=dept_a.id), users["admin"]
        )


async def test_department_head_assignment(db: AsyncSession):
    users = await seed_org_data(db)
    dept = await department_service.create_department(
        db, DepartmentCreate(name="Engineering", code="ENG"), users["admin"]
    )

    # User not in department yet - should fail
    with pytest.raises(DepartmentHeadAssignmentException):
        await department_service.update_department(
            db, dept.id, DepartmentUpdate(head_id=users["emp1"].id), users["admin"]
        )

    # Associate user to department
    users["emp1"].department_id = dept.id
    db.add(users["emp1"])
    await db.commit()

    # Promote to head - should succeed now
    updated_dept = await department_service.update_department(
        db, dept.id, DepartmentUpdate(head_id=users["emp1"].id), users["admin"]
    )
    assert updated_dept.head_id == users["emp1"].id

    # Verify log entry
    logs_result = await db.execute(select(ActivityLog).where(ActivityLog.type == "DEPARTMENT_HEAD_ASSIGNED"))
    assert len(logs_result.scalars().all()) == 1


# ==========================================
# 2. Asset Categories Tests
# ==========================================

async def test_create_category_success(db: AsyncSession):
    users = await seed_org_data(db)
    cat_in = CategoryCreate(
        name="Electronics", code="ELEC", description="Electronic gear", custom_fields={"warranty": "2 years"}
    )
    cat = await category_service.create_category(db, cat_in, users["admin"])

    assert cat.id is not None
    assert cat.name == "Electronics"
    assert cat.custom_fields["warranty"] == "2 years"

    # Verify log
    logs = (await db.execute(select(ActivityLog).where(ActivityLog.type == "CATEGORY_CREATED"))).scalars().all()
    assert len(logs) == 1


async def test_soft_delete_category(db: AsyncSession):
    users = await seed_org_data(db)
    cat = await category_service.create_category(
        db, CategoryCreate(name="Furniture", code="FURN"), users["admin"]
    )

    # Verify soft delete sets flag
    deleted_cat = await category_service.delete_category(db, cat.id, users["admin"])
    assert deleted_cat.is_deleted is True

    # Retrieve should now fail with ResourceNotFoundException
    with pytest.raises(ResourceNotFoundException):
        await category_service.get_category(db, cat.id)

    # Paged listing should not include deleted categories
    categories, pagination = await category_service.get_categories_list(db, page=1, page_size=10)
    assert len(categories) == 0
    assert pagination.totalItems == 0


# ==========================================
# 3. Employee Directory Tests
# ==========================================

async def test_employee_role_promotion_rbac(db: AsyncSession):
    users = await seed_org_data(db)

    # 1. Non-admin (Employee) attempts to change role of Employee 2 - should fail
    with pytest.raises(UserRoleModificationException):
        await employee_service.update_role(
            db, users["emp2"].id, EmployeeRoleUpdate(role=UserRole.ASSET_MANAGER), users["emp1"]
        )

    # 2. Employee attempts to promote themselves - should fail
    with pytest.raises(UserRoleModificationException):
        await employee_service.update_role(
            db, users["emp1"].id, EmployeeRoleUpdate(role=UserRole.ASSET_MANAGER), users["emp1"]
        )

    # 3. Admin promotes employee - should succeed
    # Promote emp1 to Asset Manager
    promoted = await employee_service.update_role(
        db, users["emp1"].id, EmployeeRoleUpdate(role=UserRole.ASSET_MANAGER), users["admin"]
    )
    assert promoted.role == UserRole.ASSET_MANAGER

    # Check activity log
    logs = (await db.execute(select(ActivityLog).where(ActivityLog.type == "EMPLOYEE_ROLE_CHANGED"))).scalars().all()
    assert len(logs) == 1
    assert "ASSET_MANAGER" in logs[0].title


async def test_employee_deactivation_and_dropdown(db: AsyncSession):
    users = await seed_org_data(db)

    # Deactivate employee 2
    deactivated = await employee_service.update_status(db, users["emp2"].id, is_active=False, current_user=users["admin"])
    assert deactivated.is_active is False

    # Check deactivation activity log
    logs = (await db.execute(select(ActivityLog).where(ActivityLog.type == "EMPLOYEE_DEACTIVATED"))).scalars().all()
    assert len(logs) == 1

    # Employee Dropdown list should only return ACTIVE employees
    dropdown = await employee_service.get_dropdown(db)
    active_ids = [u.id for u in dropdown]
    
    assert users["admin"].id in active_ids  # Admin is active
    assert users["emp1"].id in active_ids   # emp1 is active
    assert users["emp2"].id not in active_ids # emp2 is deactivated, should NOT appear

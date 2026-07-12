from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.repositories.employee_repository import employee_repo
from app.repositories.department_repository import department_repo
from app.schemas.employee import EmployeeUpdate, EmployeeRoleUpdate
from app.schemas.department import PaginationMetadata
from app.exceptions import UserRoleModificationException, ResourceNotFoundException, DepartmentHeadAssignmentException

class EmployeeService:
    async def log_action(self, db: AsyncSession, user_id: int, title: str, log_type: str) -> None:
        log = ActivityLog(
            user_id=user_id,
            title=title,
            type=log_type
        )
        db.add(log)
        await db.commit()

    async def get_employee(self, db: AsyncSession, id: int) -> User:
        user = await employee_repo.get(db, id)
        if not user:
            raise ResourceNotFoundException("Employee not found.")
        return user

    async def update_employee(self, db: AsyncSession, id: int, obj_in: EmployeeUpdate, current_user: User) -> User:
        user = await self.get_employee(db, id)
        
        # Enforce that only ADMIN can modify other employees' core data if needed,
        # but we allow self-updates for basic info (e.g. full_name, email).
        # However, department changes might be restricted to Admin/Managers.
        # Let's check permissions or just apply the updates:
        if obj_in.full_name is not None:
            user.full_name = obj_in.full_name
        if obj_in.email is not None:
            user.email = obj_in.email
            
        if obj_in.department_id is not None:
            # Check if department exists
            dept = await department_repo.get(db, obj_in.department_id)
            if not dept:
                raise ResourceNotFoundException("Department not found.")
            # If they are currently the head of their previous department, they cannot change department
            # without relinquishing head status first!
            # Or if they are promoted to head of the new department, we let department head assignment handle it.
            # Let's update department_id
            user.department_id = obj_in.department_id
            
        if obj_in.is_active is not None:
            user.is_active = obj_in.is_active
            
        updated = await employee_repo.update(db, db_obj=user)
        
        # Log status activation/deactivation
        if obj_in.is_active is not None:
            log_type = "EMPLOYEE_ACTIVATED" if obj_in.is_active else "EMPLOYEE_DEACTIVATED"
            action_str = "activated" if obj_in.is_active else "deactivated"
            await self.log_action(db, current_user.id, f"Employee '{updated.full_name or updated.email}' {action_str}.", log_type)
            
        return updated

    async def update_role(self, db: AsyncSession, id: int, obj_in: EmployeeRoleUpdate, current_user: User) -> User:
        # Business Rules:
        # - Only ADMIN can change roles.
        if current_user.role != UserRole.admin:
            raise UserRoleModificationException("Only administrators can modify roles.")
            
        # - Users cannot promote themselves.
        if current_user.id == id:
            raise UserRoleModificationException("Users cannot change their own roles.")
            
        user = await self.get_employee(db, id)

        # - Cannot promote inactive employee
        if not user.is_active:
            raise UserRoleModificationException("Cannot change the role of an inactive employee.")

        old_role = user.role

        # - Cannot demote last admin
        if old_role == UserRole.admin and obj_in.role != UserRole.admin:
            from sqlalchemy.future import select
            from sqlalchemy import func
            admin_count_result = await db.execute(
                select(func.count(User.id)).where(
                    User.role == UserRole.admin,
                    User.is_active == True,
                )
            )
            admin_count = admin_count_result.scalar() or 0
            if admin_count <= 1:
                raise UserRoleModificationException("Cannot demote the last active administrator.")

        user.role = obj_in.role
        
        # - Department Head must belong to assigned department.
        if obj_in.role == UserRole.department_head and user.department_id is None:
            raise DepartmentHeadAssignmentException("Department Head must belong to an assigned department.")

        # - Only one Department Head per department
        if obj_in.role == UserRole.department_head and user.department_id is not None:
            from sqlalchemy.future import select
            existing_heads = await db.execute(
                select(User).where(
                    User.role == UserRole.department_head,
                    User.department_id == user.department_id,
                    User.id != user.id,
                    User.is_active == True,
                )
            )
            if existing_heads.scalars().first():
                raise DepartmentHeadAssignmentException(
                    "This department already has a head. Remove the existing head first."
                )
            
        updated = await employee_repo.update(db, db_obj=user)
        
        await self.log_action(
            db, current_user.id,
            f"Employee '{updated.full_name or updated.email}' role changed from {old_role.value.upper()} to {updated.role.value.upper()}.",
            "EMPLOYEE_ROLE_CHANGED"
        )
        return updated


    async def update_status(self, db: AsyncSession, id: int, is_active: bool, current_user: User) -> User:
        user = await self.get_employee(db, id)
        user.is_active = is_active
        updated = await employee_repo.update(db, db_obj=user)
        
        log_type = "EMPLOYEE_ACTIVATED" if is_active else "EMPLOYEE_DEACTIVATED"
        action_str = "activated" if is_active else "deactivated"
        await self.log_action(db, current_user.id, f"Employee '{updated.full_name or updated.email}' {action_str}.", log_type)
        return updated

    async def get_employees_list(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        role: Optional[UserRole] = None
    ) -> Tuple[List[User], PaginationMetadata]:
        employees, total_items = await employee_repo.get_employees_paginated(
            db, page=page, page_size=page_size, search=search, department_id=department_id, role=role
        )
        total_pages = (total_items + page_size - 1) // page_size
        pagination = PaginationMetadata(
            currentPage=page,
            pageSize=page_size,
            totalItems=total_items,
            totalPages=total_pages
        )
        return employees, pagination

    async def get_dropdown(self, db: AsyncSession) -> List[User]:
        return await employee_repo.get_active_dropdown(db)

    async def get_department_heads_dropdown(self, db: AsyncSession) -> List[User]:
        """Return active employees with role department_head."""
        result = await db.execute(
            __import__("sqlalchemy.future", fromlist=["select"]).select(User).where(
                User.is_active == True,
                User.role == UserRole.department_head,
            ).order_by(User.full_name.asc())
        )
        return list(result.scalars().all())

    async def get_asset_managers_dropdown(self, db: AsyncSession) -> List[User]:
        """Return active employees with role asset_manager."""
        result = await db.execute(
            __import__("sqlalchemy.future", fromlist=["select"]).select(User).where(
                User.is_active == True,
                User.role == UserRole.asset_manager,
            ).order_by(User.full_name.asc())
        )
        return list(result.scalars().all())

    async def update_department(
        self, db: AsyncSession, id: int, department_id: int, current_user: User
    ) -> User:
        user = await self.get_employee(db, id)
        dept = await department_repo.get(db, department_id)
        if not dept:
            raise ResourceNotFoundException("Department not found.")
        if dept.status != "Active":
            raise DepartmentHeadAssignmentException("Cannot assign an inactive department.")
        old_dept = user.department_id
        user.department_id = department_id
        updated = await employee_repo.update(db, db_obj=user)
        await self.log_action(
            db, current_user.id,
            f"Employee '{updated.full_name or updated.email}' department changed to '{dept.name}'.",
            "EMPLOYEE_DEPARTMENT_CHANGED",
        )
        return updated

employee_service = EmployeeService()


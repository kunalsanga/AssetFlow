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
        if current_user.role != UserRole.ADMIN:
            raise UserRoleModificationException("Only administrators can modify roles.")
            
        # - Users cannot promote themselves.
        if current_user.id == id:
            raise UserRoleModificationException("Users cannot change their own roles.")
            
        user = await self.get_employee(db, id)
        old_role = user.role
        
        # - Validate promotion to same role
        if old_role == obj_in.role:
            raise UserRoleModificationException("Promotion to same role is not allowed.")
            
        # - Validate invalid role targets (Can only promote to Department Head or Asset Manager, or demote to Employee)
        if obj_in.role not in [UserRole.DEPARTMENT_HEAD, UserRole.ASSET_MANAGER, UserRole.EMPLOYEE]:
            raise UserRoleModificationException("Invalid role promotion target.")
            
        user.role = obj_in.role
        
        # - Department Head must belong to assigned department.
        # If user is promoted to department_head, they must have a department assigned.
        if obj_in.role == UserRole.DEPARTMENT_HEAD and user.department_id is None:
            raise DepartmentHeadAssignmentException("Department Head must belong to an assigned department.")
            
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

employee_service = EmployeeService()

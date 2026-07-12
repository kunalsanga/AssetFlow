from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.models.department import Department
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.repositories.department_repository import department_repo
from app.repositories.employee_repository import employee_repo
from app.schemas.department import DepartmentCreate, DepartmentUpdate, PaginationMetadata, DepartmentListData, DepartmentListResponse
from app.exceptions import CircularHierarchyException, DuplicateResourceException, DepartmentHeadAssignmentException, ResourceNotFoundException

class DepartmentService:
    async def prevent_circular_hierarchy(self, db: AsyncSession, dept_id: int, new_parent_id: Optional[int]) -> None:
        if new_parent_id is None:
            return
        if dept_id == new_parent_id:
            raise CircularHierarchyException("A department cannot set itself as its parent.")
            
        curr_parent_id = new_parent_id
        visited = set()
        while curr_parent_id is not None:
            if curr_parent_id == dept_id:
                raise CircularHierarchyException("Circular hierarchy detected: parent is a descendant.")
            if curr_parent_id in visited:
                break
            visited.add(curr_parent_id)
            
            parent_dept = await department_repo.get(db, curr_parent_id)
            if not parent_dept:
                break
            curr_parent_id = parent_dept.parent_id

    async def verify_department_head(self, db: AsyncSession, head_id: Optional[int], dept_id: int) -> None:
        if head_id is None:
            return
        head_user = await employee_repo.get(db, head_id)
        if not head_user:
            raise DepartmentHeadAssignmentException("Department Head user does not exist.")
        if head_user.department_id != dept_id:
            raise DepartmentHeadAssignmentException("Department Head must belong to the assigned department.")

    async def log_action(self, db: AsyncSession, user_id: int, title: str, log_type: str) -> None:
        log = ActivityLog(
            user_id=user_id,
            title=title,
            type=log_type
        )
        db.add(log)
        await db.commit()

    async def create_department(self, db: AsyncSession, obj_in: DepartmentCreate, current_user: User) -> Department:
        # Validate unique name
        if await department_repo.get_by_name(db, obj_in.name):
            raise DuplicateResourceException("Department name already exists.")
            
        # Validate unique code
        if await department_repo.get_by_code(db, obj_in.code):
            raise DuplicateResourceException("Department code already exists.")
            
        dept = Department(
            name=obj_in.name,
            code=obj_in.code,
            parent_id=obj_in.parent_id,
            status="Active"
        )
        
        # Save initially to get ID
        created_dept = await department_repo.create(db, obj_in=dept)
        
        # Verify head if assigned
        if obj_in.head_id:
            await self.verify_department_head(db, obj_in.head_id, created_dept.id)
            created_dept.head_id = obj_in.head_id
            created_dept = await department_repo.update(db, db_obj=created_dept)
            
        await self.log_action(
            db, current_user.id, f"Department '{created_dept.name}' created.", "DEPARTMENT_CREATED"
        )
        
        if obj_in.head_id:
            await self.log_action(
                db, current_user.id, f"Department head assigned to '{created_dept.name}'.", "DEPARTMENT_HEAD_ASSIGNED"
            )
            
        return created_dept

    async def get_department(self, db: AsyncSession, id: int) -> Department:
        dept = await department_repo.get(db, id)
        if not dept:
            raise ResourceNotFoundException("Department not found.")
        return dept

    async def update_department(self, db: AsyncSession, id: int, obj_in: DepartmentUpdate, current_user: User) -> Department:
        dept = await self.get_department(db, id)
        
        # Unique name validation
        if obj_in.name and obj_in.name != dept.name:
            if await department_repo.get_by_name(db, obj_in.name):
                raise DuplicateResourceException("Department name already exists.")
            dept.name = obj_in.name
            
        # Unique code validation
        if obj_in.code and obj_in.code != dept.code:
            if await department_repo.get_by_code(db, obj_in.code):
                raise DuplicateResourceException("Department code already exists.")
            dept.code = obj_in.code

        # Parent hierarchy check
        if obj_in.parent_id is not None:
            await self.prevent_circular_hierarchy(db, id, obj_in.parent_id)
            dept.parent_id = obj_in.parent_id
        elif "parent_id" in obj_in.model_fields_set and obj_in.parent_id is None:
            dept.parent_id = None
            
        # Head validation
        if obj_in.head_id is not None:
            await self.verify_department_head(db, obj_in.head_id, id)
            dept.head_id = obj_in.head_id
        elif "head_id" in obj_in.model_fields_set and obj_in.head_id is None:
            dept.head_id = None

        if obj_in.status:
            dept.status = obj_in.status
            
        updated_dept = await department_repo.update(db, db_obj=dept)
        
        await self.log_action(
            db, current_user.id, f"Department '{updated_dept.name}' updated.", "DEPARTMENT_UPDATED"
        )
        
        if obj_in.head_id:
            await self.log_action(
                db, current_user.id, f"Department head assigned to '{updated_dept.name}'.", "DEPARTMENT_HEAD_ASSIGNED"
            )
            
        return updated_dept

    async def update_status(self, db: AsyncSession, id: int, status: str, current_user: User) -> Department:
        dept = await self.get_department(db, id)
        dept.status = status
        updated_dept = await department_repo.update(db, db_obj=dept)
        await self.log_action(
            db, current_user.id, f"Department '{updated_dept.name}' status changed to {status}.", "DEPARTMENT_UPDATED"
        )
        return updated_dept

    async def get_departments_list(
        self, db: AsyncSession, *, page: int, page_size: int, search: Optional[str] = None
    ) -> Tuple[List[Department], PaginationMetadata]:
        departments, total_items = await department_repo.get_departments_paginated(
            db, page=page, page_size=page_size, search=search
        )
        total_pages = (total_items + page_size - 1) // page_size
        pagination = PaginationMetadata(
            currentPage=page,
            pageSize=page_size,
            totalItems=total_items,
            totalPages=total_pages
        )
        return departments, pagination

    async def get_dropdown(self, db: AsyncSession) -> List[Department]:
        return await department_repo.get_active_dropdown(db)

department_service = DepartmentService()

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_

from app.models.user import User, UserRole

class EmployeeRepository:
    async def get(self, db: AsyncSession, id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == id))
        return result.scalars().first()

    async def get_employees_paginated(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        role: Optional[UserRole] = None
    ) -> Tuple[List[User], int]:
        """
        Retrieves users (employees) with optional filters (search, department, role) and pagination.
        """
        # Count query
        count_stmt = select(func.count(User.id))
        
        if search:
            count_stmt = count_stmt.where(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        if department_id is not None:
            count_stmt = count_stmt.where(User.department_id == department_id)
        if role is not None:
            count_stmt = count_stmt.where(User.role == role)
            
        total_items = await db.scalar(count_stmt) or 0

        # Items query
        stmt = select(User)
        if search:
            stmt = stmt.where(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        if department_id is not None:
            stmt = stmt.where(User.department_id == department_id)
        if role is not None:
            stmt = stmt.where(User.role == role)
            
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        
        result = await db.execute(stmt)
        employees = list(result.scalars().all())
        
        return employees, total_items

    async def get_active_dropdown(self, db: AsyncSession) -> List[User]:
        """
        Retrieves all active employees (users) for dropdown menus.
        """
        result = await db.execute(
            select(User).where(User.is_active == True).order_by(User.full_name.asc())
        )
        return list(result.scalars().all())

    async def update(self, db: AsyncSession, *, db_obj: User) -> User:
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

employee_repo = EmployeeRepository()

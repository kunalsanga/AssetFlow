from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_

from app.models.department import Department
from app.models.user import User

class DepartmentRepository:
    async def get(self, db: AsyncSession, id: int) -> Optional[Department]:
        result = await db.execute(select(Department).where(Department.id == id))
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Department]:
        result = await db.execute(select(Department).where(Department.name == name))
        return result.scalars().first()

    async def get_by_code(self, db: AsyncSession, code: str) -> Optional[Department]:
        result = await db.execute(select(Department).where(Department.code == code))
        return result.scalars().first()

    async def get_departments_paginated(
        self, db: AsyncSession, *, page: int, page_size: int, search: Optional[str] = None
    ) -> Tuple[List[Department], int]:
        """
        Retrieves departments with optional search and pagination.
        Returns a tuple of (list of departments, total items count).
        """
        # Count query
        count_stmt = select(func.count(Department.id))
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Department.name.ilike(f"%{search}%"),
                    Department.code.ilike(f"%{search}%")
                )
            )
        total_items = await db.scalar(count_stmt) or 0

        # Items query
        stmt = select(Department)
        if search:
            stmt = stmt.where(
                or_(
                    Department.name.ilike(f"%{search}%"),
                    Department.code.ilike(f"%{search}%")
                )
            )
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        
        result = await db.execute(stmt)
        departments = list(result.scalars().all())
        
        return departments, total_items

    async def get_active_dropdown(self, db: AsyncSession) -> List[Department]:
        """
        Retrieves all active departments for dropdown menus.
        """
        result = await db.execute(
            select(Department).where(Department.status == "Active").order_by(Department.name.asc())
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, *, obj_in: Department) -> Department:
        db.add(obj_in)
        await db.commit()
        await db.refresh(obj_in)
        return obj_in

    async def update(self, db: AsyncSession, *, db_obj: Department) -> Department:
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

department_repo = DepartmentRepository()

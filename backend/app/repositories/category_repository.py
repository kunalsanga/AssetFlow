from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_

from app.models.category import Category

class CategoryRepository:
    async def get(self, db: AsyncSession, id: int) -> Optional[Category]:
        result = await db.execute(
            select(Category).where(Category.id == id, Category.is_deleted == False)
        )
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Category]:
        result = await db.execute(
            select(Category).where(Category.name == name, Category.is_deleted == False)
        )
        return result.scalars().first()

    async def get_by_code(self, db: AsyncSession, code: str) -> Optional[Category]:
        result = await db.execute(
            select(Category).where(Category.code == code, Category.is_deleted == False)
        )
        return result.scalars().first()

    async def get_categories_paginated(
        self, db: AsyncSession, *, page: int, page_size: int, search: Optional[str] = None
    ) -> Tuple[List[Category], int]:
        """
        Retrieves active (non-soft-deleted) categories with optional search and pagination.
        Returns a tuple of (list of categories, total items count).
        """
        # Count query
        count_stmt = select(func.count(Category.id)).where(Category.is_deleted == False)
        if search:
            count_stmt = count_stmt.where(
                or_(
                    Category.name.ilike(f"%{search}%"),
                    Category.code.ilike(f"%{search}%")
                )
            )
        total_items = await db.scalar(count_stmt) or 0

        # Items query
        stmt = select(Category).where(Category.is_deleted == False)
        if search:
            stmt = stmt.where(
                or_(
                    Category.name.ilike(f"%{search}%"),
                    Category.code.ilike(f"%{search}%")
                )
            )
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        
        result = await db.execute(stmt)
        categories = list(result.scalars().all())
        
        return categories, total_items

    async def get_active_dropdown(self, db: AsyncSession) -> List[Category]:
        """
        Retrieves all active, non-soft-deleted categories for dropdown menus.
        """
        result = await db.execute(
            select(Category)
            .where(Category.status == "Active", Category.is_deleted == False)
            .order_by(Category.name.asc())
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, *, obj_in: Category) -> Category:
        db.add(obj_in)
        await db.commit()
        await db.refresh(obj_in)
        return obj_in

    async def update(self, db: AsyncSession, *, db_obj: Category) -> Category:
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

category_repo = CategoryRepository()

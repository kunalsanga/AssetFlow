from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.repositories.category_repository import category_repo
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.department import PaginationMetadata
from app.exceptions import DuplicateResourceException, ResourceNotFoundException

class CategoryService:
    async def log_action(self, db: AsyncSession, user_id: int, title: str, log_type: str) -> None:
        log = ActivityLog(
            user_id=user_id,
            title=title,
            type=log_type
        )
        db.add(log)
        await db.commit()

    async def create_category(self, db: AsyncSession, obj_in: CategoryCreate, current_user: User) -> Category:
        if await category_repo.get_by_name(db, obj_in.name):
            raise DuplicateResourceException("Category name already exists.")
        if await category_repo.get_by_code(db, obj_in.code):
            raise DuplicateResourceException("Category code already exists.")
            
        category = Category(
            name=obj_in.name,
            code=obj_in.code,
            description=obj_in.description,
            custom_fields=obj_in.custom_fields,
            status="Active"
        )
        created = await category_repo.create(db, obj_in=category)
        await self.log_action(db, current_user.id, f"Asset Category '{created.name}' created.", "CATEGORY_CREATED")
        return created

    async def get_category(self, db: AsyncSession, id: int) -> Category:
        category = await category_repo.get(db, id)
        if not category:
            raise ResourceNotFoundException("Category not found.")
        return category

    async def update_category(self, db: AsyncSession, id: int, obj_in: CategoryUpdate, current_user: User) -> Category:
        category = await self.get_category(db, id)
        
        if obj_in.name and obj_in.name != category.name:
            if await category_repo.get_by_name(db, obj_in.name):
                raise DuplicateResourceException("Category name already exists.")
            category.name = obj_in.name
            
        if obj_in.code and obj_in.code != category.code:
            if await category_repo.get_by_code(db, obj_in.code):
                raise DuplicateResourceException("Category code already exists.")
            category.code = obj_in.code

        if obj_in.description is not None:
            category.description = obj_in.description
        if obj_in.status is not None:
            category.status = obj_in.status
        if obj_in.custom_fields is not None:
            category.custom_fields = obj_in.custom_fields
            
        updated = await category_repo.update(db, db_obj=category)
        await self.log_action(db, current_user.id, f"Asset Category '{updated.name}' updated.", "CATEGORY_UPDATED")
        return updated

    async def update_status(self, db: AsyncSession, id: int, status: str, current_user: User) -> Category:
        category = await self.get_category(db, id)
        category.status = status
        updated = await category_repo.update(db, db_obj=category)
        await self.log_action(db, current_user.id, f"Asset Category '{updated.name}' status changed to {status}.", "CATEGORY_UPDATED")
        return updated

    async def delete_category(self, db: AsyncSession, id: int, current_user: User) -> Category:
        """
        Soft deletes the category by setting is_deleted=True.
        """
        category = await self.get_category(db, id)
        category.is_deleted = True
        updated = await category_repo.update(db, db_obj=category)
        await self.log_action(db, current_user.id, f"Asset Category '{updated.name}' deleted.", "CATEGORY_UPDATED")
        return updated

    async def get_categories_list(
        self, db: AsyncSession, *, page: int, page_size: int, search: Optional[str] = None
    ) -> Tuple[List[Category], PaginationMetadata]:
        categories, total_items = await category_repo.get_categories_paginated(
            db, page=page, page_size=page_size, search=search
        )
        total_pages = (total_items + page_size - 1) // page_size
        pagination = PaginationMetadata(
            currentPage=page,
            pageSize=page_size,
            totalItems=total_items,
            totalPages=total_pages
        )
        return categories, pagination

    async def get_dropdown(self, db: AsyncSession) -> List[Category]:
        return await category_repo.get_active_dropdown(db)

category_service = CategoryService()

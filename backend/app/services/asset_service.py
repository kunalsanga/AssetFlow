"""
Asset Service — business logic for Screen 4 (Asset Registration & Directory).

Responsibilities:
- Auto-generate asset tags in AF-000001 format
- Validate serial uniqueness, active category/dept, cost > 0, past purchase date
- Full CRUD with soft-delete equivalent (status = RETIRED/DISPOSED)
- Activity log creation on every state change
"""
from typing import List, Optional, Tuple
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset, AssetStatus, AssetCondition
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.repositories.asset_repository import asset_repo
from app.repositories.category_repository import category_repo
from app.repositories.department_repository import department_repo
from app.schemas.asset import AssetCreate, AssetUpdate, AssetDetailResponse
from app.exceptions import (
    DuplicateResourceException,
    ResourceNotFoundException,
    ValidationException,
)


class AssetService:

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    async def _log(
        self,
        db: AsyncSession,
        user_id: int,
        asset_id: Optional[int],
        title: str,
        log_type: str,
    ) -> None:
        log = ActivityLog(user_id=user_id, asset_id=asset_id, title=title, type=log_type)
        db.add(log)
        await db.commit()

    async def _validate_category(self, db: AsyncSession, category_id: int) -> None:
        cat = await category_repo.get(db, category_id)
        if not cat:
            raise ResourceNotFoundException("Category not found.")
        if cat.status != "Active" or cat.is_deleted:
            raise ValidationException("Category is inactive and cannot be used for registration.")

    async def _validate_department(self, db: AsyncSession, department_id: int) -> None:
        dept = await department_repo.get(db, department_id)
        if not dept:
            raise ResourceNotFoundException("Department not found.")
        if dept.status != "Active":
            raise ValidationException("Department is inactive and cannot be used for registration.")

    # ------------------------------------------------------------------ #
    #  CRUD                                                                #
    # ------------------------------------------------------------------ #

    async def create_asset(
        self, db: AsyncSession, obj_in: AssetCreate, current_user: User
    ) -> Asset:
        # Validate serial uniqueness
        if obj_in.serial_number:
            if await asset_repo.get_by_serial(db, obj_in.serial_number):
                raise DuplicateResourceException("An asset with this serial number already exists.")

        # Validate category is active
        await self._validate_category(db, obj_in.category_id)

        # Validate department if provided
        if obj_in.department_id:
            await self._validate_department(db, obj_in.department_id)

        # Validate purchase cost
        if obj_in.purchase_cost is not None and obj_in.purchase_cost <= 0:
            raise ValidationException("Purchase cost must be a positive number.")

        # Validate purchase date is not in the future
        if obj_in.purchase_date and obj_in.purchase_date > date.today():
            raise ValidationException("Purchase date cannot be in the future.")

        # Auto-generate asset tag
        asset_tag = await asset_repo.get_next_asset_tag(db)

        asset = Asset(
            asset_tag=asset_tag,
            name=obj_in.name,
            serial_number=obj_in.serial_number,
            model=obj_in.model,
            category_id=obj_in.category_id,
            department_id=obj_in.department_id,
            status=AssetStatus.available,
            condition=obj_in.condition or AssetCondition.GOOD,
            location=obj_in.location,
            purchase_date=obj_in.purchase_date,
            purchase_cost=obj_in.purchase_cost,
            photo_url=obj_in.photo_url,
            document_url=obj_in.document_url,
            is_bookable=obj_in.is_bookable or False,
            description=obj_in.description,
            created_by_id=current_user.id,
        )
        created = await asset_repo.create(db, obj_in=asset)
        await self._log(
            db, current_user.id, created.id,
            f"Asset '{created.name}' ({created.asset_tag}) registered.", "ASSET_CREATED"
        )
        return created

    async def get_asset(self, db: AsyncSession, id: int) -> Asset:
        asset = await asset_repo.get(db, id)
        if not asset:
            raise ResourceNotFoundException("Asset not found.")
        return asset

    async def update_asset(
        self, db: AsyncSession, id: int, obj_in: AssetUpdate, current_user: User
    ) -> Asset:
        asset = await self.get_asset(db, id)

        # Validate category if changing
        if obj_in.category_id and obj_in.category_id != asset.category_id:
            await self._validate_category(db, obj_in.category_id)

        # Validate department if changing
        if obj_in.department_id and obj_in.department_id != asset.department_id:
            await self._validate_department(db, obj_in.department_id)

        # Validate serial uniqueness if changing
        if obj_in.serial_number and obj_in.serial_number != asset.serial_number:
            if await asset_repo.get_by_serial(db, obj_in.serial_number):
                raise DuplicateResourceException("An asset with this serial number already exists.")

        # Validate purchase cost
        if obj_in.purchase_cost is not None and obj_in.purchase_cost <= 0:
            raise ValidationException("Purchase cost must be a positive number.")

        # Validate purchase date
        if obj_in.purchase_date and obj_in.purchase_date > date.today():
            raise ValidationException("Purchase date cannot be in the future.")

        # Apply updates
        update_fields = obj_in.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(asset, field, value)

        updated = await asset_repo.update(db, db_obj=asset)
        await self._log(
            db, current_user.id, updated.id,
            f"Asset '{updated.name}' ({updated.asset_tag}) updated.", "ASSET_UPDATED"
        )
        return updated

    async def delete_asset(self, db: AsyncSession, id: int, current_user: User) -> Asset:
        """Soft-delete by setting status to RETIRED."""
        asset = await self.get_asset(db, id)
        asset.status = AssetStatus.retired
        updated = await asset_repo.update(db, db_obj=asset)
        await self._log(
            db, current_user.id, updated.id,
            f"Asset '{updated.name}' ({updated.asset_tag}) retired (soft-deleted).", "ASSET_RETIRED"
        )
        return updated

    async def get_assets_paginated(
        self,
        db: AsyncSession,
        *,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        status: Optional[AssetStatus] = None,
        condition: Optional[AssetCondition] = None,
        category_id: Optional[int] = None,
        department_id: Optional[int] = None,
        sort: str = "created_at",
        order: str = "desc",
        current_user: Optional[User] = None,
    ) -> Tuple[List[Asset], int]:
        # Scope filtering per role
        scoped_department_id = department_id
        if current_user:
            if current_user.role == UserRole.department_head and not department_id:
                scoped_department_id = current_user.department_id

        return await asset_repo.get_paginated(
            db,
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            condition=condition,
            category_id=category_id,
            department_id=scoped_department_id,
            sort=sort,
            order=order,
        )

    async def update_status(
        self, db: AsyncSession, id: int, status: AssetStatus, current_user: User
    ) -> Asset:
        asset = await self.get_asset(db, id)
        old_status = asset.status
        asset.status = status
        updated = await asset_repo.update(db, db_obj=asset)
        await self._log(
            db, current_user.id, updated.id,
            f"Asset '{updated.name}' status changed from {old_status.value} to {status.value}.",
            "ASSET_STATUS_CHANGED",
        )
        return updated


asset_service = AssetService()

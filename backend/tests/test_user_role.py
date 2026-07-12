from app.models.user import UserRole

def test_user_role_enum():
    assert UserRole.ADMIN == "ADMIN"
    assert UserRole.ASSET_MANAGER == "ASSET_MANAGER"
    assert UserRole.DEPARTMENT_HEAD == "DEPARTMENT_HEAD"
    assert UserRole.EMPLOYEE == "EMPLOYEE"

    roles = [role.value for role in UserRole]
    assert "ADMIN" in roles
    assert "EMPLOYEE" in roles
    assert "super_admin" not in roles

import pytest
from sqlalchemy.future import select
from app.models.user import User, UserRole
from app.crud import user as crud_user
from app.schemas.user import UserCreate

@pytest.mark.asyncio
async def test_user_signup_default_role(db):
    user_in = UserCreate(
        email="new_emp@example.com",
        password="secret_password",
        full_name="New Employee"
    )
    
    def run_create(sync_db):
        return crud_user.create(sync_db, obj_in=user_in)
        
    new_user = await db.run_sync(run_create)
    
    assert new_user.id is not None
    assert new_user.email == "new_emp@example.com"
    assert new_user.role == UserRole.EMPLOYEE
    
    # Retrieve it back
    result = await db.execute(select(User).where(User.id == new_user.id))
    persisted_user = result.scalars().first()
    assert persisted_user is not None
    assert persisted_user.role == UserRole.EMPLOYEE

from app.core import security
from app.schemas.token import TokenPayload
from jose import jwt
from app.core.config import settings

def test_jwt_role_integration():
    user_id = 123
    email = "test@example.com"
    role = UserRole.ASSET_MANAGER
    
    token = security.create_access_token(user_id, email=email, role=role.value)
    
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    token_data = TokenPayload(**payload)
    
    assert token_data.sub == "123"
    assert token_data.email == email
    assert token_data.role == UserRole.ASSET_MANAGER

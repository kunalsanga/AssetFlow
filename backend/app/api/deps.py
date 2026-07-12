from typing import Generator, AsyncGenerator
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core import exceptions
from app.db.session import SessionLocal, AsyncSessionLocal
from app.models.user import User, UserRole
from app import crud, schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as db:
        yield db

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise exceptions.CredentialsException()
    
    user = crud.user.get(db, id=int(token_data.sub))
    if not user:
        raise exceptions.CredentialsException(detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not crud.user.is_active(current_user):
        raise exceptions.CredentialsException(detail="Inactive user")
    return current_user

async def get_current_user_async(
    db: AsyncSession = Depends(get_async_db), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise exceptions.CredentialsException()
    
    result = await db.execute(select(User).where(User.id == int(token_data.sub)))
    user = result.scalars().first()
    if not user:
        raise exceptions.CredentialsException(detail="User not found")
    return user

async def get_current_active_user_async(
    current_user: User = Depends(get_current_user_async),
) -> User:
    if not current_user.is_active:
        raise exceptions.CredentialsException(detail="Inactive user")
    return current_user

def require_role(roles: list[UserRole]):
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in roles:
            raise exceptions.PermissionDeniedException()
        return current_user
    return role_checker

def require_role_async(roles: list[UserRole]):
    def role_checker(current_user: User = Depends(get_current_active_user_async)) -> User:
        if current_user.role not in roles:
            raise exceptions.PermissionDeniedException()
        return current_user
    return role_checker

from app.security.permissions import (
    require_role as require_role_new,
    require_any_role,
    require_permission
)


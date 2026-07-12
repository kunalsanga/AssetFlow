from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from app.core.config import settings

# Sync session for backward compatibility
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async session configuration
database_uri_async = settings.SQLALCHEMY_DATABASE_URI
if database_uri_async.startswith("postgresql://"):
    database_uri_async = database_uri_async.replace("postgresql://", "postgresql+asyncpg://")
elif database_uri_async.startswith("postgresql+psycopg2://"):
    database_uri_async = database_uri_async.replace("postgresql+psycopg2://", "postgresql+asyncpg://")
elif database_uri_async.startswith("sqlite://"):
    database_uri_async = database_uri_async.replace("sqlite://", "sqlite+aiosqlite://")

async_engine = create_async_engine(database_uri_async, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


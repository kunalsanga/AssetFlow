from fastapi import APIRouter

from app.api.v1.routers import auth, users, assets, allocations

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(allocations.router, prefix="/allocations", tags=["allocations"])

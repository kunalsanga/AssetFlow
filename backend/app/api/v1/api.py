from fastapi import APIRouter
from app.api.v1.routers import (
    auth, users, allocations, assets, bookings, maintenance, audits, 
    dashboard, departments, categories, employees, reports, 
    dropdowns, notifications, transfers
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(allocations.router, prefix="/allocations", tags=["allocations"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(audits.router, prefix="/audits", tags=["audits"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(dropdowns.router, prefix="/dropdowns", tags=["dropdowns"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(transfers.router, prefix="/transfers", tags=["transfers"])

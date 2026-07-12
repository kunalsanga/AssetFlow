from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DashboardSummary(BaseModel):
    assetsAvailable: int
    assetsAllocated: int
    maintenanceToday: int
    activeBookings: int
    pendingTransfers: int
    upcomingReturns: int
    overdueReturns: int

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class DashboardAlert(BaseModel):
    id: int
    severity: str  # HIGH, MEDIUM, INFO
    title: str
    message: str

    model_config = {
        "from_attributes": True
    }

class RecentActivity(BaseModel):
    id: int
    title: str
    type: str
    createdAt: datetime = Field(..., alias="createdAt")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class QuickActions(BaseModel):
    registerAsset: bool = Field(..., alias="registerAsset")
    bookResource: bool = Field(..., alias="bookResource")
    raiseMaintenance: bool = Field(..., alias="raiseMaintenance")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class DashboardUser(BaseModel):
    id: int
    name: str
    role: str
    department: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class DashboardData(BaseModel):
    summary: DashboardSummary
    alerts: List[DashboardAlert]
    recentActivities: List[RecentActivity] = Field(..., alias="recentActivities")
    quickActions: QuickActions = Field(..., alias="quickActions")
    user: DashboardUser

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class DashboardResponse(BaseModel):
    success: bool
    message: str
    data: DashboardData

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

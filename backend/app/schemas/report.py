from typing import List, Optional
from pydantic import BaseModel

class DepartmentUtilization(BaseModel):
    department_name: str
    total_assets: int
    allocated_assets: int
    utilization_rate: float

class MaintenanceFrequency(BaseModel):
    month: str
    request_count: int

class AssetUsageStat(BaseModel):
    asset_tag: str
    name: str
    usage_count: int
    usage_type: str = "bookings" # or allocations

class IdleAssetStat(BaseModel):
    asset_tag: str
    name: str
    idle_days: int

class MaintenanceDueStat(BaseModel):
    asset_tag: str
    name: str
    status_message: str

class ReportDashboardSummary(BaseModel):
    utilization_by_department: List[DepartmentUtilization]
    maintenance_frequency: List[MaintenanceFrequency]
    most_used_assets: List[AssetUsageStat]
    idle_assets: List[IdleAssetStat]
    maintenance_due: List[MaintenanceDueStat]

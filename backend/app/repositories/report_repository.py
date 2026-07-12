from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, text
from datetime import datetime, timedelta, date

from app.models.asset import Asset, AssetStatus
from app.models.department import Department
from app.models.allocation import Allocation, AllocationStatus
from app.models.booking import Booking
from app.models.maintenance_request import MaintenanceRequest

class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_utilization_by_department(self) -> List[Dict[str, Any]]:
        # Count total assets and allocated assets per department
        departments = self.db.query(Department).all()
        result = []
        for dept in departments:
            total_assets = self.db.query(Asset).filter(Asset.department_id == dept.id).count()
            allocated_assets = self.db.query(Asset).filter(
                Asset.department_id == dept.id,
                Asset.status == AssetStatus.allocated
            ).count()
            
            utilization_rate = (allocated_assets / total_assets * 100) if total_assets > 0 else 0
            
            result.append({
                "department_name": dept.name,
                "total_assets": total_assets,
                "allocated_assets": allocated_assets,
                "utilization_rate": utilization_rate
            })
        return result

    def get_maintenance_frequency(self) -> List[Dict[str, Any]]:
        # Count maintenance requests by month for the last 6 months
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        
        # We can extract month in postgres using func.to_char, but for SQLite compatibility during testing,
        # we do a simple query and group in python, or use generic SQL.
        # Since we use Postgres in docker, let's use to_char.
        
        # To be safe across engines, we fetch the requests and group in Python
        requests = self.db.query(MaintenanceRequest).filter(
            MaintenanceRequest.scheduled_date >= six_months_ago.date()
        ).all()
        
        month_counts = {}
        for req in requests:
            if req.scheduled_date:
                month_key = req.scheduled_date.strftime("%b %Y")
                month_counts[month_key] = month_counts.get(month_key, 0) + 1
                
        result = [{"month": k, "request_count": v} for k, v in month_counts.items()]
        # Sort by month can be tricky with string keys, so we might want a real date grouping if needed
        # For now, it's sufficient for the graph
        return result

    def get_most_used_assets(self, limit: int = 5) -> List[Dict[str, Any]]:
        # Count allocations per asset
        allocation_counts = self.db.query(
            Asset.id,
            Asset.name,
            Asset.asset_tag,
            func.count(Allocation.id).label('usage_count')
        ).join(Allocation, Asset.id == Allocation.asset_id)\
         .group_by(Asset.id, Asset.name, Asset.asset_tag)\
         .order_by(desc('usage_count'))\
         .limit(limit)\
         .all()
         
        return [
            {
                "asset_tag": row.asset_tag,
                "name": row.name,
                "usage_count": row.usage_count,
                "usage_type": "allocations"
            }
            for row in allocation_counts
        ]

    def get_idle_assets(self, days_idle: int = 30, limit: int = 5) -> List[Dict[str, Any]]:
        # Assets that are available and haven't been allocated recently
        # We approximate this by looking at available assets, and finding their last return date
        available_assets = self.db.query(Asset).filter(Asset.status == AssetStatus.available).all()
        
        result = []
        now = datetime.utcnow()
        for asset in available_assets:
            last_allocation = self.db.query(Allocation).filter(
                Allocation.asset_id == asset.id
            ).order_by(desc(Allocation.returned_at)).first()
            
            idle_days = 0
            if last_allocation and last_allocation.returned_at:
                idle_days = (now - last_allocation.returned_at).days
            elif asset.purchase_date:
                # If never allocated, idle since purchase
                idle_days = (now.date() - asset.purchase_date).days
            else:
                # Default if no data
                idle_days = 0
                
            if idle_days >= days_idle:
                result.append({
                    "asset_tag": asset.asset_tag,
                    "name": asset.name,
                    "idle_days": idle_days
                })
                
        # Sort by most idle
        result = sorted(result, key=lambda x: x["idle_days"], reverse=True)[:limit]
        return result

    def get_maintenance_due(self, limit: int = 5) -> List[Dict[str, Any]]:
        result = []
        now = date.today()
        
        # 1. Assets due for maintenance soon (within 14 days)
        upcoming_maintenance = self.db.query(MaintenanceRequest).join(Asset).filter(
            MaintenanceRequest.status != "COMPLETED",
            MaintenanceRequest.scheduled_date >= now,
            MaintenanceRequest.scheduled_date <= now + timedelta(days=14)
        ).limit(limit).all()
        
        for req in upcoming_maintenance:
            days_due = (req.scheduled_date - now).days
            result.append({
                "asset_tag": req.asset.asset_tag,
                "name": req.asset.name,
                "status_message": f"service due in {days_due} days"
            })
            
        # 2. Assets nearing retirement (older than 4 years)
        four_years_ago = now - timedelta(days=4*365)
        old_assets = self.db.query(Asset).filter(
            Asset.purchase_date <= four_years_ago,
            Asset.status != AssetStatus.retired
        ).limit(limit).all()
        
        for asset in old_assets:
            age_years = (now - asset.purchase_date).days // 365
            result.append({
                "asset_tag": asset.asset_tag,
                "name": asset.name,
                "status_message": f"{age_years} years old : nearing retirement"
            })
            
        return result[:limit]

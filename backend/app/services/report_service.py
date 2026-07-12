from sqlalchemy.orm import Session
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportDashboardSummary

class ReportService:
    def __init__(self, db: Session):
        self.repo = ReportRepository(db)

    def get_dashboard_summary(self) -> ReportDashboardSummary:
        return ReportDashboardSummary(
            utilization_by_department=self.repo.get_utilization_by_department(),
            maintenance_frequency=self.repo.get_maintenance_frequency(),
            most_used_assets=self.repo.get_most_used_assets(),
            idle_assets=self.repo.get_idle_assets(),
            maintenance_due=self.repo.get_maintenance_due()
        )

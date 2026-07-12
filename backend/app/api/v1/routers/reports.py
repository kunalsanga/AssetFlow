from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.report_service import ReportService
from app.schemas.report import ReportDashboardSummary

router = APIRouter()

@router.get("/summary", response_model=ReportDashboardSummary)
def get_report_summary(
    db: Session = Depends(deps.get_db),
    # current_user = Depends(deps.get_current_active_user)
):
    """
    Get all statistics for the Reports & Analytics dashboard.
    """
    report_service = ReportService(db)
    return report_service.get_dashboard_summary()

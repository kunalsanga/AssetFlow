from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel
from app.models.audit import AuditCycleStatus, AuditItemStatus
from app.schemas.asset import Asset
from app.schemas.user import User

class AuditCycleBase(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[AuditCycleStatus] = AuditCycleStatus.planned
    auditor_id: Optional[int] = None

class AuditCycleCreate(BaseModel):
    name: str
    start_date: date
    auditor_id: int

class AuditCycleResponse(AuditCycleBase):
    id: Optional[int] = None
    auditor: Optional[User] = None

    model_config = {"from_attributes": True}

class AuditItemBase(BaseModel):
    cycle_id: Optional[int] = None
    asset_id: Optional[int] = None
    status: Optional[AuditItemStatus] = AuditItemStatus.pending
    notes: Optional[str] = None
    verified_at: Optional[datetime] = None

class AuditItemUpdate(BaseModel):
    status: AuditItemStatus
    notes: Optional[str] = None

class AuditItemResponse(AuditItemBase):
    id: Optional[int] = None
    asset: Optional[Asset] = None

    model_config = {"from_attributes": True}

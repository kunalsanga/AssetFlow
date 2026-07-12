import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AuditCycleStatus(str, enum.Enum):
    planned = "PLANNED"
    active = "ACTIVE"
    completed = "COMPLETED"
    closed = "CLOSED"

class AuditItemStatus(str, enum.Enum):
    pending = "PENDING"
    verified = "VERIFIED"
    missing = "MISSING"
    damaged = "DAMAGED"

class AuditCycle(Base):
    __tablename__ = "audit_cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(AuditCycleStatus), default=AuditCycleStatus.planned, nullable=False)
    auditor_id = Column(Integer, ForeignKey("users.id", name="fk_audit_cycle_auditor"), nullable=False)

    # Relationships
    auditor = relationship("User", foreign_keys=[auditor_id])

class AuditItem(Base):
    __tablename__ = "audit_items"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("audit_cycles.id", ondelete="CASCADE", name="fk_audit_item_cycle"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE", name="fk_audit_item_asset"), nullable=False)
    status = Column(Enum(AuditItemStatus), default=AuditItemStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    # Relationships
    cycle = relationship("AuditCycle", backref="items")
    asset = relationship("Asset", backref="audit_items")

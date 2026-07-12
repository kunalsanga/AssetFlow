import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AllocationToType(str, enum.Enum):
    user = "user"
    department = "department"

class AllocationStatus(str, enum.Enum):
    active = "active"
    returned = "returned"
    transferred = "transferred"
    overdue = "overdue"

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    allocated_to_type = Column(Enum(AllocationToType), nullable=False)
    allocated_to_id = Column(Integer, nullable=False)  # User ID or Department ID
    allocated_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allocated_at = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    returned_at = Column(DateTime, nullable=True)
    return_condition = Column(Text, nullable=True)
    status = Column(Enum(AllocationStatus), default=AllocationStatus.active, nullable=False)

    # Relationships
    asset = relationship("Asset", backref="allocations")
    allocated_by = relationship("User", foreign_keys=[allocated_by_id])

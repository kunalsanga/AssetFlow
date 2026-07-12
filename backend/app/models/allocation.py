import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AllocationToType(str, enum.Enum):
    user = "user"
    USER = "user"
    department = "department"
    DEPARTMENT = "department"

class AllocationStatus(str, enum.Enum):
    active = "active"
    ACTIVE = "active"
    returned = "returned"
    RETURNED = "returned"
    transferred = "transferred"
    TRANSFERRED = "transferred"
    overdue = "overdue"
    OVERDUE = "overdue"

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

    employee_id = Column(Integer, ForeignKey("users.id", name="fk_allocation_employee"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_allocation_department"), nullable=True)
    expected_return = Column(DateTime, nullable=True)
    return_notes = Column(Text, nullable=True)
    condition_on_return = Column(String, nullable=True)

    # Relationships
    asset = relationship("Asset", backref="allocations")
    allocated_by = relationship("User", foreign_keys=[allocated_by_id])
    employee = relationship("User", foreign_keys=[employee_id])
    department = relationship("Department", foreign_keys=[department_id])


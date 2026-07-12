import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TransferRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class TransferRequest(Base):
    __tablename__ = "transfer_requests"

    id = Column(Integer, primary_key=True, index=True)
    allocation_id = Column(Integer, ForeignKey("allocations.id", ondelete="CASCADE"), nullable=False)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String, nullable=False)  # "user" or "department"
    target_id = Column(Integer, nullable=False)  # User ID or Department ID
    status = Column(Enum(TransferRequestStatus), default=TransferRequestStatus.pending, nullable=False)
    created_at = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    allocation = relationship("Allocation", backref="transfer_requests")
    requested_by = relationship("User", foreign_keys=[requested_by_id])

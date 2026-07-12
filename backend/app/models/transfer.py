import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TransferRequestStatus(str, enum.Enum):
    pending = "pending"
    PENDING = "pending"
    requested = "requested"
    REQUESTED = "requested"
    approved = "approved"
    APPROVED = "approved"
    rejected = "rejected"
    REJECTED = "rejected"
    cancelled = "cancelled"
    CANCELLED = "cancelled"

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

    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_transfer_asset"), nullable=True)
    current_holder = Column(Integer, ForeignKey("users.id", name="fk_transfer_current_holder"), nullable=True)
    requested_holder = Column(Integer, ForeignKey("users.id", name="fk_transfer_requested_holder"), nullable=True)
    requested_by = Column(Integer, ForeignKey("users.id", name="fk_transfer_requester"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", name="fk_transfer_approver"), nullable=True)
    reason = Column(String, nullable=True)
    requested_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)

    # Relationships
    allocation = relationship("Allocation", foreign_keys=[allocation_id], backref="transfer_requests")
    requested_by_user = relationship("User", foreign_keys=[requested_by_id])
    asset = relationship("Asset", foreign_keys=[asset_id])
    current_holder_user = relationship("User", foreign_keys=[current_holder])
    requested_holder_user = relationship("User", foreign_keys=[requested_holder])
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])


from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_maintenance_asset"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id", name="fk_maintenance_requester"), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="MEDIUM", nullable=False)
    status = Column(String, default="PENDING", nullable=False)
    scheduled_date = Column(Date, nullable=True)

    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    requester = relationship("User", foreign_keys=[requester_id])

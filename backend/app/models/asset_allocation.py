from sqlalchemy import Column, Integer, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AssetAllocation(Base):
    __tablename__ = "asset_allocations"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_allocation_asset"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_allocation_user"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_allocation_department"), nullable=True)
    allocated_at = Column(DateTime, nullable=False)
    expected_return_date = Column(Date, nullable=True)
    returned_at = Column(DateTime, nullable=True)

    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    user = relationship("User", foreign_keys=[user_id])
    department = relationship("Department", foreign_keys=[department_id])

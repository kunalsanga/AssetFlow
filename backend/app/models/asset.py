from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    status = Column(String, default="AVAILABLE", index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_asset_department"), nullable=True)
    managed_by_id = Column(Integer, ForeignKey("users.id", name="fk_asset_manager"), nullable=True)
    is_shared = Column(Boolean, default=False, nullable=False)

    # Relationships
    department = relationship("Department", foreign_keys=[department_id])
    manager = relationship("User", foreign_keys=[managed_by_id])

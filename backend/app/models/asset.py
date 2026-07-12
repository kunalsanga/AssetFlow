import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AssetStatus(str, enum.Enum):
    available = "available"
    allocated = "allocated"
    reserved = "reserved"
    under_maintenance = "under_maintenance"
    lost = "lost"
    retired = "retired"
    disposed = "disposed"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    status = Column(SQLEnum(AssetStatus), default=AssetStatus.available, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_asset_department"), nullable=True)
    managed_by_id = Column(Integer, ForeignKey("users.id", name="fk_asset_manager"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", name="fk_asset_category"), nullable=True)
    is_shared = Column(Boolean, default=False, nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=True)
    model = Column(String, nullable=True)
    description = Column(String, nullable=True)

    # Relationships
    department = relationship("Department", foreign_keys=[department_id])
    manager = relationship("User", foreign_keys=[managed_by_id])
    category = relationship("Category", foreign_keys=[category_id])


import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum, Date, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AssetStatus(str, enum.Enum):
    available = "available"
    AVAILABLE = "available"
    allocated = "allocated"
    ALLOCATED = "allocated"
    reserved = "reserved"
    RESERVED = "reserved"
    under_maintenance = "under_maintenance"
    UNDER_MAINTENANCE = "under_maintenance"
    lost = "lost"
    LOST = "lost"
    retired = "retired"
    RETIRED = "retired"
    disposed = "disposed"
    DISPOSED = "disposed"

class AssetCondition(str, enum.Enum):
    NEW = "NEW"
    GOOD = "GOOD"
    FAIR = "FAIR"
    DAMAGED = "DAMAGED"
    SCRAP = "SCRAP"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, index=True, nullable=False)
    status = Column(SQLEnum(AssetStatus), default=AssetStatus.available, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_asset_department"), nullable=True)
    managed_by_id = Column(Integer, ForeignKey("users.id", name="fk_asset_manager"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", name="fk_asset_category"), nullable=True)
    is_shared = Column(Boolean, default=False, nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=True)
    model = Column(String, nullable=True)
    description = Column(String, nullable=True)
    purchase_date = Column(Date, nullable=True)
    location = Column(String, nullable=True)

    condition = Column(SQLEnum(AssetCondition), default=AssetCondition.GOOD, nullable=False)
    location = Column(String, nullable=True)
    purchase_cost = Column(Float, nullable=True)
    photo_url = Column(String, nullable=True)
    document_url = Column(String, nullable=True)
    is_bookable = Column(Boolean, default=False, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", name="fk_asset_creator"), nullable=True)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    department = relationship("Department", foreign_keys=[department_id])
    manager = relationship("User", foreign_keys=[managed_by_id])
    category = relationship("Category", foreign_keys=[category_id])
    created_by = relationship("User", foreign_keys=[created_by_id])


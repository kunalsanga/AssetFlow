import enum
from sqlalchemy import Column, Integer, String, Enum
from app.db.base_class import Base

class AssetStatus(str, enum.Enum):
    available = "available"
    allocated = "allocated"
    maintenance = "maintenance"
    retired = "retired"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    model = Column(String, index=True, nullable=False)
    status = Column(Enum(AssetStatus), default=AssetStatus.available, nullable=False)
    description = Column(String, nullable=True)

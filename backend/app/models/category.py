from typing import Optional, Any
from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, func
from app.db.base_class import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="Active", nullable=False)  # Active / Inactive
    custom_fields = Column(JSON, nullable=True)  # Dynamic attributes (e.g. warranty period)
    is_deleted = Column(Boolean, default=False, nullable=False)  # Soft Delete flag
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    @property
    def optional_metadata(self) -> Optional[Any]:
        return self.custom_fields

    @optional_metadata.setter
    def optional_metadata(self, value: Optional[Any]):
        self.custom_fields = value

    @property
    def status_label(self) -> str:
        return self.status


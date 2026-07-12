from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_activity_user"), nullable=True)
    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_activity_asset"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    asset = relationship("Asset", foreign_keys=[asset_id])

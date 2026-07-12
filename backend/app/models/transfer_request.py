from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TransferRequest(Base):
    __tablename__ = "transfer_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", name="fk_transfer_asset"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id", name="fk_transfer_from_user"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id", name="fk_transfer_to_user"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_transfer_department"), nullable=True)
    status = Column(String, default="PENDING", nullable=False)

    # Relationships
    asset = relationship("Asset", foreign_keys=[asset_id])
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
    department = relationship("Department", foreign_keys=[department_id])

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False, unique=True)
    head_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_department_head"), nullable=True)
    status = Column(String, default="Active", nullable=False)
    parent_id = Column(Integer, ForeignKey("departments.id", name="fk_department_parent"), nullable=True)

    # Relationships
    head = relationship("User", foreign_keys=[head_id], post_update=True)
    users = relationship("User", foreign_keys="[User.department_id]", back_populates="department")

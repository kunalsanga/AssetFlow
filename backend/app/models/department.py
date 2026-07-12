from typing import Optional
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False, unique=True)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    head_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_department_head"), nullable=True)
    status = Column(String, default="Active", nullable=False)
    parent_id = Column(Integer, ForeignKey("departments.id", name="fk_department_parent"), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    head = relationship("User", foreign_keys=[head_id], post_update=True)
    users = relationship("User", foreign_keys="[User.department_id]", back_populates="department")

    @property
    def parent_department_id(self) -> Optional[int]:
        return self.parent_id
    
    @parent_department_id.setter
    def parent_department_id(self, value: Optional[int]):
        self.parent_id = value

    @property
    def department_head_id(self) -> Optional[int]:
        return self.head_id
    
    @department_head_id.setter
    def department_head_id(self, value: Optional[int]):
        self.head_id = value

    @property
    def status_label(self) -> str:
        return self.status


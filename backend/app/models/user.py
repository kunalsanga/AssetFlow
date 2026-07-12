import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    ASSET_MANAGER = "ASSET_MANAGER"
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD"
    EMPLOYEE = "EMPLOYEE"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    is_active = Column(Boolean, default=True)
    department_id = Column(Integer, ForeignKey("departments.id", name="fk_user_department"), nullable=True)

    department = relationship("Department", foreign_keys=[department_id], back_populates="users")


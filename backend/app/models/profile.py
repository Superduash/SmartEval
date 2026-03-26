from sqlalchemy import Column, ForeignKey, Integer, String

from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    phone = Column(String(32), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    timezone = Column(String(64), nullable=True)
    bio = Column(String(500), nullable=True)

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(120), nullable=False)
    action = Column(String(500), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

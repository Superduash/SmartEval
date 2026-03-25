from sqlalchemy.orm import Session

from app.models.agent_log import AgentLog


def log_agent_action(db: Session, agent_name: str, action: str) -> None:
    entry = AgentLog(agent_name=agent_name, action=action)
    db.add(entry)
    db.commit()

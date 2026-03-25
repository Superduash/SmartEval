from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.deps import get_current_user, require_student, require_teacher
from app.main import app
from app.models import Role, User

SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    teacher = User(id=1, name="Teacher One", email="teacher@example.com", password="hashed", role=Role.teacher)
    student = User(id=2, name="Student One", email="student@example.com", password="hashed", role=Role.student)
    db.add_all([teacher, student])
    db.commit()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client_public(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides = {}


@pytest.fixture(scope="function")
def client_teacher(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        yield db_session

    def override_teacher():
        return db_session.query(User).filter(User.id == 1).first()

    def override_current_user():
        return db_session.query(User).filter(User.id == 1).first()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_teacher] = override_teacher
    app.dependency_overrides[get_current_user] = override_current_user

    with TestClient(app) as client:
        yield client
    app.dependency_overrides = {}


@pytest.fixture(scope="function")
def client_student(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        yield db_session

    def override_student():
        return db_session.query(User).filter(User.id == 2).first()

    def override_current_user():
        return db_session.query(User).filter(User.id == 2).first()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_student] = override_student
    app.dependency_overrides[get_current_user] = override_current_user

    with TestClient(app) as client:
        yield client
    app.dependency_overrides = {}

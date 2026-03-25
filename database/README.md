# Database Layer

Primary schema and persistence logic:

- SQLAlchemy models: `backend/app/models`
- Session/config: `backend/app/core/database.py`
- Runtime DB: PostgreSQL (Docker service `db`)
- Test DB: in-memory SQLite via `backend/tests/conftest.py`

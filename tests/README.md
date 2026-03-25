# Unified Test Directory

This folder documents repository-wide testing strategy.

- Backend tests live in `backend/tests` (pytest).
- Frontend component tests live in `frontend/tests/components` (Jest + RTL).
- End-to-end tests live in `frontend/tests/e2e` (Playwright).

## Added Utilities

- `run_all.sh`: single command to run backend tests, frontend lint, frontend unit tests, and frontend production build.

### Usage

```bash
chmod +x tests/run_all.sh
./tests/run_all.sh
```

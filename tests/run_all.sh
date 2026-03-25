#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

echo "[1/4] Backend tests"
cd "$BACKEND_DIR"
if [[ -d "$ROOT_DIR/.venv" ]]; then
  source "$ROOT_DIR/.venv/bin/activate"
fi
pytest -q

echo "[2/4] Frontend lint"
cd "$FRONTEND_DIR"
npm run lint

echo "[3/4] Frontend unit tests"
npm test -- --watch=false

echo "[4/4] Frontend production build"
npm run build

echo "All checks passed."

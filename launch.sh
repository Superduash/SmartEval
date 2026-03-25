#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_PY="$ROOT_DIR/.venv/bin/python"

BACKEND_HOST="127.0.0.1"
BACKEND_PORT="8000"
FRONTEND_HOST="127.0.0.1"
FRONTEND_PORT="3000"

BACKEND_HEALTH_URL="http://$BACKEND_HOST:$BACKEND_PORT/api/v1/health"
FRONTEND_URL="http://$FRONTEND_HOST:$FRONTEND_PORT"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Stopping services..."

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  wait || true
  echo "Stopped."
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local retries="${3:-90}"

  for ((i = 1; i <= retries; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label is ready."
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for $label at $url"
  return 1
}

if [[ ! -x "$VENV_PY" ]]; then
  echo "Missing Python virtual environment at .venv/."
  echo "Run ./mac_install.sh once, then retry ./launch.sh"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed. Install Node.js and retry."
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "frontend/node_modules not found. Run: cd frontend && npm install"
  exit 1
fi

trap cleanup INT TERM EXIT

echo "Starting backend on :$BACKEND_PORT..."
(
  cd "$BACKEND_DIR"
  "$VENV_PY" -m uvicorn app.main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

echo "Starting frontend on :$FRONTEND_PORT..."
(
  cd "$FRONTEND_DIR"
  npm run dev -- -H "$FRONTEND_HOST" -p "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

wait_for_url "$BACKEND_HEALTH_URL" "Backend"
wait_for_url "$FRONTEND_URL" "Frontend"

echo "Opening app in browser..."
open "$FRONTEND_URL"

echo ""
echo "App is running"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  http://$BACKEND_HOST:$BACKEND_PORT"
echo "Press Ctrl+C to stop both services"

wait

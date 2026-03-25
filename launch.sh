#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
CLIENT_DIR="$ROOT_DIR/client"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_PY="$ROOT_DIR/.venv/bin/python"

BACKEND_HOST="127.0.0.1"
BACKEND_PORT="8000"
FRONTEND_PORT="3000"

BACKEND_HEALTH_URL="http://$BACKEND_HOST:$BACKEND_PORT/api/v1/health/"
FRONTEND_URL="http://127.0.0.1:$FRONTEND_PORT"

BACKEND_PID=""
FRONTEND_PID=""

kill_port() {
  local port="$1"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi

  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
    sleep 0.2
  fi
}

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  wait || true
}

wait_for_url() {
  local url="$1"
  local retries="${2:-120}"

  for ((i = 1; i <= retries; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done

  return 1
}

if [[ ! -x "$VENV_PY" ]]; then
  echo "Missing Python virtual environment at .venv/."
  echo "Run ./mac_install.sh once, then retry ./launch.sh"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  exit 1
fi

if [[ ! -d "$CLIENT_DIR" ]]; then
  exit 1
fi

trap cleanup INT TERM EXIT

kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

(
  cd "$BACKEND_DIR"
  exec "$VENV_PY" -m uvicorn app.main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT" --log-level warning
) &
BACKEND_PID=$!

(
  if [[ -d "$FRONTEND_DIR" ]]; then
    cd "$FRONTEND_DIR"
    npm run dev -- --turbo >/dev/null 2>&1 || exec npm run dev >/dev/null 2>&1
  else
    cd "$CLIENT_DIR"
    exec npm start >/dev/null 2>&1
  fi
) &
FRONTEND_PID=$!

wait_for_url "$BACKEND_HEALTH_URL" || true
wait_for_url "$FRONTEND_URL" || true

open "$FRONTEND_URL" >/dev/null 2>&1 || true

echo "ready: $FRONTEND_URL"

wait

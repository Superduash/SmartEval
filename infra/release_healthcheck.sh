#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:3000}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000/api/v1/health/}"
TIMEOUT_SECS="${TIMEOUT_SECS:-30}"

check_url() {
  local url="$1"
  local label="$2"
  local end_time=$((SECONDS + TIMEOUT_SECS))

  until curl -fsS "$url" >/dev/null 2>&1; do
    if (( SECONDS >= end_time )); then
      echo "$label check failed: $url"
      return 1
    fi
    sleep 0.5
  done

  echo "$label healthy: $url"
}

check_url "$BACKEND_URL" "Backend"
check_url "$FRONTEND_URL" "Frontend"

echo "Release health checks passed."

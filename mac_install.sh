#!/bin/bash
# ============================================================
# Smart Evaluation — Fast Mac Install (No Brew Version)
# Works on old Macs | Python 3.12 | Node already installed
# ============================================================
set -e

PROJECT_DIR="/Users/ashwin/Downloads/Smart Evaluation"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Smart Evaluation — Fast Setup (No Brew)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Check Python ─────────────────────────────────────────
echo "▶ Checking Python"
python3 --version || { echo "❌ Python not installed"; exit 1; }

# ── 2. Check Node ───────────────────────────────────────────
echo "▶ Checking Node"
node -v || { echo "❌ Node not installed"; exit 1; }

# ── 3. Backend Setup ────────────────────────────────────────
echo "▶ Setting up Backend"
cd "$PROJECT_DIR/backend"

python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip setuptools wheel

pip install \
  fastapi \
  uvicorn \
  sqlalchemy \
  aiosqlite \
  python-jose \
  passlib bcrypt \
  python-multipart \
  pydantic-settings \
  email-validator \
  openai \
  pytesseract \
  pdf2image \
  pillow \
  python-dotenv \
  httpx \
  reportlab \
  matplotlib \
  pytest

echo "  ✅ Backend ready"

# ── 4. Create .env ──────────────────────────────────────────
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
cat > "$PROJECT_DIR/backend/.env" << 'EOF'
APP_NAME=Smart Evaluation Backend
ENV=development
DEBUG=true
SECRET_KEY=dev-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=sqlite:///./smart_eval.db
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./storage
PASSING_MARK=40
EOF
echo "  ✅ .env created"
fi

# ── 5. Frontend Setup ───────────────────────────────────────
echo "▶ Setting up Frontend"
cd "$PROJECT_DIR/frontend"

cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

npm install --legacy-peer-deps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ INSTALL COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run the app:"
echo ""
echo "Terminal 1 (Backend):"
echo "cd \"$PROJECT_DIR/backend\""
echo "source .venv/bin/activate"
echo "uvicorn app.main:app --reload --port 8000"
echo ""
echo "Terminal 2 (Frontend):"
echo "cd \"$PROJECT_DIR/frontend\""
echo "npm run dev"
echo ""
echo "Open: http://localhost:3000"
echo "API:  http://localhost:8000/docs"
echo ""
#!/bin/bash
# ──────────────────────────────────────────────────────────────────
# Vision Flow — Local Development Startup (venv + Docker Postgres)
# ──────────────────────────────────────────────────────────────────
set -e

cd "$(dirname "$0")"

VENV_DIR="./venv"
if [ ! -d "$VENV_DIR" ]; then
  echo "[!] venv not found at $VENV_DIR"
  exit 1
fi

# Activate venv
source "$VENV_DIR/bin/activate"

# ── Local overrides ─────────────────────────────────────────────
export DATABASE_URL="postgresql://visionflow:visionflow@localhost:5432/visionflow"
export YOLO_MODEL_PATH="yolo11n_openvino_model/"
export SECRET_KEY="change-me-dev-secret"

# Load rest of .env without overriding what we just set
set -a
# shellcheck disable=SC1090
source <(grep -v "^\s*#" .env | grep -v "^DATABASE_URL" | grep -v "^YOLO_MODEL_PATH" | grep -v "^SECRET_KEY" | grep "=")
set +a

# ── Start postgres if not running ────────────────────────────────
if ! nc -z localhost 5432 2>/dev/null; then
  echo "[*] Starting PostgreSQL container..."
  docker-compose up -d postgres
  echo "[*] Waiting for PostgreSQL to be ready..."
  for i in {1..20}; do
    nc -z localhost 5432 2>/dev/null && break
    sleep 1
    echo "    waiting... ($i)"
  done
fi

echo "[*] PostgreSQL is ready."

# ── Prisma ──────────────────────────────────────────────────────
echo "[*] Generating Prisma client..."
prisma generate

echo "[*] Pushing schema to PostgreSQL..."
prisma db push --accept-data-loss

# ── Create default admin if it doesn't exist ────────────────────
echo "[*] Ensuring admin account exists..."
python create_admin.py \
  --email "admin@visionflow.ai" \
  --password "Admin@1234" \
  --first-name "Super" \
  --last-name "Admin" || true

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Backend: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Admin:    admin@visionflow.ai / Admin@1234"
echo "════════════════════════════════════════════════════════"
echo ""

# ── Start FastAPI ────────────────────────────────────────────────
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

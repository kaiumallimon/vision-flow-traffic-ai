#!/bin/bash
# ══════════════════════════════════════════════════════════════════
#  Vision Flow — Linux/macOS Startup Script
#  Starts: PostgreSQL (Docker) + FastAPI (venv) + Next.js (npm)
# ══════════════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colours ──────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[*]${RESET} $1"; }
success() { echo -e "${GREEN}[✔]${RESET} $1"; }
warn()    { echo -e "${YELLOW}[!]${RESET} $1"; }
error()   { echo -e "${RED}[✘]${RESET} $1"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────
[[ -d "./venv" ]]           || error "venv not found. Run: python -m venv venv && pip install -r fastapi_requirements.txt"
command -v docker  &>/dev/null || error "Docker is not installed or not in PATH"
command -v node    &>/dev/null || error "Node.js is not installed"
command -v npm     &>/dev/null || error "npm is not installed"

# ── Activate venv ─────────────────────────────────────────────────
source "./venv/bin/activate"
success "Virtual environment activated"

# ── Environment variables ─────────────────────────────────────────
# Local overrides (differ from Docker .env values)
export DATABASE_URL="postgresql://visionflow:visionflow@localhost:5432/visionflow"
export YOLO_MODEL_PATH="yolo11n_openvino_model/"

# Load remaining keys from .env without overriding the above
if [[ -f ".env" ]]; then
  set -a
  source <(grep -v '^\s*#' .env \
    | grep -v '^DATABASE_URL' \
    | grep -v '^YOLO_MODEL_PATH' \
    | grep '=')
  set +a
fi

# ── Start PostgreSQL ──────────────────────────────────────────────
if nc -z localhost 5432 2>/dev/null; then
  success "PostgreSQL already running on :5432"
else
  info "Starting PostgreSQL container..."
  docker-compose up -d postgres
  info "Waiting for PostgreSQL to accept connections..."
  for i in {1..30}; do
    nc -z localhost 5432 2>/dev/null && break
    sleep 1
    printf "    attempt %d/30\r" "$i"
  done
  nc -z localhost 5432 2>/dev/null || error "PostgreSQL did not become ready in time"
  success "PostgreSQL is ready"
fi

# ── Prisma ────────────────────────────────────────────────────────
info "Generating Prisma client..."
prisma generate --schema=schema.prisma 2>&1 | tail -3

info "Syncing schema to PostgreSQL..."
prisma db push --accept-data-loss --schema=schema.prisma 2>&1 | tail -3
success "Database schema is up to date"

# ── Admin account ─────────────────────────────────────────────────
info "Ensuring default admin account exists..."
python create_admin.py \
  --email    "admin@visionflow.ai" \
  --password "Admin@1234" \
  --first-name "Super" \
  --last-name  "Admin" 2>&1 || warn "Admin account may already exist (skipping)"

# ── Frontend dependencies ──────────────────────────────────────────
if [[ ! -d "frontend/node_modules" ]]; then
  info "Installing frontend npm dependencies..."
  (cd frontend && npm install --silent)
  success "Frontend dependencies installed"
else
  success "Frontend dependencies already installed"
fi

# ── Banner ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Vision Flow is starting…${RESET}"
echo -e "  ${GREEN}Backend${RESET}   → http://localhost:8000"
echo -e "  ${GREEN}API Docs${RESET}  → http://localhost:8000/docs"
echo -e "  ${GREEN}Frontend${RESET}  → http://localhost:3000"
echo -e "  ${YELLOW}Admin${RESET}     → admin@visionflow.ai / Admin@1234"
echo -e "${BOLD}════════════════════════════════════════════════════════${RESET}"
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop all services"
echo ""

# ── Process tracking ──────────────────────────────────────────────
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  warn "Shutting down services..."
  [[ -n "$BACKEND_PID"  ]] && kill "$BACKEND_PID"  2>/dev/null && success "Backend stopped"
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null && success "Frontend stopped"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Start FastAPI backend ─────────────────────────────────────────
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
success "Backend started (PID $BACKEND_PID)"

# ── Start Next.js frontend ────────────────────────────────────────
(cd frontend && npm run dev) &
FRONTEND_PID=$!
success "Frontend started (PID $FRONTEND_PID)"

# ── Wait ──────────────────────────────────────────────────────────
wait "$BACKEND_PID" "$FRONTEND_PID"

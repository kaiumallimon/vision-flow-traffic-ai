#!/bin/bash
# ══════════════════════════════════════════════════════════════════
#  Vision Flow — Local Development Startup
#  Backend: FastAPI via venv  |  Database: Neon (cloud PostgreSQL)
# ══════════════════════════════════════════════════════════════════
set -e
cd "$(dirname "$0")"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[*]${RESET} $1"; }
success() { echo -e "${GREEN}[+]${RESET} $1"; }
fail()    { echo -e "${RED}[!]${RESET} $1"; exit 1; }

# ── Pre-flight ────────────────────────────────────────────────────
[[ -d "./venv" ]] || fail "venv not found. Run: python3 -m venv venv && pip install -r fastapi_requirements.txt"
command -v node &>/dev/null || fail "Node.js not installed"
command -v npm  &>/dev/null || fail "npm not installed"

# ── Activate venv ─────────────────────────────────────────────────
source ./venv/bin/activate
success "Virtual environment activated"

# ── Load .env ─────────────────────────────────────────────────────
set -a; source .env; set +a


# ── Admin account ─────────────────────────────────────────────────
info "Ensuring admin account exists..."
python create_admin.py \
  --email "admin@visionflow.ai" --password "Admin@1234" \
  --first-name "Super" --last-name "Admin" 2>&1 || true

# ── Frontend dependencies ──────────────────────────────────────────
if [[ ! -d "frontend/node_modules" ]]; then
  info "Installing frontend npm packages..."
  (cd frontend && npm install --silent)
fi

# ── Banner ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════${RESET}"
echo -e "  ${GREEN}Backend${RESET}   → http://localhost:8000"
echo -e "  ${GREEN}API Docs${RESET}  → http://localhost:8000/docs"
echo -e "  ${GREEN}Frontend${RESET}  → http://localhost:3000"
echo -e "  ${CYAN}DB${RESET}        → Neon (cloud)"
echo -e "${BOLD}════════════════════════════════════════════════════════${RESET}"
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop"
echo ""

# ── Shutdown handler ──────────────────────────────────────────────
BACKEND_PID=""; FRONTEND_PID=""
cleanup() {
  echo ""
  [[ -n "$BACKEND_PID"  ]] && kill "$BACKEND_PID"  2>/dev/null
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Start services ────────────────────────────────────────────────
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
success "Backend started (PID $BACKEND_PID)"

(cd frontend && npm run dev) &
FRONTEND_PID=$!
success "Frontend started (PID $FRONTEND_PID)"

wait "$BACKEND_PID" "$FRONTEND_PID"

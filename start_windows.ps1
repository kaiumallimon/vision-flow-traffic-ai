# ══════════════════════════════════════════════════════════════════
#  Vision Flow — Windows Startup Script (PowerShell)
#  Starts: PostgreSQL (Docker) + FastAPI (venv) + Next.js (npm)
#
#  Usage:  .\start_windows.ps1
#  Requires: Docker Desktop, Node.js, Python 3.10+
# ══════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# ── Helpers ───────────────────────────────────────────────────────
function Info    { param($msg) Write-Host "[*] $msg" -ForegroundColor Cyan }
function Success { param($msg) Write-Host "[+] $msg" -ForegroundColor Green }
function Warn    { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Fail    { param($msg) Write-Host "[x] $msg" -ForegroundColor Red; exit 1 }

function Test-Port {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()
        return $true
    } catch { return $false }
}

# ── Pre-flight checks ──────────────────────────────────────────────
if (-not (Get-Command python  -ErrorAction SilentlyContinue)) { Fail "Python is not installed or not in PATH" }
if (-not (Get-Command docker  -ErrorAction SilentlyContinue)) { Fail "Docker is not installed or not in PATH" }
if (-not (Get-Command node    -ErrorAction SilentlyContinue)) { Fail "Node.js is not installed" }
if (-not (Get-Command npm     -ErrorAction SilentlyContinue)) { Fail "npm is not installed" }

# ── Venv paths ────────────────────────────────────────────────────
$Python  = ".\venv\Scripts\python.exe"
$Pip     = ".\venv\Scripts\pip.exe"
$Prisma  = ".\venv\Scripts\prisma.exe"
$Uvicorn = ".\venv\Scripts\uvicorn.exe"

# Auto-create venv if missing
if (-not (Test-Path ".\venv")) {
    Info "Creating virtual environment..."
    python -m venv venv
    Success "Virtual environment created"
}

# Install / sync dependencies using Windows-specific requirements
# (excludes uvicorn[standard] which pulls in uvloop — Unix only)
$WinReqs = ".\fastapi_requirements_windows.txt"
if (-not (Test-Path $Uvicorn)) {
    Info "Installing Python dependencies (this may take a few minutes)..."
    & $Pip install --upgrade pip --quiet
    & $Pip install -r $WinReqs
    Success "Python dependencies installed"
} else {
    Success "Virtual environment found"
}

foreach ($bin in @($Python, $Prisma, $Uvicorn)) {
    if (-not (Test-Path $bin)) { Fail "Missing venv binary: $bin — delete venv\ and re-run this script" }
}

# ── Environment variables ─────────────────────────────────────────
# Local overrides (differ from Docker .env values)
$env:DATABASE_URL   = "postgresql://visionflow:visionflow@localhost:5432/visionflow"
$env:YOLO_MODEL_PATH = "yolo11n_openvino_model/"

# Load remaining keys from .env without overriding the above
if (Test-Path ".env") {
    $skipKeys = @("DATABASE_URL", "YOLO_MODEL_PATH")
    Get-Content ".env" | Where-Object { $_ -match "^\s*[^#].+=.+" } | ForEach-Object {
        $parts = $_ -split "=", 2
        $key   = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($skipKeys -notcontains $key) {
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# ── Start PostgreSQL ───────────────────────────────────────────────
if (Test-Port 5432) {
    Success "PostgreSQL already running on :5432"
} else {
    Info "Starting PostgreSQL container..."
    docker-compose up -d postgres | Out-Null
    Info "Waiting for PostgreSQL to accept connections..."
    $attempts = 0
    while (-not (Test-Port 5432)) {
        $attempts++
        if ($attempts -ge 30) { Fail "PostgreSQL did not become ready in time" }
        Start-Sleep -Seconds 1
        Write-Host "    attempt $attempts/30" -NoNewline
        Write-Host "`r" -NoNewline
    }
    Success "PostgreSQL is ready"
}

# ── Prisma ────────────────────────────────────────────────────────
Info "Generating Prisma client..."
& $Prisma generate --schema=schema.prisma 2>&1 | Select-Object -Last 3

Info "Syncing schema to PostgreSQL..."
& $Prisma db push --accept-data-loss --schema=schema.prisma 2>&1 | Select-Object -Last 3
Success "Database schema is up to date"

# ── Admin account ─────────────────────────────────────────────────
Info "Ensuring default admin account exists..."
try {
    & $Python create_admin.py `
        --email      "admin@visionflow.ai" `
        --password   "Admin@1234" `
        --first-name "Super" `
        --last-name  "Admin"
} catch {
    Warn "Admin account may already exist (skipping)"
}

# ── Frontend dependencies ──────────────────────────────────────────
if (-not (Test-Path "frontend\node_modules")) {
    Info "Installing frontend npm dependencies..."
    Push-Location frontend
    npm install --silent
    Pop-Location
    Success "Frontend dependencies installed"
} else {
    Success "Frontend dependencies already installed"
}

# ── Banner ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "  Vision Flow is starting..." -ForegroundColor White
Write-Host "  Backend   -> http://localhost:8000"    -ForegroundColor Green
Write-Host "  API Docs  -> http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Frontend  -> http://localhost:3000"    -ForegroundColor Green
Write-Host "  Admin     -> admin@visionflow.ai / Admin@1234" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop all services"
Write-Host ""

# ── Start FastAPI backend (new window / background job) ───────────
Info "Starting FastAPI backend..."
$backendJob = Start-Job -ScriptBlock {
    param($dir, $db, $yolo)
    Set-Location $dir
    $env:DATABASE_URL    = $db
    $env:YOLO_MODEL_PATH = $yolo
    & ".\venv\Scripts\uvicorn.exe" app.main:app --host 0.0.0.0 --port 8000 --reload
} -ArgumentList $PSScriptRoot, $env:DATABASE_URL, $env:YOLO_MODEL_PATH

Success "Backend job started (Job ID: $($backendJob.Id))"

# ── Start Next.js frontend ────────────────────────────────────────
Info "Starting Next.js frontend..."
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location (Join-Path $dir "frontend")
    npm run dev
} -ArgumentList $PSScriptRoot

Success "Frontend job started (Job ID: $($frontendJob.Id))"

# ── Stream logs & wait ────────────────────────────────────────────
Info "Streaming logs (Ctrl+C to stop)..."
try {
    while ($true) {
        Receive-Job -Job $backendJob  -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[API] $_" -ForegroundColor DarkCyan }
        Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[WEB] $_" -ForegroundColor DarkGreen }

        # Stop if either job dies unexpectedly
        if ($backendJob.State  -eq "Failed") { Warn "Backend job failed!";  break }
        if ($frontendJob.State -eq "Failed") { Warn "Frontend job failed!"; break }

        Start-Sleep -Milliseconds 500
    }
} finally {
    Warn "Shutting down services..."
    Stop-Job  -Job $backendJob  -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob  -Force -ErrorAction SilentlyContinue
    Stop-Job  -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
    Success "All services stopped"
}

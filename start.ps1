# ══════════════════════════════════════════════════════════════════
#  Vision Flow — Windows Startup Script (PowerShell)
#  Backend: FastAPI via venv  |  Database: Neon (cloud PostgreSQL)
#
#  Usage: .\start.ps1
#  First run: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# ══════════════════════════════════════════════════════════════════
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Info    { param($msg) Write-Host "[*] $msg" -ForegroundColor Cyan }
function Success { param($msg) Write-Host "[+] $msg" -ForegroundColor Green }
function Fail    { param($msg) Write-Host "[!] $msg" -ForegroundColor Red; exit 1 }

# ── Pre-flight ────────────────────────────────────────────────────
if (-not (Get-Command python  -ErrorAction SilentlyContinue)) { Fail "Python not found" }
if (-not (Get-Command node    -ErrorAction SilentlyContinue)) { Fail "Node.js not found" }
if (-not (Get-Command npm     -ErrorAction SilentlyContinue)) { Fail "npm not found" }

# ── Venv paths ────────────────────────────────────────────────────
$Python  = ".\venv\Scripts\python.exe"
$Pip     = ".\venv\Scripts\pip.exe"
$Prisma  = ".\venv\Scripts\prisma.exe"
$Uvicorn = ".\venv\Scripts\uvicorn.exe"

if (-not (Test-Path ".\venv")) {
    Info "Creating virtual environment..."
    python -m venv venv
    Success "Virtual environment created"
}

if (-not (Test-Path $Uvicorn)) {
    Info "Installing Python dependencies (first run — may take a few minutes)..."
    & $Pip install --upgrade pip --quiet
    & $Pip install -r fastapi_requirements_windows.txt
    Success "Dependencies installed"
} else {
    Success "Virtual environment ready"
}

# ── Load .env ─────────────────────────────────────────────────────
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match "^\s*[^#].+=.+" } | ForEach-Object {
        $parts = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

# ── Prisma ────────────────────────────────────────────────────────
Info "Generating Prisma client..."
& $Prisma generate --schema=schema.prisma 2>&1 | Select-Object -Last 2

Info "Pushing schema to Neon..."
& $Prisma db push --accept-data-loss --schema=schema.prisma 2>&1 | Select-Object -Last 2
Success "Database schema is up to date"

# ── Admin account ─────────────────────────────────────────────────
Info "Ensuring admin account exists..."
try {
    & $Python create_admin.py --email "admin@visionflow.ai" --password "Admin@1234" --first-name "Super" --last-name "Admin"
} catch { }

# ── Frontend dependencies ──────────────────────────────────────────
if (-not (Test-Path "frontend\node_modules")) {
    Info "Installing frontend npm packages..."
    Push-Location frontend; npm install --silent; Pop-Location
}

# ── Banner ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "  Backend   -> http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs  -> http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Frontend  -> http://localhost:3000" -ForegroundColor Green
Write-Host "  DB        -> Neon (cloud)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop"
Write-Host ""

# ── Start services as background jobs ────────────────────────────
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    Get-Content ".env" | Where-Object { $_ -match "^\s*[^#].+=.+" } | ForEach-Object {
        $p = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($p[0].Trim(), $p[1].Trim(), "Process")
    }
    & ".\venv\Scripts\uvicorn.exe" app.main:app --host 0.0.0.0 --port 8000 --reload
} -ArgumentList $PSScriptRoot

$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location (Join-Path $dir "frontend")
    npm run dev
} -ArgumentList $PSScriptRoot

Success "Backend started (Job $($backendJob.Id))"
Success "Frontend started (Job $($frontendJob.Id))"

# ── Stream logs ───────────────────────────────────────────────────
try {
    while ($true) {
        Receive-Job $backendJob  -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[API] $_" -ForegroundColor DarkCyan }
        Receive-Job $frontendJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[WEB] $_" -ForegroundColor DarkGreen }
        if ($backendJob.State  -eq "Failed") { Write-Host "[!] Backend crashed" -ForegroundColor Red;  break }
        if ($frontendJob.State -eq "Failed") { Write-Host "[!] Frontend crashed" -ForegroundColor Red; break }
        Start-Sleep -Milliseconds 500
    }
} finally {
    Stop-Job  $backendJob,  $frontendJob  -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob  -Force -ErrorAction SilentlyContinue
    Write-Host "[+] All services stopped" -ForegroundColor Green
}

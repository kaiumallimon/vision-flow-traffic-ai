#!/usr/bin/env bash
set -e

# Use Render's persistent cache directory so pip packages
# are not re-downloaded on every deploy.
PIP_CACHE="${XDG_CACHE_HOME:-/opt/render/.cache}/pip"
echo "==> pip cache dir: $PIP_CACHE"

echo "==> Installing Python dependencies..."
pip install --upgrade pip --cache-dir "$PIP_CACHE"
pip install -r fastapi_requirements.txt --cache-dir "$PIP_CACHE"

echo "==> Build complete!"

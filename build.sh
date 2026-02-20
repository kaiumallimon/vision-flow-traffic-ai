#!/usr/bin/env bash
set -e

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r fastapi_requirements.txt

echo "==> Generating Prisma client..."
prisma generate --schema=schema.prisma

echo "==> Fetching Prisma query engine binary..."
prisma py fetch

echo "==> Copying Prisma binary to project src (survives into runtime container)..."
BINARY_NAME="prisma-query-engine-debian-openssl-3.0.x"
CACHE_DIR="/opt/render/.cache/prisma-python/binaries/5.4.2/ac9d7041ed77bcc8a8dbd2ab6616b39013829574"
BINARY_SRC="$CACHE_DIR/$BINARY_NAME"

if [ ! -f "$BINARY_SRC" ]; then
  echo "Binary not at expected path, searching..."
  BINARY_SRC=$(find /opt/render/.cache -type f -name "$BINARY_NAME" 2>/dev/null | head -1)
fi

if [ -z "$BINARY_SRC" ] || [ ! -f "$BINARY_SRC" ]; then
  echo "Listing cache dir contents for debugging:"
  ls -la "$CACHE_DIR" 2>/dev/null || echo "(cache dir not found)"
  find /opt/render/.cache -type f 2>/dev/null | head -20
  echo "ERROR: Prisma binary not found after fetch!"
  exit 1
fi

cp "$BINARY_SRC" "/opt/render/project/src/$BINARY_NAME"
chmod +x "/opt/render/project/src/$BINARY_NAME"
echo "==> Binary copied to /opt/render/project/src/$BINARY_NAME"

echo "==> Pushing schema to Neon..."
prisma db push --accept-data-loss --schema=schema.prisma

echo "==> Build complete!"

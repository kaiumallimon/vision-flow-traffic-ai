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
BINARY_SRC=$(find /opt/render/.cache -name "$BINARY_NAME" 2>/dev/null | head -1)

if [ -z "$BINARY_SRC" ]; then
  echo "ERROR: Prisma binary not found after fetch!"
  exit 1
fi

cp "$BINARY_SRC" "/opt/render/project/src/$BINARY_NAME"
chmod +x "/opt/render/project/src/$BINARY_NAME"
echo "==> Binary copied to /opt/render/project/src/$BINARY_NAME"

echo "==> Pushing schema to Neon..."
prisma db push --accept-data-loss --schema=schema.prisma

echo "==> Build complete!"

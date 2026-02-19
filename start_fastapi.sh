#!/bin/bash

# Vision Flow FastAPI Server Startup Script

echo "🚀 Starting Vision Flow FastAPI Server..."

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment if exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r fastapi_requirements.txt
fi

# Generate Prisma client if needed
echo "🔧 Generating Prisma client..."
prisma generate

# Apply schema to database
echo "🗄️ Applying Prisma schema to database..."
prisma db push

# Start FastAPI server
echo "✅ Starting server on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

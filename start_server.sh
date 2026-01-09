#!/bin/bash
# Start Vision Flow Traffic AI - Backend + Frontend

echo "🚀 Starting Vision Flow Traffic AI..."
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $DJANGO_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    exit 0
}

# Set trap to catch CTRL+C
trap cleanup SIGINT SIGTERM

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with your API keys and email settings"
    echo ""
fi

# Run migrations
echo "📊 Checking database migrations..."
python manage.py migrate

echo ""
echo "🔧 Starting Django Backend (http://localhost:8000)..."
python manage.py runserver > /dev/null 2>&1 &
DJANGO_PID=$!

# Wait for Django to start
sleep 2

echo "⚛️  Starting React Frontend (http://localhost:5173)..."
cd frontend
npm run dev &
VITE_PID=$!

echo ""
echo "✅ Servers running:"
echo "   - Backend:  http://localhost:8000"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "📝 Frontend will proxy API calls to backend"
echo "Press CTRL+C to stop all servers"
echo ""

# Wait for processes
wait

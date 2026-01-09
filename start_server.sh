#!/bin/bash
# Start Vision Flow Traffic AI - Backend (Django)

echo "🚀 Starting Django Backend..."
echo ""

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
echo "✅ Django Backend running at http://localhost:8000"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Start the server
python manage.py runserver

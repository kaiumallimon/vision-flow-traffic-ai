#!/bin/bash
# Start Vision Flow Traffic AI - Frontend (React)

echo "⚛️  Starting React Frontend..."
echo ""

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ React Frontend starting at http://localhost:5173"
echo ""
echo "🔗 Make sure Django backend is running at http://localhost:8000"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Start the Vite dev server
npm run dev

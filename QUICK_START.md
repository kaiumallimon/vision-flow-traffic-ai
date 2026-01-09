# 🚀 Quick Start Guide - Vision Flow AI

This guide will help you get Vision Flow AI up and running quickly.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.8 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] PostgreSQL installed and running
- [ ] Git installed

## Step-by-Step Setup

### 1. Clone & Navigate

```bash
git clone <your-repo-url>
cd Vision-Flow-Traffic-AI
```

### 2. Backend Setup (5 minutes)

```bash
# Create and activate virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# OR on Windows
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database with Prisma
prisma generate
prisma db push

# Run Django migrations
python manage.py migrate
```

### 3. Frontend Setup (3 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local to set your API URL (usually http://localhost:8000/api)
nano .env.local
```

### 4. Start the Application

**Option A: Using the startup scripts (Recommended)**

Open two terminal windows:

Terminal 1 (Backend):
```bash
./start_server.sh
```

Terminal 2 (Frontend):
```bash
./start_frontend.sh
```

**Option B: Manual start**

Terminal 1 (Backend):
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/

## First Time User Flow

1. **Open the app**: Navigate to http://localhost:3000
2. **Create account**: Click "Get Started" or "Register"
3. **Fill in details**:
   - First Name
   - Last Name
   - Email
   - Password (min 6 characters)
4. **Login**: Use your credentials to sign in
5. **Upload image**: Go to "Analyze Image" and upload a traffic image
6. **View results**: See detection results, heatmap, and AI recommendations
7. **Check history**: View all your past detections in History

## Common Issues & Solutions

### Issue: Module not found errors

**Solution**: Make sure you're in the correct directory and dependencies are installed
```bash
# For backend
pip install -r requirements.txt

# For frontend
cd frontend && npm install
```

### Issue: Database connection error

**Solution**: Ensure PostgreSQL is running and credentials are correct in `.env`
```bash
# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # Mac
```

### Issue: Port already in use

**Solution**: Change the port or kill the process
```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Find process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: Prisma not working

**Solution**: Regenerate Prisma client
```bash
prisma generate
prisma db push
```

### Issue: CORS errors in browser

**Solution**: Verify backend CORS settings in `visionflow/settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

## Environment Variables Reference

### Backend (.env in root)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/visionflow
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env.local in frontend/)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Testing the API

You can test the API endpoints using curl or tools like Postman:

```bash
# Register a user
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Project Structure Quick Reference

```
Vision-Flow-Traffic-AI/
├── api/              # Django API endpoints
├── frontend/         # Next.js frontend
│   ├── app/         # Pages
│   ├── components/  # UI components
│   └── lib/         # Utilities
├── visionflow/       # Django settings
├── media/           # Uploaded files
└── yolo11n_openvino_model/  # AI model
```

## Development Tips

1. **Backend changes**: Restart Django server to see changes
2. **Frontend changes**: Next.js has hot reload, no restart needed
3. **Database changes**: Run `prisma db push` after schema changes
4. **Add new packages**:
   - Backend: `pip install <package>` then update requirements.txt
   - Frontend: `npm install <package>`

## Need Help?

- Check the full [README.md](README.md)
- Review [TESTING_GUIDE.md](TESTING_GUIDE.md)
- Check the console logs for errors
- Ensure all services (PostgreSQL, Django, Next.js) are running

## Next Steps

Once everything is running:

1. ✅ Create your account
2. ✅ Upload and analyze your first traffic image
3. ✅ Explore the dashboard and statistics
4. ✅ Try different traffic images
5. ✅ Check your detection history
6. ✅ Update your profile

---

Happy coding! 🎉

# 🚦 Vision Flow AI - Traffic Detection System

An advanced AI-powered traffic detection and analysis platform featuring real-time object detection, comprehensive analytics, and automated email notifications. Built with FastAPI backend and modern Next.js frontend.

## ✨ Features

### Backend (FastAPI + Prisma)
- 🔐 **User Authentication**: JWT-based authentication with secure email validation
- 🤖 **AI Detection**: YOLO11n-based traffic object detection with OpenVINO optimization
- 🎯 **GradCAM Visualization**: Generate attention heatmaps for model interpretability
- 📧 **Email Notifications**: Automated HTML email alerts with embedded images
- 🗄️ **SQLite Database**: Lightweight database with Prisma ORM
- 📊 **Analytics API**: Comprehensive statistics and detection history
- 🔒 **Password Hashing**: Secure bcrypt password encryption

### Frontend (Next.js 14 + React 19)
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📈 **Interactive Dashboard**: Real-time statistics with Recharts visualizations
- 🖼️ **Image Upload**: Drag-and-drop interface with instant preview
- 📜 **History Management**: Browse, search, and filter detection history
- 🌟 **Responsive Design**: Mobile-first design that works on all devices
- 🎭 **Beautiful Animations**: Smooth transitions and gradient effects
- 🔄 **Real-time Updates**: Instant feedback and loading states

## 📋 Prerequisites

### For Both Windows and Linux:
- **Python 3.8+** (3.10 recommended)
- **Node.js 18+** (18.x or 20.x LTS recommended)
- **npm or yarn** (comes with Node.js)
- **Git** (for cloning the repository)

### Email Configuration (Optional but Recommended):
- Gmail account with App Password (for SMTP notifications)
- Or any other SMTP service credentials

---

## 🚀 Installation Guide

### For Linux (Ubuntu/Debian)

#### 1. Install System Dependencies

```bash
# Update package list
sudo apt update

# Install Python and pip
sudo apt install python3 python3-pip python3-venv

# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
python3 --version
node --version
npm --version
```

#### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/Vision-Flow-Traffic-AI.git
cd Vision-Flow-Traffic-AI
```

#### 3. Backend Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r fastapi_requirements.txt

# Generate Prisma client
prisma generate

# Initialize database (creates db.sqlite3)
prisma db push
```

#### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Return to root directory
cd ..
```

#### 5. Environment Configuration

```bash
# Create .env file in root directory
nano .env
```

Add the following configuration:

```env
# OpenRouter API Key (for AI contextual advice)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Optional: JWT Secret Key
SECRET_KEY=your-secret-key-here-change-in-production
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords

#### 6. Run the Application

**Option 1: Using the startup scripts**

```bash
# Terminal 1 - Start Backend (FastAPI)
chmod +x start_fastapi.sh
./start_fastapi.sh

# Terminal 2 - Start Frontend (Next.js)
chmod +x start_frontend.sh
./start_frontend.sh
```

**Option 2: Manual start**

```bash
# Terminal 1 - Backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

### For Windows

#### 1. Install System Dependencies

1. **Install Python:**
   - Download from https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify: Open Command Prompt and type `python --version`

2. **Install Node.js:**
   - Download LTS version from https://nodejs.org/
   - Run the installer (includes npm)
   - Verify: Open Command Prompt and type `node --version` and `npm --version`

3. **Install Git:**
   - Download from https://git-scm.com/download/win
   - Use default settings during installation

#### 2. Clone the Repository

```cmd
git clone https://github.com/yourusername/Vision-Flow-Traffic-AI.git
cd Vision-Flow-Traffic-AI
```

#### 3. Backend Setup

```cmd
REM Create virtual environment
python -m venv venv

REM Activate virtual environment
venv\Scripts\activate

REM Install Python dependencies
pip install -r fastapi_requirements.txt

REM Generate Prisma client
prisma generate

REM Initialize database
prisma db push
```

#### 4. Frontend Setup

```cmd
REM Navigate to frontend directory
cd frontend

REM Install Node.js dependencies
npm install

REM Return to root directory
cd ..
```

#### 5. Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
# OpenRouter API Key (for AI contextual advice)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Optional: JWT Secret Key
SECRET_KEY=your-secret-key-here-change-in-production
```

#### 6. Create Startup Scripts (Optional)

**start_backend.bat:**
```batch
@echo off
echo Starting Vision Flow FastAPI Backend...
call venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**start_frontend.bat:**
```batch
@echo off
echo Starting Vision Flow Frontend...
cd frontend
npm run dev
```

#### 7. Run the Application

**Option 1: Using batch files**

```cmd
REM Terminal 1 - Start Backend
start_backend.bat

REM Terminal 2 - Start Frontend
start_frontend.bat
```

**Option 2: Manual start**

```cmd
REM Terminal 1 - Backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🌐 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative API Docs**: http://localhost:8000/redoc

## 📝 Usage Guide

### 1. Register an Account
- Navigate to http://localhost:3000/register
- Fill in your details (first name, last name, email, password)
- Click "Create Account"

### 2. Login
- Go to http://localhost:3000/login
- Enter your email and password
- Click "Sign In"

### 3. Analyze Traffic Images
- Go to Dashboard → Analyze
- Upload an image (drag & drop or click to select)
- Wait for AI analysis
- View results with heatmap visualization
- Check your email for automated notification

### 4. View Analytics
- Dashboard shows comprehensive statistics
- Timeline charts show detection patterns
- Distribution charts display object types
- View recent analysis history

### 5. Browse History
- Navigate to Dashboard → History
- Search and filter detections
- View detailed analysis for each detection
- Delete unwanted records

## 🏗️ Project Structure

```
Vision-Flow-Traffic-AI/
├── app/                          # FastAPI Backend
│   ├── main.py                   # Application entry point
│   ├── config.py                 # Configuration settings
│   ├── database.py               # Database connection
│   ├── models/                   # Pydantic models
│   ├── routes/                   # API endpoints
│   │   ├── auth_routes.py        # Authentication
│   │   ├── detection_routes.py   # Detection & analysis
│   │   └── user_routes.py        # User management
│   ├── services/                 # Business logic
│   │   ├── auth.py               # JWT token handling
│   │   ├── database.py           # Database operations
│   │   └── email.py              # Email notifications
│   └── utils.py                  # Utility functions
├── frontend/                     # Next.js Frontend
│   ├── app/                      # Next.js 14 App Router
│   │   ├── page.js               # Landing page
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── dashboard/            # Dashboard pages
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── dashboard/            # Dashboard components
│   │   └── profile/              # Profile components
│   └── lib/                      # Utilities & hooks
├── media/                        # Uploaded images & heatmaps
│   └── uploads/
├── yolo11n_openvino_model/       # YOLO model files
├── schema.prisma                 # Database schema
├── db.sqlite3                    # SQLite database
├── .env                          # Environment variables
├── fastapi_requirements.txt      # Python dependencies
└── README.md                     # This file
```

## 🔧 Troubleshooting

### Backend Issues

**Problem: Import errors**
```bash
# Reinstall dependencies
pip install --upgrade -r fastapi_requirements.txt
```

**Problem: Prisma client not found**
```bash
# Regenerate Prisma client
prisma generate
```

**Problem: Database errors**
```bash
# Reset and reinitialize database
prisma db push --force-reset
```

**Problem: Email not sending**
- Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env
- For Gmail: Ensure you're using an App Password, not your regular password
- Check SMTP settings and firewall rules

### Frontend Issues

**Problem: Module not found errors**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem: Port already in use**
```bash
# Use a different port
npm run dev -- -p 3001
```

**Problem: API connection failed**
- Ensure backend is running on port 8000
- Check CORS settings in app/main.py
- Verify API base URL in frontend/lib/api.js

## 📦 Dependencies

### Backend
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Prisma**: Database ORM
- **Ultralytics**: YOLO model implementation
- **OpenVINO**: Model optimization
- **Pillow**: Image processing
- **OpenCV**: Computer vision operations
- **email-validator**: Email validation

### Frontend
- **Next.js 16**: React framework
- **React 19**: UI library
- **shadcn/ui**: Component library
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **Zustand**: State management

## 🔐 Security Notes

1. **Change SECRET_KEY** in .env for production
2. **Use App Passwords** for Gmail SMTP
3. **Never commit .env** file to version control
4. **Use HTTPS** in production
5. **Implement rate limiting** for API endpoints
6. **Regular security updates** for dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- YOLO11n model by Ultralytics
- OpenVINO optimization toolkit
- shadcn/ui component library
- Next.js and FastAPI communities

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@visionflow.ai

---

**Made with ❤️ by Vision Flow Team**
prisma db push

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

The backend will run on http://localhost:8000

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

The frontend will run on http://localhost:3000

### 4. Quick Start Scripts

Use the provided scripts for easy startup:

```bash
# Start backend
./start_server.sh

# Start frontend (in another terminal)
./start_frontend.sh
```

## 📁 Project Structure

```
vision-flow-traffic-ai/
├── api/                          # Django API app
│   ├── views.py                 # API endpoints
│   ├── urls.py                  # URL routing
│   ├── serializers.py           # DRF serializers
│   └── utils.py                 # Helper functions
├── frontend/                     # Next.js frontend
│   ├── app/                     # Next.js 14 App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Login page
│   │   └── register/           # Register page
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── ImageUpload.jsx     # Image upload
│   │   └── Sidebar.jsx         # Navigation
│   └── lib/                     # Utilities & hooks
├── visionflow/                  # Django project settings
├── yolo11n_openvino_model/     # YOLO model files
├── media/                       # Uploaded files
├── schema.prisma               # Prisma schema
└── manage.py                   # Django management
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/visionflow
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### Frontend Environment Variables

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/auth/google` - Google OAuth

### Detection
- `POST /api/analyze` - Analyze traffic image
- `GET /api/history` - Get detection history (with filters)
- `DELETE /api/history/:id` - Delete detection

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile/update` - Update profile

### Statistics
- `GET /api/stats` - Get detection statistics

## 🎨 Frontend Pages

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Analytics dashboard
- `/dashboard/analyze` - Image analysis
- `/dashboard/history` - Detection history
- `/dashboard/profile` - User profile

## 🧪 Testing

### Backend Tests

```bash
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📊 Database Schema

The application uses Prisma with the following models:

- **User**: User accounts with authentication
- **Detection**: Traffic detection records with images and heatmaps

See `schema.prisma` for the complete schema definition.

## 🔐 Security

- JWT token authentication
- Email validation with email-validator
- Password hashing
- CORS configuration
- CSRF protection
- SQL injection prevention (via Prisma)

## 🎯 Technologies Used

### Backend
- Django 6.0+
- Django REST Framework
- Prisma ORM
- PostgreSQL
- YOLO11n (OpenVINO)
- SimpleJWT
- Email Validator

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- shadcn/ui
- Recharts
- Axios
- Lucide Icons

## 📝 Development

### Adding New UI Components

```bash
cd frontend
npx shadcn-ui@latest add [component-name]
```

### Database Changes

```bash
# Update schema.prisma, then:
prisma generate
prisma db push
```

## 🚀 Deployment

### Backend (Django)

1. Set `DEBUG=False` in settings
2. Configure allowed hosts
3. Setup production database
4. Collect static files: `python manage.py collectstatic`
5. Use a production server (Gunicorn, uWSGI)

### Frontend (Next.js)

```bash
cd frontend
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- YOLO for object detection
- shadcn for the beautiful UI components
- Django and Next.js communities

## 📧 Support

For support, email support@visionflow.ai or open an issue in the repository.

---

Made with ❤️ by Vision Flow Team

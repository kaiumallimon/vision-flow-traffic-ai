# Vision Flow Traffic AI - Django Fullstack

A comprehensive Django fullstack application with JWT authentication, Prisma ORM, and advanced AI-powered traffic detection features.

## 🚀 Features Implemented

### Core Features
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Prisma ORM with SQLite** - Modern database management
- ✅ **YOLO Object Detection** - Real-time traffic object detection
- ✅ **AI Advisor** - Contextual safety advice using Gemini AI
- ✅ **GradCAM Heatmaps** - Visual explanation of model predictions

### New Features (For Faculty Demo)
1. ✅ **User Profile Page**
   - View and edit user information
   - Update name and password
   - Display account statistics (join date, total detections)

2. ✅ **Detection Statistics Dashboard**
   - Total detections counter
   - Most common detected objects (bar charts)
   - Detections over time (last 7 days)
   - Visual data representation

3. ✅ **Search & Filter History**
   - Search detections by object name
   - Filter by date range (from/to)
   - Real-time filtering
   - Clear filters button

4. ✅ **Email Notifications**
   - Automatic email sent after each detection
   - Includes detected object and safety advice
   - Configurable SMTP settings

## 📁 Project Structure

```
Vision-Flow-Traffic-AI/
├── venv/                      # Virtual environment
├── visionflow/                # Django project settings
│   ├── settings.py           # Main configuration
│   ├── urls.py               # URL routing
│   └── wsgi.py
├── api/                       # Django app
│   ├── views.py              # API endpoints
│   ├── serializers.py        # Data serialization
│   ├── urls.py               # API routes
│   └── utils.py              # Helper functions
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── DashboardNew.jsx  # Main dashboard with all features
│   │   └── App.jsx
│   └── dist/                 # Production build (served by Django)
├── media/                     # User uploads
│   └── uploads/
├── yolo11n_openvino_model/   # YOLO model files
├── schema.prisma             # Prisma database schema
├── db.sqlite3                # SQLite database
├── manage.py                 # Django management script
└── .env                      # Environment variables
```

## 🛠️ Setup Instructions

### 1. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 2. Configure Environment Variables
Edit `.env` file with your credentials:
```env
OPENROUTER_API_KEY=your_openrouter_api_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
```

### 3. Run Prisma Migrations (if needed)
```bash
prisma generate
prisma db push
```

### 4. Run the Server
```bash
python manage.py runserver
```

The application will be available at: `http://localhost:8000`

## 📱 Using the Application

### 1. **Register/Login**
- Navigate to `/register` to create an account
- Email validation is enabled (no fake emails allowed)
- Google OAuth is supported

### 2. **Detection Tab**
- Upload an image for traffic detection
- View real-time analysis with heatmaps
- Receive safety advice
- Email notification sent automatically

### 3. **Profile Tab**
- View account information
- Update first name, last name
- Change password
- View total detections count

### 4. **Statistics Tab**
- Total detections overview
- Most common detected objects (visual charts)
- Detection timeline (last 7 days)
- Color-coded statistics cards

### 5. **Search & Filter**
- Click filter icon in sidebar
- Search by object name
- Filter by date range
- Clear all filters

## 🔧 Technology Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API development
- **Django Simple JWT** - JWT authentication
- **Prisma** - Database ORM
- **SQLite** - Database
- **Ultralytics YOLO** - Object detection
- **OpenCV** - Image processing
- **Email Validator** - Email verification

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - API requests
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google OAuth** - Social authentication

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/auth/google` - Google OAuth

### Detection
- `POST /api/analyze` - Analyze image
- `GET /api/history?email=user@example.com` - Get detection history
- `GET /api/history?email=user@example.com&search=car&date_from=2026-01-01` - Filtered history
- `DELETE /api/history/{id}` - Delete detection

### Profile
- `GET /api/profile?email=user@example.com` - Get user profile
- `PUT /api/profile/update` - Update profile

### Statistics
- `GET /api/stats?email=user@example.com` - Get detection statistics

## 🎓 Faculty Demo Highlights

This project demonstrates:

1. **Fullstack Development**
   - Django backend with RESTful API
   - React frontend with modern hooks
   - Seamless integration

2. **Database Management**
   - Prisma ORM with relationships
   - Efficient queries with filters
   - Data aggregation for statistics

3. **Authentication & Security**
   - JWT token-based auth
   - Email validation
   - OAuth integration

4. **Advanced Features**
   - Real-time search and filtering
   - Data visualization
   - Email notifications
   - File upload and management

5. **Code Quality**
   - Clean separation of concerns
   - Reusable components
   - Async/await patterns
   - Error handling

6. **AI/ML Integration**
   - YOLO object detection
   - GradCAM explainability
   - Gemini AI for contextual advice

## 🐛 Troubleshooting

### Frontend not loading?
```bash
cd frontend
npm run build
```

### Prisma errors?
```bash
prisma generate
prisma db push
```

### Port already in use?
```bash
python manage.py runserver 8080
```

## 📝 Notes

- The application uses SQLite for simplicity (production should use PostgreSQL)
- Email notifications require valid SMTP credentials
- YOLO model runs on CPU (GPU support available)
- All detections are private to the user's account

## 👨‍💻 Developer

Built by kaiumallimon - January 2026

---

**Perfect for demonstrating fullstack capabilities in a university project!**

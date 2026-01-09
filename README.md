# Vision Flow AI - Traffic Detection System

A comprehensive AI-powered traffic detection and analysis platform with a Django backend and modern Next.js frontend.

## 🚀 Features

### Backend (Django + Prisma)
- **User Authentication**: JWT-based authentication with email validation
- **AI Detection**: YOLO11n-based traffic object detection
- **GradCAM Visualization**: Generate heatmaps for detection explanations
- **Email Notifications**: Automated email alerts for completed analyses
- **RESTful API**: Comprehensive API with DRF
- **Prisma ORM**: Type-safe database operations with PostgreSQL

### Frontend (Next.js 14)
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Interactive Dashboard**: Real-time statistics and charts
- **Image Upload**: Drag-and-drop interface with instant feedback
- **History Management**: Track and manage all detections
- **Responsive Design**: Works seamlessly on all devices
- **Dark Mode Ready**: Beautiful gradient-based design

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vision-flow-traffic-ai.git
cd vision-flow-traffic-ai
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup Prisma
prisma generate
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

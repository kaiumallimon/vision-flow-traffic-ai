# Vision Flow AI - Frontend

A modern, AI-powered traffic detection and analysis platform built with Next.js 14 and shadcn/ui.

## Features

- 🔐 **Authentication**: Secure login and registration with JWT tokens
- 🖼️ **Image Analysis**: Upload traffic images for AI-powered detection
- 📊 **Analytics Dashboard**: View detection statistics and trends
- 📜 **Detection History**: Track and manage all your analyses
- 👤 **Profile Management**: Update your account information
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see main README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create a production build:

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── analyze/      # Image upload & analysis
│   │   ├── history/      # Detection history
│   │   ├── profile/      # User profile
│   │   └── page.js       # Dashboard home
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── layout.js         # Root layout
│   ├── page.js           # Landing page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ImageUpload.jsx   # Image upload component
│   └── Sidebar.jsx       # Dashboard sidebar
├── lib/                   # Utilities
│   ├── api.js            # Axios configuration
│   ├── hooks.js          # Custom React hooks
│   └── utils.js          # Helper functions
└── public/               # Static assets
```

## Pages

### Landing Page (`/`)
- Hero section with feature highlights
- How it works guide
- Call to action sections

### Authentication
- **Login** (`/login`): Email and password authentication
- **Register** (`/register`): Create a new account

### Dashboard (`/dashboard`)
- **Overview**: Analytics dashboard with charts and statistics
- **Analyze** (`/dashboard/analyze`): Upload and analyze traffic images
- **History** (`/dashboard/history`): View and manage detection history
- **Profile** (`/dashboard/profile`): Update account settings

## API Integration

The frontend communicates with the Django backend through REST API endpoints:

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/analyze` - Image analysis
- `GET /api/history` - Get detection history
- `DELETE /api/history/:id` - Delete detection
- `GET /api/profile` - Get user profile
- `PUT /api/profile/update` - Update profile
- `GET /api/stats` - Get detection statistics

## Components

### UI Components (shadcn/ui)
- Alert
- Badge
- Button
- Card
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Select
- Skeleton
- Table
- Tabs

### Custom Components
- **ImageUpload**: Drag-and-drop image upload with preview
- **Sidebar**: Dashboard navigation with user profile

## Hooks

Custom React hooks for API interactions:

- `useAuth()`: Authentication operations (login, register, logout)
- `useDetection()`: Image analysis operations
- `useHistory()`: Detection history management
- `useProfile()`: User profile operations
- `useStats()`: Statistics and analytics

## Styling

The project uses Tailwind CSS with a custom theme:

- Primary color: Blue (#2563eb)
- Slate color palette for neutrals
- Custom CSS variables for theming
- Responsive breakpoints (sm, md, lg, xl)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

# 🎨 Vision Flow AI - Frontend Architecture

## Overview

A modern, responsive Next.js 14 application with shadcn/ui components for AI-powered traffic detection.

## Tech Stack

### Core
- **Next.js 14**: App Router with Server/Client Components
- **React 18**: Modern React with Hooks
- **TypeScript**: Type-safe JavaScript (JSX)

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **Lucide Icons**: Beautiful, consistent icons

### State & Data
- **React Hooks**: Custom hooks for API calls
- **Axios**: HTTP client with interceptors
- **localStorage**: Client-side state persistence

### Charts & Visualization
- **Recharts**: Composable charting library
- **React Hook Form**: Form state management
- **Zod**: Schema validation

## Project Structure

```
frontend/
├── app/                          # Next.js 14 App Router
│   ├── page.js                  # Landing page (/)
│   ├── layout.js                # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── login/                   # Login page
│   │   └── page.js
│   │
│   ├── register/                # Registration page
│   │   └── page.js
│   │
│   └── dashboard/               # Protected routes
│       ├── layout.js            # Dashboard layout with sidebar
│       ├── page.js              # Dashboard home
│       │
│       ├── analyze/             # Image upload & analysis
│       │   └── page.js
│       │
│       ├── history/             # Detection history
│       │   └── page.js
│       │
│       └── profile/             # User profile
│           └── page.js
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── alert.jsx
│   │   ├── badge.jsx
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── form.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── select.jsx
│   │   ├── skeleton.jsx
│   │   ├── spinner.jsx
│   │   ├── table.jsx
│   │   └── tabs.jsx
│   │
│   ├── ImageUpload.jsx          # Image upload with preview
│   └── Sidebar.jsx              # Dashboard navigation
│
├── lib/                          # Utilities & hooks
│   ├── api.js                   # Axios configuration
│   ├── hooks.js                 # Custom React hooks
│   └── utils.js                 # Helper functions
│
├── public/                       # Static assets
│
├── .env.local                    # Environment variables
├── .env.example                  # Example environment
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS config
└── tailwind.config.js            # Tailwind configuration
```

## Pages

### 1. Landing Page (`/`)
**Purpose**: Marketing page for first-time visitors

**Features**:
- Hero section with value proposition
- Feature highlights
- How it works section
- Call-to-action sections
- Responsive navigation

**Components**:
- Button
- Lucide icons

### 2. Authentication Pages

#### Login (`/login`)
**Purpose**: User authentication

**Features**:
- Email/password login
- Show/hide password toggle
- Form validation
- Error handling
- Auto-redirect if already logged in

**Components**:
- Card
- Input
- Button
- Alert

#### Register (`/register`)
**Purpose**: New user registration

**Features**:
- First/last name fields
- Email validation
- Password confirmation
- Success message
- Auto-redirect to login

**Components**:
- Card
- Input
- Button
- Alert

### 3. Dashboard Pages

#### Dashboard Home (`/dashboard`)
**Purpose**: Analytics overview

**Features**:
- Statistics cards (total detections, most common, etc.)
- Line chart - Detections over time (7 days)
- Pie chart - Most common objects
- Quick action CTA

**Components**:
- Card
- Recharts (LineChart, PieChart)
- Skeleton (loading states)

#### Analyze (`/dashboard/analyze`)
**Purpose**: Upload and analyze traffic images

**Features**:
- Drag-and-drop file upload
- Image preview
- Real-time analysis
- Heatmap visualization
- AI recommendations
- Success/error handling

**Components**:
- ImageUpload
- Card
- Button
- Alert

#### History (`/dashboard/history`)
**Purpose**: View all past detections

**Features**:
- Search/filter functionality
- Sortable table
- View details dialog
- Delete confirmation
- Pagination-ready structure

**Components**:
- Table
- Dialog
- Badge
- Button
- Input (search)
- Alert

#### Profile (`/dashboard/profile`)
**Purpose**: User account management

**Features**:
- Edit name
- Change password
- Account statistics
- Logout
- Form validation

**Components**:
- Card
- Input
- Button
- Alert
- DropdownMenu

## Custom Hooks

### `useAuth()`
Authentication operations

```javascript
const { register, login, logout, loading, error } = useAuth();
```

**Methods**:
- `register(firstName, lastName, email, password)` - Create account
- `login(email, password)` - Authenticate user
- `logout()` - Clear session

### `useDetection()`
Image analysis operations

```javascript
const { analyzeImage, loading, error } = useDetection();
```

**Methods**:
- `analyzeImage(file, email)` - Upload and analyze image

### `useHistory()`
Detection history management

```javascript
const { getHistory, deleteItem, loading, error } = useHistory();
```

**Methods**:
- `getHistory(email, search, dateFrom, dateTo)` - Fetch detections
- `deleteItem(itemId)` - Remove detection

### `useProfile()`
User profile operations

```javascript
const { getProfile, updateProfile, loading, error } = useProfile();
```

**Methods**:
- `getProfile(email)` - Get user data
- `updateProfile(email, firstName, lastName, password)` - Update account

### `useStats()`
Analytics and statistics

```javascript
const { getStats, loading, error } = useStats();
```

**Methods**:
- `getStats(email)` - Get detection statistics

## API Integration

### Base Configuration
```javascript
// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
```

### Request Interceptor
- Adds JWT token to all requests
- Reads from localStorage

### Response Interceptor
- Handles 401 (unauthorized)
- Auto-redirects to login
- Clears invalid tokens

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /register | Create account |
| POST | /login | Authenticate |
| POST | /analyze | Analyze image |
| GET | /history | Get detections |
| DELETE | /history/:id | Delete detection |
| GET | /profile | Get profile |
| PUT | /profile/update | Update profile |
| GET | /stats | Get statistics |

## Styling System

### Tailwind Configuration
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#2563eb',  // Blue
      // ... custom colors
    }
  }
}
```

### Color Palette
- **Primary**: Blue (#2563eb) - Actions, links
- **Slate**: Neutrals - Text, backgrounds
- **Red**: Destructive actions
- **Green**: Success states
- **Orange**: Warnings

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Component Library (shadcn/ui)

### Interactive Components
- **Button**: Multiple variants (default, ghost, outline, destructive)
- **Input**: Text input with validation states
- **Select**: Dropdown selection
- **Dialog**: Modal dialogs
- **DropdownMenu**: Context menus

### Display Components
- **Card**: Container with header/content/footer
- **Badge**: Status indicators
- **Alert**: Notifications
- **Table**: Data tables
- **Skeleton**: Loading placeholders

### Form Components
- **Form**: Form wrapper with validation
- **FormField**: Individual form fields
- **Label**: Input labels

## State Management

### Client-Side State
- **useState**: Component state
- **useEffect**: Side effects
- **useRef**: DOM references

### Persistent State
- **localStorage**: User data, JWT tokens
- **Session**: Temporary data

## Performance Optimizations

### Code Splitting
- Automatic route-based splitting by Next.js
- Dynamic imports for heavy components

### Image Optimization
- Next.js Image component
- Lazy loading

### Caching
- API response caching (via Axios)
- Browser caching for static assets

## Security

### Authentication
- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes with middleware

### Input Validation
- Client-side validation
- Server-side validation (backend)
- XSS prevention

### CORS
- Configured in backend
- Credentials included in requests

## Development Workflow

### Local Development
```bash
npm run dev
```
- Hot module replacement
- Fast refresh
- Error overlay

### Building
```bash
npm run build
```
- Production optimization
- Static generation
- Bundle analysis

### Linting
```bash
npm run lint
```
- ESLint configuration
- Code quality checks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Real-time notifications
- [ ] Image comparison
- [ ] Export reports
- [ ] Advanced filtering
- [ ] Batch upload
- [ ] Mobile app
- [ ] Offline support

---

Built with ❤️ using Next.js and shadcn/ui

# 📡 API Documentation - Vision Flow AI

Complete reference for all backend API endpoints used by the frontend.

## Base URL

```
http://localhost:8000/api
```

Production: `https://your-domain.com/api`

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

Token is obtained from `/login` endpoint and stored in localStorage.

---

## Endpoints

### 1. User Registration

Register a new user account.

**Endpoint**: `POST /register`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (201):
```json
{
  "message": "Registration successful"
}
```

**Error Response** (400):
```json
{
  "detail": "Email already registered"
}
```

**Frontend Usage**:
```javascript
const { register } = useAuth();
await register("John", "Doe", "john@example.com", "password123");
```

---

### 2. User Login

Authenticate and obtain JWT tokens.

**Endpoint**: `POST /login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Response** (401):
```json
{
  "detail": "Invalid credentials"
}
```

**Frontend Usage**:
```javascript
const { login } = useAuth();
const response = await login("john@example.com", "password123");
// Store token: localStorage.setItem('token', response.tokens.access);
```

---

### 3. Google OAuth

Authenticate or register using Google OAuth.

**Endpoint**: `POST /auth/google`

**Request Body**:
```json
{
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "google_id": "1234567890"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

### 4. Analyze Image

Upload and analyze a traffic image with AI.

**Endpoint**: `POST /analyze`

**Content-Type**: `multipart/form-data`

**Request Body** (FormData):
- `file`: Image file (JPG, PNG)
- `email`: User email

**Success Response** (200):
```json
{
  "id": 123,
  "detected": "car",
  "advice": "Regular maintenance recommended for optimal vehicle performance.",
  "heatmap_url": "/media/uploads/heatmap_1234567890.jpg",
  "original_url": "/media/uploads/input_1234567890.jpg"
}
```

**Error Response** (400):
```json
{
  "detail": "File and email are required"
}
```

**Error Response** (404):
```json
{
  "detail": "User not found"
}
```

**Frontend Usage**:
```javascript
const { analyzeImage } = useDetection();
const file = e.target.files[0];
const result = await analyzeImage(file, user.email);
```

---

### 5. Get Detection History

Retrieve all detections for a user with optional filtering.

**Endpoint**: `GET /history`

**Query Parameters**:
- `email` (required): User email
- `search` (optional): Search by object name
- `date_from` (optional): Filter from date (ISO format)
- `date_to` (optional): Filter to date (ISO format)

**Example Request**:
```
GET /history?email=john@example.com&search=car&date_from=2024-01-01
```

**Success Response** (200):
```json
[
  {
    "id": 123,
    "object_name": "car",
    "advice": "Regular maintenance recommended...",
    "image_path": "/media/uploads/input_1234567890.jpg",
    "heatmap_path": "/media/uploads/heatmap_1234567890.jpg",
    "created_at": "2024-01-09T10:30:00Z"
  },
  {
    "id": 124,
    "object_name": "truck",
    "advice": "Check tire pressure regularly...",
    "image_path": "/media/uploads/input_1234567891.jpg",
    "heatmap_path": "/media/uploads/heatmap_1234567891.jpg",
    "created_at": "2024-01-09T11:45:00Z"
  }
]
```

**Error Response** (400):
```json
{
  "detail": "Email is required"
}
```

**Frontend Usage**:
```javascript
const { getHistory } = useHistory();
const detections = await getHistory(
  user.email,
  "car",           // search
  "2024-01-01",    // date_from
  "2024-01-31"     // date_to
);
```

---

### 6. Delete Detection

Remove a detection record and associated files.

**Endpoint**: `DELETE /history/:id`

**Path Parameters**:
- `id`: Detection ID

**Example Request**:
```
DELETE /history/123
```

**Success Response** (200):
```json
{
  "message": "Detection deleted successfully"
}
```

**Error Response** (404):
```json
{
  "detail": "Detection not found"
}
```

**Frontend Usage**:
```javascript
const { deleteItem } = useHistory();
await deleteItem(123);
```

---

### 7. Get User Profile

Retrieve user profile information.

**Endpoint**: `GET /profile`

**Query Parameters**:
- `email` (required): User email

**Example Request**:
```
GET /profile?email=john@example.com
```

**Success Response** (200):
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "totalDetections": 15
}
```

**Error Response** (404):
```json
{
  "detail": "User not found"
}
```

**Frontend Usage**:
```javascript
const { getProfile } = useProfile();
const profile = await getProfile(user.email);
```

---

### 8. Update Profile

Update user profile information.

**Endpoint**: `PUT /profile/update`

**Request Body**:
```json
{
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "password": "newpassword123"  // optional
}
```

**Success Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com"
  }
}
```

**Error Response** (404):
```json
{
  "detail": "User not found"
}
```

**Frontend Usage**:
```javascript
const { updateProfile } = useProfile();
await updateProfile(
  user.email,
  "John",
  "Smith",
  "newpassword123"  // optional
);
```

---

### 9. Get Statistics

Get detection statistics and analytics.

**Endpoint**: `GET /stats`

**Query Parameters**:
- `email` (required): User email

**Example Request**:
```
GET /stats?email=john@example.com
```

**Success Response** (200):
```json
{
  "totalDetections": 25,
  "mostCommonObjects": {
    "car": 12,
    "truck": 8,
    "bus": 3,
    "motorcycle": 2
  },
  "detectionsByDate": {
    "2024-01-09": 5,
    "2024-01-08": 3,
    "2024-01-07": 4,
    "2024-01-06": 2,
    "2024-01-05": 6,
    "2024-01-04": 3,
    "2024-01-03": 2
  },
  "recentDetections": 25
}
```

**Error Response** (404):
```json
{
  "detail": "User not found"
}
```

**Frontend Usage**:
```javascript
const { getStats } = useStats();
const stats = await getStats(user.email);
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Common Error Responses

### Invalid Email
```json
{
  "detail": "Invalid or fake email: The domain example.com does not exist"
}
```

### Missing Required Field
```json
{
  "email": ["This field is required."]
}
```

### Authentication Failed
```json
{
  "detail": "Invalid credentials"
}
```

## Request Examples

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Upload Image**:
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@/path/to/image.jpg" \
  -F "email=john@example.com"
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
const register = await api.post('/register', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'password123',
});

// Login
const login = await api.post('/login', {
  email: 'john@example.com',
  password: 'password123',
});

// Analyze image
const formData = new FormData();
formData.append('file', file);
formData.append('email', 'john@example.com');
const analyze = await api.post('/analyze', formData);
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production:
- 100 requests per minute per IP
- 1000 requests per hour per user

## CORS

Configured to allow requests from:
- `http://localhost:3000` (development)
- Your production domain

## Content Types

- **JSON**: `application/json` for most endpoints
- **FormData**: `multipart/form-data` for file uploads

## Best Practices

1. **Always handle errors**: Use try-catch blocks
2. **Store tokens securely**: Use httpOnly cookies in production
3. **Validate on client**: Before sending requests
4. **Show loading states**: During API calls
5. **Implement retry logic**: For failed requests
6. **Cache responses**: Where appropriate
7. **Use TypeScript**: For type safety (optional)

---

For backend implementation details, see `api/views.py` and `api/serializers.py`.

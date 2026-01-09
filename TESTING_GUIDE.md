# 🧪 Quick Testing Guide

## Before You Start
1. Configure `.env` file with your API keys
2. Activate virtual environment: `source venv/bin/activate`
3. Run server: `./start_server.sh` or `python manage.py runserver`

---

## ✅ Test Checklist

### 1. Authentication Tests

#### Register New User
```
URL: http://localhost:8000/register
Steps:
1. Enter first name, last name
2. Enter REAL email (validation enabled)
3. Enter password (min 6 chars)
4. Click "CREATE ACCOUNT"
Expected: Success message, redirect to login
```

#### Login
```
URL: http://localhost:8000/login
Steps:
1. Enter registered email
2. Enter password
3. Click "LOGIN"
Expected: Redirect to dashboard with JWT token stored
```

#### Google OAuth (Optional)
```
Steps:
1. Click "Sign in with Google"
2. Select Google account
Expected: Auto-login and redirect to dashboard
```

---

### 2. Detection Tab Tests

#### Image Upload & Analysis
```
Steps:
1. Click upload icon (bottom bar)
2. Select a traffic image (car, person, etc.)
3. Click "Detect" button
4. Wait for analysis
Expected:
- Shows original image
- Shows AI heatmap
- Displays detected object
- Shows safety advice
- Email notification sent
- Detection added to history sidebar
```

#### View History Item
```
Steps:
1. Click any detection in sidebar history
2. View results
Expected: Loads detection with images and advice
```

#### Delete Detection
```
Steps:
1. Hover over history item
2. Click trash icon
3. Confirm deletion
Expected: Detection removed from history and files deleted
```

---

### 3. Profile Tab Tests

#### View Profile
```
Steps:
1. Click "Profile" button in sidebar
2. View information
Expected:
- Shows first name, last name
- Shows email (disabled)
- Shows member since date
- Shows total detections count
```

#### Update Profile
```
Steps:
1. Change first name
2. Change last name
3. (Optional) Enter new password
4. Click "Update Profile"
Expected:
- Success message
- Data updated in database
- User info refreshed
```

---

### 4. Statistics Tab Tests

#### View Statistics
```
Steps:
1. Click "Statistics" button in sidebar
2. Review data
Expected:
- Total detections card (blue)
- Unique objects card (purple)
- This week card (green)
- Most detected objects with bars
- Detection timeline (7 days) with bars
```

#### Verify Calculations
```
Test:
1. Upload a new image
2. Go to stats tab
3. Refresh to see updated numbers
Expected: All counters update correctly
```

---

### 5. Search & Filter Tests

#### Search by Object Name
```
Steps:
1. Click filter icon in sidebar
2. Enter object name (e.g., "car")
3. Watch history filter in real-time
Expected: Only matching detections shown
```

#### Filter by Date Range
```
Steps:
1. Open filters
2. Select "From" date
3. Select "To" date
4. View filtered results
Expected: Only detections in range shown
```

#### Combined Search & Filter
```
Steps:
1. Enter search term
2. Select date range
3. View results
Expected: Both filters applied (AND logic)
```

#### Clear Filters
```
Steps:
1. Apply some filters
2. Click "Clear Filters"
Expected: All filters reset, full history shown
```

---

### 6. Email Notification Test

#### Verify Email Sending
```
Steps:
1. Configure .env with real email settings:
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_app_password
2. Upload and analyze an image
3. Check your email inbox
Expected:
- Email received with subject "Detection Complete: {object}"
- Email contains detected object and advice
```

#### Test Without Email (Fail-safe)
```
Steps:
1. Use invalid email settings
2. Upload and analyze image
Expected:
- Detection still works
- No error shown to user
- Email failure logged in console
```

---

## 🔍 Backend API Tests (Optional)

### Test with curl or Postman

#### Register
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"123456"}'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

#### Get Profile
```bash
curl http://localhost:8000/api/profile?email=john@example.com
```

#### Get Stats
```bash
curl http://localhost:8000/api/stats?email=john@example.com
```

#### Get History with Filters
```bash
curl "http://localhost:8000/api/history?email=john@example.com&search=car&date_from=2026-01-01"
```

---

## 🐛 Common Issues & Solutions

### Issue: Frontend not loading
**Solution:**
```bash
cd frontend
npm run build
```

### Issue: Prisma errors
**Solution:**
```bash
prisma generate
prisma db push
```

### Issue: Email not sending
**Solutions:**
1. Check .env configuration
2. For Gmail, use "App Password" not regular password
3. Enable "Less secure app access" in Gmail settings
4. Check console for error messages

### Issue: YOLO model not found
**Solution:**
- Ensure `yolo11n_openvino_model/` folder exists
- Contains: yolo11n.xml and metadata.yaml

### Issue: Import errors
**Solution:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Database errors
**Solution:**
```bash
rm db.sqlite3
prisma db push
```

---

## 📊 Expected Test Results

After complete testing, you should have:
- ✅ At least 3 registered users
- ✅ Multiple detections in history
- ✅ Updated user profiles
- ✅ Statistics showing data
- ✅ Filtered search results
- ✅ Email notifications received
- ✅ No console errors

---

## 🎯 Demo Workflow for Faculty

**Recommended demonstration flow:**

1. **Start with Registration** (1 min)
   - Show email validation
   - Create account

2. **Show Detection** (2 min)
   - Upload traffic image
   - Show real-time analysis
   - Point out heatmap (AI explainability)
   - Show email notification

3. **Demonstrate Search** (1 min)
   - Add 2-3 more detections
   - Use search to filter
   - Show date filtering

4. **Show Statistics** (2 min)
   - Navigate to stats tab
   - Explain data aggregation
   - Show visual charts

5. **Profile Management** (1 min)
   - Update user info
   - Explain JWT security

6. **Code Walkthrough** (3 min)
   - Show Django structure
   - Explain Prisma ORM
   - Point out JWT implementation
   - Show async operations

**Total: ~10 minutes**

---

## ✅ All Systems Go!

Your application is fully functional and ready for demonstration. All features have been implemented and tested.

**Good luck! 🚀**

# Announcements Setup Guide

## Issue: Database announcements not showing in frontend

The frontend has been updated to fetch real data from the API instead of using hardcoded mock data. Here's what you need to do to get it working:

## Steps to Fix

### 1. Start the Backend Server
```bash
cd BACKEND
npm start
# or
node index.js
```

The server should start on port 3000 and you should see:
```
✅ Server running on port 3000
✅ Socket.IO server initialized
✅ Environment: development
✅ Health check available at: http://localhost:3000/health
```

### 2. Seed the Database with Sample Announcements
```bash
cd BACKEND
node seed-announcements.js
```

This will create 10 sample announcements in the database.

### 3. Start the Frontend
```bash
cd FRONTEND
npm run dev
```

The frontend should start on port 5173.

### 4. Login as a User
- Go to http://localhost:5173/login
- Login with any user account (student, lecturer, or admin)
- Navigate to the Announcements page

### 5. Check the Console
Open the browser developer tools (F12) and check the console for:
- Authentication token
- API request details
- Any error messages

## What Was Fixed

1. **Created Announcement Service**: `FRONTEND/src/services/announcementService.ts`
   - Handles all API calls to the backend
   - Includes proper TypeScript interfaces
   - Uses correct API base URL (port 3000)

2. **Updated Announcements Page**: `FRONTEND/src/pages/Announcements.tsx`
   - Removed hardcoded mock data
   - Added real API integration
   - Added loading states and error handling
   - Added debugging console logs
   - Added refresh functionality

3. **Features Added**:
   - Real-time data fetching from database
   - Search and filtering by category/priority
   - Mark as read functionality
   - Proper error handling and loading states
   - Responsive design with proper UI feedback

## API Endpoints Used

- `GET /api/announcements` - Get all announcements
- `POST /api/announcements/:id/read` - Mark announcement as read
- `GET /api/announcements/pinned` - Get pinned announcements

## Troubleshooting

### If you see "No announcements found":
1. Check if the backend server is running
2. Check if you're logged in (check console for auth token)
3. Run the seed script to add sample data
4. Check the browser console for error messages

### If you see network errors:
1. Verify the backend is running on port 3000
2. Check CORS configuration
3. Verify the API endpoints are working

### If authentication fails:
1. Make sure you're logged in
2. Check if the JWT token is valid
3. Try logging out and logging back in

## Sample Data

The seed script creates 10 announcements including:
- Welcome message
- Library maintenance notice
- Academic calendar updates
- Student council elections
- Emergency contact information
- Faculty meeting reminders
- And more...

## Next Steps

Once the basic functionality is working, you can:
1. Add the "Create Announcement" form for lecturers/admins
2. Add pagination for large datasets
3. Add real-time updates via WebSocket
4. Add file attachment support
5. Add announcement templates

## Testing

You can test the API directly using the test script:
```bash
cd BACKEND
node test-announcements.js
```

This will test all announcement endpoints and verify they're working correctly.
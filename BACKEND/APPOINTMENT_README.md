# Appointment System Backend

This document provides comprehensive documentation for the appointment system backend API, which allows students to book appointments with academic staff and enables staff to manage their appointments.

## Overview

The appointment system provides the following key features:
- **Student Features**: Book appointments with lecturers, view appointment history, cancel appointments
- **Staff Features**: View incoming appointments, confirm/cancel appointments, mark appointments as completed
- **Admin Features**: View all appointments, manage the system
- **Conflict Detection**: Prevents double-booking and time conflicts
- **Role-based Access Control**: Different permissions for students, lecturers, and admins

## Database Schema

### Appointment Model

```javascript
{
  student: ObjectId,           // Reference to User (student)
  staff: ObjectId,            // Reference to User (lecturer)
  date: Date,                 // Appointment date
  startTime: String,          // Start time (HH:MM AM/PM format)
  endTime: String,            // End time (HH:MM AM/PM format)
  location: String,           // Meeting location
  purpose: String,            // Appointment purpose (enum)
  status: String,             // Appointment status (enum)
  description: String,        // Optional description
  notes: String,              // Staff notes
  cancelledBy: ObjectId,      // Who cancelled the appointment
  cancelledAt: Date,          // When it was cancelled
  cancellationReason: String, // Reason for cancellation
  reminderSent: Boolean,      // Whether reminder was sent
  reminderSentAt: Date,       // When reminder was sent
  createdAt: Date,            // Auto-generated
  updatedAt: Date             // Auto-generated
}
```

### Enums

**Purpose Types:**
- `office_hours` - Regular office hours
- `project_review` - Project review meeting
- `consultation` - General consultation
- `thesis_meeting` - Thesis/dissertation meeting
- `academic_advising` - Academic advising
- `other` - Other purposes

**Status Types:**
- `pending` - Awaiting staff confirmation
- `confirmed` - Confirmed by staff
- `cancelled` - Cancelled by either party
- `completed` - Appointment completed
- `no_show` - Student didn't show up

## API Endpoints

### Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### 1. Create Appointment
**POST** `/api/appointments`

Creates a new appointment request.

**Request Body:**
```json
{
  "staffId": "lecturer_user_id",
  "date": "2024-10-28",
  "startTime": "9:00 AM",
  "endTime": "10:00 AM",
  "location": "Room 301",
  "purpose": "office_hours",
  "description": "Need help with assignment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "_id": "appointment_id",
      "student": { "firstName": "John", "lastName": "Doe" },
      "staff": { "firstName": "Dr. Sarah", "lastName": "Wilson" },
      "date": "2024-10-28T00:00:00.000Z",
      "startTime": "9:00 AM",
      "endTime": "10:00 AM",
      "location": "Room 301",
      "purpose": "office_hours",
      "status": "pending",
      "formattedDate": "October 28, 2024",
      "timeRange": "9:00 AM - 10:00 AM"
    }
  }
}
```

### 2. Get Appointments by Role
**GET** `/api/appointments/:role`

Gets appointments based on user role (student, lecturer, admin).

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "appointments": [
      {
        "_id": "appointment_id",
        "student": { "firstName": "John", "lastName": "Doe" },
        "staff": { "firstName": "Dr. Sarah", "lastName": "Wilson" },
        "date": "2024-10-28T00:00:00.000Z",
        "startTime": "9:00 AM",
        "endTime": "10:00 AM",
        "location": "Room 301",
        "purpose": "office_hours",
        "status": "confirmed",
        "formattedDate": "October 28, 2024",
        "timeRange": "9:00 AM - 10:00 AM"
      }
    ]
  }
}
```

### 3. Get Single Appointment
**GET** `/api/appointments/ticket/:id`

Gets details of a specific appointment.

**Response:**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "_id": "appointment_id",
      "student": { "firstName": "John", "lastName": "Doe", "email": "john@example.com" },
      "staff": { "firstName": "Dr. Sarah", "lastName": "Wilson", "department": "Computer Science" },
      "date": "2024-10-28T00:00:00.000Z",
      "startTime": "9:00 AM",
      "endTime": "10:00 AM",
      "location": "Room 301",
      "purpose": "office_hours",
      "status": "confirmed",
      "description": "Need help with assignment",
      "notes": "Bring your laptop",
      "formattedDate": "October 28, 2024",
      "timeRange": "9:00 AM - 10:00 AM"
    }
  }
}
```

### 4. Update Appointment
**PUT** `/api/appointments/:id`

Updates an existing appointment.

**Request Body:**
```json
{
  "date": "2024-10-29",
  "startTime": "10:00 AM",
  "endTime": "11:00 AM",
  "location": "Room 205",
  "notes": "Updated notes"
}
```

### 5. Cancel Appointment
**POST** `/api/appointments/:id/cancel`

Cancels an appointment.

**Request Body:**
```json
{
  "reason": "Emergency came up"
}
```

### 6. Confirm Appointment (Staff Only)
**POST** `/api/appointments/:id/confirm`

Confirms a pending appointment.

### 7. Complete Appointment (Staff Only)
**POST** `/api/appointments/:id/complete`

Marks an appointment as completed.

### 8. Get Available Staff
**GET** `/api/appointments/staff`

Gets list of available lecturers for booking.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "staff": [
      {
        "_id": "staff_id",
        "firstName": "Dr. Sarah",
        "lastName": "Wilson",
        "email": "sarah.wilson@university.edu",
        "department": "Computer Science"
      }
    ]
  }
}
```

### 9. Get Appointment Statistics
**GET** `/api/appointments/stats/:role`

Gets appointment statistics for the user's role.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 2,
    "confirmed": 5,
    "completed": 2,
    "cancelled": 1,
    "breakdown": [
      { "_id": "pending", "count": 2 },
      { "_id": "confirmed", "count": 5 },
      { "_id": "completed", "count": 2 },
      { "_id": "cancelled", "count": 1 }
    ]
  }
}
```

### 10. Get Staff Availability
**GET** `/api/appointments/availability/:staffId/:date`

Gets available time slots for a specific staff member on a specific date.

**Response:**
```json
{
  "success": true,
  "data": {
    "staff": {
      "id": "staff_id",
      "name": "Dr. Sarah Wilson",
      "department": "Computer Science"
    },
    "date": "2024-10-28",
    "appointments": [
      {
        "startTime": "2:00 PM",
        "endTime": "3:00 PM",
        "status": "confirmed"
      }
    ],
    "availableSlots": [
      {
        "startTime": "9:00 AM",
        "endTime": "10:00 AM",
        "available": true
      },
      {
        "startTime": "10:00 AM",
        "endTime": "11:00 AM",
        "available": true
      }
    ]
  }
}
```

## Role-Based Access Control

### Student Permissions
- Create appointments with lecturers
- View their own appointments
- Update their own appointments
- Cancel their own appointments
- View available staff

### Lecturer Permissions
- View appointments assigned to them
- Confirm pending appointments
- Cancel appointments they're involved in
- Mark appointments as completed
- Add notes to appointments
- View appointment statistics

### Admin Permissions
- View all appointments
- Update any appointment
- Cancel any appointment
- View all statistics
- Manage the entire system

## Validation Rules

### Time Format
- Times must be in 12-hour format: `HH:MM AM/PM`
- Examples: `9:00 AM`, `2:30 PM`, `12:00 PM`

### Date Validation
- Appointment dates cannot be in the past
- End time must be after start time

### Conflict Detection
- System prevents double-booking of staff members
- Checks for overlapping time slots on the same date
- Excludes cancelled and completed appointments from conflict checks

### Business Hours
- Default business hours: 9:00 AM to 5:00 PM
- Available time slots are generated in 1-hour intervals

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (appointment doesn't exist)
- `409` - Conflict (time slot conflict)
- `500` - Internal Server Error

## Testing

### Sample Test Data

You can test the API with these sample appointments:

```javascript
// Sample appointment creation
const appointmentData = {
  staffId: "lecturer_user_id",
  date: "2024-10-28",
  startTime: "9:00 AM",
  endTime: "10:00 AM",
  location: "Room 301",
  purpose: "office_hours",
  description: "Need help with assignment"
};

// Sample appointment update
const updateData = {
  notes: "Please bring your laptop and assignment files"
};

// Sample cancellation
const cancelData = {
  reason: "Emergency came up, need to reschedule"
};
```

### Testing Tools
- Use Postman or similar API testing tools
- Test with different user roles (student, lecturer, admin)
- Verify conflict detection by creating overlapping appointments
- Test all CRUD operations

## Integration with Frontend

The appointment system integrates seamlessly with the frontend by:

1. **Real-time Updates**: Socket.IO can be extended for real-time appointment notifications
2. **Role-based UI**: Frontend can show different interfaces based on user role
3. **Conflict Prevention**: Frontend can pre-validate time slots before submission
4. **Status Management**: Frontend can show appropriate actions based on appointment status

## Future Enhancements

Potential improvements for the appointment system:

1. **Email Notifications**: Send confirmation and reminder emails
2. **Calendar Integration**: Sync with Google Calendar, Outlook, etc.
3. **Recurring Appointments**: Support for weekly/monthly recurring meetings
4. **Video Conferencing**: Integration with Zoom, Teams, etc.
5. **Waitlist System**: Allow students to join waitlists for full time slots
6. **Analytics Dashboard**: Advanced reporting and analytics
7. **Mobile App**: Native mobile application support

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control on all operations
3. **Input Validation**: Comprehensive validation of all inputs
4. **SQL Injection**: Protected through Mongoose ODM
5. **Rate Limiting**: Consider implementing rate limiting for appointment creation
6. **Data Privacy**: Ensure student data is properly protected

## Deployment

The appointment system is ready for deployment and includes:

1. **Environment Variables**: Configurable through .env file
2. **Database Connection**: MongoDB with connection pooling
3. **Error Handling**: Comprehensive error handling and logging
4. **Health Checks**: Built-in health check endpoint
5. **CORS Support**: Configured for frontend integration

## Support

For questions or issues with the appointment system:

1. Check the API documentation above
2. Review the error messages for specific issues
3. Test with the provided sample data
4. Check the server logs for detailed error information
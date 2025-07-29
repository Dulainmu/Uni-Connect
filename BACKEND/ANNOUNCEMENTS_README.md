# Announcements API Documentation

## Overview

The Announcements API provides a comprehensive system for managing announcements in the Campus Connect platform. It supports creating, reading, updating, and deleting announcements with role-based access control, categorization, priority levels, and read tracking.

## Features

- **Role-based Access Control**: Different permissions for students, lecturers, and admins
- **Categorization**: Organize announcements by type (general, academic, event, emergency, maintenance)
- **Priority Levels**: Set importance (low, medium, high, urgent)
- **Target Audience**: Control who can see specific announcements
- **Read Tracking**: Track which users have read each announcement
- **Pinning**: Pin important announcements to the top
- **Expiration**: Set automatic expiration dates for announcements
- **Attachments**: Support for file attachments
- **Search & Filtering**: Advanced filtering and search capabilities
- **Pagination**: Efficient pagination for large datasets

## API Endpoints

### Authentication Required
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### 1. Create Announcement
**POST** `/api/announcements`

**Access**: Lecturer, Admin

**Request Body**:
```json
{
  "title": "Important Update",
  "content": "This is the announcement content...",
  "category": "general",
  "priority": "medium",
  "targetAudience": ["student", "lecturer"],
  "isPinned": false,
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "https://example.com/document.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000
    }
  ],
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "announcement_id",
    "title": "Important Update",
    "content": "This is the announcement content...",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "lecturer"
    },
    "category": "general",
    "priority": "medium",
    "targetAudience": ["student", "lecturer"],
    "isPinned": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Announcements
**GET** `/api/announcements`

**Access**: All authenticated users

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `priority` (string): Filter by priority
- `isPinned` (boolean): Filter by pinned status
- `search` (string): Search in title and content
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order - 'asc' or 'desc' (default: desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "announcement_id",
      "title": "Important Update",
      "content": "This is the announcement content...",
      "author": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "lecturer"
      },
      "category": "general",
      "priority": "medium",
      "isPinned": false,
      "isReadByCurrentUser": false,
      "readCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 3. Get Single Announcement
**GET** `/api/announcements/:id`

**Access**: All authenticated users (with target audience restrictions)

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "announcement_id",
    "title": "Important Update",
    "content": "This is the announcement content...",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "lecturer"
    },
    "category": "general",
    "priority": "medium",
    "targetAudience": ["student", "lecturer"],
    "isPinned": false,
    "attachments": [],
    "readBy": [
      {
        "user": {
          "_id": "user_id",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com",
          "role": "student"
        },
        "readAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "readCount": 1,
    "isReadByCurrentUser": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Announcement
**PUT** `/api/announcements/:id`

**Access**: Author or Admin

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "category": "academic",
  "priority": "high",
  "targetAudience": ["student"],
  "isPinned": true,
  "isActive": true
}
```

### 5. Delete Announcement
**DELETE** `/api/announcements/:id`

**Access**: Author or Admin

**Response**:
```json
{
  "success": true,
  "message": "Announcement deleted successfully"
}
```

### 6. Mark as Read
**POST** `/api/announcements/:id/read`

**Access**: All authenticated users

**Response**:
```json
{
  "success": true,
  "message": "Announcement marked as read"
}
```

### 7. Get Pinned Announcements
**GET** `/api/announcements/pinned`

**Access**: All authenticated users

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "announcement_id",
      "title": "Pinned Announcement",
      "content": "This is a pinned announcement...",
      "author": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "lecturer"
      },
      "isPinned": true,
      "isReadByCurrentUser": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 8. Get Statistics (Admin Only)
**GET** `/api/announcements/stats`

**Access**: Admin only

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "active": 85,
    "pinned": 5,
    "expired": 15,
    "categories": [
      { "_id": "general", "count": 30 },
      { "_id": "academic", "count": 25 },
      { "_id": "event", "count": 20 }
    ],
    "priorities": [
      { "_id": "low", "count": 20 },
      { "_id": "medium", "count": 50 },
      { "_id": "high", "count": 25 },
      { "_id": "urgent", "count": 5 }
    ]
  }
}
```

## Data Models

### Announcement Schema
```javascript
{
  title: String (required, max 200 chars),
  content: String (required, max 2000 chars),
  author: ObjectId (ref: User, required),
  category: String (enum: general, academic, event, emergency, maintenance),
  priority: String (enum: low, medium, high, urgent),
  targetAudience: [String] (enum: student, lecturer, admin),
  isActive: Boolean (default: true),
  isPinned: Boolean (default: false),
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  readBy: [{
    user: ObjectId (ref: User),
    readAt: Date
  }],
  expiresAt: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": ["Title is required", "Content cannot exceed 2000 characters"]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "You are not logged in. Please log in to get access."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Announcement not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Error creating announcement",
  "error": "Database connection error"
}
```

## Testing

Run the test suite to verify the API functionality:

```bash
cd BACKEND
node test-announcements.js
```

The test suite will:
1. Test authentication
2. Create a test announcement
3. Retrieve announcements
4. Update an announcement
5. Mark as read
6. Get pinned announcements
7. Delete the test announcement

## Security Features

- **JWT Authentication**: All endpoints require valid authentication
- **Role-based Authorization**: Different access levels for different user roles
- **Target Audience Filtering**: Users only see announcements intended for their role
- **Author-only Updates**: Only the author or admin can modify announcements
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Protection against abuse (inherited from auth middleware)

## Performance Optimizations

- **Database Indexes**: Optimized queries with strategic indexing
- **Pagination**: Efficient handling of large datasets
- **Population**: Selective field population to minimize data transfer
- **Caching**: Virtual fields for computed properties
- **Query Optimization**: Efficient filtering and sorting

## Integration Notes

- The API follows RESTful conventions
- All responses include a `success` boolean flag
- Error responses include descriptive messages
- Pagination metadata is included in list responses
- File attachments are handled via URLs (file upload should be implemented separately)
- Real-time notifications can be added via Socket.IO integration

## Future Enhancements

- **Real-time Notifications**: Socket.IO integration for live updates
- **File Upload**: Direct file upload support
- **Rich Text Content**: HTML/markdown support for content
- **Announcement Templates**: Predefined templates for common announcements
- **Bulk Operations**: Mass create/update/delete operations
- **Analytics**: Detailed read analytics and engagement metrics
- **Scheduling**: Future-dated announcements
- **Email Notifications**: Email alerts for important announcements
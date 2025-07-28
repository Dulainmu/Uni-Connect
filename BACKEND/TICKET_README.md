# Campus Connect Ticketing System

This document describes the comprehensive ticketing system backend implementation for the Campus Connect application.

## Features

- **Role-based ticket management** (Students, Lecturers, Admins)
- **Ticket creation and submission** with categories and priorities
- **Ticket assignment** to lecturers
- **Status tracking** (Open, In Progress, Resolved, Closed)
- **Comment system** for ticket communication
- **File attachment support** (framework ready)
- **Automatic ticket numbering** (TK000001 format)
- **Real-time updates** and notifications
- **Statistics and reporting**

## Architecture

### Models

#### Ticket Model (`src/models/Ticket.js`)
- Stores ticket information with full metadata
- Supports categories: technical, academic, administrative, financial, other
- Tracks status, priority, assignment, and timestamps
- Includes comment system and file attachments
- Automatic ticket number generation

### API Endpoints

#### Authentication Required
All ticket endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### POST `/api/tickets`
Create a new ticket.

**Request Body:**
```json
{
  "title": "Login Issues with Student Portal",
  "description": "I'm unable to access the student portal with my credentials.",
  "category": "technical",
  "priority": "high",
  "department": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "ticket": {
      "_id": "ticket_id",
      "title": "Login Issues with Student Portal",
      "description": "I'm unable to access the student portal with my credentials.",
      "category": "technical",
      "priority": "high",
      "status": "open",
      "ticketNumber": "TK000001",
      "submittedBy": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@university.edu",
        "role": "student"
      },
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T10:30:00Z"
    }
  }
}
```

#### GET `/api/tickets/:role`
Get tickets based on user role (student, lecturer, admin).

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "tickets": [
      {
        "_id": "ticket_id",
        "title": "Login Issues with Student Portal",
        "category": "technical",
        "status": "open",
        "priority": "high",
        "ticketNumber": "TK000001",
        "submittedBy": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@university.edu",
          "role": "student"
        },
        "assignedTo": {
          "_id": "lecturer_id",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@university.edu",
          "role": "lecturer"
        },
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-20T10:30:00Z"
      }
    ]
  }
}
```

#### GET `/api/tickets/ticket/:id`
Get a single ticket by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "_id": "ticket_id",
      "title": "Login Issues with Student Portal",
      "description": "I'm unable to access the student portal with my credentials.",
      "category": "technical",
      "priority": "high",
      "status": "open",
      "ticketNumber": "TK000001",
      "submittedBy": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@university.edu",
        "role": "student"
      },
      "assignedTo": {
        "_id": "lecturer_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@university.edu",
        "role": "lecturer"
      },
      "comments": [
        {
          "_id": "comment_id",
          "user": {
            "_id": "lecturer_id",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane.smith@university.edu",
            "role": "lecturer"
          },
          "content": "I'll look into this issue for you.",
          "createdAt": "2024-01-20T11:00:00Z"
        }
      ],
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T11:00:00Z"
    }
  }
}
```

#### PUT `/api/tickets/:id`
Update ticket status, assignment, or priority (Lecturers, Admins only).

**Request Body:**
```json
{
  "status": "in_progress",
  "assignedTo": "lecturer_id",
  "priority": "high",
  "comments": "Working on resolving this issue."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "ticket": {
      "_id": "ticket_id",
      "status": "in_progress",
      "assignedTo": "lecturer_id",
      "priority": "high",
      "updatedAt": "2024-01-20T11:30:00Z"
    }
  }
}
```

#### POST `/api/tickets/:id/comments`
Add a comment to a ticket.

**Request Body:**
```json
{
  "content": "I've identified the issue and will fix it by tomorrow."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "ticket": {
      "_id": "ticket_id",
      "comments": [
        {
          "_id": "comment_id",
          "user": {
            "_id": "lecturer_id",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane.smith@university.edu",
            "role": "lecturer"
          },
          "content": "I've identified the issue and will fix it by tomorrow.",
          "createdAt": "2024-01-20T12:00:00Z"
        }
      ]
    }
  }
}
```

#### GET `/api/tickets/lecturers`
Get available lecturers for ticket assignment.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "lecturers": [
      {
        "_id": "lecturer_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@university.edu",
        "department": "Computer Science"
      }
    ]
  }
}
```

#### GET `/api/tickets/stats/:role`
Get ticket statistics by role.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "open": 3,
    "inProgress": 5,
    "resolved": 2,
    "breakdown": [
      {
        "_id": "open",
        "count": 3
      },
      {
        "_id": "in_progress",
        "count": 5
      },
      {
        "_id": "resolved",
        "count": 2
      }
    ]
  }
}
```

## Role-Based Access Control

### Students
- Can create tickets
- Can view their own tickets
- Can add comments to their tickets
- Cannot update ticket status or assignment

### Lecturers
- Can view tickets assigned to them
- Can view academic tickets (even if not assigned)
- Can update ticket status and priority
- Can assign tickets to themselves
- Can add comments to tickets they can access

### Admins
- Can view all tickets
- Can update any ticket
- Can assign tickets to any lecturer
- Can manage ticket categories and priorities
- Full system access

## Database Schema

### Ticket Collection
```javascript
{
  title: String (required, max 200 chars),
  description: String (required, max 2000 chars),
  category: String (enum: technical, academic, administrative, financial, other),
  priority: String (enum: low, medium, high, urgent, default: medium),
  status: String (enum: open, in_progress, resolved, closed, default: open),
  submittedBy: ObjectId (ref: User, required),
  assignedTo: ObjectId (ref: User, optional),
  department: String (required for academic tickets),
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{
    user: ObjectId (ref: User, required),
    content: String (required, max 1000 chars),
    createdAt: Date
  }],
  resolvedAt: Date (set when status = resolved),
  closedAt: Date (set when status = closed),
  ticketNumber: String (unique, auto-generated),
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration

The frontend integrates with the ticketing system through the `ticketService` which provides:

- **TypeScript interfaces** for all data structures
- **Error handling** and loading states
- **Authentication** integration
- **Real-time updates** (framework ready)

### Key Components
- `Tickets.tsx` - Main ticket management page
- `ticketService.ts` - API service layer
- Role-based UI rendering
- Form validation and submission
- Loading and error states

## Environment Variables

Ensure these are set in your `.env` file:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/campus-connect

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
```

## Testing

Test the ticketing system endpoints:

```bash
# Create a ticket
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test ticket",
    "category": "technical",
    "priority": "medium"
  }'

# Get tickets by role
curl -X GET http://localhost:5000/api/tickets/student \
  -H "Authorization: Bearer <token>"

# Update ticket
curl -X PUT http://localhost:5000/api/tickets/<ticket_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "comments": "Working on this issue"
  }'
```

## Future Enhancements

- **Real-time notifications** using Socket.IO
- **File upload** functionality
- **Email notifications** for ticket updates
- **Advanced filtering** and search
- **Ticket templates** for common issues
- **Reporting dashboard** with analytics
- **Mobile app** integration 
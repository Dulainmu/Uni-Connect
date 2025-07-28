# Campus Connect Authentication System

## Overview

This authentication system provides JWT-based authentication with role-based access control for the Campus Connect application. It supports three user roles: **student**, **lecturer**, and **admin**.

## Features

### 🔐 Authentication Features
- **JWT-based authentication** with secure token generation
- **Password hashing** using bcrypt with salt rounds of 12
- **Password reset functionality** with secure token generation
- **Account deactivation** support
- **Last login tracking**
- **Email verification** (framework ready)

### 🛡️ Security Features
- **Rate limiting** on authentication endpoints (5 requests per 15 minutes)
- **Password change detection** - invalidates old tokens
- **Account status validation** - checks if account is active
- **Token expiration** handling
- **Input validation** and sanitization

### 👥 Role-Based Access Control
- **Student**: Basic access to student-specific features
- **Lecturer**: Access to teaching and administrative features
- **Admin**: Full system access and user management

## API Endpoints

### Public Routes (No Authentication Required)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "securepassword123",
  "role": "student",
  "studentId": "STU123456",
  "department": "Computer Science"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "securepassword123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@university.edu"
}
```

#### Reset Password
```http
PUT /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Protected Routes (Authentication Required)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /api/auth/update-profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "department": "Computer Science"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

### Admin Routes (Admin Role Required)

#### Get All Users
```http
GET /api/auth/users
Authorization: Bearer <jwt_token>
```

#### Update User
```http
PUT /api/auth/users/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@university.edu",
  "role": "lecturer",
  "isActive": true,
  "department": "Mathematics"
}
```

## Test Routes

The system includes test routes to verify role-based access control:

### Protected Route (All Authenticated Users)
```http
GET /api/test/protected
Authorization: Bearer <jwt_token>
```

### Student Only Route
```http
GET /api/test/student-only
Authorization: Bearer <jwt_token>
```

### Lecturer Only Route
```http
GET /api/test/lecturer-only
Authorization: Bearer <jwt_token>
```

### Admin Only Route
```http
GET /api/test/admin-only
Authorization: Bearer <jwt_token>
```

### Staff Route (Lecturers + Admins)
```http
GET /api/test/staff-only
Authorization: Bearer <jwt_token>
```

## User Model Schema

```javascript
{
  firstName: String (required, max 50 chars),
  lastName: String (required, max 50 chars),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'student', 'lecturer', 'admin'),
  studentId: String (unique, required for students),
  department: String (required for lecturers),
  isActive: Boolean (default: true),
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Create a `.env` file in the BACKEND directory:

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

## Middleware Usage

### Protecting Routes
```javascript
const { protect } = require('../middleware/auth');

// Protect a single route
router.get('/protected', protect, (req, res) => {
  // req.user contains the authenticated user
});

// Protect all routes in a router
router.use(protect);
```

### Role-Based Authorization
```javascript
const { authorizeStudent, authorizeLecturer, authorizeAdmin } = require('../middleware/auth');

// Student only route
router.get('/student-data', protect, authorizeStudent, (req, res) => {});

// Lecturer only route
router.get('/lecturer-data', protect, authorizeLecturer, (req, res) => {});

// Admin only route
router.get('/admin-data', protect, authorizeAdmin, (req, res) => {});

// Multiple roles
const { authorize } = require('../middleware/auth');
router.get('/staff-data', protect, authorize('lecturer', 'admin'), (req, res) => {});
```

### Rate Limiting
```javascript
const { rateLimit } = require('../middleware/auth');

// 10 requests per 5 minutes
const customRateLimit = rateLimit(10, 5 * 60 * 1000);
router.post('/sensitive-endpoint', customRateLimit, (req, res) => {});
```

## Error Handling

The system includes comprehensive error handling:

- **Validation errors**: Detailed field-level validation messages
- **Authentication errors**: Clear JWT and login error messages
- **Authorization errors**: Role-based access control messages
- **Database errors**: Duplicate key, cast errors, etc.
- **Development vs Production**: Different error detail levels

## Security Best Practices

1. **JWT Secret**: Use a strong, unique JWT secret in production
2. **Password Policy**: Enforce strong password requirements
3. **Rate Limiting**: Implement rate limiting on sensitive endpoints
4. **HTTPS**: Always use HTTPS in production
5. **Token Expiration**: Set appropriate token expiration times
6. **Input Validation**: Validate all user inputs
7. **Error Messages**: Don't leak sensitive information in error messages

## Testing the System

1. **Start the server**:
   ```bash
   cd BACKEND
   npm run dev
   ```

2. **Register a test user**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "password": "password123",
       "role": "student",
       "studentId": "TEST123"
     }'
   ```

3. **Login and get token**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

4. **Test protected routes**:
   ```bash
   curl -X GET http://localhost:5000/api/test/protected \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Frontend Integration

### Storing JWT Token
```javascript
// After successful login
localStorage.setItem('token', response.data.token);
```

### Adding Token to Requests
```javascript
// Using axios
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Using fetch
fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### Handling Token Expiration
```javascript
// Intercept 401 responses
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Next Steps

1. **Email Integration**: Implement email sending for password reset and verification
2. **Refresh Tokens**: Add refresh token functionality for better security
3. **Two-Factor Authentication**: Implement 2FA for additional security
4. **Session Management**: Add session tracking and management
5. **Audit Logging**: Implement comprehensive audit logging
6. **Password Policies**: Add configurable password strength requirements 
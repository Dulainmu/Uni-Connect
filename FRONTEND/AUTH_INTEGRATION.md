# Frontend Authentication Integration

## Overview

This document describes how the authentication system has been integrated into the React frontend of the Campus Connect application.

## Features Implemented

### 🔐 Authentication Features
- **Login/Register forms** with role-based registration
- **JWT token management** with automatic token inclusion in requests
- **Protected routes** with role-based access control
- **User profile management** with edit capabilities
- **Logout functionality** with proper cleanup
- **Toast notifications** for user feedback

### 🛡️ Security Features
- **Automatic token refresh** on app initialization
- **Token expiration handling** with automatic logout
- **Route protection** preventing unauthorized access
- **Input validation** and error handling

## Components Created

### 1. Authentication Service (`src/services/authService.ts`)
Handles all API communication with the backend authentication endpoints.

**Key Features:**
- Axios instance with interceptors for automatic token inclusion
- Automatic 401 handling with logout and redirect
- TypeScript interfaces for type safety
- Local storage management for tokens and user data

**Usage:**
```typescript
import { authService } from '@/services/authService';

// Login
const response = await authService.login({ email, password });

// Register
const response = await authService.register(registerData);

// Get current user
const user = await authService.getCurrentUser();
```

### 2. Authentication Context (`src/contexts/AuthContext.tsx`)
Provides authentication state and functions throughout the application.

**Key Features:**
- Global user state management
- Authentication functions (login, register, logout, etc.)
- Automatic token validation on app load
- Loading states for better UX

**Usage:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### 3. Protected Route Component (`src/components/ProtectedRoute.tsx`)
Wraps routes that require authentication and role-based access.

**Key Features:**
- Authentication checking
- Role-based access control
- Loading states during authentication checks
- Automatic redirects for unauthorized access

**Usage:**
```typescript
// Basic protection
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute allowedRoles={['student']}>
  <StudentDashboard />
</ProtectedRoute>

// Convenience components
<StudentRoute>
  <StudentOnlyComponent />
</StudentRoute>

<LecturerRoute>
  <LecturerOnlyComponent />
</LecturerRoute>

<AdminRoute>
  <AdminOnlyComponent />
</AdminRoute>
```

### 4. User Profile Component (`src/components/UserProfile.tsx`)
Displays and allows editing of user profile information.

**Key Features:**
- Display user information with role badges
- Edit mode for profile updates
- Form validation and error handling
- Loading states during updates

## Updated Components

### 1. Login Page (`src/pages/Login.tsx`)
Enhanced with real authentication functionality.

**New Features:**
- Real login/register with backend API
- Role-based registration forms
- Loading states and error handling
- Toast notifications for feedback
- Redirect to intended destination after login

### 2. Dashboard (`src/pages/Dashboard.tsx`)
Updated to show real user information and logout functionality.

**New Features:**
- Display user name, role, and details
- Logout button with confirmation
- Role-specific information display
- User avatar with initials

### 3. App Component (`src/App.tsx`)
Wrapped with authentication providers and protected routes.

**New Features:**
- AuthProvider wrapper for global state
- Protected routes for authenticated pages
- Automatic authentication checking

## Setup Instructions

### 1. Install Dependencies
```bash
cd FRONTEND
npm install axios
```

### 2. Environment Configuration
Create a `.env` file in the FRONTEND directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Backend Connection
Ensure your backend server is running on `http://localhost:5000` with the authentication endpoints available.

## Usage Examples

### Basic Authentication Flow
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // User will be automatically redirected
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    // User will be redirected to login page
  };

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
```

### Role-Based Access Control
```typescript
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedComponent = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'lecturer') {
    return <LecturerDashboard />;
  }

  return <StudentDashboard />;
};
```

### Protected Routes
```typescript
// In your router configuration
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/admin" element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } />
</Routes>
```

## API Endpoints Used

The frontend integrates with these backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

## Error Handling

The authentication system includes comprehensive error handling:

- **Network errors** - Automatic retry and user feedback
- **Authentication errors** - Automatic logout and redirect
- **Validation errors** - Field-specific error messages
- **Server errors** - User-friendly error messages

## Security Considerations

1. **Token Storage** - JWT tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Token Expiration** - Automatic logout on token expiration
3. **Route Protection** - All sensitive routes are protected
4. **Input Validation** - Client-side validation with server-side verification
5. **Error Messages** - No sensitive information leaked in error messages

## Testing the Integration

1. **Start the backend server:**
   ```bash
   cd BACKEND
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd FRONTEND
   npm run dev
   ```

3. **Test the authentication flow:**
   - Navigate to `/login`
   - Register a new account
   - Login with the created account
   - Test protected routes
   - Test logout functionality

## Customization

### Adding New Protected Routes
```typescript
<Route path="/new-feature" element={
  <ProtectedRoute allowedRoles={['student', 'lecturer']}>
    <NewFeature />
  </ProtectedRoute>
} />
```

### Custom Role-Based Components
```typescript
const RoleBasedFeature = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <AdminFeature />;
  }
  
  return <DefaultFeature />;
};
```

### Custom Authentication Logic
```typescript
const { user, updateProfile } = useAuth();

const handleCustomAction = async () => {
  try {
    await updateProfile({ firstName: 'New Name' });
    // Custom logic here
  } catch (error) {
    // Handle error
  }
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors** - Ensure backend CORS is configured for frontend domain
2. **Token Not Found** - Check localStorage and token generation
3. **Route Protection Not Working** - Verify AuthProvider is wrapping the app
4. **API Connection Failed** - Check backend server and API base URL

### Debug Mode
Enable debug logging by setting:
```typescript
// In authService.ts
const DEBUG = true;
```

## Next Steps

1. **Email Integration** - Add email verification and password reset UI
2. **Profile Pictures** - Add avatar upload functionality
3. **Two-Factor Authentication** - Implement 2FA UI components
4. **Session Management** - Add session timeout warnings
5. **Audit Logging** - Add user activity tracking
6. **Password Policies** - Add password strength indicators 
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  studentId?: string;
  department?: string;
  isActive: boolean;
  lastLogin: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin';
  studentId?: string;
  department?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    user: User;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  department?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Authentication service
class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  // Logout user
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  }

  // Change password
  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Store auth data
  storeAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear auth data
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<{ success: boolean; count: number; data: { users: User[] } }> {
    const response = await api.get('/auth/users');
    return response.data;
  }

  // Update user (admin only)
  async updateUser(userId: string, data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.put(`/auth/users/${userId}`, data);
    return response.data;
  }
}

export const authService = new AuthService();
export default authService; 
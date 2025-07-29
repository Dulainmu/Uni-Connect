import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  category: 'general' | 'academic' | 'event' | 'emergency' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  isActive: boolean;
  isPinned: boolean;
  attachments: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  readBy: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
    readAt: string;
  }>;
  readCount: number;
  isReadByCurrentUser: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'emergency' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  isPinned?: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  expiresAt?: string;
}

export interface AnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SingleAnnouncementResponse {
  success: boolean;
  data: Announcement;
}

export interface PinnedAnnouncementsResponse {
  success: boolean;
  data: Announcement[];
}

class AnnouncementService {
  private getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAnnouncements(params?: {
    page?: number;
    limit?: number;
    category?: string;
    priority?: string;
    isPinned?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AnnouncementsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/announcements?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch announcements: ${response.statusText}`);
    }

    return response.json();
  }

  async getAnnouncement(id: string): Promise<SingleAnnouncementResponse> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch announcement: ${response.statusText}`);
    }

    return response.json();
  }

  async getPinnedAnnouncements(): Promise<PinnedAnnouncementsResponse> {
    const response = await fetch(`${API_BASE_URL}/announcements/pinned`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pinned announcements: ${response.statusText}`);
    }

    return response.json();
  }

  async createAnnouncement(data: CreateAnnouncementData): Promise<SingleAnnouncementResponse> {
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create announcement: ${response.statusText}`);
    }

    return response.json();
  }

  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementData>): Promise<SingleAnnouncementResponse> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update announcement: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteAnnouncement(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete announcement: ${response.statusText}`);
    }

    return response.json();
  }

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}/read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to mark announcement as read: ${response.statusText}`);
    }

    return response.json();
  }

  async getAnnouncementStats(): Promise<{
    success: boolean;
    data: {
      total: number;
      active: number;
      pinned: number;
      expired: number;
      categories: Array<{ _id: string; count: number }>;
      priorities: Array<{ _id: string; count: number }>;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/announcements/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch announcement stats: ${response.statusText}`);
    }

    return response.json();
  }
}

export const announcementService = new AnnouncementService();
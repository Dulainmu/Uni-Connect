import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalMessages: number;
  systemHealth: string;
}

export interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
    userGrowthRate: number;
  };
  communicationMetrics: {
    totalMessages: number;
    averageResponseTime: number;
    appointmentBookings: number;
    ticketResolutionRate: number;
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    featureUsage: Array<{
      name: string;
      usage: number;
    }>;
    peakHours: Array<{
      hour: string;
      users: number;
    }>;
  };
  performanceMetrics: {
    systemUptime: number;
    errorRate: number;
    averageLoadTime: number;
  };
}

class AdminService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making admin API request to: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log(`Admin API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Admin API error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get admin dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await this.makeRequest('/admin/stats');
      // Transform backend response to match AdminStats interface
      const data = response.data;
      return {
        totalUsers: data.users?.total || 0,
        activeUsers: data.users?.active || 0,
        totalTickets: data.tickets?.total || 0,
        openTickets: data.tickets?.open || 0,
        resolvedTickets: data.tickets?.resolved || 0,
        totalMessages: 3421, // Mock for now
        systemHealth: data.performance?.systemUptime > 99 ? "Good" : "Warning"
      };
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('Admin stats API failed, using mock data:', error);
      return {
        totalUsers: 1247,
        activeUsers: 892,
        totalTickets: 156,
        openTickets: 23,
        resolvedTickets: 133,
        totalMessages: 3421,
        systemHealth: "Good"
      };
    }
  }

  // Get analytics data
  async getAnalyticsData(dateRange: string = '7d'): Promise<AnalyticsData> {
    // Mock implementation - replace with actual API call
    return {
      userMetrics: {
        totalUsers: 1247,
        activeUsers: 892,
        newRegistrations: 45,
        userGrowthRate: 12.5
      },
      communicationMetrics: {
        totalMessages: 3421,
        averageResponseTime: 2.3,
        appointmentBookings: 156,
        ticketResolutionRate: 87.5
      },
      engagementMetrics: {
        dailyActiveUsers: 234,
        featureUsage: [
          { name: 'Chat', usage: 85 },
          { name: 'Tickets', usage: 67 },
          { name: 'Appointments', usage: 45 },
          { name: 'Announcements', usage: 78 }
        ],
        peakHours: [
          { hour: '9AM', users: 120 },
          { hour: '10AM', users: 180 },
          { hour: '11AM', users: 220 },
          { hour: '12PM', users: 200 },
          { hour: '1PM', users: 150 },
          { hour: '2PM', users: 190 },
          { hour: '3PM', users: 240 },
          { hour: '4PM', users: 210 }
        ]
      },
      performanceMetrics: {
        systemUptime: 99.8,
        errorRate: 0.2,
        averageLoadTime: 1.2
      }
    };
  }

  // System monitoring endpoints
  async getSystemHealth(): Promise<{ status: string; uptime: number; errors: number }> {
    return this.makeRequest('/admin/system/health');
  }

  // User analytics
  async getUserAnalytics(dateRange: string = '7d'): Promise<any> {
    return this.makeRequest(`/admin/analytics/users?range=${dateRange}`);
  }

  // Communication analytics
  async getCommunicationAnalytics(dateRange: string = '7d'): Promise<any> {
    return this.makeRequest(`/admin/analytics/communication?range=${dateRange}`);
  }

  // Bulk user operations
  async bulkUpdateUsers(userIds: string[], updates: any): Promise<any> {
    return this.makeRequest('/admin/users/bulk', {
      method: 'PUT',
      body: JSON.stringify({ userIds, updates })
    });
  }

  // Export data
  async exportData(type: 'users' | 'tickets' | 'analytics', format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/export/${type}?format=${format}`, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }
}

export const adminService = new AdminService();
export default adminService;
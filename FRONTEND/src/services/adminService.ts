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
      const data = response.data;
      return {
        totalUsers: data.users?.total || 0,
        activeUsers: data.users?.active || 0,
        totalTickets: data.tickets?.total || 0,
        openTickets: data.tickets?.open || 0,
        resolvedTickets: data.tickets?.resolved || 0,
        totalMessages: 0, // Will be updated when messaging analytics are implemented
        systemHealth: data.performance?.systemUptime > 99 ? "Good" : "Warning"
      };
    } catch (error) {
      console.error('Admin stats API failed:', error);
      throw error;
    }
  }

  // Get analytics data
  async getAnalyticsData(dateRange: string = '7d'): Promise<AnalyticsData> {
    try {
      const [userAnalytics, communicationAnalytics] = await Promise.all([
        this.getUserAnalytics(dateRange),
        this.getCommunicationAnalytics(dateRange)
      ]);

      // Transform the data to match AnalyticsData interface
      return {
        userMetrics: {
          totalUsers: userAnalytics.data?.roleDistribution?.reduce((acc: number, role: any) => acc + role.count, 0) || 0,
          activeUsers: 0, // Will be calculated from user analytics
          newRegistrations: userAnalytics.data?.userGrowth?.length || 0,
          userGrowthRate: 0 // Will be calculated from user growth data
        },
        communicationMetrics: {
          totalMessages: 0, // Will be updated when messaging analytics are implemented
          averageResponseTime: communicationAnalytics.data?.averageResponseTime || 0,
          appointmentBookings: 0, // Will be updated when appointment analytics are implemented
          ticketResolutionRate: 0 // Will be calculated from ticket data
        },
        engagementMetrics: {
          dailyActiveUsers: 0, // Will be calculated from user activity data
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
    } catch (error) {
      console.error('Analytics API failed:', error);
      throw error;
    }
  }

  // System monitoring endpoints
  async getSystemHealth(): Promise<{ status: string; uptime: number; errors: number }> {
    try {
      const response = await this.makeRequest('/admin/system/health');
      return {
        status: response.data.status,
        uptime: response.data.uptime,
        errors: 0 // Will be calculated from system metrics
      };
    } catch (error) {
      console.error('System health API failed:', error);
      throw error;
    }
  }

  // User analytics
  async getUserAnalytics(dateRange: string = '7d'): Promise<any> {
    try {
      return await this.makeRequest(`/admin/analytics/users?range=${dateRange}`);
    } catch (error) {
      console.error('User analytics API failed:', error);
      throw error;
    }
  }

  // Communication analytics
  async getCommunicationAnalytics(dateRange: string = '7d'): Promise<any> {
    try {
      return await this.makeRequest(`/admin/analytics/communication?range=${dateRange}`);
    } catch (error) {
      console.error('Communication analytics API failed:', error);
      throw error;
    }
  }

  // Bulk user operations
  async bulkUpdateUsers(userIds: string[], updates: any): Promise<any> {
    try {
      return await this.makeRequest('/admin/users/bulk', {
        method: 'PUT',
        body: JSON.stringify({ userIds, updates })
      });
    } catch (error) {
      console.error('Bulk update users API failed:', error);
      throw error;
    }
  }

  // Export data
  async exportData(type: 'users' | 'tickets' | 'analytics', format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/${type}?format=${format}`, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return response.blob();
    } catch (error) {
      console.error('Export API failed:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService;
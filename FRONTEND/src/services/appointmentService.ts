import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api';
//new
export interface Appointment {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    studentId?: string;
  };
  staff: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  purpose: 'office_hours' | 'project_review' | 'consultation' | 'thesis_meeting' | 'academic_advising' | 'other';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  description?: string;
  notes?: string;
  cancelledBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  cancelledAt?: string;
  cancellationReason?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  formattedDate?: string;
  timeRange?: string;
  studentFullName?: string;
  staffFullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  purpose: 'office_hours' | 'project_review' | 'consultation' | 'thesis_meeting' | 'academic_advising' | 'other';
  description?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  purpose?: 'office_hours' | 'project_review' | 'consultation' | 'thesis_meeting' | 'academic_advising' | 'other';
  description?: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  breakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface StaffAvailability {
  staff: {
    id: string;
    name: string;
    department?: string;
  };
  date: string;
  appointments: Appointment[];
  availableSlots: AvailableSlot[];
}

class AppointmentService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();

    console.log('Making appointment request to:', `${API_BASE_URL}/appointments${endpoint}`);
    console.log('Token available:', !!token);
    console.log('Request options:', options);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('Request config:', config);

    const response = await fetch(`${API_BASE_URL}/appointments${endpoint}`, config);

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  }

  // Create a new appointment
  async createAppointment(data: CreateAppointmentData): Promise<{ success: boolean; data: { appointment: Appointment } }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get appointments by role (student, lecturer, admin)
  async getAppointmentsByRole(role: string): Promise<{ success: boolean; count: number; data: { appointments: Appointment[] } }> {
    return this.makeRequest(`/${role}`);
  }

  // Get a single appointment by ID
  async getAppointment(id: string): Promise<{ success: boolean; data: { appointment: Appointment } }> {
    return this.makeRequest(`/ticket/${id}`);
  }

  // Update an appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<{ success: boolean; data: { appointment: Appointment } }> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Cancel an appointment
  async cancelAppointment(id: string, reason: string): Promise<{ success: boolean; data: { appointment: Appointment } }> {
    return this.makeRequest(`/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Confirm an appointment (staff only)
  async confirmAppointment(id: string): Promise<{ success: boolean; data: { appointment: Appointment } }> {
    return this.makeRequest(`/${id}/confirm`, {
      method: 'POST',
    });
  }

  // Complete an appointment (staff only)
  async completeAppointment(id: string): Promise<{ success: boolean; data: { appointment: Appointment } }> {
    return this.makeRequest(`/${id}/complete`, {
      method: 'POST',
    });
  }

  // Get available staff for appointments
  async getAvailableStaff(): Promise<{ success: boolean; count: number; data: { staff: Staff[] } }> {
    return this.makeRequest('/staff');
  }

  // Get appointment statistics by role
  async getAppointmentStats(role: string): Promise<{ success: boolean; data: AppointmentStats }> {
    return this.makeRequest(`/stats/${role}`);
  }

  // Get staff availability for a specific date
  async getStaffAvailability(staffId: string, date: string): Promise<{ success: boolean; data: StaffAvailability }> {
    return this.makeRequest(`/availability/${staffId}/${date}`);
  }
}

export const appointmentService = new AppointmentService();
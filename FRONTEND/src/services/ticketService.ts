import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api';

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: 'technical' | 'academic' | 'administrative' | 'financial' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  submittedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    studentId?: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  department?: string;
  attachments: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }>;
  resolvedAt?: string;
  closedAt?: string;
  ticketNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  category: 'technical' | 'academic' | 'administrative' | 'financial' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  department?: string;
}

export interface UpdateTicketData {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  comments?: string;
}

export interface Lecturer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  breakdown: Array<{
    _id: string;
    count: number;
  }>;
}

class TicketService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();
    
    console.log('Making request to:', `${API_BASE_URL}/tickets${endpoint}`);
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

    const response = await fetch(`${API_BASE_URL}/tickets${endpoint}`, config);
    
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

  // Create a new ticket
  async createTicket(data: CreateTicketData): Promise<{ success: boolean; data: { ticket: Ticket } }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get tickets by role (student, lecturer, admin)
  async getTicketsByRole(role: string): Promise<{ success: boolean; count: number; data: { tickets: Ticket[] } }> {
    return this.makeRequest(`/${role}`);
  }

  // Get a single ticket by ID
  async getTicket(id: string): Promise<{ success: boolean; data: { ticket: Ticket } }> {
    return this.makeRequest(`/ticket/${id}`);
  }

  // Update a ticket
  async updateTicket(id: string, data: UpdateTicketData): Promise<{ success: boolean; data: { ticket: Ticket } }> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Add a comment to a ticket
  async addComment(ticketId: string, content: string): Promise<{ success: boolean; data: { ticket: Ticket } }> {
    return this.makeRequest(`/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Get available lecturers for assignment
  async getAvailableLecturers(): Promise<{ success: boolean; count: number; data: { lecturers: Lecturer[] } }> {
    return this.makeRequest('/lecturers');
  }

  // Get ticket statistics by role
  async getTicketStats(role: string): Promise<{ success: boolean; data: TicketStats }> {
    return this.makeRequest(`/stats/${role}`);
  }
}

export const ticketService = new TicketService(); 
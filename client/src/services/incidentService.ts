import apiClient from '../api/apiClient';

export interface IncidentPayload {
  incidentNumber: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  incidentDate: string; // ISO date string
  facility: string;
  reportedBy: string;
  deviceName: string;
  manufacturer: string;
}

export interface IncidentResponse {
  id: string;
  incidentNumber: string;
  severity: string;
  status: string;
  description: string;
  incidentDate: string;
  facility: string;
  reportedBy: string;
  deviceName: string;
  manufacturer: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentListResponse extends IncidentResponse {
  investigation?: {
    id: string;
    phase: string;
    status: string;
  };
}

export const incidentService = {
  /**
   * Create a new incident
   */
  async createIncident(payload: IncidentPayload): Promise<IncidentResponse> {
    const response = await apiClient.post<IncidentResponse>('/api/incidents', payload);
    return response.data;
  },

  /**
   * Get a specific incident by ID
   */
  async getIncident(id: string): Promise<IncidentResponse> {
    const response = await apiClient.get<IncidentResponse>(`/api/incidents/${id}`);
    return response.data;
  },

  /**
   * List all incidents with optional filters
   */
  async listIncidents(filters?: {
    severity?: string;
    status?: string;
  }): Promise<IncidentListResponse[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get<IncidentListResponse[]>(
      `/api/incidents${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Update incident status
   */
  async updateIncidentStatus(id: string, status: string): Promise<IncidentResponse> {
    const response = await apiClient.patch<IncidentResponse>(`/api/incidents/${id}/status`, {
      status,
    });
    return response.data;
  },
};

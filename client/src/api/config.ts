export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Investigations
  investigations: `${API_BASE_URL}/api/investigations`,
  investigation: (id: string) => `${API_BASE_URL}/api/investigations/${id}`,
  investigationAudit: (id: string) => `${API_BASE_URL}/api/investigations/${id}/audit`,
  investigationAgentLogs: (id: string) => `${API_BASE_URL}/api/investigations/${id}/agent-logs`,
  investigationReport: (id: string) => `${API_BASE_URL}/api/investigations/${id}/report`,
  investigationReview: (id: string) => `${API_BASE_URL}/api/investigations/${id}/review`,
  investigationRerunWorkflow: (id: string) => `${API_BASE_URL}/api/investigations/${id}/rerun-workflow`,

  // Incidents
  incidents: `${API_BASE_URL}/api/incidents`,
  incident: (id: string) => `${API_BASE_URL}/api/incidents/${id}`,

  // Dashboard
  dashboardStats: `${API_BASE_URL}/api/dashboard/stats`,

  // Agents
  agentActivities: `${API_BASE_URL}/api/agents/activities`,

  // Auth
  authRefresh: `${API_BASE_URL}/api/auth/refresh`,
};

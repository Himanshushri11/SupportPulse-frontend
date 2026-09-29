import { apiClient } from './client';

export const ticketsApi = {
  // Get paginated tickets with filtering, searching, and sorting
  getTickets: async (params = {}) => {
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },

  // Get single ticket by MongoDB ID or ticketNumber
  getTicket: async (ticketId) => {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  },

  // Create a new support ticket
  createTicket: async (payload) => {
    const response = await apiClient.post('/tickets', payload);
    return response.data;
  },

  // Update controlled ticket attributes (title, priority, category)
  updateTicket: async (ticketId, payload) => {
    const response = await apiClient.patch(`/tickets/${ticketId}`, payload);
    return response.data;
  },

  // Assign or reassign ticket to an agent (Staff only)
  assignTicket: async (ticketId, agentId) => {
    const response = await apiClient.post(`/tickets/${ticketId}/assign`, { agentId });
    return response.data;
  },

  // Get active support agents and admins (Staff only)
  getAgents: async () => {
    const response = await apiClient.get('/tickets/agents');
    return response.data;
  },

  // Update ticket lifecycle status via state machine
  updateStatus: async (ticketId, status) => {
    const response = await apiClient.post(`/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  // Resolve ticket
  resolveTicket: async (ticketId) => {
    const response = await apiClient.post(`/tickets/${ticketId}/resolve`);
    return response.data;
  },

  // Reopen ticket
  reopenTicket: async (ticketId) => {
    const response = await apiClient.post(`/tickets/${ticketId}/reopen`);
    return response.data;
  },

  // Close ticket
  closeTicket: async (ticketId) => {
    const response = await apiClient.post(`/tickets/${ticketId}/close`);
    return response.data;
  },

  // Get ticket conversation thread (messages & notes)
  getMessages: async (ticketId, params = {}) => {
    const response = await apiClient.get(`/tickets/${ticketId}/messages`, { params });
    return response.data;
  },

  // Post a message (public reply or internal note)
  createMessage: async (ticketId, payload) => {
    const response = await apiClient.post(`/tickets/${ticketId}/messages`, payload);
    return response.data;
  },

  // Get audit activity history timeline
  getActivity: async (ticketId) => {
    const response = await apiClient.get(`/tickets/${ticketId}/activity`);
    return response.data;
  },

  // Read available support categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Get role-aware dashboard summary & analytics
  getDashboardSummary: async () => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },
};

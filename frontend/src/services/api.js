import apiClient from './apiClient';

const unwrapData = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (payload?.data !== undefined) return payload.data;
  if (payload?.tickets !== undefined) return payload.tickets;
  if (payload?.messages !== undefined) return payload.messages;
  if (payload?.ticket !== undefined) return payload.ticket;
  if (payload?.message !== undefined) return payload.message;
  return payload;
};

export const getTickets = async () => unwrapData(await apiClient.get('/tickets'));
export const createTicket = async (body) => unwrapData(await apiClient.post('/tickets', body));
export const getMyTickets = async () => unwrapData(await apiClient.get('/tickets/my'));
export const updateTicket = async (id, updates) =>
  unwrapData(await apiClient.patch(`/tickets/${id}`, updates));
export const acceptTicket = async (id) => unwrapData(await apiClient.post(`/tickets/${id}/accept`));
export const getMessagesByTicket = async (ticketId) =>
  unwrapData(await apiClient.get(`/messages/${ticketId}`));
export const sendMessage = async (body) => unwrapData(await apiClient.post('/messages', body));
export const getWidgetConfig = async () => unwrapData(await apiClient.get('/widget/config'));
export const createWidgetSession = async (body) =>
  unwrapData(await apiClient.post('/widget/session', body));

export default apiClient;

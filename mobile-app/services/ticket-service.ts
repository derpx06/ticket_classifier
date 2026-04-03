import { apiRequest } from '@/services/api';

export type TicketStatus = 'pending' | 'assigned' | 'resolved' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketCategory = 'billing' | 'technical' | 'login' | 'website-chat' | 'other';

export type TicketMessage = {
  _id?: string;
  id?: string;
  ticketId?: string;
  sender: 'user' | 'agent' | 'bot' | 'system';
  text: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TicketItem = {
  _id?: string;
  id?: string;
  ticketCode?: string;
  customerName?: string;
  message?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: number | null;
};

type AuthToken = string;

export const getTicketId = (ticket: TicketItem | null | undefined) =>
  String(ticket?._id || ticket?.id || '');

export async function getTickets(token: AuthToken) {
  return apiRequest<TicketItem[]>('/tickets', { token });
}

export async function getMyTickets(token: AuthToken) {
  return apiRequest<TicketItem[]>('/tickets/my', { token });
}

export async function getMessagesByTicket(token: AuthToken, ticketId: string) {
  return apiRequest<TicketMessage[]>(`/tickets/${ticketId}/messages`, { token });
}

export async function updateTicketStatus(token: AuthToken, ticketId: string, status: TicketStatus) {
  return apiRequest<TicketItem>(`/tickets/${ticketId}`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export async function acceptTicket(token: AuthToken, ticketId: string) {
  return apiRequest<TicketItem>(`/tickets/${ticketId}/accept`, {
    method: 'POST',
    token,
  });
}

export async function sendTicketMessage(token: AuthToken, ticketId: string, text: string) {
  return apiRequest<TicketMessage>(`/tickets/${ticketId}/messages`, {
    method: 'POST',
    token,
    body: {
      sender: 'agent',
      text,
    },
  });
}

import api from './api';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'pending' | 'assigned' | 'resolved' | 'escalated' | 'closed';

export interface Ticket {
  id: string;
  uuid?: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  agentId?: string;
  /** From API `customerName` */
  customerName?: string;
  /** Set when API `urgency` differs from `priority`. */
  urgency?: TicketPriority;
  assignedRoleName?: string;
}

export interface Message {
  id: string;
  ticketId: string;
  sender: 'user' | 'agent' | 'bot';
  text: string;
  createdAt: string;
}

type MessageSender = Message['sender'];

const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const STATUSES: TicketStatus[] = ['pending', 'assigned', 'resolved', 'escalated', 'closed'];
const SENDERS: MessageSender[] = ['user', 'agent', 'bot'];

function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Single line of real ticket fields for list cards (category, priority, customer, etc.). */
export function formatTicketCardDetails(t: Ticket): string {
  const parts: string[] = [];
  if (t.category?.trim()) parts.push(titleCaseWord(t.category));
  parts.push(titleCaseWord(t.priority));
  if (t.customerName?.trim()) parts.push(t.customerName.trim());
  if (t.urgency) parts.push(`Urgency ${titleCaseWord(t.urgency)}`);
  if (t.assignedRoleName?.trim()) parts.push(t.assignedRoleName.trim());
  return parts.join(' · ');
}

function pickString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object' && v !== null && 'toString' in v) {
    const s = (v as { toString(): unknown }).toString();
    if (typeof s === 'string' && s !== '[object Object]') return s;
  }
  return '';
}

function toIsoDate(v: unknown): string {
  if (v == null) return new Date().toISOString();
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** Maps Mongo/API shape (`_id`, `message`) to app `Ticket` (`id`, `subject`). */
export function normalizeTicket(raw: unknown): Ticket {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const id = pickString(o._id) || pickString(o.id);
  const message = pickString(o.message);
  const subject = pickString(o.subject) || message || 'No subject';
  const cat = pickString(o.category) || 'other';
  const p = String(o.priority ?? '').toLowerCase();
  const priority = PRIORITIES.includes(p as TicketPriority) ? (p as TicketPriority) : 'medium';
  const s = String(o.status ?? '').toLowerCase();
  const status = STATUSES.includes(s as TicketStatus) ? (s as TicketStatus) : 'pending';

  const uRaw = String(o.urgency ?? '').trim().toLowerCase();
  const urgencyParsed = PRIORITIES.includes(uRaw as TicketPriority) ? (uRaw as TicketPriority) : undefined;
  const urgency = urgencyParsed && urgencyParsed !== priority ? urgencyParsed : undefined;

  return {
    id,
    subject,
    category: cat,
    priority,
    status,
    createdAt: toIsoDate(o.createdAt),
    updatedAt: toIsoDate(o.updatedAt),
    customerId: pickString(o.customerId) || undefined,
    agentId: pickString(o.agentId) || pickString(o.assignedTo) || undefined,
    customerName: pickString(o.customerName).trim() || undefined,
    urgency,
    assignedRoleName: pickString(o.assignedRoleName).trim() || undefined,
  };
}

/** Maps Mongo/socket shape to app `Message`. */
export function normalizeMessage(raw: unknown): Message {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const id = pickString(o._id) || pickString(o.id);
  const ticketId = pickString(o.ticketId);
  const senderRaw = String(o.sender ?? 'user').toLowerCase();
  const sender = SENDERS.includes(senderRaw as MessageSender) ? (senderRaw as MessageSender) : 'user';

  return {
    id,
    ticketId,
    sender,
    text: pickString(o.text),
    createdAt: toIsoDate(o.createdAt),
  };
}

export const getTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<{ data: unknown[] }>('/tickets');
  const list = Array.isArray(response.data.data) ? response.data.data : [];
  return list.map(normalizeTicket);
};

export const getMyTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<{ data: unknown[] }>('/tickets/my');
  const list = Array.isArray(response.data.data) ? response.data.data : [];
  return list.map(normalizeTicket);
};

export const getTicketMessages = async (ticketId: string): Promise<Message[]> => {
  const response = await api.get<{ data: unknown[] }>(`/tickets/${ticketId}/messages`);
  const list = Array.isArray(response.data.data) ? response.data.data : [];
  return list.map(normalizeMessage);
};

export const sendMessage = async (ticketId: string, text: string): Promise<Message> => {
  const response = await api.post<{ data: unknown }>(`/tickets/${ticketId}/messages`, {
    sender: 'agent',
    text,
  });
  return normalizeMessage(response.data.data);
};

export const acceptTicket = async (ticketId: string): Promise<Ticket> => {
  const response = await api.post<{ data: unknown }>(`/tickets/${ticketId}/accept`);
  return normalizeTicket(response.data.data);
};

export const updateTicketConfig = async (
  ticketId: string,
  payload: { status?: Ticket['status']; priority?: Ticket['priority'] }
): Promise<Ticket> => {
  const response = await api.patch<{ data: unknown }>(`/tickets/${ticketId}`, payload);
  return normalizeTicket(response.data.data);
};

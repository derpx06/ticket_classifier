import { Ticket, TicketPriority, TicketStatus } from '@/services/ticket-service';

export function nexusTicketId(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-4);
  return tail ? tail.toUpperCase() : 'XXXX';
}

export function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export type TagKind = 'status' | 'category' | 'priority' | 'urgency';

export function buildTicketTags(ticket: Ticket): { key: string; text: string; kind: TagKind; priority?: TicketPriority }[] {
  const out: { key: string; text: string; kind: TagKind; priority?: TicketPriority }[] = [];
  if (ticket.category?.trim()) {
    out.push({ key: 'category', text: titleCaseWord(ticket.category), kind: 'category' });
  }
  out.push({
    key: 'priority',
    text: ticket.priority === 'low' ? 'Neutral' : titleCaseWord(ticket.priority),
    kind: 'priority',
    priority: ticket.priority,
  });
  if (ticket.urgency && ticket.urgency !== ticket.priority) {
    out.push({
      key: 'urgency',
      text: ticket.urgency === 'low' ? 'Neutral' : titleCaseWord(ticket.urgency),
      kind: 'urgency',
      priority: ticket.urgency,
    });
  }
  return out;
}

export function tagChipColors(
  tag: { kind: TagKind; priority?: TicketPriority },
  ticket: Ticket,
  isDark: boolean,
): { bg: string; fg: string } {
  if (tag.kind === 'status') {
    const s = ticket.status;
    if (s === 'resolved') {
      return isDark ? { bg: '#14532d', fg: '#a7f3d0' } : { bg: '#d1fae5', fg: '#047857' };
    }
    if (s === 'escalated') {
      return isDark ? { bg: '#7f1d1d', fg: '#fecaca' } : { bg: '#fee2e2', fg: '#b91c1c' };
    }
    if (s === 'pending') {
      return isDark ? { bg: '#78350f', fg: '#fde68a' } : { bg: '#fef3c7', fg: '#b45309' };
    }
    if (s === 'assigned') {
      return isDark ? { bg: '#334155', fg: '#cbd5e1' } : { bg: '#f1f5f9', fg: '#475569' };
    }
    if (s === 'closed') {
      return isDark ? { bg: '#3f3f46', fg: '#d4d4d8' } : { bg: '#f4f4f5', fg: '#52525b' };
    }
    return isDark ? { bg: '#334155', fg: '#e2e8f0' } : { bg: '#f1f5f9', fg: '#475569' };
  }
  if (tag.kind === 'category') {
    return isDark ? { bg: '#3b2f5c', fg: '#e9d5ff' } : { bg: '#ede9fe', fg: '#6d28d9' };
  }
  const p = tag.priority ?? 'medium';
  if (p === 'low') {
    return isDark ? { bg: '#334155', fg: '#cbd5e1' } : { bg: '#f1f5f9', fg: '#475569' };
  }
  if (p === 'medium') {
    return isDark ? { bg: '#7c2d12', fg: '#fdba74' } : { bg: '#ffedd5', fg: '#c2410c' };
  }
  if (p === 'high') {
    return isDark ? { bg: '#9a3412', fg: '#fed7aa' } : { bg: '#fed7aa', fg: '#9a3412' };
  }
  return isDark ? { bg: '#7f1d1d', fg: '#fecaca' } : { bg: '#fee2e2', fg: '#b91c1c' };
}

export function nexusCardPresentation(status: Ticket['status'], isDark: boolean) {
  if (status === 'escalated') {
    return {
      stripe: isDark ? '#1e40af' : '#1e3a8a',
      pillBg: isDark ? '#991b1b' : '#b91c1c',
      pillFg: '#ffffff',
      label: 'ESCALATED',
    };
  }
  if (status === 'resolved') {
    return {
      stripe: isDark ? '#059669' : '#6ee7b7',
      pillBg: isDark ? '#065f46' : '#d1fae5',
      pillFg: isDark ? '#a7f3d0' : '#047857',
      label: 'RESOLVED',
    };
  }
  if (status === 'assigned') {
    return {
      stripe: isDark ? '#475569' : '#cbd5e1',
      pillBg: isDark ? '#334155' : '#f1f5f9',
      pillFg: isDark ? '#cbd5e1' : '#475569',
      label: 'ASSIGNED',
    };
  }
  if (status === 'closed') {
    return {
      stripe: isDark ? '#52525b' : '#d4d4d8',
      pillBg: isDark ? '#3f3f46' : '#f4f4f5',
      pillFg: isDark ? '#d4d4d8' : '#52525b',
      label: 'CLOSED',
    };
  }
  return {
    stripe: isDark ? '#b45309' : '#fde68a',
    pillBg: isDark ? '#78350f' : '#fef3c7',
    pillFg: isDark ? '#fcd34d' : '#92400e',
    label: 'PENDING',
  };
}

export function customerDisplayName(ticket: Ticket): string {
  return ticket.customerName?.trim() || 'Website Visitor';
}

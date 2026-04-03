import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSession } from '@/context/session-context';
import {
  acceptTicket,
  getMessagesByTicket,
  getTicketId,
  getTickets,
  TicketItem,
  TicketMessage,
  TicketStatus,
  updateTicketStatus,
} from '@/services/ticket-service';

const statusOptions: ('All' | TicketStatus)[] = ['All', 'pending', 'assigned', 'resolved', 'escalated'];

const categoryColors: Record<string, string> = {
  billing: '#4338ca',
  technical: '#0e7490',
  login: '#6d28d9',
  'website-chat': '#0369a1',
  other: '#64748b',
};

const statusColors: Record<TicketStatus, string> = {
  pending: '#b45309',
  assigned: '#1d4ed8',
  resolved: '#047857',
  escalated: '#be123c',
};

const priorityColors: Record<string, string> = {
  high: '#be123c',
  medium: '#c2410c',
  low: '#047857',
};

const formatLabel = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function QueriesScreen() {
  const { token } = useSession();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');
  const [selectedId, setSelectedId] = useState('');
  const [messagesByTicket, setMessagesByTicket] = useState<Record<string, TicketMessage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState('');

  const upsertTicket = useCallback((incoming: TicketItem) => {
    const incomingId = getTicketId(incoming);
    if (!incomingId) return;
    setTickets((previous) => {
      const exists = previous.some((ticket) => getTicketId(ticket) === incomingId);
      const next = exists
        ? previous.map((ticket) => (getTicketId(ticket) === incomingId ? { ...ticket, ...incoming } : ticket))
        : [incoming, ...previous];
      return next.sort(
        (a, b) =>
          new Date(String(b.updatedAt || b.createdAt || 0)).getTime() -
          new Date(String(a.updatedAt || a.createdAt || 0)).getTime(),
      );
    });
  }, []);

  const loadTickets = useCallback(
    async (asRefresh = false) => {
      if (!token) return;
      try {
        if (asRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError('');
        const data = await getTickets(token);
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort(
          (a, b) =>
            new Date(String(b.updatedAt || b.createdAt || 0)).getTime() -
            new Date(String(a.updatedAt || a.createdAt || 0)).getTime(),
        );
        setTickets(sorted);
        setSelectedId((previous) => {
          if (previous && sorted.some((ticket) => getTicketId(ticket) === previous)) {
            return previous;
          }
          return getTicketId(sorted[0]);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tickets.';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const code = String(ticket.ticketCode || getTicketId(ticket)).toLowerCase();
      const name = String(ticket.customerName || '').toLowerCase();
      const message = String(ticket.message || '').toLowerCase();
      const status = String(ticket.status || '').toLowerCase() as TicketStatus;

      const matchesSearch = !query || code.includes(query) || name.includes(query) || message.includes(query);
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchText, statusFilter]);

  useEffect(() => {
    if (!selectedId && filteredTickets[0]) {
      setSelectedId(getTicketId(filteredTickets[0]));
      return;
    }
    if (selectedId && !filteredTickets.some((ticket) => getTicketId(ticket) === selectedId)) {
      setSelectedId(getTicketId(filteredTickets[0]));
    }
  }, [filteredTickets, selectedId]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => getTicketId(ticket) === selectedId) || null,
    [selectedId, tickets],
  );

  const selectedTicketId = getTicketId(selectedTicket);
  const selectedMessages = messagesByTicket[selectedTicketId] || [];

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      if (!token || !selectedTicketId) return;
      try {
        setIsMessagesLoading(true);
        const messages = await getMessagesByTicket(token, selectedTicketId);
        if (!cancelled) {
          setMessagesByTicket((previous) => ({ ...previous, [selectedTicketId]: messages || [] }));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load ticket messages.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsMessagesLoading(false);
        }
      }
    };

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [token, selectedTicketId]);

  const onAccept = async () => {
    if (!token || !selectedTicketId || isActing) return;
    try {
      setIsActing(true);
      setError('');
      const updated = await acceptTicket(token, selectedTicketId);
      upsertTicket(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to accept ticket.';
      setError(message);
    } finally {
      setIsActing(false);
    }
  };

  const onReject = async () => {
    if (!token || !selectedTicketId || isActing) return;
    try {
      setIsActing(true);
      setError('');
      const updated = await updateTicketStatus(token, selectedTicketId, 'escalated');
      upsertTicket(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reject ticket.';
      setError(message);
    } finally {
      setIsActing(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.emptyText}>Please login to view tickets.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadTickets(true)} />}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Live Human Support Requests</Text>
        <Text style={styles.panelSubtitle}>Connected to backend ticket data.</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search ticket, customer, message..."
          style={styles.searchInput}
        />

        <View style={styles.filterRow}>
          {statusOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setStatusFilter(option)}
              style={[styles.filterChip, statusFilter === option && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, statusFilter === option && styles.filterChipTextActive]}>
                {formatLabel(option)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.resultText}>
          Showing {filteredTickets.length} result{filteredTickets.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.panel}>
        {filteredTickets.map((ticket) => {
          const ticketId = getTicketId(ticket);
          const isActive = selectedTicketId === ticketId;
          const status = (ticket.status || 'pending') as TicketStatus;
          const category = String(ticket.category || 'other');
          const priority = String(ticket.priority || 'medium');
          return (
            <Pressable
              key={ticketId}
              onPress={() => setSelectedId(ticketId)}
              style={[styles.ticketCard, isActive && styles.ticketCardActive]}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketCode}>{ticket.ticketCode || ticketId}</Text>
                <Text style={[styles.badge, { color: statusColors[status] }]}>
                  {formatLabel(status)}
                </Text>
              </View>
              <Text style={styles.customerName}>{ticket.customerName || '-'}</Text>
              <Text style={styles.ticketMessage}>{ticket.message || '-'}</Text>
              <View style={styles.badgeRow}>
                <Text style={[styles.badge, { color: categoryColors[category] || '#64748b' }]}>
                  {formatLabel(category)}
                </Text>
                <Text style={[styles.badge, { color: priorityColors[priority] || '#64748b' }]}>
                  {formatLabel(priority)}
                </Text>
              </View>
            </Pressable>
          );
        })}
        {filteredTickets.length === 0 ? (
          <Text style={styles.emptyText}>No tickets match the current filters.</Text>
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ticket Details</Text>
        {selectedTicket ? (
          <>
            <Text style={styles.detailsTicketCode}>
              {selectedTicket.ticketCode || selectedTicketId}
            </Text>
            <Text style={styles.customerName}>{selectedTicket.customerName || '-'}</Text>
            <Text style={styles.ticketMessage}>{selectedTicket.message || '-'}</Text>

            <Text style={styles.sectionLabel}>Conversation</Text>
            {isMessagesLoading ? <Text style={styles.emptyText}>Loading messages...</Text> : null}
            {!isMessagesLoading && selectedMessages.length === 0 ? (
              <Text style={styles.emptyText}>No messages yet.</Text>
            ) : null}
            {!isMessagesLoading &&
              selectedMessages.map((message, index) => {
                const key = String(message._id || message.id || `${selectedTicketId}-${index}`);
                const createdAt = message.createdAt ? new Date(message.createdAt).toLocaleString() : '-';
                return (
                  <View key={key} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSender}>{formatLabel(String(message.sender || 'user'))}</Text>
                      <Text style={styles.messageTime}>{createdAt}</Text>
                    </View>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                );
              })}

            <View style={styles.actionRow}>
              <Pressable
                onPress={() => void onAccept()}
                disabled={isActing || selectedTicket.status !== 'pending'}
                style={[styles.actionButton, styles.acceptButton, (isActing || selectedTicket.status !== 'pending') && styles.actionDisabled]}>
                <Text style={styles.actionButtonText}>Accept</Text>
              </Pressable>
              <Pressable
                onPress={() => void onReject()}
                disabled={isActing || selectedTicket.status !== 'pending'}
                style={[styles.actionButton, styles.rejectButton, (isActing || selectedTicket.status !== 'pending') && styles.actionDisabled]}>
                <Text style={styles.actionButtonText}>Reject</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Select a ticket to view details.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 13,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 10,
  },
  panelTitle: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: 16,
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  errorText: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  filterChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  filterChipText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#1d4ed8',
  },
  resultText: {
    fontSize: 12,
    color: '#64748b',
  },
  ticketCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  ticketCardActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ticketCode: {
    color: '#1d4ed8',
    fontWeight: '800',
    fontSize: 14,
  },
  customerName: {
    color: '#334155',
    fontWeight: '600',
  },
  ticketMessage: {
    color: '#0f172a',
    fontSize: 13,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  detailsTicketCode: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  messageCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 9,
    gap: 4,
    backgroundColor: '#f8fafc',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  messageSender: {
    color: '#1e293b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  messageTime: {
    color: '#64748b',
    fontSize: 11,
  },
  messageText: {
    color: '#0f172a',
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionDisabled: {
    opacity: 0.5,
  },
  acceptButton: {
    backgroundColor: '#1d4ed8',
  },
  rejectButton: {
    backgroundColor: '#be123c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

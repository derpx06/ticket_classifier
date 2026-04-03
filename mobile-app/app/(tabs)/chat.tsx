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
  getMessagesByTicket,
  getMyTickets,
  getTicketId,
  getTickets,
  sendTicketMessage,
  TicketItem,
  TicketMessage,
  TicketStatus,
  updateTicketStatus,
} from '@/services/ticket-service';

type StatusFilter = 'All' | TicketStatus;

const statusOptions: StatusFilter[] = ['All', 'pending', 'assigned', 'resolved', 'escalated'];

const statusColors: Record<TicketStatus, string> = {
  pending: '#b45309',
  assigned: '#1d4ed8',
  resolved: '#047857',
  escalated: '#be123c',
};

const formatLabel = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ChatScreen() {
  const { role, token } = useSession();
  const [conversations, setConversations] = useState<TicketItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [messagesByTicket, setMessagesByTicket] = useState<Record<string, TicketMessage[]>>({});
  const [draft, setDraft] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = String(role || '').toLowerCase() === 'admin';

  const upsertConversation = useCallback((incoming: TicketItem) => {
    const incomingId = getTicketId(incoming);
    if (!incomingId) return;
    setConversations((previous) => {
      const exists = previous.some((conversation) => getTicketId(conversation) === incomingId);
      const next = exists
        ? previous.map((conversation) =>
            getTicketId(conversation) === incomingId ? { ...conversation, ...incoming } : conversation,
          )
        : [incoming, ...previous];
      return next.sort(
        (a, b) =>
          new Date(String(b.updatedAt || b.createdAt || 0)).getTime() -
          new Date(String(a.updatedAt || a.createdAt || 0)).getTime(),
      );
    });
  }, []);

  const loadConversations = useCallback(
    async (asRefresh = false) => {
      if (!token) return;
      try {
        if (asRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError('');
        const data = isAdmin ? await getTickets(token) : await getMyTickets(token);
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort(
          (a, b) =>
            new Date(String(b.updatedAt || b.createdAt || 0)).getTime() -
            new Date(String(a.updatedAt || a.createdAt || 0)).getTime(),
        );
        setConversations(sorted);
        setActiveId((previous) => {
          if (previous && sorted.some((conversation) => getTicketId(conversation) === previous)) {
            return previous;
          }
          return getTicketId(sorted[0]);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load conversations.';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAdmin, token],
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const filteredConversations = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const status = (conversation.status || 'pending') as TicketStatus;
      const code = String(conversation.ticketCode || getTicketId(conversation)).toLowerCase();
      const customer = String(conversation.customerName || '').toLowerCase();
      const message = String(conversation.message || '').toLowerCase();
      const cachedMessages = messagesByTicket[getTicketId(conversation)] || [];
      const hasMessageHit = cachedMessages.some((entry) => entry.text.toLowerCase().includes(query));
      const matchesSearch = !query || code.includes(query) || customer.includes(query) || message.includes(query) || hasMessageHit;
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [conversations, messagesByTicket, searchText, statusFilter]);

  useEffect(() => {
    if (!activeId && filteredConversations[0]) {
      setActiveId(getTicketId(filteredConversations[0]));
      return;
    }
    if (activeId && !conversations.some((conversation) => getTicketId(conversation) === activeId)) {
      setActiveId(getTicketId(filteredConversations[0]));
    }
  }, [activeId, conversations, filteredConversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => getTicketId(conversation) === activeId) || null,
    [activeId, conversations],
  );

  const activeMessages = messagesByTicket[activeId] || [];

  useEffect(() => {
    let cancelled = false;
    const loadMessages = async () => {
      if (!token || !activeId) return;
      try {
        setIsLoadingMessages(true);
        const messages = await getMessagesByTicket(token, activeId);
        if (!cancelled) {
          setMessagesByTicket((previous) => ({ ...previous, [activeId]: messages || [] }));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load messages.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    };

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeId, token]);

  const summary = useMemo(
    () => ({
      total: conversations.length,
      assigned: conversations.filter((conversation) => conversation.status === 'assigned').length,
      pending: conversations.filter((conversation) => conversation.status === 'pending').length,
    }),
    [conversations],
  );

  const sendMessage = async () => {
    if (!token || !activeConversation || !activeId || !draft.trim() || isSending) return;
    if (activeConversation.status !== 'assigned') {
      setError('Accept this ticket first before sending messages.');
      return;
    }

    setIsSending(true);
    setError('');
    const text = draft.trim();
    try {
      const created = await sendTicketMessage(token, activeId, text);
      setMessagesByTicket((previous) => ({
        ...previous,
        [activeId]: [...(previous[activeId] || []), created],
      }));
      setDraft('');
      upsertConversation({
        ...activeConversation,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message.';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const onUpdateStatus = async (status: TicketStatus) => {
    if (!token || !activeConversation || isSending) return;
    try {
      setIsSending(true);
      setError('');
      const updated = await updateTicketStatus(token, getTicketId(activeConversation), status);
      upsertConversation(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update ticket status.';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.emptyText}>Please login to open chat.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadConversations(true)} />}>
      <View style={styles.panel}>
        <Text style={styles.title}>Support Chat</Text>
        <Text style={styles.subtitle}>
          {isAdmin ? 'Company-wide customer conversations' : 'Assigned customer conversations'}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.assigned}</Text>
            <Text style={styles.summaryLabel}>Assigned</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search ticket, customer, message..."
          style={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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
        </ScrollView>
      </View>

      <View style={styles.panel}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Conversations</Text>
          <Text style={styles.sectionHint}>{filteredConversations.length} matches</Text>
        </View>
        {filteredConversations.map((conversation) => {
          const conversationId = getTicketId(conversation);
          const isActive = conversationId === activeId;
          const cachedMessages = messagesByTicket[conversationId] || [];
          const lastMessage = cachedMessages[cachedMessages.length - 1];
          const status = (conversation.status || 'pending') as TicketStatus;
          return (
            <Pressable
              key={conversationId}
              onPress={() => setActiveId(conversationId)}
              style={[styles.conversationCard, isActive && styles.conversationCardActive]}>
              <View style={styles.conversationTopRow}>
                <Text style={styles.conversationCode}>{conversation.ticketCode || conversationId}</Text>
                <Text style={[styles.conversationStatus, { color: statusColors[status] }]}>
                  {formatLabel(status)}
                </Text>
              </View>
              <Text style={styles.conversationCustomer}>{conversation.customerName || '-'}</Text>
              <Text numberOfLines={2} style={styles.conversationPreview}>
                {lastMessage?.text || conversation.message || '-'}
              </Text>
              <Text style={styles.lastMessageTime}>
                {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : '-'}
              </Text>
            </Pressable>
          );
        })}
        {!filteredConversations.length ? (
          <Text style={styles.emptyText}>No conversations match your search/filter.</Text>
        ) : null}
      </View>

      <View style={styles.panel}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {activeConversation ? (
          <>
            <View style={styles.activeHeader}>
              <View>
                <Text style={styles.activeTitle}>{activeConversation.message || 'Support conversation'}</Text>
                <Text style={styles.activeMeta}>{activeConversation.customerName || '-'}</Text>
              </View>
              <Text
                style={[
                  styles.statusBadge,
                  { color: statusColors[(activeConversation.status || 'pending') as TicketStatus] },
                ]}>
                {formatLabel(String(activeConversation.status || 'pending'))}
              </Text>
            </View>

            <View style={styles.messageStack}>
              {activeMessages.map((entry, index) => {
                const key = String(entry._id || entry.id || `${activeId}-${index}`);
                const isAgent = entry.sender === 'agent';
                return (
                  <View
                    key={key}
                    style={[styles.chatBubble, isAgent ? styles.chatBubbleAgent : styles.chatBubbleUser]}>
                    <Text style={[styles.chatText, isAgent ? styles.chatTextAgent : styles.chatTextUser]}>
                      {entry.text}
                    </Text>
                    <Text style={[styles.chatMeta, isAgent ? styles.chatMetaAgent : styles.chatMetaUser]}>
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : '-'}
                    </Text>
                  </View>
                );
              })}
              {isLoadingMessages ? <Text style={styles.emptyText}>Loading messages...</Text> : null}
              {!isLoadingMessages && activeMessages.length === 0 ? (
                <Text style={styles.emptyText}>No messages yet.</Text>
              ) : null}
            </View>

            <View style={styles.composerRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={
                  activeConversation.status === 'assigned'
                    ? 'Type your reply...'
                    : 'Set status to Assigned to start chatting...'
                }
                editable={activeConversation.status === 'assigned'}
                style={styles.input}
              />
              <Pressable
                onPress={() => void sendMessage()}
                disabled={!draft.trim() || activeConversation.status !== 'assigned' || isSending}
                style={[
                  styles.sendButton,
                  (!draft.trim() || activeConversation.status !== 'assigned' || isSending) && styles.disabledButton,
                ]}>
                <Text style={styles.sendText}>{isSending ? '...' : 'Send'}</Text>
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                onPress={() => void onUpdateStatus('pending')}
                style={[styles.actionButton, styles.pendingButton]}>
                <Text style={styles.actionText}>Pending</Text>
              </Pressable>
              <Pressable
                onPress={() => void onUpdateStatus('assigned')}
                style={[styles.actionButton, styles.assignedButton]}>
                <Text style={styles.actionText}>Assigned</Text>
              </Pressable>
              <Pressable
                onPress={() => void onUpdateStatus('resolved')}
                style={[styles.actionButton, styles.resolvedButton]}>
                <Text style={styles.actionText}>Resolved</Text>
              </Pressable>
              <Pressable
                onPress={() => void onUpdateStatus('escalated')}
                style={[styles.actionButton, styles.escalatedButton]}>
                <Text style={styles.actionText}>Escalate</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Select a conversation to begin.</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryValue: {
    color: '#1d4ed8',
    fontWeight: '800',
    fontSize: 18,
  },
  summaryLabel: {
    color: '#334155',
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterRow: {
    gap: 8,
    paddingRight: 6,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  filterChipText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#1d4ed8',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionHint: {
    fontSize: 12,
    color: '#64748b',
  },
  conversationCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  conversationCardActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  conversationPreview: {
    fontSize: 12,
    color: '#0f172a',
    lineHeight: 17,
  },
  conversationCustomer: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  conversationStatus: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  lastMessageTime: {
    fontSize: 11,
    color: '#64748b',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: 240,
  },
  activeMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  messageStack: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    gap: 8,
  },
  chatBubble: {
    maxWidth: '88%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chatBubbleAgent: {
    alignSelf: 'flex-end',
    backgroundColor: '#1d4ed8',
  },
  chatBubbleUser: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  chatText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatTextAgent: {
    color: '#ffffff',
  },
  chatTextUser: {
    color: '#0f172a',
  },
  chatMeta: {
    marginTop: 4,
    fontSize: 10,
  },
  chatMetaAgent: {
    color: '#dbeafe',
    textAlign: 'right',
  },
  chatMetaUser: {
    color: '#64748b',
  },
  composerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 9,
  },
  pendingButton: {
    backgroundColor: '#f59e0b',
  },
  assignedButton: {
    backgroundColor: '#2563eb',
  },
  resolvedButton: {
    backgroundColor: '#059669',
  },
  escalatedButton: {
    backgroundColor: '#be123c',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  errorText: {
    color: '#be123c',
    fontWeight: '600',
    fontSize: 12,
  },
});

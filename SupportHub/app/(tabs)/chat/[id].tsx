import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ListRenderItem,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import {
  getTicketMessages,
  getTickets,
  getMyTickets,
  sendMessage,
  updateTicketConfig,
  Message,
  normalizeMessage,
  type TicketStatus,
} from '@/services/ticket-service';
import { getSocket, joinTicket, leaveTicket } from '@/services/socket-service';
import { EscalationMemberModal } from '@/components/escalation-member-modal';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** One row per message id (first occurrence wins — keeps sort order from API). */
function dedupeMessagesById(list: Message[]): Message[] {
  const seen = new Set<string>();
  return list.filter((m) => {
    if (!m.id) return true;
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

function ticketHeaderCode(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-6);
  return tail ? tail.toUpperCase() : '—';
}

function dateSeparatorLabel(d: Date): string {
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMM d');
}

type ChatRow =
  | { kind: 'date'; key: string; date: Date }
  | { kind: 'msg'; key: string; message: Message };

function senderLabel(sender: Message['sender']): string {
  if (sender === 'agent') return 'You';
  if (sender === 'bot') return 'Assistant';
  return 'Customer';
}

function isTicketStatus(s: unknown): s is TicketStatus {
  return (
    s === 'pending' ||
    s === 'assigned' ||
    s === 'resolved' ||
    s === 'escalated' ||
    s === 'closed'
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketStatus, setTicketStatus] = useState<TicketStatus | null>(null);
  const [assignedToUserId, setAssignedToUserId] = useState<number | null>(null);
  const [escalationVisible, setEscalationVisible] = useState(false);
  const [statusBusy, setStatusBusy] = useState<'pending' | 'resolved' | null>(null);
  const [assigningMemberId, setAssigningMemberId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<ChatRow>>(null);

  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (id) {
      navigation.setOptions({ title: `Ticket #${ticketHeaderCode(id)}` });
    }
  }, [id, navigation]);

  const refreshTicketStatus = useCallback(async () => {
    if (!id || !user) return;
    try {
      const data = user.role === 'admin' ? await getTickets() : await getMyTickets();
      const t = data.find((x) => x.id === id);
      setTicketStatus(t?.status ?? null);
      setAssignedToUserId(t?.assignedTo ?? null);
    } catch (e) {
      console.error('Failed to load ticket status', e);
    }
  }, [id, user]);

  const isAdmin = String(user?.role ?? '').toLowerCase() === 'admin';
  const currentUserId = Number(user?.id);
  const isAssignedToAnotherAgent =
    assignedToUserId != null && Number.isFinite(currentUserId) && assignedToUserId !== currentUserId;

  /** Matches web Chat.jsx: lock when resolved or ticket is assigned to someone else (not merely `escalated`). */
  const composerLocked =
    ticketStatus === 'resolved' ||
    ticketStatus === 'closed' ||
    isAssignedToAnotherAgent;

  const updateTicketStatus = async (next: 'pending' | 'resolved') => {
    if (!id || statusBusy || composerLocked) return;
    setStatusBusy(next);
    try {
      await updateTicketConfig(id, { status: next });
      setTicketStatus(next);
    } catch {
      Alert.alert('Error', 'Could not update ticket status.');
    } finally {
      setStatusBusy(null);
    }
  };

  const assignEscalation = async (memberId: number) => {
    if (!id) return;
    setAssigningMemberId(memberId);
    try {
      await updateTicketConfig(id, { status: 'escalated', assignedTo: memberId });
      setTicketStatus('escalated');
      setAssignedToUserId(memberId);
      setEscalationVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to assign ticket.');
    } finally {
      setAssigningMemberId(null);
    }
  };

  useEffect(() => {
    void refreshTicketStatus();
  }, [refreshTicketStatus]);

  const rows = useMemo((): ChatRow[] => {
    const out: ChatRow[] = [];
    let prevDayKey: string | null = null;
    for (const m of messages) {
      const d = new Date(m.createdAt);
      const dayKey = format(d, 'yyyy-MM-dd');
      if (dayKey !== prevDayKey) {
        prevDayKey = dayKey;
        out.push({ kind: 'date', key: `sep-${dayKey}`, date: d });
      }
      const mid = m.id ? String(m.id) : `t-${m.createdAt}`;
      out.push({ kind: 'msg', key: `m-${mid}`, message: m });
    }
    return out;
  }, [messages]);

  useEffect(() => {
    if (!id || !user) return;

    const fetchMessages = async () => {
      try {
        const data = await getTicketMessages(id);
        setMessages(dedupeMessagesById(data));
        const list = user.role === 'admin' ? await getTickets() : await getMyTickets();
        const t = list.find((x) => x.id === id);
        setTicketStatus(t?.status ?? null);
        setAssignedToUserId(t?.assignedTo ?? null);
      } catch (e) {
        console.error('Failed to fetch messages', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = getSocket();
    joinTicket(id);

    const handleNewMessage = (payload: unknown) => {
      const msg = normalizeMessage(payload);
      if (!msg.id || msg.ticketId !== id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return dedupeMessagesById([...prev, msg]);
      });
    };

    const handleTicketStatus = (data: unknown) => {
      if (!data || typeof data !== 'object') return;
      const rec = data as { ticketId?: string; status?: unknown; assignedTo?: unknown };
      if (rec.ticketId !== id) return;
      if (isTicketStatus(rec.status)) setTicketStatus(rec.status);
      if ('assignedTo' in rec) {
        const raw = rec.assignedTo;
        if (raw === null || raw === undefined) setAssignedToUserId(null);
        else {
          const n = typeof raw === 'number' ? raw : Number(raw);
          setAssignedToUserId(Number.isInteger(n) ? n : null);
        }
      }
    };

    if (socket) {
      socket.on('chat:message', handleNewMessage);
      socket.on('chat:ticket_status', handleTicketStatus);
    }

    return () => {
      if (socket) {
        socket.off('chat:message', handleNewMessage);
        socket.off('chat:ticket_status', handleTicketStatus);
      }
      leaveTicket(id);
    };
  }, [id, user]);

  const handleSend = async () => {
    if (composerLocked || !inputText.trim() || !id) return;

    const textToSend = inputText.trim();
    setInputText('');

    const optimisticMsg: Message = {
      id: Date.now().toString(),
      ticketId: id,
      sender: 'agent',
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const realMsg = await sendMessage(id, textToSend);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticMsg.id);
        const withoutDup = withoutOptimistic.filter((m) => m.id !== realMsg.id);
        return dedupeMessagesById([...withoutDup, realMsg]);
      });
    } catch (e) {
      console.error('Message failed to send', e);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const renderItem: ListRenderItem<ChatRow> = ({ item }) => {
    if (item.kind === 'date') {
      return (
        <View style={styles.dateWrap}>
          <View style={[styles.datePill, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
            <Text style={[styles.datePillText, { color: c.textSecondary, fontFamily: Font.semibold }]}>
              {dateSeparatorLabel(item.date)}
            </Text>
          </View>
        </View>
      );
    }

    const msg = item.message;
    const isAgent = msg.sender === 'agent';
    const isBot = msg.sender === 'bot';

    let bubbleBg: string;
    let bubbleBorder: string;
    let textColor: string;
    let timeColor: string;
    let align: 'flex-end' | 'flex-start';

    if (isAgent) {
      bubbleBg = Palette.primary;
      bubbleBorder = 'transparent';
      textColor = '#ffffff';
      timeColor = 'rgba(255,255,255,0.75)';
      align = 'flex-end';
    } else if (isBot) {
      bubbleBg = `${Palette.info}14`;
      bubbleBorder = `${Palette.info}35`;
      textColor = c.text;
      timeColor = c.textSecondary;
      align = 'flex-start';
    } else {
      bubbleBg = c.surface;
      bubbleBorder = c.border;
      textColor = c.text;
      timeColor = c.textSecondary;
      align = 'flex-start';
    }

    return (
      <View style={[styles.bubbleRow, { alignSelf: align }]}>
        <View
          style={[
            styles.messageBubble,
            isAgent ? styles.bubbleTailAgent : isBot ? styles.bubbleTailBot : styles.bubbleTailUser,
            {
              backgroundColor: bubbleBg,
              borderColor: bubbleBorder,
            },
          ]}
        >
          {!isAgent && (
            <View style={styles.senderRow}>
              {isBot ? (
                <Feather name="cpu" size={12} color={Palette.info} style={styles.senderIcon} />
              ) : (
                <Feather name="user" size={12} color={c.textSecondary} style={styles.senderIcon} />
              )}
              <Text style={[styles.senderName, { color: isBot ? Palette.info : c.textSecondary, fontFamily: Font.semibold }]}>
                {senderLabel(msg.sender)}
              </Text>
            </View>
          )}
          <Text style={[styles.messageText, { color: textColor, fontFamily: Font.regular }]}>{msg.text}</Text>
          <View style={styles.timeRowInner}>
            <Text style={[styles.messageTime, { color: timeColor, fontFamily: Font.regular }]}>
              {format(new Date(msg.createdAt), 'HH:mm')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.chatCanvas }]}>
        <View style={[styles.loadingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={[styles.loadingText, { color: c.textSecondary, fontFamily: Font.medium }]}>
            Loading conversation…
          </Text>
        </View>
      </View>
    );
  }

  const canSend = !!inputText.trim() && !composerLocked;
  const kbOffset = Platform.OS === 'ios' ? 90 : 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.chatCanvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={kbOffset}
    >
      <FlatList<ChatRow>
        ref={flatListRef}
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={
          composerLocked ? (
            <View
              style={[
                styles.lockCard,
                {
                  backgroundColor: isAssignedToAnotherAgent ? '#0f172a' : '#0f172a',
                  borderColor: isAssignedToAnotherAgent ? '#334155' : '#334155',
                },
              ]}
            >
              <View style={styles.lockIconWrap}>
                <Feather name="alert-circle" size={16} color="#fff" />
              </View>
              <View style={styles.lockCardText}>
                <Text style={[styles.lockTitle, { fontFamily: Font.semibold }]}>
                  {isAssignedToAnotherAgent
                    ? 'This ticket has been handed off.'
                    : 'This chat has been closed.'}
                </Text>
                <Text style={[styles.lockSub, { fontFamily: Font.regular }]}>
                  {isAssignedToAnotherAgent
                    ? 'This ticket is assigned to another team member, so only that teammate can continue the live chat.'
                    : 'This ticket is resolved, so messaging and status changes are disabled for this conversation.'}
                </Text>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Spacing.lg + insets.bottom },
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyThread}>
            <View style={[styles.emptyThreadIcon, { backgroundColor: `${Palette.primary}12`, borderColor: `${Palette.primary}22` }]}>
              <Feather name="message-circle" size={28} color={Palette.primary} />
            </View>
            <Text style={[styles.emptyThreadTitle, { color: c.text, fontFamily: Font.semibold }]}>Start the thread</Text>
            <Text style={[styles.emptyThreadSub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              No messages yet. Say hello below — your reply goes to the customer in real time.
            </Text>
          </View>
        }
      />

      {!composerLocked ? (
        <View style={[styles.statusActions, { borderTopColor: c.border, backgroundColor: c.surface }]}>
          <TouchableOpacity
            style={[styles.statusBtn, { borderColor: c.border, backgroundColor: c.surface }]}
            onPress={() => void updateTicketStatus('pending')}
            disabled={statusBusy != null}
            activeOpacity={0.85}
          >
            {statusBusy === 'pending' ? (
              <ActivityIndicator size="small" color={c.text} />
            ) : (
              <Text style={[styles.statusBtnText, { color: c.text, fontFamily: Font.semibold }]}>Mark Pending</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusBtnResolved]}
            onPress={() => void updateTicketStatus('resolved')}
            disabled={statusBusy != null}
            activeOpacity={0.85}
          >
            {statusBusy === 'resolved' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.statusBtnText, { color: '#fff', fontFamily: Font.semibold }]}>Mark as Resolved</Text>
            )}
          </TouchableOpacity>
          {isAdmin ? (
            <TouchableOpacity
              style={[styles.statusBtnEscalate]}
              onPress={() => setEscalationVisible(true)}
              disabled={statusBusy != null || assigningMemberId != null}
              activeOpacity={0.85}
            >
              <Text style={[styles.statusBtnText, { color: '#fff', fontFamily: Font.semibold }]}>Escalate</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: c.surface,
            borderTopColor: c.border,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
          },
          Platform.select({
            ios: {
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            android: { elevation: 6 },
            default: {},
          }),
        ]}
      >
        <View
          style={[
            styles.inputInner,
            {
              backgroundColor: c.surfaceMuted,
              borderColor: c.border,
              opacity: composerLocked ? 0.55 : 1,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: c.text, fontFamily: Font.regular }]}
            placeholder={composerLocked ? 'This chat is closed.' : 'Type your reply…'}
            placeholderTextColor={c.icon}
            value={inputText}
            onChangeText={setInputText}
            editable={!composerLocked}
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: Palette.primary,
                opacity: canSend ? 1 : 0.38,
              },
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.88}
            accessibilityLabel="Send message"
          >
            <Feather name="send" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <EscalationMemberModal
        visible={escalationVisible}
        onClose={() => {
          if (assigningMemberId != null) return;
          setEscalationVisible(false);
        }}
        busyMemberId={assigningMemberId}
        onAssign={(memberId) => void assignEscalation(memberId)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingCard: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexGrow: 1,
    gap: Spacing.sm,
  },
  dateWrap: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  datePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  datePillText: {
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bubbleRow: {
    maxWidth: '88%',
    marginBottom: Spacing.xs,
  },
  messageBubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  bubbleTailAgent: {
    borderBottomRightRadius: 5,
  },
  bubbleTailUser: {
    borderBottomLeftRadius: 5,
  },
  bubbleTailBot: {
    borderBottomLeftRadius: 5,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderIcon: {
    marginRight: 5,
  },
  senderName: {
    fontSize: 11,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  timeRowInner: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  messageTime: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  emptyThread: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    minHeight: 280,
  },
  emptyThreadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyThreadTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  emptyThreadSub: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  lockCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  lockIconWrap: {
    marginTop: 2,
    padding: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  lockCardText: {
    flex: 1,
    minWidth: 0,
  },
  lockTitle: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  lockSub: {
    fontSize: 13,
    color: 'rgba(241,245,249,0.78)',
    lineHeight: 19,
    marginTop: Spacing.xs,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnResolved: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.success,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnEscalate: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.danger,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  inputShell: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 11 : 10,
    paddingBottom: Platform.OS === 'ios' ? 11 : 10,
    fontSize: 16,
    lineHeight: 22,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});

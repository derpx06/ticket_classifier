import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { getTicketMessages, sendMessage, Message, normalizeMessage } from '@/services/ticket-service';
import { getSocket, joinTicket, leaveTicket } from '@/services/socket-service';
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

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<ChatRow>>(null);

  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (id) {
      navigation.setOptions({ title: `Ticket #${ticketHeaderCode(id)}` });
    }
  }, [id, navigation]);

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
    if (!id) return;

    const fetchMessages = async () => {
      try {
        const data = await getTicketMessages(id);
        setMessages(dedupeMessagesById(data));
      } catch (e) {
        console.error('Failed to fetch messages', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = getSocket();
    joinTicket(id);

    if (socket) {
      const handleNewMessage = (payload: unknown) => {
        const msg = normalizeMessage(payload);
        if (!msg.id || msg.ticketId !== id) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return dedupeMessagesById([...prev, msg]);
        });
      };

      socket.on('chat:message', handleNewMessage);

      socket.on('chat:ticket_status', (data) => {
        console.log('Ticket status changed:', data);
      });

      return () => {
        socket.off('chat:message', handleNewMessage);
        leaveTicket(id);
      };
    }
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;

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

  const canSend = !!inputText.trim();
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
        <View style={[styles.inputInner, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
          <TextInput
            style={[styles.input, { color: c.text, fontFamily: Font.regular }]}
            placeholder="Write a reply…"
            placeholderTextColor={c.icon}
            value={inputText}
            onChangeText={setInputText}
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

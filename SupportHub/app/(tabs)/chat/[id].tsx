import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
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

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

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
        // Socket may have appended the same persisted message before HTTP returned.
        const withoutDup = withoutOptimistic.filter((m) => m.id !== realMsg.id);
        return dedupeMessagesById([...withoutDup, realMsg]);
      });
    } catch (e) {
      console.error('Message failed to send', e);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isAgent = item.sender === 'agent';

    return (
      <View
        style={[
          styles.messageBubble,
          isAgent ? styles.messageAgent : styles.messageUser,
          {
            backgroundColor: isAgent ? Palette.primary : c.surfaceMuted,
            alignSelf: isAgent ? 'flex-end' : 'flex-start',
            borderColor: isAgent ? 'transparent' : c.border,
          },
        ]}
      >
        {!isAgent && (
          <Text
            style={[
              styles.senderName,
              { color: c.textSecondary, fontFamily: Font.medium },
            ]}
          >
            {item.sender}
          </Text>
        )}
        <Text style={[styles.messageText, { color: isAgent ? '#fff' : c.text, fontFamily: Font.regular }]}>
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            {
              color: isAgent ? 'rgba(255,255,255,0.72)' : c.icon,
              fontFamily: Font.regular,
            },
          ]}
        >
          {format(new Date(item.createdAt), 'HH:mm')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={[styles.loadingText, { color: c.textSecondary, fontFamily: Font.regular }]}>
          Loading messages…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) =>
          item.id
            ? `${item.ticketId}-${item.id}`
            : `local-${item.createdAt}-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: c.surface,
            borderTopColor: c.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: c.text,
              backgroundColor: c.surfaceMuted,
              fontFamily: Font.regular,
            },
          ]}
          placeholder="Type a message…"
          placeholderTextColor={c.icon}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: Palette.primary, opacity: inputText.trim() ? 1 : 0.45 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.88}
        >
          <Feather name="send" size={20} color="#fff" />
        </TouchableOpacity>
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
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  messageAgent: {
    borderBottomRightRadius: Spacing.xs,
  },
  messageUser: {
    borderBottomLeftRadius: Spacing.xs,
  },
  senderName: {
    fontSize: 12,
    marginBottom: Spacing.xs,
    textTransform: 'capitalize',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
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

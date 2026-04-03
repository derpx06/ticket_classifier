import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getTickets, getMyTickets, formatTicketCardDetails, Ticket } from '@/services/ticket-service';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ticketShortId(id: string): string {
  return id.replace(/\s/g, '').slice(0, 8).toUpperCase() || '—';
}

export default function ChatListScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const fetchData = async () => {
    try {
      const data = user?.role === 'admin' ? await getTickets() : await getMyTickets();
      if (__DEV__) {
        console.log('[Chat list] tickets count', data.length);
        if (data[0]) console.log('[Chat list] sample ticket', JSON.stringify(data[0], null, 2));
      }
      setTickets(data);
    } catch (e) {
      console.error('Failed to fetch chat tickets:', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={[
        styles.chatCard,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
        },
      ]}
      onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${Palette.primary}14` }]}>
        <Feather name="message-circle" size={22} color={Palette.primary} />
      </View>
      <View style={styles.chatInfo}>
        <Text style={[styles.chatSubject, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={1}>
          {item.subject}
        </Text>
        <Text style={[styles.chatDesc, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={2}>
          #{ticketShortId(item.id)} · {item.status} · {formatTicketCardDetails(item)}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={c.icon} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        ListHeaderComponent={
          <Text style={[styles.listIntro, { color: c.textSecondary, fontFamily: Font.regular }]}>
            Open a thread to reply in real time
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: `${Palette.primary}12` }]}>
              <Feather name="message-square" size={32} color={Palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Font.semibold }]}>No conversations</Text>
            <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              Assigned tickets appear here. Pull to refresh.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  listIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  chatCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  chatInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  chatSubject: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  chatDesc: {
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'capitalize',
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { getTickets, getMyTickets, formatTicketCardDetails, Ticket, TicketStatus } from '@/services/ticket-service';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ticketShortId(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-6);
  return tail ? tail.toUpperCase() : '—';
}

function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function statusStyle(status: TicketStatus, isDark: boolean) {
  switch (status) {
    case 'escalated':
      return {
        bg: `${Palette.danger}18`,
        fg: Palette.danger,
        border: `${Palette.danger}35`,
        label: 'Escalated',
      };
    case 'resolved':
      return {
        bg: `${Palette.success}16`,
        fg: Palette.success,
        border: `${Palette.success}35`,
        label: 'Resolved',
      };
    case 'assigned':
      return {
        bg: `${Palette.primary}14`,
        fg: Palette.primary,
        border: `${Palette.primary}30`,
        label: 'In progress',
      };
    case 'closed':
      return {
        bg: isDark ? '#33415560' : '#f4f4f5',
        fg: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#475569' : '#e4e4e7',
        label: 'Closed',
      };
    case 'pending':
    default:
      return {
        bg: isDark ? '#33415580' : '#fef3c7',
        fg: isDark ? '#fcd34d' : '#b45309',
        border: isDark ? '#475569' : '#fde68a',
        label: 'Pending',
      };
  }
}

function elevatedCard(isDark: boolean): object {
  if (isDark) return {};
  return Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
    default: {},
  });
}

export default function ChatListScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const lift = elevatedCard(isDark);

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

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [tickets],
  );

  const renderItem = ({ item }: { item: Ticket }) => {
    const st = statusStyle(item.status, isDark);
    const details = formatTicketCardDetails(item);
    const rel = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true });

    return (
      <TouchableOpacity
        style={[styles.chatCard, { backgroundColor: c.surface, borderColor: c.border }, lift]}
        onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
        activeOpacity={0.72}
      >
        <View style={[styles.cardStripe, { backgroundColor: Palette.primary }]} />
        <View style={[styles.iconContainer, { backgroundColor: `${Palette.primary}16`, borderColor: `${Palette.primary}28` }]}>
          <Feather name="message-circle" size={22} color={Palette.primary} />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <Text style={[styles.chatId, { color: c.textSecondary, fontFamily: Font.semibold }]} numberOfLines={1}>
              #{ticketShortId(item.id)}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
              <Text style={[styles.statusPillText, { color: st.fg, fontFamily: Font.semibold }]}>{st.label}</Text>
            </View>
          </View>
          <Text style={[styles.chatSubject, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
            {item.subject}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
              <Feather name="layers" size={11} color={c.textSecondary} />
              <Text style={[styles.metaChipText, { color: c.textSecondary, fontFamily: Font.medium }]} numberOfLines={1}>
                {titleCaseWord(item.category)}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: `${Palette.warning}12`, borderColor: `${Palette.warning}30` }]}>
              <Feather name="flag" size={11} color={Palette.warning} />
              <Text style={[styles.metaChipText, { color: Palette.warning, fontFamily: Font.semibold }]} numberOfLines={1}>
                {titleCaseWord(item.priority)}
              </Text>
            </View>
          </View>
          {details ? (
            <Text style={[styles.detailLine, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={1}>
              {details}
            </Text>
          ) : null}
          <View style={[styles.timeRow, { borderTopColor: c.border }]}>
            <Feather name="clock" size={12} color={c.icon} />
            <Text style={[styles.timeText, { color: c.textSecondary, fontFamily: Font.medium }]}>{rel}</Text>
          </View>
        </View>
        <View style={[styles.chevronWrap, { backgroundColor: c.surfaceMuted }]}>
          <Feather name="chevron-right" size={20} color={Palette.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View style={[styles.introCard, { backgroundColor: c.surface, borderColor: c.border }, lift]}>
      <View style={[styles.introIcon, { backgroundColor: `${Palette.primary}14` }]}>
        <Feather name="zap" size={22} color={Palette.primary} />
      </View>
      <View style={styles.introCopy}>
        <Text style={[styles.introTitle, { color: c.text, fontFamily: Font.bold }]}>Live threads</Text>
        <Text style={[styles.introSub, { color: c.textSecondary, fontFamily: Font.regular }]}>
          Open a conversation to reply in real time. New messages sync instantly.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={sortedTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Spacing.xxxl * 2 + insets.bottom },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        ListHeaderComponent={
          <>
            <Text style={[styles.screenKicker, { color: c.textSecondary, fontFamily: Font.medium }]}>Chat</Text>
            <Text style={[styles.screenTitle, { color: c.text, fontFamily: Font.bold }]}>Messages</Text>
            {listHeader}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: `${Palette.primary}12`, borderColor: `${Palette.primary}22` }]}>
              <Feather name="message-square" size={34} color={Palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Font.semibold }]}>No conversations yet</Text>
            <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              Assigned tickets show up here. Pull down to refresh.
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
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  screenKicker: {
    fontSize: 12,
    letterSpacing: 0.85,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  screenTitle: {
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: Spacing.lg,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCopy: {
    flex: 1,
    minWidth: 0,
  },
  introTitle: {
    fontSize: 17,
    letterSpacing: -0.25,
    marginBottom: 6,
  },
  introSub: {
    fontSize: 14,
    lineHeight: 21,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardStripe: {
    width: 3,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    marginVertical: Spacing.md,
  },
  chatInfo: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    minWidth: 0,
  },
  chatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  chatId: {
    fontSize: 11,
    letterSpacing: 0.65,
    flex: 1,
    minWidth: 0,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 10,
    letterSpacing: 0.35,
  },
  chatSubject: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
  },
  metaChipText: {
    fontSize: 11,
    flexShrink: 1,
  },
  detailLine: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.sm,
    opacity: 0.95,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.xs,
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeText: {
    fontSize: 12,
  },
  chevronWrap: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
});

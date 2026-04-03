import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getTickets, acceptTicket, updateTicketConfig, Ticket } from '@/services/ticket-service';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function QueriesScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const fetchData = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (e) {
      console.error('Failed to fetch tickets:', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await acceptTicket(id);
      Alert.alert('Success', 'Ticket accepted');
      fetchData();
    } catch {
      Alert.alert('Error', 'Could not accept ticket');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Ticket['status']) => {
    try {
      await updateTicketConfig(id, { status: newStatus });
      fetchData();
    } catch {
      Alert.alert('Error', 'Could not update ticket status');
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.status.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Ticket }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.ticketIcon, { backgroundColor: `${Palette.primary}12` }]}>
          <Feather name="inbox" size={20} color={Palette.primary} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.subject, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
              {item.subject}
            </Text>
            <View style={[styles.badge, { backgroundColor: statusBg(item.status, colorScheme === 'dark') }]}>
              <Text style={[styles.badgeText, { color: statusFg(item.status, colorScheme === 'dark'), fontFamily: Font.semibold }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Feather
              name={priorityIcon(item.priority)}
              size={14}
              color={priorityColor(item.priority)}
            />
            <Text style={[styles.priority, { color: c.textSecondary, fontFamily: Font.medium }]}>
              {item.category} · {item.priority}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: c.border }]}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Palette.primary }]}
            onPress={() => handleAccept(item.id)}
            activeOpacity={0.88}
          >
            <Feather name="check" size={16} color="#fff" />
            <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Accept</Text>
          </TouchableOpacity>
        )}

        {item.status === 'assigned' && (
          <>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: Palette.success }]}
              onPress={() => handleStatusChange(item.id, 'resolved')}
              activeOpacity={0.88}
            >
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { borderColor: Palette.danger }]}
              onPress={() => handleStatusChange(item.id, 'escalated')}
              activeOpacity={0.88}
            >
              <Feather name="alert-triangle" size={16} color={Palette.danger} />
              <Text style={[styles.btnTextOutline, { color: Palette.danger, fontFamily: Font.semibold }]}>
                Escalate
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.searchWrap, { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }]}>
        <View style={[styles.searchInner, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
          <Feather name="search" size={18} color={c.icon} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: c.text, fontFamily: Font.regular }]}
            placeholder="Search by subject, status, category…"
            placeholderTextColor={c.icon}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="folder" size={40} color={c.icon} />
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Font.semibold }]}>No queries</Text>
            <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              Try adjusting your search or pull to refresh
            </Text>
          </View>
        }
      />
    </View>
  );
}

function statusBg(status: string, dark: boolean): string {
  switch (status) {
    case 'pending':
      return dark ? '#422006' : '#fef3c7';
    case 'assigned':
      return dark ? '#1e3a5f' : '#dbeafe';
    case 'resolved':
      return dark ? '#14532d' : '#d1fae5';
    case 'escalated':
      return dark ? '#450a0a' : '#fee2e2';
    default:
      return dark ? '#334155' : '#e2e8f0';
  }
}

function statusFg(status: string, dark: boolean): string {
  switch (status) {
    case 'pending':
      return dark ? '#fcd34d' : '#b45309';
    case 'assigned':
      return dark ? '#93c5fd' : '#1d4ed8';
    case 'resolved':
      return dark ? '#86efac' : '#047857';
    case 'escalated':
      return dark ? '#fca5a5' : '#b91c1c';
    default:
      return dark ? '#e2e8f0' : '#475569';
  }
}

function priorityIcon(p: string): keyof typeof Feather.glyphMap {
  switch (p) {
    case 'high':
      return 'trending-up';
    case 'low':
      return 'minus-circle';
    default:
      return 'activity';
  }
}

function priorityColor(p: string): string {
  switch (p) {
    case 'high':
      return Palette.danger;
    case 'low':
      return Palette.success;
    default:
      return Palette.warning;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {},
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  ticketIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subject: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priority: {
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
  },
  btnTextOutline: {
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: Spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

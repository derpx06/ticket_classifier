import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import {
  getTickets,
  acceptTicket,
  updateTicketConfig,
  formatTicketCardDetails,
  Ticket,
} from '@/services/ticket-service';
import { TicketDetailsModal } from '@/components/ticket-details-modal';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ticketCode(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-6);
  return tail ? `#TK-${tail.toUpperCase()}` : '#TK-XXXX';
}

function statusTheme(status: string, dark: boolean) {
  switch (status) {
    case 'pending':
      return {
        chipBg: dark ? '#4b2e07' : '#fef3c7',
        chipFg: dark ? '#fcd34d' : '#b45309',
      };
    case 'assigned':
      return {
        chipBg: dark ? '#1e3a5f' : '#dbeafe',
        chipFg: dark ? '#93c5fd' : '#1d4ed8',
      };
    case 'resolved':
      return {
        chipBg: dark ? '#14532d' : '#dcfce7',
        chipFg: dark ? '#86efac' : '#166534',
      };
    case 'escalated':
      return {
        chipBg: dark ? '#451a03' : '#fee2e2',
        chipFg: dark ? '#fca5a5' : '#b91c1c',
      };
    case 'closed':
      return {
        chipBg: dark ? '#374151' : '#e2e8f0',
        chipFg: dark ? '#cbd5e1' : '#475569',
      };
    default:
      return {
        chipBg: dark ? '#374151' : '#e2e8f0',
        chipFg: dark ? '#cbd5e1' : '#475569',
      };
  }
}

function urgencyCopy(status: Ticket['status']) {
  switch (status) {
    case 'escalated':
      return 'Escalated';
    case 'assigned':
      return 'Assigned';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Pending';
  }
}

function isTerminalStatus(status: Ticket['status']): boolean {
  return status === 'resolved' || status === 'escalated' || status === 'closed';
}

export default function QueriesScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];

  const fetchData = async () => {
    try {
      const data = await getTickets();
      if (__DEV__) {
        console.log('[Queries] tickets count', data.length);
        if (data[0]) console.log('[Queries] sample ticket', JSON.stringify(data[0], null, 2));
      }
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

  const openTicketDetails = (item: Ticket) => setDetailTicket(item);

  const modalAccept = async (id: string) => {
    await acceptTicket(id);
    fetchData();
  };

  const modalReject = async (id: string) => {
    await updateTicketConfig(id, { status: 'escalated' });
    fetchData();
  };

  const modalResolve = async (id: string) => {
    await updateTicketConfig(id, { status: 'resolved' });
    fetchData();
  };

  const modalEscalate = async (id: string) => {
    await updateTicketConfig(id, { status: 'escalated' });
    fetchData();
  };

  const filteredTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.status.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [tickets, search],
  );

  const activeHighPriority = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (t.priority === 'high' || t.priority === 'critical') &&
          t.status !== 'resolved' &&
          t.status !== 'closed',
      ).length,
    [tickets],
  );

  const renderHeader = () => (
    <View>
      <View style={[styles.searchWrap, { marginBottom: Spacing.lg }]}> 
        <View style={[styles.searchInner, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}> 
          <Feather name="search" size={18} color={c.icon} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: c.text, fontFamily: Font.regular }]}
            placeholder="Search across all active tickets..."
            placeholderTextColor={c.icon}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#1d4e89' : '#2b5fb5',
          },
        ]}
      >
        <Text style={[styles.heroGreeting, { fontFamily: Font.medium }]}>Morning, Specialist</Text>
        <Text style={[styles.heroTitle, { fontFamily: Font.bold }]}> 
          You have {activeHighPriority} priority queries waiting for resolution.
        </Text>
        <TouchableOpacity
          style={[styles.heroButton, { backgroundColor: '#e8f0ff' }]}
          activeOpacity={0.85}
          onPress={() => {}}
        >
          <Text style={[styles.heroButtonText, { fontFamily: Font.semibold }]}>Review Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Ticket }) => {
    const status = statusTheme(item.status, isDark);
    const ago = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: false });
    const detailsLine = formatTicketCardDetails(item);

    return (
      <View
        style={[
          styles.ticketCard,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
          },
        ]}
      >
        <View style={styles.ticketMetaRow}>
          <View style={[styles.chip, { backgroundColor: status.chipBg }]}>
            <Text style={[styles.chipText, { color: status.chipFg, fontFamily: Font.semibold }]}>{urgencyCopy(item.status)}</Text>
          </View>
          <Text style={[styles.metaText, { color: c.textSecondary, fontFamily: Font.medium }]}> 
            {ticketCode(item.id)} • {ago} ago
          </Text>
        </View>

        <Text
          style={[
            styles.ticketTitle,
            { color: c.text, fontFamily: Font.bold },
            !detailsLine ? { marginBottom: Spacing.lg } : null,
          ]}
          numberOfLines={4}
        >
          {item.subject}
        </Text>

        {detailsLine ? (
          <Text style={[styles.ticketDetails, { color: c.textSecondary, fontFamily: Font.medium }]} numberOfLines={2}>
            {detailsLine}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: isDark ? '#1d4ed8' : '#1d4ed8' }]}
                onPress={() => handleAccept(item.id)}
                activeOpacity={0.9}
              >
                <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}
                onPress={() => openTicketDetails(item)}
                activeOpacity={0.9}
              >
                <Text style={[styles.btnTextSecondary, { color: c.text, fontFamily: Font.semibold }]}>View Details</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'assigned' && (
            <View style={styles.actionsCol}>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#1d4ed8' }]}
                  onPress={() => handleStatusChange(item.id, 'resolved')}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Resolve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#dc2626' }]}
                  onPress={() => handleStatusChange(item.id, 'escalated')}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Escalate</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnSecondary,
                  styles.btnFullWidth,
                  { backgroundColor: c.surfaceMuted, borderColor: c.border, marginTop: Spacing.sm },
                ]}
                onPress={() => openTicketDetails(item)}
                activeOpacity={0.9}
              >
                <Text style={[styles.btnTextSecondary, { color: c.text, fontFamily: Font.semibold }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {isTerminalStatus(item.status) && (
            <View style={styles.actionsCol}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnSecondary,
                  styles.btnFullWidth,
                  { backgroundColor: c.surfaceMuted, borderColor: c.border },
                ]}
                onPress={() => openTicketDetails(item)}
                activeOpacity={0.9}
              >
                <Text style={[styles.btnTextSecondary, { color: c.text, fontFamily: Font.semibold }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TicketDetailsModal
        ticket={detailTicket}
        visible={detailTicket != null}
        onClose={() => setDetailTicket(null)}
        onAccept={modalAccept}
        onReject={modalReject}
        onResolve={modalResolve}
        onEscalate={modalEscalate}
      />
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  searchWrap: {},
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 46,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.sm,
  },
  heroCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroGreeting: {
    color: '#dbeafe',
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: Spacing.lg,
  },
  heroButton: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  heroButtonText: {
    color: '#1d4ed8',
    fontSize: 13,
  },
  ticketCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  ticketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  metaText: {
    fontSize: 11,
  },
  ticketTitle: {
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  ticketDetails: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionsCol: {
    width: '100%',
  },
  btnFullWidth: {
    alignSelf: 'stretch',
    minWidth: undefined,
    width: '100%',
  },
  btn: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 108,
  },
  btnSecondary: {
    borderWidth: 1,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
  },
  btnTextSecondary: {
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl * 1.5,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

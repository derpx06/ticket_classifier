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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { getTickets, acceptTicket, updateTicketConfig, Ticket, TicketPriority, TicketStatus } from '@/services/ticket-service';
import { TicketDetailsModal } from '@/components/ticket-details-modal';
import { Spacing, Radius, Palette, Layout } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

const OUTER_BG = '#2f3036';
const CARD_SHEET = '#f1f5f9';
const CARD_INNER = '#ffffff';
const BRAND_NAVY = '#1e3a5f';
const BRAND_BLUE = '#2563eb';

type FilterFacet = 'status' | 'priority' | 'category';

function ticketCode(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-4);
  return tail ? `NX-${tail.toUpperCase()}` : 'NX-XXXX';
}

function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function statusAccent(status: Ticket['status']) {
  switch (status) {
    case 'escalated':
      return { accent: '#9f1239', badgeBg: '#9f1239', badgeFg: '#ffffff', label: 'ESCALATED' };
    case 'resolved':
      return { accent: '#4ade80', badgeBg: '#22c55e', badgeFg: '#ffffff', label: 'RESOLVED' };
    case 'assigned':
      return { accent: '#38bdf8', badgeBg: '#e5e7eb', badgeFg: '#374151', label: 'IN PROGRESS' };
    case 'closed':
      return { accent: '#94a3b8', badgeBg: '#64748b', badgeFg: '#ffffff', label: 'CLOSED' };
    case 'pending':
    default:
      return { accent: '#f59e0b', badgeBg: '#fef3c7', badgeFg: '#92400e', label: 'PENDING' };
  }
}

function isTerminalStatus(status: Ticket['status']): boolean {
  return status === 'resolved' || status === 'escalated' || status === 'closed';
}

const STATUS_OPTIONS: (TicketStatus | 'all')[] = ['all', 'pending', 'assigned', 'resolved', 'escalated'];
const PRIORITY_OPTIONS: (TicketPriority | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];

export default function QueriesScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [facet, setFacet] = useState<FilterFacet>('status');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((t) => {
      const raw = t.category?.trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!map.has(key)) map.set(key, raw);
    });
    return ['all', ...Array.from(map.values()).sort((a, b) => a.localeCompare(b))];
  }, [tickets]);

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

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tickets.filter((t) => {
      if (q) {
        const hay = `${t.subject} ${t.status} ${t.category} ${t.customerName ?? ''} ${t.assignedRoleName ?? ''} ${t.urgency ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all') {
        const cat = t.category?.trim().toLowerCase() ?? '';
        if (cat !== categoryFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

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

  const facetChipStyle = (active: boolean) => ({
    backgroundColor: active ? '#dbeafe' : '#e5e7eb',
    borderColor: active ? BRAND_BLUE : 'transparent',
  });
  const facetChipText = (active: boolean) => ({
    color: active ? '#1e40af' : '#475569',
  });

  const renderFacetValuePills = () => {
    if (facet === 'status') {
      return (
        <View style={styles.valuePillRow}>
          {STATUS_OPTIONS.map((opt) => {
            const active = statusFilter === opt;
            const label = opt === 'all' ? 'All' : titleCaseWord(opt);
            return (
              <TouchableOpacity
                key={String(opt)}
                onPress={() => setStatusFilter(opt)}
                style={[styles.valuePill, active ? styles.valuePillOn : styles.valuePillOff]}
                activeOpacity={0.85}
              >
                <Text style={[styles.valuePillText, { color: active ? '#fff' : '#475569', fontFamily: Font.semibold }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    if (facet === 'priority') {
      return (
        <View style={styles.valuePillRow}>
          {PRIORITY_OPTIONS.map((opt) => {
            const active = priorityFilter === opt;
            const label = opt === 'all' ? 'All' : titleCaseWord(opt);
            return (
              <TouchableOpacity
                key={String(opt)}
                onPress={() => setPriorityFilter(opt)}
                style={[styles.valuePill, active ? styles.valuePillOn : styles.valuePillOff]}
                activeOpacity={0.85}
              >
                <Text style={[styles.valuePillText, { color: active ? '#fff' : '#475569', fontFamily: Font.semibold }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    return (
      <View style={styles.valuePillRow}>
        {categoryOptions.map((opt) => {
          const active = categoryFilter === opt;
          const label = opt === 'all' ? 'All' : titleCaseWord(opt);
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setCategoryFilter(opt)}
              style={[styles.valuePill, active ? styles.valuePillOn : styles.valuePillOff]}
              activeOpacity={0.85}
            >
              <Text style={[styles.valuePillText, { color: active ? '#fff' : '#475569', fontFamily: Font.semibold }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <View style={styles.logoDot} />
          <View style={styles.logoDot} />
          <View style={styles.logoDot} />
        </View>
        <Text style={[styles.brandName, { fontFamily: Font.bold }]}>Support Hub</Text>
        <TouchableOpacity style={styles.bellBtn} hitSlop={12} activeOpacity={0.7}>
          <Feather name="bell" size={20} color={BRAND_NAVY} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.pageTitle, { fontFamily: Font.bold }]}>Queries</Text>
      {activeHighPriority > 0 ? (
        <Text style={[styles.pageSub, { fontFamily: Font.medium }]}>
          {activeHighPriority} high-priority {activeHighPriority === 1 ? 'query' : 'queries'} need attention
        </Text>
      ) : null}

      <View style={styles.searchInner}>
        <Feather name="search" size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { fontFamily: Font.regular }]}
          placeholder="Search ticket archives..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.facetRow}>
        <TouchableOpacity
          style={[styles.facetChip, facetChipStyle(facet === 'status')]}
          onPress={() => setFacet('status')}
          activeOpacity={0.85}
        >
          <Feather name="filter" size={14} color={facet === 'status' ? '#1e40af' : '#64748b'} style={styles.facetIcon} />
          <Text style={[styles.facetChipText, facetChipText(facet === 'status'), { fontFamily: Font.semibold }]}>
            Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.facetChip, facetChipStyle(facet === 'priority')]}
          onPress={() => setFacet('priority')}
          activeOpacity={0.85}
        >
          <Text style={[styles.facetChipText, facetChipText(facet === 'priority'), { fontFamily: Font.semibold }]}>
            Priority
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.facetChip, facetChipStyle(facet === 'category')]}
          onPress={() => setFacet('category')}
          activeOpacity={0.85}
        >
          <Text style={[styles.facetChipText, facetChipText(facet === 'category'), { fontFamily: Font.semibold }]}>
            Category
          </Text>
        </TouchableOpacity>
      </View>

      {renderFacetValuePills()}
    </View>
  );

  const renderItem = ({ item }: { item: Ticket }) => {
    const vis = statusAccent(item.status);
    const ago = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: false });
    const customerLabel = item.customerName?.trim() || 'AI Chat User';
    const metaMuted = '#64748b';

    const metaPills = (
      <View style={styles.metaPillRow}>
        <View style={[styles.metaPill, { backgroundColor: '#f1f5f9' }]}>
          <Text style={[styles.metaPillText, { color: '#475569', fontFamily: Font.semibold }]} numberOfLines={1}>
            {customerLabel}
          </Text>
        </View>
        <View style={[styles.metaPill, { backgroundColor: '#ede9fe' }]}>
          <Text style={[styles.metaPillText, { color: '#5b21b6', fontFamily: Font.semibold }]}>
            {titleCaseWord(item.category)}
          </Text>
        </View>
        <View style={[styles.metaPill, { backgroundColor: '#ffedd5' }]}>
          <Text style={[styles.metaPillText, { color: '#c2410c', fontFamily: Font.semibold }]}>
            {titleCaseWord(item.priority)}
          </Text>
        </View>
        {item.urgency ? (
          <View style={[styles.metaPill, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.metaPillText, { color: '#b91c1c', fontFamily: Font.semibold }]}>
              Urgency {titleCaseWord(item.urgency)}
            </Text>
          </View>
        ) : null}
        {item.assignedRoleName?.trim() ? (
          <View style={[styles.metaPill, { backgroundColor: '#e0f2fe' }]}>
            <Text
              style={[styles.metaPillText, { color: '#0369a1', fontFamily: Font.semibold }]}
              numberOfLines={1}
            >
              {item.assignedRoleName.trim()}
            </Text>
          </View>
        ) : null}
      </View>
    );

    return (
      <View
        style={[
          styles.ticketCard,
          {
            backgroundColor: CARD_INNER,
            borderColor: '#e2e8f0',
          },
        ]}
      >
        <View style={[styles.accentBar, { backgroundColor: vis.accent }]} />

        <View style={styles.ticketCardBody}>
          <View style={styles.ticketTopRow}>
            <Text style={[styles.ticketId, { fontFamily: Font.semibold }]}>{ticketCode(item.id)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: vis.badgeBg }]}>
              <Text style={[styles.statusBadgeText, { color: vis.badgeFg, fontFamily: Font.bold }]}>{vis.label}</Text>
            </View>
          </View>

          <Text style={[styles.ticketSubjectTitle, { color: '#0f172a', fontFamily: Font.bold }]} numberOfLines={2}>
            {item.subject}
          </Text>

          {metaPills}

          <View style={styles.ticketFooter}>
            <Text style={[styles.updatedLabel, { color: metaMuted, fontFamily: Font.medium }]}>
              Updated {ago} ago
            </Text>
          </View>

          <View style={styles.actions}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: BRAND_BLUE }]}
                  onPress={() => handleAccept(item.id)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}
                  onPress={() => openTicketDetails(item)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnTextSecondary, { color: '#0f172a', fontFamily: Font.semibold }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === 'assigned' && (
              <View style={styles.actionsCol}>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: BRAND_BLUE }]}
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
                    { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', marginTop: Spacing.sm },
                  ]}
                  onPress={() => openTicketDetails(item)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnTextSecondary, { color: '#0f172a', fontFamily: Font.semibold }]}>
                    View Details
                  </Text>
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
                    { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                  ]}
                  onPress={() => openTicketDetails(item)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnTextSecondary, { color: '#0f172a', fontFamily: Font.semibold }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  /* Light Support Hub shell; honor dark mode only for refresh tint */
  const refreshTint = isDark ? Palette.primary : BRAND_BLUE;

  return (
    <View style={[styles.outer, { paddingTop: insets.top, backgroundColor: OUTER_BG }]}>
      <TicketDetailsModal
        ticket={detailTicket}
        visible={detailTicket != null}
        onClose={() => setDetailTicket(null)}
        onAccept={modalAccept}
        onReject={modalReject}
        onResolve={modalResolve}
        onEscalate={modalEscalate}
      />

      <View style={[styles.sheet, { maxWidth: Layout.maxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: Spacing.xxxl + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={refreshTint} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="folder" size={40} color="#94a3b8" />
              <Text style={[styles.emptyTitle, { fontFamily: Font.semibold }]}>No queries</Text>
              <Text style={[styles.emptySub, { fontFamily: Font.regular }]}>
                Try adjusting search or filters, or pull to refresh
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginBottom: 0,
    marginTop: Spacing.sm,
    backgroundColor: CARD_SHEET,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BRAND_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginRight: Spacing.sm,
  },
  logoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  brandName: {
    flex: 1,
    fontSize: 16,
    color: BRAND_NAVY,
    letterSpacing: -0.3,
  },
  bellBtn: {
    padding: Spacing.xs,
  },
  pageTitle: {
    fontSize: 28,
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  pageSub: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: Spacing.md,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: Spacing.md,
    minHeight: 46,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: Spacing.sm,
  },
  facetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  facetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  facetIcon: {
    marginRight: 6,
  },
  facetChipText: {
    fontSize: 13,
  },
  valuePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  valuePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  valuePillOn: {
    backgroundColor: BRAND_BLUE,
    borderColor: BRAND_BLUE,
  },
  valuePillOff: {
    backgroundColor: '#ffffff',
  },
  valuePillText: {
    fontSize: 11,
  },
  ticketCard: {
    borderRadius: 0,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  accentBar: {
    width: 5,
    alignSelf: 'stretch',
  },
  ticketCardBody: {
    flex: 1,
    padding: Spacing.lg,
    paddingLeft: Spacing.md,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  ticketId: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flex: 1,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    letterSpacing: 0.6,
  },
  ticketSubjectTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: Spacing.md,
  },
  metaPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metaPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  metaPillText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  ticketFooter: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  updatedLabel: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
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
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: '#64748b',
  },
});

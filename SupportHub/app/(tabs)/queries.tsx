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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import {
  getTickets,
  acceptTicket,
  updateTicketConfig,
  formatTicketCardDetails,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '@/services/ticket-service';
import { TicketDetailsModal } from '@/components/ticket-details-modal';
import { Spacing, Radius, Palette, Colors } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

type FilterFacet = 'status' | 'priority' | 'category';

function ticketCode(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-6);
  return tail ? tail.toUpperCase() : '—';
}

function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function isTerminalStatus(status: Ticket['status']): boolean {
  return status === 'resolved' || status === 'escalated' || status === 'closed';
}

function cardElevation(isDark: boolean): object {
  if (isDark) return { elevation: 0 };
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

function statusPresentation(status: Ticket['status'], isDark: boolean) {
  const s = status;
  if (s === 'escalated') {
    return {
      stripe: Palette.danger,
      label: 'Escalated',
      pillBg: isDark ? `${Palette.danger}28` : `${Palette.danger}12`,
      pillFg: isDark ? '#fecaca' : Palette.danger,
      pillBorder: `${Palette.danger}45`,
    };
  }
  if (s === 'resolved') {
    return {
      stripe: Palette.success,
      label: 'Resolved',
      pillBg: isDark ? `${Palette.success}28` : `${Palette.success}12`,
      pillFg: isDark ? '#a7f3d0' : Palette.success,
      pillBorder: `${Palette.success}40`,
    };
  }
  if (s === 'closed') {
    return {
      stripe: isDark ? '#64748b' : '#94a3b8',
      label: 'Closed',
      pillBg: isDark ? '#334155' : '#f4f4f5',
      pillFg: isDark ? '#cbd5e1' : '#64748b',
      pillBorder: isDark ? '#475569' : '#e4e4e7',
    };
  }
  if (s === 'assigned') {
    return {
      stripe: Palette.primary,
      label: 'In progress',
      pillBg: isDark ? `${Palette.primary}30` : `${Palette.primary}12`,
      pillFg: isDark ? '#93c5fd' : Palette.primary,
      pillBorder: `${Palette.primary}40`,
    };
  }
  return {
    stripe: Palette.warning,
    label: 'Pending',
    pillBg: isDark ? `${Palette.warning}30` : `${Palette.warning}14`,
    pillFg: isDark ? '#fcd34d' : '#b45309',
    pillBorder: `${Palette.warning}45`,
  };
}

function priorityDotColor(p: TicketPriority): string {
  if (p === 'critical') return Palette.danger;
  if (p === 'high') return Palette.warning;
  if (p === 'medium') return Palette.info;
  return '#64748b';
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
  const c = Colors[colorScheme ?? 'light'];
  const lift = cardElevation(isDark);

  const fetchData = useCallback(async () => {
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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

  const handleStatusChange = async (id: string, newStatus: Ticket['status']) => {
    try {
      await updateTicketConfig(id, { status: newStatus });
      void fetchData();
    } catch {
      Alert.alert('Error', 'Could not update ticket status');
    }
  };

  const openTicketDetails = (item: Ticket) => setDetailTicket(item);

  const modalAccept = async (id: string) => {
    await acceptTicket(id);
    void fetchData();
  };

  const modalReject = async (id: string) => {
    await updateTicketConfig(id, { status: 'escalated' });
    void fetchData();
  };

  const modalResolve = async (id: string) => {
    await updateTicketConfig(id, { status: 'resolved' });
    void fetchData();
  };

  const modalEscalate = async (id: string) => {
    await updateTicketConfig(id, { status: 'escalated' });
    void fetchData();
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

  const renderFacetValuePills = () => {
    const row = (children: React.ReactNode) => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.valuePillScroll}
        style={styles.valuePillScrollView}
      >
        {children}
      </ScrollView>
    );

    if (facet === 'status') {
      return row(
        STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt;
          const label = opt === 'all' ? 'All' : titleCaseWord(opt);
          return (
            <TouchableOpacity
              key={String(opt)}
              onPress={() => setStatusFilter(opt)}
              style={[
                styles.valuePill,
                {
                  backgroundColor: active ? Palette.primary : c.surface,
                  borderColor: active ? Palette.primary : c.border,
                },
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.valuePillText,
                  { color: active ? '#ffffff' : c.textSecondary, fontFamily: Font.semibold },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }),
      );
    }
    if (facet === 'priority') {
      return row(
        PRIORITY_OPTIONS.map((opt) => {
          const active = priorityFilter === opt;
          const label = opt === 'all' ? 'All' : titleCaseWord(opt);
          return (
            <TouchableOpacity
              key={String(opt)}
              onPress={() => setPriorityFilter(opt)}
              style={[
                styles.valuePill,
                {
                  backgroundColor: active ? Palette.primary : c.surface,
                  borderColor: active ? Palette.primary : c.border,
                },
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.valuePillText,
                  { color: active ? '#ffffff' : c.textSecondary, fontFamily: Font.semibold },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }),
      );
    }
    return row(
      categoryOptions.map((opt) => {
        const active = categoryFilter === opt;
        const label = opt === 'all' ? 'All' : titleCaseWord(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => setCategoryFilter(opt)}
            style={[
              styles.valuePill,
              {
                backgroundColor: active ? Palette.primary : c.surface,
                borderColor: active ? Palette.primary : c.border,
              },
            ]}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.valuePillText,
                { color: active ? '#ffffff' : c.textSecondary, fontFamily: Font.semibold },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      }),
    );
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.titleRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.pageTitle, { color: c.text, fontFamily: Font.bold }]}>Queries</Text>
          <Text style={[styles.pageHint, { color: c.textSecondary, fontFamily: Font.regular }]}>
            Search and filter your queue
          </Text>
        </View>
        <View style={[styles.countPill, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
          <Text style={[styles.countPillText, { color: c.textSecondary, fontFamily: Font.semibold }]}>
            {filteredTickets.length}
          </Text>
          <Text style={[styles.countPillSuffix, { color: c.textSecondary, fontFamily: Font.medium }]}>
            {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
          </Text>
        </View>
      </View>

      {activeHighPriority > 0 ? (
        <View style={[styles.alertStrip, { backgroundColor: `${Palette.danger}12`, borderColor: `${Palette.danger}35` }]}>
          <Feather name="alert-circle" size={16} color={Palette.danger} />
          <Text style={[styles.alertStripText, { color: isDark ? '#fecaca' : '#991b1b', fontFamily: Font.medium }]}>
            {activeHighPriority} high-priority {activeHighPriority === 1 ? 'item needs' : 'items need'} attention
          </Text>
        </View>
      ) : null}

      <View style={[styles.searchInner, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Feather name="search" size={18} color={c.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: c.text, fontFamily: Font.regular }]}
          placeholder="Search subject, customer, category…"
          placeholderTextColor={c.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={12} accessibilityLabel="Clear search">
            <Feather name="x-circle" size={20} color={c.icon} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.filterLabel, { color: c.textSecondary, fontFamily: Font.semibold }]}>Filter by</Text>
      <View style={styles.facetRow}>
        <TouchableOpacity
          style={[
            styles.facetChip,
            {
              backgroundColor: facet === 'status' ? `${Palette.primary}14` : c.surface,
              borderColor: facet === 'status' ? `${Palette.primary}45` : c.border,
            },
          ]}
          onPress={() => setFacet('status')}
          activeOpacity={0.85}
        >
          <Feather name="git-branch" size={15} color={facet === 'status' ? Palette.primary : c.icon} />
          <Text
            style={[
              styles.facetChipText,
              { color: facet === 'status' ? Palette.primary : c.text, fontFamily: Font.semibold },
            ]}
          >
            Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.facetChip,
            {
              backgroundColor: facet === 'priority' ? `${Palette.primary}14` : c.surface,
              borderColor: facet === 'priority' ? `${Palette.primary}45` : c.border,
            },
          ]}
          onPress={() => setFacet('priority')}
          activeOpacity={0.85}
        >
          <Feather name="flag" size={15} color={facet === 'priority' ? Palette.primary : c.icon} />
          <Text
            style={[
              styles.facetChipText,
              { color: facet === 'priority' ? Palette.primary : c.text, fontFamily: Font.semibold },
            ]}
          >
            Priority
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.facetChip,
            {
              backgroundColor: facet === 'category' ? `${Palette.primary}14` : c.surface,
              borderColor: facet === 'category' ? `${Palette.primary}45` : c.border,
            },
          ]}
          onPress={() => setFacet('category')}
          activeOpacity={0.85}
        >
          <Feather name="layers" size={15} color={facet === 'category' ? Palette.primary : c.icon} />
          <Text
            style={[
              styles.facetChipText,
              { color: facet === 'category' ? Palette.primary : c.text, fontFamily: Font.semibold },
            ]}
          >
            Category
          </Text>
        </TouchableOpacity>
      </View>

      {renderFacetValuePills()}

      <View style={[styles.listRule, { backgroundColor: c.border }]} />
    </View>
  );

  const renderItem = ({ item }: { item: Ticket }) => {
    const vis = statusPresentation(item.status, isDark);
    const updated = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true });
    const details = formatTicketCardDetails(item);
    const pDot = priorityDotColor(item.priority);

    return (
      <View
        style={[
          styles.ticketCard,
          { backgroundColor: c.surface, borderColor: c.border },
          lift,
        ]}
      >
        <View style={[styles.accentBar, { backgroundColor: vis.stripe }]} />

        <View style={styles.ticketCardBody}>
          <View style={styles.ticketTopRow}>
            <View style={styles.ticketIdRow}>
              <Text style={[styles.ticketKicker, { color: c.textSecondary, fontFamily: Font.medium }]}>Ticket</Text>
              <Text style={[styles.ticketId, { color: c.text, fontFamily: Font.bold }]} numberOfLines={1}>
                #{ticketCode(item.id)}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: vis.pillBg, borderColor: vis.pillBorder }]}>
              <Text style={[styles.statusPillText, { color: vis.pillFg, fontFamily: Font.semibold }]}>{vis.label}</Text>
            </View>
          </View>

          <View style={styles.subjectRow}>
            <View style={[styles.priorityDot, { backgroundColor: pDot }]} />
            <Text style={[styles.ticketSubjectTitle, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
              {item.subject}
            </Text>
          </View>

          {details ? (
            <Text style={[styles.metaLine, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={2}>
              {details}
            </Text>
          ) : null}

          <View style={[styles.ticketFooter, { borderTopColor: c.border }]}>
            <Feather name="clock" size={14} color={c.icon} />
            <Text style={[styles.updatedLabel, { color: c.textSecondary, fontFamily: Font.medium }]}>{updated}</Text>
          </View>

          <View style={styles.actions}>
            {item.status === 'pending' && (
              <TouchableOpacity
                style={[styles.ctaRow, { backgroundColor: c.surfaceMuted, borderColor: `${Palette.primary}40` }]}
                onPress={() => openTicketDetails(item)}
                activeOpacity={0.72}
              >
                <View style={[styles.ctaIcon, { backgroundColor: `${Palette.primary}16` }]}>
                  <Feather name="inbox" size={20} color={Palette.primary} />
                </View>
                <View style={styles.ctaTextCol}>
                  <Text style={[styles.ctaTitle, { color: c.text, fontFamily: Font.semibold }]}>Review ticket</Text>
                  <Text style={[styles.ctaHint, { color: c.textSecondary, fontFamily: Font.regular }]}>
                    Accept or hand off
                  </Text>
                </View>
                <View style={[styles.ctaChevron, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Feather name="chevron-right" size={18} color={c.icon} />
                </View>
              </TouchableOpacity>
            )}

            {item.status === 'assigned' && (
              <View style={styles.actionsCol}>
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btnSolid, { backgroundColor: Palette.success }]}
                    onPress={() => handleStatusChange(item.id, 'resolved')}
                    activeOpacity={0.9}
                  >
                    <Feather name="check" size={18} color="#fff" style={styles.btnIconLeft} />
                    <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Resolve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnSolid, { backgroundColor: Palette.danger }]}
                    onPress={() => handleStatusChange(item.id, 'escalated')}
                    activeOpacity={0.9}
                  >
                    <Feather name="arrow-up-right" size={18} color="#fff" style={styles.btnIconLeft} />
                    <Text style={[styles.btnText, { fontFamily: Font.semibold }]}>Escalate</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.ctaRowSubtle, { borderColor: c.border, backgroundColor: c.surface }]}
                  onPress={() => openTicketDetails(item)}
                  activeOpacity={0.72}
                >
                  <Feather name="align-left" size={18} color={c.icon} />
                  <Text style={[styles.ctaRowSubtleText, { color: c.text, fontFamily: Font.semibold }]}>Details</Text>
                  <Feather name="chevron-right" size={18} color={c.icon} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              </View>
            )}

            {isTerminalStatus(item.status) && (
              <TouchableOpacity
                style={[styles.ctaRow, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}
                onPress={() => openTicketDetails(item)}
                activeOpacity={0.72}
              >
                <View style={[styles.ctaIcon, { backgroundColor: `${Palette.primary}16` }]}>
                  <Feather name="file-text" size={20} color={Palette.primary} />
                </View>
                <View style={styles.ctaTextCol}>
                  <Text style={[styles.ctaTitle, { color: c.text, fontFamily: Font.semibold }]}>Open thread</Text>
                  <Text style={[styles.ctaHint, { color: c.textSecondary, fontFamily: Font.regular }]}>
                    View history and notes
                  </Text>
                </View>
                <View style={[styles.ctaChevron, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Feather name="chevron-right" size={18} color={c.icon} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.outer, { paddingTop: insets.top, backgroundColor: c.background }]}>
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
        contentContainerStyle={[styles.listContent, { paddingBottom: Spacing.xxxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconWrap, { backgroundColor: `${Palette.primary}14` }]}>
              <Feather name="inbox" size={28} color={Palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Font.semibold }]}>Nothing matches</Text>
            <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              Clear search or change filters, then pull to refresh.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  headerBlock: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  pageHint: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  countPillText: {
    fontSize: 18,
    letterSpacing: -0.4,
  },
  countPillSuffix: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  alertStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
  },
  alertStripText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    minHeight: 50,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  filterLabel: {
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  facetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  facetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  facetChipText: {
    fontSize: 13,
  },
  valuePillScrollView: {
    marginHorizontal: -Spacing.xl,
    marginBottom: Spacing.lg,
  },
  valuePillScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
  },
  valuePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  valuePillText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  listRule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  ticketCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  ticketCardBody: {
    flex: 1,
    padding: Spacing.xl,
    paddingLeft: Spacing.lg,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  ticketIdRow: {
    flex: 1,
    minWidth: 0,
  },
  ticketKicker: {
    fontSize: 10,
    letterSpacing: 0.85,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  ticketId: {
    fontSize: 15,
    letterSpacing: 0.35,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    flexShrink: 0,
  },
  ticketSubjectTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  metaLine: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  updatedLabel: {
    fontSize: 13,
    flex: 1,
  },
  actions: {
    gap: Spacing.md,
  },
  actionsCol: {
    gap: Spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  btnIconLeft: {
    marginRight: Spacing.xs,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  ctaRowSubtle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  ctaRowSubtleText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextCol: {
    flex: 1,
    minWidth: 0,
  },
  ctaTitle: {
    fontSize: 16,
    letterSpacing: -0.25,
  },
  ctaHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  ctaChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatDistanceToNowStrict } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import {
  getTickets,
  acceptTicket,
  updateTicketConfig,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '@/services/ticket-service';
import { TicketDetailsModal } from '@/components/ticket-details-modal';
import { useAuth } from '@/context/AuthContext';
import { Spacing, Radius, Palette, Colors } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  buildTicketTags,
  customerDisplayName,
  nexusCardPresentation,
  nexusTicketId,
  tagChipColors,
  titleCaseWord,
} from '@/utils/ticket-card-visuals';

type FilterModalKind = 'status' | 'priority' | 'category';

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === 'string' ? v : v[0];
}

const STATUS_OPTIONS: (TicketStatus | 'all')[] = ['all', 'pending', 'assigned', 'resolved', 'escalated'];
const PRIORITY_OPTIONS: (TicketPriority | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];

export default function QueriesScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string | string[] }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState<FilterModalKind | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];

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

  useFocusEffect(
    useCallback(() => {
      const raw = firstParam(params.status);
      if (!raw || raw === 'all') return;
      if (!STATUS_OPTIONS.includes(raw as TicketStatus)) return;
      setStatusFilter(raw as TicketStatus);
      setPriorityFilter('all');
      setCategoryFilter('all');
      router.setParams({ status: undefined });
    }, [params.status, router]),
  );

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

  const modalEscalate = async (id: string, assigneeUserId: number) => {
    await updateTicketConfig(id, { status: 'escalated', assignedTo: assigneeUserId });
    void fetchData();
  };

  const isAdmin = String(user?.role ?? '').toLowerCase() === 'admin';
  const userCompanyRoleId =
    user?.companyRole != null && typeof user.companyRole === 'object' && typeof user.companyRole.id === 'number'
      ? user.companyRole.id
      : null;
  const userDisplayName = user?.name?.trim() || null;
  const userCompanyRoleName =
    user?.companyRole != null && typeof user.companyRole === 'object' && typeof user.companyRole.name === 'string'
      ? user.companyRole.name.trim() || null
      : null;

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

  const chipInactiveBg = isDark ? c.surfaceMuted : '#e5e7eb';
  const chipInactiveFg = isDark ? c.textSecondary : '#64748b';
  const chipActiveBg = isDark ? `${Palette.primary}28` : '#dbeafe';
  const chipActiveFg = isDark ? '#93c5fd' : '#1e40af';
  const searchBg = isDark ? c.surfaceMuted : '#f1f5f9';
  const titleBlue = Palette.primary;
  const subtleText = c.textSecondary;

  const closeFilterModal = () => setFilterModalOpen(null);

  const filterChipPalette = (kind: FilterModalKind) => {
    const open = filterModalOpen === kind;
    return {
      bg: open ? chipActiveBg : chipInactiveBg,
      fg: open ? chipActiveFg : chipInactiveFg,
    };
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderBelowTitle}>
      <View style={[styles.searchInner, { backgroundColor: searchBg }]}>
        <Feather name="search" size={18} color={c.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: c.text, fontFamily: Font.regular }]}
          placeholder="Search ticket archives..."
          placeholderTextColor={c.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.facetRow}>
        <TouchableOpacity
          style={[styles.facetChip, { backgroundColor: filterChipPalette('status').bg }]}
          onPress={() => setFilterModalOpen('status')}
          activeOpacity={0.85}
        >
          <Feather name="filter" size={14} color={filterChipPalette('status').fg} />
          <Text style={[styles.facetChipText, { color: filterChipPalette('status').fg, fontFamily: Font.semibold }]}>
            Status
          </Text>
          {statusFilter !== 'all' && filterModalOpen !== 'status' ? (
            <View style={[styles.filterChipDot, { backgroundColor: Palette.primary }]} />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.facetChip, { backgroundColor: filterChipPalette('priority').bg }]}
          onPress={() => setFilterModalOpen('priority')}
          activeOpacity={0.85}
        >
          <Text style={[styles.facetChipText, { color: filterChipPalette('priority').fg, fontFamily: Font.semibold }]}>
            Priority
          </Text>
          {priorityFilter !== 'all' && filterModalOpen !== 'priority' ? (
            <View style={[styles.filterChipDot, { backgroundColor: Palette.primary }]} />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.facetChip, { backgroundColor: filterChipPalette('category').bg }]}
          onPress={() => setFilterModalOpen('category')}
          activeOpacity={0.85}
        >
          <Text style={[styles.facetChipText, { color: filterChipPalette('category').fg, fontFamily: Font.semibold }]}>
            Category
          </Text>
          {categoryFilter !== 'all' && filterModalOpen !== 'category' ? (
            <View style={[styles.filterChipDot, { backgroundColor: Palette.primary }]} />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Ticket }) => {
    const vis = nexusCardPresentation(item.status, isDark);
    const timeAgo = formatDistanceToNowStrict(new Date(item.updatedAt), { addSuffix: true });
    const customer = customerDisplayName(item);
    const quote = item.subject?.trim() ? `${item.subject.trim()}` : '—';
    const tags = buildTicketTags(item);

    return (
      <TouchableOpacity
        style={[styles.ticketCard, { backgroundColor: c.surface, borderColor: c.border }]}
        activeOpacity={0.72}
        onPress={() => openTicketDetails(item)}
      >
        <View style={[styles.accentBar, { backgroundColor: vis.stripe }]} />
        <View style={styles.ticketCardBody}>
          <View style={styles.ticketTopRow}>
            <Text style={[styles.ticketId, { color: c.textSecondary, fontFamily: Font.medium }]} numberOfLines={1}>
              NX-{nexusTicketId(item.id)}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: vis.pillBg }]}>
              <Text style={[styles.statusPillText, { color: vis.pillFg, fontFamily: Font.semibold }]}>{vis.label}</Text>
            </View>
          </View>

          <Text style={[styles.quoteBody, { color: c.text, fontFamily: Font.regular }]} numberOfLines={2}>
            {quote}
          </Text>
          <Text style={[styles.customerName, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={1}>
            {customer}
          </Text>
          <View style={styles.tagRow}>
            {tags.map((tag) => {
              const colors = tagChipColors(tag, item, isDark);
              return (
                <View key={tag.key} style={[styles.metaTag, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.metaTagText, { color: colors.fg, fontFamily: Font.semibold }]} numberOfLines={1}>
                    {tag.text}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.ticketFooter, { borderTopColor: c.border }]}>
            <Text style={[styles.timeLabel, { color: c.textSecondary, fontFamily: Font.regular }]}>{timeAgo}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screenRoot, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: Spacing.lg,
            backgroundColor: c.background,
          },
        ]}
      >
        <View style={[styles.headerInner, { paddingHorizontal: Spacing.xl }]}>
          <View style={styles.headerTitles}>
            <Text style={[styles.pageTitle, { color: titleBlue, fontFamily: Font.bold }]}>Tickets</Text>
            <Text style={[styles.pageSubtitle, { color: subtleText, fontFamily: Font.regular }]}>
              Browse and filter your queue
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => void signOut()}
              style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.55 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              hitSlop={8}
            >
              <Feather name="log-out" size={20} color={c.icon} />
            </Pressable>
          </View>
        </View>
      </View>

      <TicketDetailsModal
        ticket={detailTicket}
        visible={detailTicket != null}
        onClose={() => setDetailTicket(null)}
        onAccept={modalAccept}
        onReject={modalReject}
        onResolve={modalResolve}
        onEscalate={modalEscalate}
        isAdmin={isAdmin}
        userCompanyRoleId={userCompanyRoleId}
        userDisplayName={userDisplayName}
        userCompanyRoleName={userCompanyRoleName}
      />

      <Modal
        visible={filterModalOpen !== null}
        transparent
        animationType="fade"
        onRequestClose={closeFilterModal}
      >
        <View style={styles.filterModalRoot}>
          <Pressable style={styles.filterModalBackdrop} onPress={closeFilterModal} accessibilityLabel="Dismiss filters" />
          <View
            style={[
              styles.filterModalSheet,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
              },
              Platform.select({
                ios: {
                  shadowColor: '#0f172a',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.18,
                  shadowRadius: 24,
                },
                android: { elevation: 12 },
                default: {},
              }),
            ]}
          >
            <View style={[styles.filterModalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.filterModalTitle, { color: c.text, fontFamily: Font.bold }]}>
                {filterModalOpen === 'status' && 'Status'}
                {filterModalOpen === 'priority' && 'Priority'}
                {filterModalOpen === 'category' && 'Category'}
              </Text>
              <Pressable onPress={closeFilterModal} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                <Feather name="x" size={22} color={c.icon} />
              </Pressable>
            </View>
            <ScrollView
              style={styles.filterModalScroll}
              contentContainerStyle={styles.filterModalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filterModalOpen === 'status' &&
                STATUS_OPTIONS.map((opt) => {
                  const active = statusFilter === opt;
                  const label = opt === 'all' ? 'All' : titleCaseWord(opt);
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        setStatusFilter(opt);
                        closeFilterModal();
                      }}
                      style={({ pressed }) => [
                        styles.filterModalRow,
                        { borderBottomColor: c.border, backgroundColor: pressed ? c.surfaceMuted : active ? `${Palette.primary}10` : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.filterModalRowLabel, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
                        {label}
                      </Text>
                      {active ? <Feather name="check" size={20} color={Palette.primary} /> : <View style={styles.filterModalCheckSpacer} />}
                    </Pressable>
                  );
                })}
              {filterModalOpen === 'priority' &&
                PRIORITY_OPTIONS.map((opt) => {
                  const active = priorityFilter === opt;
                  const label = opt === 'all' ? 'All' : titleCaseWord(opt);
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        setPriorityFilter(opt);
                        closeFilterModal();
                      }}
                      style={({ pressed }) => [
                        styles.filterModalRow,
                        { borderBottomColor: c.border, backgroundColor: pressed ? c.surfaceMuted : active ? `${Palette.primary}10` : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.filterModalRowLabel, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
                        {label}
                      </Text>
                      {active ? <Feather name="check" size={20} color={Palette.primary} /> : <View style={styles.filterModalCheckSpacer} />}
                    </Pressable>
                  );
                })}
              {filterModalOpen === 'category' &&
                categoryOptions.map((opt) => {
                  const active = categoryFilter === opt;
                  const label = opt === 'all' ? 'All' : titleCaseWord(opt);
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        setCategoryFilter(opt);
                        closeFilterModal();
                      }}
                      style={({ pressed }) => [
                        styles.filterModalRow,
                        { borderBottomColor: c.border, backgroundColor: pressed ? c.surfaceMuted : active ? `${Palette.primary}10` : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.filterModalRowLabel, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
                        {label}
                      </Text>
                      {active ? <Feather name="check" size={20} color={Palette.primary} /> : <View style={styles.filterModalCheckSpacer} />}
                    </Pressable>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        style={styles.listFlex}
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: Spacing.xxxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconWrap, { backgroundColor: `${Palette.primary}14` }]}>
              <Feather name="inbox" size={28} color={Palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Font.semibold }]}>No tickets</Text>
            <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              Adjust search or filters, or pull to refresh.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  headerBar: {},
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: 2,
  },
  headerIconBtn: {
    padding: Spacing.sm,
  },
  listFlex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  listHeaderBelowTitle: {
    marginBottom: Spacing.xs,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
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
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  facetChipText: {
    fontSize: 13,
  },
  filterChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
  filterModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  filterModalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '72%',
    paddingBottom: Spacing.xl,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterModalTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  filterModalScroll: {
    maxHeight: 360,
  },
  filterModalScrollContent: {
    paddingBottom: Spacing.lg,
  },
  filterModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  filterModalRowLabel: {
    flex: 1,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  filterModalCheckSpacer: {
    width: 20,
    height: 20,
  },
  ticketCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  ticketCardBody: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ticketId: {
    fontSize: 14,
    letterSpacing: 0.15,
    flex: 1,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  customerName: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.1,
    marginBottom: Spacing.md,
  },
  quoteBody: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  metaTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    maxWidth: '100%',
  },
  metaTagText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeLabel: {
    fontSize: 13,
    lineHeight: 19,
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

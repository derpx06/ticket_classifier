import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  getTickets,
  acceptTicket,
  updateTicketConfig,
  Ticket,
  TicketStatus,
} from '@/services/ticket-service';
import { TicketDetailsModal } from '@/components/ticket-details-modal';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  buildTicketTags,
  customerDisplayName,
  nexusCardPresentation,
  nexusTicketId,
  tagChipColors,
} from '@/utils/ticket-card-visuals';

function elevatedCard(isDark: boolean): object {
  if (isDark) {
    return { elevation: 0 };
  }
  return Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    android: { elevation: 3 },
    default: {},
  });
}

type WorkspaceStatusKey = 'open' | 'escalated' | 'pending' | 'resolved';

function dashboardStatToQueryStatus(variant: WorkspaceStatusKey): TicketStatus {
  switch (variant) {
    case 'open':
      return 'assigned';
    case 'escalated':
      return 'escalated';
    case 'pending':
      return 'pending';
    case 'resolved':
      return 'resolved';
    default: {
      const _x: never = variant;
      return _x;
    }
  }
}

export default function DashboardScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const cardLift = elevatedCard(isDark);

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await getTickets();
      if (__DEV__) {
        console.log('[Dashboard] tickets count', data.length);
        if (data[0]) console.log('[Dashboard] sample ticket', JSON.stringify(data[0], null, 2));
      }
      setTickets(data);
    } catch (e) {
      console.error('Error fetching tickets', e);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const modalAccept = async (id: string) => {
    await acceptTicket(id);
    void fetchDashboardData();
  };

  const modalReject = async (id: string) => {
    await updateTicketConfig(id, { status: 'escalated' });
    void fetchDashboardData();
  };

  const modalResolve = async (id: string) => {
    await updateTicketConfig(id, { status: 'resolved' });
    void fetchDashboardData();
  };

  const modalEscalate = async (id: string, assigneeUserId: number) => {
    await updateTicketConfig(id, { status: 'escalated', assignedTo: assigneeUserId });
    void fetchDashboardData();
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

  const openQueriesFiltered = (variant: WorkspaceStatusKey) => {
    const status = dashboardStatToQueryStatus(variant);
    router.push(`/(tabs)/queries?status=${encodeURIComponent(status)}`);
  };

  const pending = useMemo(() => tickets.filter((t) => t.status === 'pending'), [tickets]);
  const assigned = useMemo(() => tickets.filter((t) => t.status === 'assigned'), [tickets]);
  const resolved = useMemo(() => tickets.filter((t) => t.status === 'resolved'), [tickets]);
  const escalated = useMemo(() => tickets.filter((t) => t.status === 'escalated'), [tickets]);

  const openCount = assigned.length;

  const recentQueries = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...tickets].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const filtered = q
      ? sorted.filter((t) => {
          const hay = `${t.subject} ${t.category} ${t.customerName ?? ''} ${t.assignedRoleName ?? ''} ${t.status}`.toLowerCase();
          return hay.includes(q);
        })
      : sorted;
    return filtered.slice(0, 4);
  }, [tickets, search]);

  const titleBlue = Palette.primary;
  const subtleText = c.textSecondary;

  return (
    <View style={[styles.screenRoot, { backgroundColor: c.background }]}>
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
            <Text style={[styles.dashboardTitle, { color: titleBlue, fontFamily: Font.bold }]}>Dashboard</Text>
            <Text style={[styles.dashboardSubtitle, { color: subtleText, fontFamily: Font.regular }]}>
              Queries Workspace Overview
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [
                styles.headerIconBtn,
                { opacity: pressed ? 0.55 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              hitSlop={8}
            >
              <Feather name="user" size={22} color={c.icon} />
            </Pressable>
            <Pressable
              onPress={() => void signOut()}
              style={({ pressed }) => [
                styles.headerIconBtn,
                { opacity: pressed ? 0.55 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              hitSlop={8}
            >
              <Feather name="log-out" size={22} color={c.icon} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />
        }
      >
        <View style={[styles.searchShell, { backgroundColor: c.surface, borderColor: c.border }, cardLift]}>
          <Feather name="search" size={20} color={c.icon} style={styles.searchGlyph} />
          <TextInput
            style={[styles.searchField, { color: c.text, fontFamily: Font.regular }]}
            placeholder="Search…"
            placeholderTextColor={c.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
         
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <TintedStatCard
              variant="open"
              count={openCount}
              label="OPEN"
              icon="layers"
              isDark={isDark}
              onPress={() => openQueriesFiltered('open')}
            />
            <TintedStatCard
              variant="escalated"
              count={escalated.length}
              label="ESCALATED"
              icon="alert-triangle"
              isDark={isDark}
              onPress={() => openQueriesFiltered('escalated')}
            />
          </View>
          <View style={styles.statRow}>
            <TintedStatCard
              variant="pending"
              count={pending.length}
              label="PENDING"
              icon="clock"
              isDark={isDark}
              onPress={() => openQueriesFiltered('pending')}
            />
            <TintedStatCard
              variant="resolved"
              count={resolved.length}
              label="RESOLVED"
              icon="check-circle"
              isDark={isDark}
              onPress={() => openQueriesFiltered('resolved')}
            />
          </View>
        </View>

        <View style={styles.recentHeaderRow}>
          <Text style={[styles.recentSectionTitle, { color: c.text, fontFamily: Font.bold }]}>Recent Queries</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/queries')}
            style={styles.viewAllLink}
            activeOpacity={0.7}
            hitSlop={12}
          >
            <Text style={[styles.viewAllLinkText, { color: Palette.primary, fontFamily: Font.semibold }]}>
              View All
            </Text>
            <Feather name="arrow-right" size={16} color={Palette.primary} />
          </TouchableOpacity>
        </View>

        {recentQueries.length > 0 ? (
          <View style={styles.recentList}>
            {recentQueries.map((ticket) => (
              <WorkspaceQueryCard
                key={ticket.id}
                ticket={ticket}
                isDark={isDark}
                surface={c.surface}
                borderColor={c.border}
                textColor={c.text}
                subtleText={subtleText}
                onPress={() => setDetailTicket(ticket)}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.recentEmpty, { backgroundColor: c.surface, borderColor: c.border }, cardLift]}>
            <Feather name="inbox" size={32} color={c.icon} />
            <Text style={[styles.recentEmptyTitle, { color: c.text, fontFamily: Font.semibold }]}>
              No tickets match
            </Text>
            <Text style={[styles.recentEmptySub, { color: subtleText, fontFamily: Font.regular }]}>
              Try another search or pull to refresh.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TintedStatCard({
  variant,
  count,
  label,
  icon,
  isDark,
  onPress,
}: {
  variant: WorkspaceStatusKey;
  count: number;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isDark: boolean;
  onPress: () => void;
}) {
  const t = isDark ? DARK_TINTS[variant] : LIGHT_TINTS[variant];

  return (
    <TouchableOpacity
      style={[styles.tintedCard, { backgroundColor: t.bg }]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${count}. Open tickets filtered by this status.`}
    >
      <View style={[styles.tintedIconWrap, { backgroundColor: t.iconBg }]}>
        <Feather name={icon} size={22} color={t.iconFg} />
      </View>
      <Text style={[styles.tintedLabel, { color: t.labelColor, fontFamily: Font.semibold }]}>{label}</Text>
      <Text style={[styles.tintedCount, { color: t.countColor, fontFamily: Font.extraBold }]}>{count}</Text>
    </TouchableOpacity>
  );
}

const LIGHT_TINTS: Record<
  WorkspaceStatusKey,
  { bg: string; leftBar: string; iconBg: string; iconFg: string; labelColor: string; countColor: string }
> = {
  open: {
    bg: '#eff6ff',
    leftBar: '#2563eb',
    iconBg: '#dbeafe',
    iconFg: '#1d4ed8',
    labelColor: '#1d4ed8',
    countColor: '#1e3a8a',
  },
  escalated: {
    bg: '#fef2f2',
    leftBar: '#b91c1c',
    iconBg: '#fee2e2',
    iconFg: '#b91c1c',
    labelColor: '#b91c1c',
    countColor: '#7f1d1d',
  },
  pending: {
    bg: '#f4f4f5',
    leftBar: '#71717a',
    iconBg: '#e4e4e7',
    iconFg: '#52525b',
    labelColor: '#52525b',
    countColor: '#18181b',
  },
  resolved: {
    bg: '#ecfdf5',
    leftBar: '#059669',
    iconBg: '#d1fae5',
    iconFg: '#047857',
    labelColor: '#047857',
    countColor: '#064e3b',
  },
};

const DARK_TINTS: Record<
  WorkspaceStatusKey,
  { bg: string; leftBar: string; iconBg: string; iconFg: string; labelColor: string; countColor: string }
> = {
  open: {
    bg: '#172554',
    leftBar: '#3b82f6',
    iconBg: '#1e3a8a',
    iconFg: '#93c5fd',
    labelColor: '#93c5fd',
    countColor: '#e0e7ff',
  },
  escalated: {
    bg: '#450a0a',
    leftBar: '#f87171',
    iconBg: '#7f1d1d',
    iconFg: '#fecaca',
    labelColor: '#fecaca',
    countColor: '#fef2f2',
  },
  pending: {
    bg: '#27272a',
    leftBar: '#a1a1aa',
    iconBg: '#3f3f46',
    iconFg: '#d4d4d8',
    labelColor: '#d4d4d8',
    countColor: '#fafafa',
  },
  resolved: {
    bg: '#064e3b',
    leftBar: '#34d399',
    iconBg: '#065f46',
    iconFg: '#6ee7b7',
    labelColor: '#6ee7b7',
    countColor: '#ecfdf5',
  },
};

function WorkspaceQueryCard({
  ticket,
  isDark,
  surface,
  borderColor,
  textColor,
  subtleText,
  onPress,
}: {
  ticket: Ticket;
  isDark: boolean;
  surface: string;
  borderColor: string;
  textColor: string;
  subtleText: string;
  onPress: () => void;
}) {
  const vis = nexusCardPresentation(ticket.status, isDark);
  const tags = buildTicketTags(ticket);
  const customer = customerDisplayName(ticket);

  return (
    <TouchableOpacity
      style={[styles.wqCard, { backgroundColor: surface, borderColor }]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={[styles.wqStripe, { backgroundColor: vis.stripe }]} />
      <View style={styles.wqBody}>
        <View style={styles.wqTop}>
          <Text style={[styles.wqId, { color: subtleText, fontFamily: Font.medium }]} numberOfLines={1}>
            NX-{nexusTicketId(ticket.id)}
          </Text>
          <View style={[styles.wqPill, { backgroundColor: vis.pillBg }]}>
            <Text style={[styles.wqPillText, { color: vis.pillFg, fontFamily: Font.semibold }]}>{vis.label}</Text>
          </View>
        </View>
        <Text style={[styles.wqTitle, { color: textColor, fontFamily: Font.semibold }]} numberOfLines={2}>
          {ticket.subject}
        </Text>
        <Text style={[styles.wqCustomer, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={1}>
          {customer}
        </Text>
        <View style={styles.wqTagRow}>
          {tags.map((tag) => {
            const chipColors = tagChipColors(tag, ticket, isDark);
            return (
              <View key={tag.key} style={[styles.wqMetaTag, { backgroundColor: chipColors.bg }]}>
                <Text style={[styles.wqMetaTagText, { color: chipColors.fg, fontFamily: Font.semibold }]} numberOfLines={1}>
                  {tag.text}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
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
  dashboardTitle: {
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  dashboardSubtitle: {
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
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xl,
    minHeight: 52,
  },
  searchGlyph: {
    marginRight: Spacing.sm,
  },
  searchField: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
    minWidth: 0,
  },
  askAiBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginLeft: Spacing.sm,
  },
  askAiBtnText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  statGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tintedCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    minHeight: 128,
  },
  tintedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  tintedLabel: {
    fontSize: 11,
    letterSpacing: 0.85,
    marginBottom: Spacing.xs,
  },
  tintedCount: {
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 38,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  recentSectionTitle: {
    fontSize: 18,
    letterSpacing: -0.35,
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllLinkText: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  recentList: {
    gap: Spacing.md,
  },
  wqCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  wqStripe: {
    width: 3,
    alignSelf: 'stretch',
  },
  wqBody: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  wqTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  wqId: {
    fontSize: 14,
    flex: 1,
    letterSpacing: 0.15,
  },
  wqPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    flexShrink: 0,
  },
  wqPillText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  wqTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: Spacing.xs,
  },
  wqCustomer: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.1,
    marginBottom: Spacing.sm,
  },
  wqTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  wqMetaTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    maxWidth: '100%',
  },
  wqMetaTagText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  recentEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  recentEmptyTitle: {
    fontSize: 16,
  },
  recentEmptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});

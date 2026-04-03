import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { getTickets, formatTicketCardDetails, Ticket } from '@/services/ticket-service';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ticketCode(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-6);
  return tail ? tail.toUpperCase() : '—';
}

function initials(name?: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];

  const fetchDashboardData = async () => {
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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pending = useMemo(() => tickets.filter((t) => t.status === 'pending'), [tickets]);
  const assigned = useMemo(() => tickets.filter((t) => t.status === 'assigned'), [tickets]);
  const resolved = useMemo(() => tickets.filter((t) => t.status === 'resolved'), [tickets]);
  const escalated = useMemo(() => tickets.filter((t) => t.status === 'escalated'), [tickets]);

  const oldestPending = useMemo(() => {
    if (pending.length === 0) return null;
    return pending.reduce<Ticket | null>((oldest, t) => {
      const tTime = new Date(t.updatedAt).getTime();
      if (!oldest || tTime < new Date(oldest.updatedAt).getTime()) return t;
      return oldest;
    }, null);
  }, [pending]);

  const pendingSubtitle = oldestPending
    ? `Oldest waiting ${formatDistanceToNow(new Date(oldestPending.updatedAt), { addSuffix: true })}`
    : 'Queue is clear';

  const criticalHigh = useMemo(
    () =>
      tickets.filter((t) => (t.priority === 'high' || t.priority === 'critical') && t.status === 'pending').length,
    [tickets],
  );

  const highPrioritySubtitle =
    criticalHigh > 0
      ? `${criticalHigh} high-priority in queue`
      : 'No critical items';

  const recentQueries = useMemo(
    () =>
      [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
    [tickets],
  );

  const subtleText = c.textSecondary;

  return (
    <View style={[styles.screenRoot, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + Spacing.sm,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <View style={[styles.headerInner, { paddingHorizontal: Spacing.xl }]}>
          <View style={styles.topBarText}>
            <Text
              style={[styles.screenTitle, { color: c.text, fontFamily: Font.semibold }]}
              numberOfLines={1}
            >
              Dashboard
            </Text>
            <Text
              style={[styles.screenSubtitle, { color: subtleText, fontFamily: Font.regular }]}
              numberOfLines={1}
            >
              Live ticket metrics
            </Text>
          </View>
          <View style={styles.topBarActions}>
            <View style={[styles.avatar, { borderColor: c.border, backgroundColor: c.surfaceMuted }]}>
              <Text style={[styles.avatarText, { color: c.text, fontFamily: Font.medium }]}>
                {initials(user?.name)}
              </Text>
            </View>
            <Pressable
              onPress={() => void signOut()}
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              hitSlop={8}
            >
              <Feather name="log-out" size={20} color={c.icon} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />
        }
      >
      <Text style={[styles.sectionLabel, { color: subtleText, fontFamily: Font.medium }]}>Summary</Text>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <OverviewStatCard
            icon="user"
            iconColor={Palette.primary}
            count={assigned.length}
            label="Assigned"
            activeTag
            borderColor={c.border}
            textColor={c.text}
            subtleColor={subtleText}
            surface={c.surface}
            accentBorder={false}
          />
          <OverviewStatCard
            icon="message-circle"
            iconColor={Palette.primary}
            count={pending.length}
            label="Pending"
            borderColor={c.border}
            textColor={c.text}
            subtleColor={subtleText}
            surface={c.surface}
            accentBorder={false}
          />
        </View>
        <View style={styles.gridRow}>
          <OverviewStatCard
            icon="check"
            iconColor={subtleText}
            count={resolved.length}
            label="Resolved"
            borderColor={c.border}
            textColor={c.text}
            subtleColor={subtleText}
            surface={c.surface}
            accentBorder={false}
          />
          <OverviewStatCard
            icon="alert-circle"
            iconColor={Palette.danger}
            count={escalated.length}
            label="Escalated"
            variant="danger"
            borderColor={c.border}
            textColor={c.text}
            subtleColor={subtleText}
            surface={c.surface}
            accentBorder
          />
        </View>
      </View>

      <Text style={[styles.sectionHeading, { color: c.text, fontFamily: Font.semibold }]}>Shortcuts</Text>

      <TouchableOpacity
        style={[styles.actionRow, { backgroundColor: c.surface, borderColor: c.border }]}
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/queries')}
      >
        <View style={[styles.actionIconWrap, { borderColor: c.border }]}>
          <Feather name="inbox" size={20} color={Palette.primary} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={[styles.actionTitle, { color: c.text, fontFamily: Font.semibold }]}>Pending tickets</Text>
          <Text style={[styles.actionSubtitle, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={2}>
            {pendingSubtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={c.icon} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionRow,
          styles.actionRowAlert,
          { backgroundColor: c.surface, borderColor: c.border, marginTop: Spacing.sm },
        ]}
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/queries')}
      >
        <View style={[styles.actionIconWrap, { borderColor: `${Palette.danger}55` }]}>
          <Feather name="alert-triangle" size={20} color={Palette.danger} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={[styles.actionTitle, { color: c.text, fontFamily: Font.semibold }]}>High priority</Text>
          <Text style={[styles.actionSubtitle, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={2}>
            {highPrioritySubtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={c.icon} />
      </TouchableOpacity>

      <View style={styles.recentHeader}>
        <Text style={[styles.sectionHeading, { color: c.text, fontFamily: Font.semibold, marginTop: 0 }]}>
          Recent
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/queries')} hitSlop={12}>
          <Text style={[styles.viewAll, { fontFamily: Font.medium }]}>View all</Text>
        </TouchableOpacity>
      </View>

      {recentQueries.map((ticket) => (
        <TouchableOpacity
          key={ticket.id}
          style={[styles.queryCard, { backgroundColor: c.surface, borderColor: c.border }]}
          activeOpacity={0.7}
          onPress={() => router.push(`/(tabs)/chat/${ticket.id}`)}
        >
          <View style={styles.queryCardTop}>
            <Text style={[styles.queryId, { color: c.text, fontFamily: Font.semibold }]}>#{ticketCode(ticket.id)}</Text>
            <StatusPill status={ticket.status} isDark={isDark} />
          </View>
          <Text style={[styles.querySnippet, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={2}>
            {ticket.subject}
          </Text>
          <Text style={[styles.queryMeta, { color: subtleText, fontFamily: Font.medium }]} numberOfLines={1}>
            {formatTicketCardDetails(ticket)}
          </Text>
        </TouchableOpacity>
      ))}

      {recentQueries.length === 0 && (
        <Text style={[styles.emptyHint, { color: subtleText, fontFamily: Font.regular }]}>
          No tickets yet. Pull to refresh.
        </Text>
      )}
      </ScrollView>
    </View>
  );
}

function OverviewStatCard({
  icon,
  iconColor,
  count,
  label,
  activeTag,
  variant,
  borderColor,
  textColor,
  subtleColor,
  surface,
  accentBorder,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  count: number;
  label: string;
  activeTag?: boolean;
  variant?: 'danger';
  borderColor: string;
  textColor: string;
  subtleColor: string;
  surface: string;
  accentBorder?: boolean;
}) {
  const countColor = variant === 'danger' ? Palette.danger : textColor;
  const labelColor = variant === 'danger' ? Palette.danger : subtleColor;

  return (
    <View
      style={[
        styles.statCardOuter,
        {
          backgroundColor: surface,
          borderColor,
          borderLeftWidth: accentBorder ? 3 : 1,
          borderLeftColor: accentBorder ? Palette.danger : borderColor,
        },
      ]}
    >
      <View style={styles.statCardTop}>
        <View style={[styles.statIconCircle, { borderColor }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>
        {activeTag ? (
          <View style={[styles.activeTag, { borderColor: `${Palette.primary}66` }]}>
            <Text style={[styles.activeTagText, { color: Palette.primary, fontFamily: Font.medium }]}>Active</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.statCount, { color: countColor, fontFamily: Font.semibold }]}>{count}</Text>
      <Text style={[styles.statLabel, { color: labelColor, fontFamily: Font.regular }]}>{label}</Text>
    </View>
  );
}

function StatusPill({ status, isDark }: { status: string; isDark: boolean }) {
  const s = status.toLowerCase();
  let bg = 'transparent';
  let fg = isDark ? '#94a3b8' : '#64748b';
  let border = isDark ? '#475569' : '#e2e8f0';

  if (s === 'pending') {
    bg = 'transparent';
    fg = isDark ? '#94a3b8' : '#64748b';
    border = isDark ? '#475569' : '#e2e8f0';
  } else if (s === 'assigned') {
    bg = 'transparent';
    fg = Palette.primary;
    border = `${Palette.primary}44`;
  } else if (s === 'resolved') {
    bg = 'transparent';
    fg = Palette.success;
    border = `${Palette.success}44`;
  } else if (s === 'escalated') {
    bg = 'transparent';
    fg = Palette.danger;
    border = `${Palette.danger}44`;
  }

  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: border, borderWidth: 1 }]}>
      <Text style={[styles.pillText, { color: fg, fontFamily: Font.medium }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  headerBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.md,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  topBarText: {
    flex: 1,
    minWidth: 0,
    paddingRight: Spacing.md,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: Spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 13,
  },
  iconBtn: {
    padding: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  grid: {
    gap: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCardOuter: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    minHeight: 118,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  activeTagText: {
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statCount: {
    fontSize: 26,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
    letterSpacing: -0.1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  actionRowAlert: {
    borderLeftWidth: 3,
    borderLeftColor: Palette.danger,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  viewAll: {
    fontSize: 14,
    color: Palette.primary,
  },
  queryCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  queryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  queryId: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  querySnippet: {
    fontSize: 14,
    lineHeight: 20,
  },
  queryMeta: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  pillText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  emptyHint: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: 14,
    lineHeight: 20,
  },
});

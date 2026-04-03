import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { getTickets, Ticket } from '@/services/ticket-service';
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
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];

  const fetchDashboardData = async () => {
    try {
      const data = await getTickets();
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
    ? `Awaiting response (${formatDistanceToNow(new Date(oldestPending.updatedAt), { addSuffix: false })})`
    : 'No tickets awaiting response';

  const criticalHigh = useMemo(
    () => tickets.filter((t) => t.priority === 'high' && t.status === 'pending').length,
    [tickets],
  );

  const highPrioritySubtitle =
    criticalHigh > 0
      ? `${criticalHigh} Critical issue${criticalHigh === 1 ? '' : 's'} detected`
      : 'No critical issues';

  const recentQueries = useMemo(
    () =>
      [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
    [tickets],
  );

  const cardBg = c.surface;
  const subtleText = c.textSecondary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />
      }
    >
      <View style={styles.overviewHeader}>
        <View style={styles.overviewHeaderLeft}>
          <Text style={[styles.overviewTitle, { color: c.text, fontFamily: Font.bold }]}>Overview</Text>
          <Text style={[styles.liveUpdates, { fontFamily: Font.extraBold }]}>LIVE UPDATES</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: isDark ? c.surfaceMuted : Palette.primary }]}>
          <Text style={[styles.avatarText, { fontFamily: Font.semibold }]}>{initials(user?.name)}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <OverviewStatCard
            icon="user"
            iconColor={Palette.primary}
            count={assigned.length}
            label="Assigned"
            activeTag
            backgroundColor={cardBg}
            borderColor={c.border}
            isDark={isDark}
            textColor={c.text}
            subtleColor={subtleText}
          />
          <OverviewStatCard
            icon="message-circle"
            iconColor={Palette.primary}
            count={pending.length}
            label="Pending"
            backgroundColor={cardBg}
            borderColor={c.border}
            isDark={isDark}
            textColor={c.text}
            subtleColor={subtleText}
          />
        </View>
        <View style={styles.gridRow}>
          <OverviewStatCard
            icon="check"
            iconColor={isDark ? c.icon : '#64748b'}
            count={resolved.length}
            label="Resolved"
            backgroundColor={cardBg}
            borderColor={c.border}
            isDark={isDark}
            textColor={c.text}
            subtleColor={subtleText}
          />
          <OverviewStatCard
            icon="alert-circle"
            iconColor={Palette.danger}
            count={escalated.length}
            label="Escalated"
            variant="danger"
            backgroundColor={isDark ? '#3f1d1d' : '#fef2f2'}
            borderColor={isDark ? '#7f1d1d' : '#fecaca'}
            isDark={isDark}
            textColor={isDark ? '#fecaca' : Palette.danger}
            subtleColor={isDark ? '#fca5a5' : Palette.danger}
          />
        </View>
      </View>

      <Text style={[styles.sectionHeading, { color: c.text, fontFamily: Font.bold, marginTop: Spacing.sm }]}>
        Action Center
      </Text>

      <TouchableOpacity
        style={[styles.actionRow, { backgroundColor: isDark ? c.surface : '#f1f5f9' }]}
        activeOpacity={0.75}
        onPress={() => router.push('/(tabs)/queries')}
      >
        <View style={[styles.actionIconWrap, { backgroundColor: isDark ? c.surfaceMuted : '#e2e8f0' }]}>
          <Feather name="monitor" size={22} color={Palette.primary} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={[styles.actionTitle, { color: c.text, fontFamily: Font.semibold }]}>Pending Tickets</Text>
          <Text style={[styles.actionSubtitle, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={1}>
            {pendingSubtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={subtleText} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionRow,
          { backgroundColor: isDark ? '#3f1d1d' : '#fef2f2', marginTop: Spacing.md },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/(tabs)/queries')}
      >
        <View style={[styles.actionIconWrap, { backgroundColor: isDark ? '#7f1d1d' : '#fee2e2' }]}>
          <Feather name="alert-triangle" size={22} color={Palette.danger} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={[styles.actionTitle, { color: isDark ? '#fecaca' : '#991b1b', fontFamily: Font.semibold }]}>
            High Priority Alerts
          </Text>
          <Text
            style={[styles.actionSubtitle, { color: isDark ? '#fca5a5' : '#b91c1c', fontFamily: Font.regular }]}
            numberOfLines={1}
          >
            {highPrioritySubtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={isDark ? '#fca5a5' : Palette.danger} />
      </TouchableOpacity>

      <View style={styles.recentHeader}>
        <Text style={[styles.sectionHeading, { color: c.text, fontFamily: Font.bold, marginTop: 0 }]}>
          Recent Queries
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/queries')} hitSlop={12}>
          <Text style={[styles.viewAll, { fontFamily: Font.semibold }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {recentQueries.map((ticket) => (
        <TouchableOpacity
          key={ticket.id}
          style={[
            styles.queryCard,
            {
              backgroundColor: cardBg,
              borderColor: c.border,
              ...Platform.select({
                ios: {
                  shadowColor: '#0f172a',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.35 : 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: isDark ? 2 : 1 },
              }),
            },
          ]}
          activeOpacity={0.75}
          onPress={() => router.push(`/(tabs)/chat/${ticket.id}`)}
        >
          <View style={styles.queryCardTop}>
            <Text style={[styles.queryId, { color: c.text, fontFamily: Font.extraBold }]}>#{ticketCode(ticket.id)}</Text>
            <StatusPill status={ticket.status} isDark={isDark} />
          </View>
          <Text style={[styles.querySnippet, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={2}>
            {ticket.subject}
          </Text>
        </TouchableOpacity>
      ))}

      {recentQueries.length === 0 && (
        <Text style={[styles.emptyHint, { color: subtleText, fontFamily: Font.regular }]}>
          No queries yet. Pull to refresh.
        </Text>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

function OverviewStatCard({
  icon,
  iconColor,
  count,
  label,
  activeTag,
  variant,
  backgroundColor,
  borderColor,
  isDark,
  textColor,
  subtleColor,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  count: number;
  label: string;
  activeTag?: boolean;
  variant?: 'danger';
  backgroundColor: string;
  borderColor: string;
  isDark: boolean;
  textColor: string;
  subtleColor: string;
}) {
  return (
    <View
      style={[
        styles.statCardOuter,
        {
          backgroundColor,
          borderColor,
          ...Platform.select({
            ios: {
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.25 : 0.05,
              shadowRadius: 6,
            },
            android: { elevation: isDark ? 2 : 1 },
          }),
        },
      ]}
    >
      <View style={styles.statCardTop}>
        <View style={[styles.statIconCircle, { backgroundColor: isDark ? '#334155' : '#eff6ff' }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        {activeTag ? (
          <View style={[styles.activeTag, { backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }]}>
            <Text style={[styles.activeTagText, { color: isDark ? '#93c5fd' : Palette.primary, fontFamily: Font.extraBold }]}>
              ACTIVE
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.statCount,
          { color: variant === 'danger' ? iconColor : textColor, fontFamily: Font.extraBold },
        ]}
      >
        {count}
      </Text>
      <Text
        style={[
          styles.statLabel,
          { color: variant === 'danger' ? iconColor : subtleColor, fontFamily: Font.semibold },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function StatusPill({ status, isDark }: { status: string; isDark: boolean }) {
  const s = status.toLowerCase();
  let bg = '#64748b';
  let fg = '#fff';

  if (s === 'pending') {
    bg = isDark ? '#475569' : '#e2e8f0';
    fg = isDark ? '#f1f5f9' : '#475569';
  } else if (s === 'assigned') {
    bg = Palette.primary;
    fg = '#fff';
  } else if (s === 'resolved') {
    bg = isDark ? '#14532d' : '#d1fae5';
    fg = isDark ? '#bbf7d0' : '#047857';
  } else if (s === 'escalated') {
    bg = isDark ? '#7f1d1d' : '#fee2e2';
    fg = isDark ? '#fecaca' : '#b91c1c';
  }

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg, fontFamily: Font.extraBold }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  overviewHeaderLeft: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 30,
    letterSpacing: -0.6,
  },
  liveUpdates: {
    marginTop: Spacing.sm,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Palette.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
  },
  grid: {
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCardOuter: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    minHeight: 132,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  statIconCircle: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  activeTagText: {
    fontSize: 9,
    letterSpacing: 0.8,
  },
  statCount: {
    fontSize: 30,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  sectionHeading: {
    fontSize: 18,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
    letterSpacing: -0.2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.xs,
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  queryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  queryId: {
    fontSize: 15,
    letterSpacing: 0.4,
  },
  querySnippet: {
    fontSize: 14,
    lineHeight: 21,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.sm,
  },
  pillText: {
    fontSize: 10,
    letterSpacing: 0.7,
  },
  emptyHint: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: 14,
    lineHeight: 20,
  },
});

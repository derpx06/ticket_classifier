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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import {
  getTickets,
  formatTicketCardDetails,
  Ticket,
  type TicketPriority,
} from '@/services/ticket-service';
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

function firstName(name?: string | null): string {
  if (!name?.trim()) return 'there';
  return name.trim().split(/\s+/)[0] ?? 'there';
}

function greetingLabel(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function elevatedCard(isDark: boolean): object {
  if (isDark) {
    return { elevation: 0 };
  }
  return Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
    },
    android: { elevation: 3 },
    default: {},
  });
}

function priorityAccentColor(p: TicketPriority): string {
  if (p === 'critical') return Palette.danger;
  if (p === 'high') return Palette.warning;
  if (p === 'medium') return Palette.info;
  return Palette.primary;
}

function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
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

  const openWorkload = assigned.length + pending.length;
  const subtleText = c.textSecondary;
  const heroTint = isDark ? `${Palette.primary}22` : `${Palette.primary}12`;
  const cardLift = elevatedCard(isDark);

  return (
    <View style={[styles.screenRoot, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <View style={[styles.headerAccent, { backgroundColor: Palette.primary }]} />
        <View style={[styles.headerInner, { paddingHorizontal: Spacing.xl }]}>
          <View style={styles.topBarText}>
            <Text
              style={[styles.greetingLine, { color: subtleText, fontFamily: Font.medium }]}
              numberOfLines={1}
            >
              {greetingLabel()}
            </Text>
            <Text
              style={[styles.screenTitle, { color: c.text, fontFamily: Font.bold }]}
              numberOfLines={1}
            >
              {firstName(user?.name)}
            </Text>
            <Text
              style={[styles.screenSubtitle, { color: subtleText, fontFamily: Font.regular }]}
              numberOfLines={2}
            >
              Here is what needs attention across your queue.
            </Text>
          </View>
          <View style={styles.topBarActions}>
            <View
              style={[
                styles.avatar,
                {
                  borderColor: `${Palette.primary}40`,
                  backgroundColor: heroTint,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: Palette.primary, fontFamily: Font.semibold }]}>
                {initials(user?.name)}
              </Text>
            </View>
            <Pressable
              onPress={() => void signOut()}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: c.surfaceMuted, opacity: pressed ? 0.5 : 1 },
              ]}
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
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />
        }
      >
        <View
          style={[
            styles.heroCard,
            { backgroundColor: c.surface, borderColor: c.border },
            cardLift,
          ]}
        >
          <View style={[styles.heroGlow, { backgroundColor: heroTint }]} />
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: subtleText, fontFamily: Font.medium }]}>
                Open workload
              </Text>
              <Text style={[styles.heroValue, { color: c.text, fontFamily: Font.extraBold }]}>{openWorkload}</Text>
              <Text style={[styles.heroCaption, { color: subtleText, fontFamily: Font.regular }]}>
                Assigned + pending tickets right now
              </Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: heroTint, borderColor: `${Palette.primary}33` }]}>
              <Feather name="activity" size={22} color={Palette.primary} />
            </View>
          </View>
        </View>

        <SectionTitle label="Summary" subtleColor={subtleText} accentColor={Palette.primary} />

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <OverviewStatCard
              icon="user-check"
              iconColor={Palette.primary}
              iconBg={`${Palette.primary}18`}
              count={assigned.length}
              label="Assigned"
              activeTag
              borderColor={c.border}
              textColor={c.text}
              subtleColor={subtleText}
              surface={c.surface}
              accentBorder={false}
              cardLift={cardLift}
            />
            <OverviewStatCard
              icon="clock"
              iconColor={Palette.warning}
              iconBg={`${Palette.warning}20`}
              count={pending.length}
              label="Pending"
              borderColor={c.border}
              textColor={c.text}
              subtleColor={subtleText}
              surface={c.surface}
              accentBorder={false}
              cardLift={cardLift}
            />
          </View>
          <View style={styles.gridRow}>
            <OverviewStatCard
              icon="check-circle"
              iconColor={Palette.success}
              iconBg={`${Palette.success}18`}
              count={resolved.length}
              label="Resolved"
              borderColor={c.border}
              textColor={c.text}
              subtleColor={subtleText}
              surface={c.surface}
              accentBorder={false}
              cardLift={cardLift}
            />
            <OverviewStatCard
              icon="alert-circle"
              iconColor={Palette.danger}
              iconBg={`${Palette.danger}20`}
              count={escalated.length}
              label="Escalated"
              variant="danger"
              borderColor={c.border}
              textColor={c.text}
              subtleColor={subtleText}
              surface={c.surface}
              accentBorder
              cardLift={cardLift}
            />
          </View>
        </View>

        <SectionTitle label="Shortcuts" subtleColor={subtleText} accentColor={Palette.primary} />

        <TouchableOpacity
          style={[
            styles.actionRow,
            { backgroundColor: c.surface, borderColor: c.border },
            cardLift,
          ]}
          activeOpacity={0.72}
          onPress={() => router.push('/(tabs)/queries')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: `${Palette.primary}14`, borderWidth: 0 }]}>
            <Feather name="inbox" size={20} color={Palette.primary} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={[styles.actionTitle, { color: c.text, fontFamily: Font.semibold }]}>Pending tickets</Text>
            <Text style={[styles.actionSubtitle, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={2}>
              {pendingSubtitle}
            </Text>
          </View>
          <View style={[styles.chevronCircle, { backgroundColor: c.surfaceMuted }]}>
            <Feather name="chevron-right" size={18} color={c.icon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionRow,
            styles.actionRowAlert,
            { backgroundColor: c.surface, borderColor: c.border, marginTop: Spacing.md },
            cardLift,
          ]}
          activeOpacity={0.72}
          onPress={() => router.push('/(tabs)/queries')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: `${Palette.danger}16`, borderWidth: 0 }]}>
            <Feather name="alert-triangle" size={20} color={Palette.danger} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={[styles.actionTitle, { color: c.text, fontFamily: Font.semibold }]}>High priority</Text>
            <Text style={[styles.actionSubtitle, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={2}>
              {highPrioritySubtitle}
            </Text>
          </View>
          <View style={[styles.chevronCircle, { backgroundColor: c.surfaceMuted }]}>
            <Feather name="chevron-right" size={18} color={c.icon} />
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.recentPanel,
            {
              backgroundColor: c.surfaceMuted,
              borderColor: c.border,
            },
            cardLift,
          ]}
        >
          <View style={styles.recentPanelHeader}>
            <SectionTitle label="Recent queries" subtleColor={subtleText} accentColor={Palette.primary} inline />
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/queries')}
              hitSlop={12}
              style={[styles.viewAllPill, { backgroundColor: c.surface, borderColor: `${Palette.primary}35` }]}
              activeOpacity={0.75}
            >
              <Text style={[styles.viewAllPillText, { fontFamily: Font.semibold }]}>View all</Text>
              <Feather name="arrow-right" size={15} color={Palette.primary} />
            </TouchableOpacity>
          </View>

          {recentQueries.length > 0 ? (
            <View style={styles.recentList}>
              {recentQueries.map((ticket) => (
                <RecentQueryCard
                  key={ticket.id}
                  ticket={ticket}
                  isDark={isDark}
                  surface={c.surface}
                  borderColor={c.border}
                  textColor={c.text}
                  subtleText={subtleText}
                  mutedSurface={c.surfaceMuted}
                  onPress={() => router.push(`/(tabs)/chat/${ticket.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.recentEmptyInner, { borderColor: c.border, backgroundColor: c.surface }]}>
              <View style={[styles.recentEmptyIcon, { backgroundColor: heroTint }]}>
                <Feather name="inbox" size={26} color={Palette.primary} />
              </View>
              <Text style={[styles.recentEmptyTitle, { color: c.text, fontFamily: Font.semibold }]}>
                Nothing recent yet
              </Text>
              <Text style={[styles.recentEmptySub, { color: subtleText, fontFamily: Font.regular }]}>
                Pull down to refresh, or open Queries to browse everything.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({
  label,
  subtleColor,
  accentColor,
  inline,
}: {
  label: string;
  subtleColor: string;
  accentColor: string;
  inline?: boolean;
}) {
  return (
    <View style={[styles.sectionTitleRow, inline && styles.sectionTitleRowInline]}>
      <View style={[styles.sectionAccent, { backgroundColor: accentColor }]} />
      <Text style={[styles.sectionLabel, { color: subtleColor, fontFamily: Font.semibold }]}>{label}</Text>
    </View>
  );
}

function OverviewStatCard({
  icon,
  iconColor,
  iconBg,
  count,
  label,
  activeTag,
  variant,
  borderColor,
  textColor,
  subtleColor,
  surface,
  accentBorder,
  cardLift,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  iconBg: string;
  count: number;
  label: string;
  activeTag?: boolean;
  variant?: 'danger';
  borderColor: string;
  textColor: string;
  subtleColor: string;
  surface: string;
  accentBorder?: boolean;
  cardLift: object;
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
        cardLift,
      ]}
    >
      <View style={styles.statCardTop}>
        <View style={[styles.statIconCircle, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>
        {activeTag ? (
          <View style={[styles.activeTag, { backgroundColor: `${Palette.primary}14`, borderColor: `${Palette.primary}40` }]}>
            <Text style={[styles.activeTagText, { color: Palette.primary, fontFamily: Font.semibold }]}>Live</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.statCount, { color: countColor, fontFamily: Font.extraBold }]}>{count}</Text>
      <Text style={[styles.statLabel, { color: labelColor, fontFamily: Font.medium }]}>{label}</Text>
    </View>
  );
}

function StatusPill({ status, isDark }: { status: string; isDark: boolean }) {
  const s = status.toLowerCase();
  let bg = isDark ? '#33415580' : '#f4f4f5';
  let fg = isDark ? '#94a3b8' : '#64748b';
  let border = isDark ? '#475569' : '#e4e4e7';

  if (s === 'pending') {
    bg = isDark ? '#33415599' : '#f4f4f5';
    fg = isDark ? '#cbd5e1' : '#475569';
    border = isDark ? '#475569' : '#e2e8f0';
  } else if (s === 'assigned') {
    bg = `${Palette.primary}18`;
    fg = Palette.primary;
    border = `${Palette.primary}35`;
  } else if (s === 'resolved') {
    bg = `${Palette.success}16`;
    fg = Palette.success;
    border = `${Palette.success}35`;
  } else if (s === 'escalated') {
    bg = `${Palette.danger}18`;
    fg = Palette.danger;
    border = `${Palette.danger}40`;
  }

  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.pillText, { color: fg, fontFamily: Font.semibold }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

function RecentQueryCard({
  ticket,
  isDark,
  surface,
  borderColor,
  textColor,
  subtleText,
  mutedSurface,
  onPress,
}: {
  ticket: Ticket;
  isDark: boolean;
  surface: string;
  borderColor: string;
  textColor: string;
  subtleText: string;
  mutedSurface: string;
  onPress: () => void;
}) {
  const pColor = priorityAccentColor(ticket.priority);
  const details = formatTicketCardDetails(ticket);

  return (
    <TouchableOpacity
      style={[styles.recentCard, { backgroundColor: surface, borderColor }]}
      activeOpacity={0.72}
      onPress={onPress}
    >
      <View style={[styles.recentStripe, { backgroundColor: pColor }]} />
      <View style={[styles.recentLeadIcon, { backgroundColor: `${pColor}18`, borderColor: `${pColor}38` }]}>
        <Feather name="message-square" size={19} color={pColor} />
      </View>
      <View style={styles.recentCardMain}>
        <View style={styles.recentTopRow}>
          <View style={styles.recentIdCol}>
            <Text style={[styles.recentKicker, { color: subtleText, fontFamily: Font.medium }]}>Ticket</Text>
            <Text style={[styles.recentIdMono, { color: textColor, fontFamily: Font.bold }]} numberOfLines={1}>
              #{ticketCode(ticket.id)}
            </Text>
          </View>
          <StatusPill status={ticket.status} isDark={isDark} />
        </View>
        <Text style={[styles.recentSubject, { color: textColor, fontFamily: Font.semibold }]} numberOfLines={2}>
          {ticket.subject}
        </Text>
        <View style={styles.recentChipsRow}>
          <View style={[styles.recentChip, { backgroundColor: mutedSurface, borderColor }]}>
            <Feather name="layers" size={12} color={subtleText} />
            <Text style={[styles.recentChipLabel, { color: subtleText, fontFamily: Font.medium }]} numberOfLines={1}>
              {titleCaseWord(ticket.category)}
            </Text>
          </View>
          <View style={[styles.recentChip, { backgroundColor: `${pColor}12`, borderColor: `${pColor}32` }]}>
            <Feather name="flag" size={12} color={pColor} />
            <Text style={[styles.recentChipLabel, { color: pColor, fontFamily: Font.semibold }]} numberOfLines={1}>
              {titleCaseWord(ticket.priority)}
            </Text>
          </View>
        </View>
        {details ? (
          <Text style={[styles.recentDetailsLine, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        <View style={[styles.recentFooter, { borderTopColor: borderColor }]}>
          <Feather name="clock" size={14} color={subtleText} />
          <Text style={[styles.recentFooterTime, { color: subtleText, fontFamily: Font.medium }]}>
            {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
          </Text>
        </View>
      </View>
      <View style={[styles.recentChevronWrap, { backgroundColor: mutedSurface }]}>
        <Feather name="chevron-right" size={20} color={Palette.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  headerBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  headerAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingTop: Spacing.xs,
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
  greetingLine: {
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
    maxWidth: 260,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarText: {
    fontSize: 14,
  },
  iconBtn: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  heroCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  heroValue: {
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroCaption: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleRowInline: {
    marginTop: 0,
    marginBottom: 0,
    flexShrink: 1,
    minWidth: 0,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    minHeight: 124,
    overflow: 'hidden',
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  activeTagText: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statCount: {
    fontSize: 30,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
    letterSpacing: -0.1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  actionRowAlert: {
    borderLeftWidth: 3,
    borderLeftColor: Palette.danger,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentPanel: {
    marginTop: Spacing.xxxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  recentPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  viewAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  viewAllPillText: {
    fontSize: 13,
    color: Palette.primary,
    letterSpacing: -0.1,
  },
  recentList: {
    gap: Spacing.md,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentStripe: {
    width: 3,
  },
  recentLeadIcon: {
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    marginVertical: Spacing.md,
  },
  recentCardMain: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    minWidth: 0,
  },
  recentTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recentIdCol: {
    flex: 1,
    minWidth: 0,
  },
  recentKicker: {
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  recentIdMono: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
  recentSubject: {
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: -0.25,
    marginBottom: Spacing.sm,
  },
  recentChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
  },
  recentChipLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  recentDetailsLine: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.sm,
    opacity: 0.92,
  },
  recentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  recentFooterTime: {
    fontSize: 12,
    flex: 1,
  },
  recentChevronWrap: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recentEmptyInner: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  recentEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  recentEmptyTitle: {
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  recentEmptySub: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 260,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 9,
    letterSpacing: 0.6,
  },
});

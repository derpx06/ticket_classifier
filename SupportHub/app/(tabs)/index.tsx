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
  formatTicketCardDetails,
  Ticket,
} from '@/services/ticket-service';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Matches reference dashboard: short public-style id */
function displayTicketId(id: string): string {
  const tail = id.replace(/\s/g, '').slice(-4);
  return tail ? tail.toUpperCase() : 'XXXX';
}

function initials(name?: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

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

function assignedLabel(ticket: Ticket): string {
  const role = ticket.assignedRoleName?.trim();
  if (role) return role;
  const customer = ticket.customerName?.trim();
  if (customer) return customer;
  return 'Unassigned';
}

type WorkspaceStatusKey = 'open' | 'escalated' | 'pending' | 'resolved';

function workspaceStatusKey(status: Ticket['status']): WorkspaceStatusKey {
  if (status === 'escalated') return 'escalated';
  if (status === 'resolved') return 'resolved';
  if (status === 'pending' || status === 'closed') return 'pending';
  return 'open';
}

function workspacePillLabel(status: Ticket['status']): string {
  switch (status) {
    case 'assigned':
      return 'OPEN';
    case 'pending':
      return 'PENDING';
    case 'resolved':
      return 'RESOLVED';
    case 'escalated':
      return 'ESCALATED';
    case 'closed':
      return 'CLOSED';
    default: {
      const _x: never = status;
      return String(_x).toUpperCase();
    }
  }
}

export default function DashboardScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const cardLift = elevatedCard(isDark);

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
              style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.55 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={22} color={titleBlue} />
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />
        }
      >
        <View style={[styles.searchShell, { backgroundColor: c.surface, borderColor: c.border }, cardLift]}>
          <Feather name="search" size={20} color={c.icon} style={styles.searchGlyph} />
          <TextInput
            style={[styles.searchField, { color: c.text, fontFamily: Font.regular }]}
            placeholder="Smart search…"
            placeholderTextColor={c.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={styles.askAiBtn}
            onPress={() => router.push('/(tabs)/chat')}
            activeOpacity={0.88}
          >
            <Text style={[styles.askAiBtnText, { fontFamily: Font.bold }]}>ASK AI</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <TintedStatCard variant="open" count={openCount} label="OPEN" icon="layers" isDark={isDark} />
            <TintedStatCard
              variant="escalated"
              count={escalated.length}
              label="ESCALATED"
              icon="alert-triangle"
              isDark={isDark}
            />
          </View>
          <View style={styles.statRow}>
            <TintedStatCard variant="pending" count={pending.length} label="PENDING" icon="clock" isDark={isDark} />
            <TintedStatCard
              variant="resolved"
              count={resolved.length}
              label="RESOLVED"
              icon="check-circle"
              isDark={isDark}
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
                mutedSurface={c.surfaceMuted}
                onPress={() => router.push(`/(tabs)/chat/${ticket.id}`)}
                cardLift={cardLift}
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
}: {
  variant: WorkspaceStatusKey;
  count: number;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isDark: boolean;
}) {
  const t = isDark ? DARK_TINTS[variant] : LIGHT_TINTS[variant];

  return (
    <View style={[styles.tintedCard, { backgroundColor: t.bg }]}>
      <View style={[styles.tintedIconWrap, { backgroundColor: t.iconBg }]}>
        <Feather name={icon} size={22} color={t.iconFg} />
      </View>
      <Text style={[styles.tintedLabel, { color: t.labelColor, fontFamily: Font.semibold }]}>{label}</Text>
      <Text style={[styles.tintedCount, { color: t.countColor, fontFamily: Font.extraBold }]}>{count}</Text>
    </View>
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
  mutedSurface,
  onPress,
  cardLift,
}: {
  ticket: Ticket;
  isDark: boolean;
  surface: string;
  borderColor: string;
  textColor: string;
  subtleText: string;
  mutedSurface: string;
  onPress: () => void;
  cardLift: object;
}) {
  const key = workspaceStatusKey(ticket.status);
  const stripe = isDark ? DARK_TINTS[key].leftBar : LIGHT_TINTS[key].leftBar;
  const pill = workspacePillVisual(ticket.status, isDark);
  const details = formatTicketCardDetails(ticket);
  const assignee = assignedLabel(ticket);
  const assigneeInitials = initials(assignee === 'Unassigned' ? null : assignee);

  return (
    <TouchableOpacity
      style={[styles.wqCard, { backgroundColor: surface, borderColor }, cardLift]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={[styles.wqStripe, { backgroundColor: stripe }]} />
      <View style={styles.wqBody}>
        <View style={styles.wqTop}>
          <Text style={[styles.wqId, { color: subtleText, fontFamily: Font.medium }]} numberOfLines={1}>
            ID: #NX-{displayTicketId(ticket.id)}
          </Text>
          <View
            style={[
              styles.wqPill,
              {
                backgroundColor: pill.bg,
                borderColor: pill.border,
                borderWidth: pill.border === 'transparent' ? 0 : StyleSheet.hairlineWidth,
              },
            ]}
          >
            <Text style={[styles.wqPillText, { color: pill.fg, fontFamily: Font.bold }]}>{pill.label}</Text>
          </View>
        </View>
        <Text style={[styles.wqTitle, { color: textColor, fontFamily: Font.bold }]} numberOfLines={2}>
          {ticket.subject}
        </Text>
        {details ? (
          <Text style={[styles.wqDesc, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={3}>
            {details}
          </Text>
        ) : null}
        <View style={styles.wqAssignRow}>
          <View style={[styles.wqAvatar, { backgroundColor: mutedSurface, borderColor }]}>
            <Text style={[styles.wqAvatarText, { color: textColor, fontFamily: Font.semibold }]}>{assigneeInitials}</Text>
          </View>
          <Text style={[styles.wqAssignText, { color: subtleText, fontFamily: Font.regular }]} numberOfLines={1}>
            Assigned: {assignee}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function workspacePillVisual(
  status: Ticket['status'],
  isDark: boolean,
): { label: string; bg: string; fg: string; border: string } {
  const label = workspacePillLabel(status);
  if (status === 'escalated') {
    return {
      label,
      bg: isDark ? '#b91c1c' : '#dc2626',
      fg: '#ffffff',
      border: 'transparent',
    };
  }
  if (status === 'assigned') {
    return {
      label: 'OPEN',
      bg: isDark ? '#1e3a8a' : '#dbeafe',
      fg: isDark ? '#bfdbfe' : '#1d4ed8',
      border: isDark ? '#3b82f6' : '#93c5fd',
    };
  }
  if (status === 'pending') {
    return {
      label: 'PENDING',
      bg: isDark ? '#3f3f46' : '#f4f4f5',
      fg: isDark ? '#e4e4e7' : '#52525b',
      border: isDark ? '#52525b' : '#e4e4e7',
    };
  }
  if (status === 'resolved') {
    return {
      label: 'RESOLVED',
      bg: isDark ? '#065f46' : '#d1fae5',
      fg: isDark ? '#a7f3d0' : '#047857',
      border: isDark ? '#059669' : '#6ee7b7',
    };
  }
  if (status === 'closed') {
    return {
      label: 'CLOSED',
      bg: isDark ? '#334155' : '#f1f5f9',
      fg: isDark ? '#94a3b8' : '#64748b',
      border: isDark ? '#475569' : '#e2e8f0',
    };
  }
  return {
    label,
    bg: isDark ? '#334155' : '#f4f4f5',
    fg: isDark ? '#e2e8f0' : '#334155',
    border: isDark ? '#475569' : '#e4e4e7',
  };
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
    gap: Spacing.lg,
  },
  wqCard: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  wqStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  wqBody: {
    flex: 1,
    padding: Spacing.lg,
  },
  wqTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  wqId: {
    fontSize: 13,
    flex: 1,
    letterSpacing: 0.2,
  },
  wqPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  wqPillText: {
    fontSize: 10,
    letterSpacing: 0.55,
  },
  wqTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.25,
    marginBottom: Spacing.sm,
  },
  wqDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  wqAssignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  wqAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wqAvatarText: {
    fontSize: 11,
  },
  wqAssignText: {
    fontSize: 13,
    flex: 1,
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

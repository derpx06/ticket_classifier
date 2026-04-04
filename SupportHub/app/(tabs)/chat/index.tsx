import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDistanceToNowStrict } from 'date-fns';
import { getTickets, getMyTickets, Ticket } from '@/services/ticket-service';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  buildTicketTags,
  customerDisplayName,
  nexusCardPresentation,
  tagChipColors,
} from '@/utils/ticket-card-visuals';

function avatarLetter(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  return t.charAt(0).toUpperCase();
}

export default function ChatListScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const titleBlue = Palette.primary;
  const subtleText = c.textSecondary;

  const fetchData = useCallback(async () => {
    try {
      const data = user?.role === 'admin' ? await getTickets() : await getMyTickets();
      if (__DEV__) {
        console.log('[Chat list] tickets count', data.length);
        if (data[0]) console.log('[Chat list] sample ticket', JSON.stringify(data[0], null, 2));
      }
      setTickets(data);
    } catch (e) {
      console.error('Failed to fetch chat tickets:', e);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [tickets],
  );

  const renderItem = ({ item }: { item: Ticket }) => {
    const rel = formatDistanceToNowStrict(new Date(item.updatedAt), { addSuffix: true });
    const customer = customerDisplayName(item);
    const preview = item.subject?.trim() || '—';
    const vis = nexusCardPresentation(item.status, isDark);
    const priorityTag = buildTicketTags(item).find((t) => t.kind === 'priority');
    const priColors = priorityTag ? tagChipColors(priorityTag, item, isDark) : null;

    return (
      <TouchableOpacity
        style={[styles.threadRow, { borderBottomColor: c.border }]}
        onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.threadAvatar, { backgroundColor: c.surface, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth }]}>
          <Text style={[styles.threadAvatarText, { color: Palette.primary, fontFamily: Font.semibold }]}>
            {avatarLetter(customer)}
          </Text>
        </View>
        <View style={styles.threadBody}>
          <View style={styles.threadTitleRow}>
            <Text style={[styles.threadName, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={1}>
              {customer}
            </Text>
            <Text style={[styles.threadTime, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={1}>
              {rel}
            </Text>
          </View>
          <Text style={[styles.threadPreview, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={1}>
            {preview}
          </Text>
          <View style={styles.threadMetaRow}>
            <View style={[styles.threadMiniPill, { backgroundColor: vis.pillBg }]} accessibilityLabel={`Status ${vis.label}`}>
              <Text style={[styles.threadMiniPillText, { color: vis.pillFg, fontFamily: Font.semibold }]} numberOfLines={1}>
                {vis.label}
              </Text>
            </View>
            {priColors && priorityTag ? (
              <View style={[styles.threadMiniPill, { backgroundColor: priColors.bg }]} accessibilityLabel={`Priority ${priorityTag.text}`}>
                <Text style={[styles.threadMiniPillText, { color: priColors.fg, fontFamily: Font.semibold }]} numberOfLines={1}>
                  {priorityTag.text}
                </Text>
              </View>
            ) : null}
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
            <Text style={[styles.pageTitle, { color: titleBlue, fontFamily: Font.bold }]}>Messages</Text>
            <Text style={[styles.pageSubtitle, { color: subtleText, fontFamily: Font.regular }]}>
              Conversations for your tickets
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        style={[styles.listFlex, { backgroundColor: c.chatCanvas }]}
        data={sortedTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            flexGrow: 1,
            paddingBottom: Spacing.xxxl + insets.bottom,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: `${Palette.primary}12`, borderColor: `${Palette.primary}22` }]}>
              <Feather name="message-square" size={34} color={Palette.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: Font.semibold }]}>No conversations yet</Text>
            <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              Assigned tickets show up here. Pull down to refresh.
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
  listFlex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadAvatarText: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  threadBody: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  threadName: {
    flex: 1,
    fontSize: 16,
    letterSpacing: -0.25,
    lineHeight: 21,
  },
  threadTime: {
    fontSize: 12,
    letterSpacing: 0.1,
    flexShrink: 0,
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.1,
    opacity: 0.92,
  },
  threadMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  threadMiniPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    maxWidth: '100%',
  },
  threadMiniPillText: {
    fontSize: 10,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    minHeight: 280,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
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

function displayScalar(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' && v.trim() === '') return '—';
  return String(v);
}

function DetailRow({
  label,
  value,
  icon,
  c,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  c: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.detailRow, { borderColor: c.border, backgroundColor: c.surfaceMuted }]}>
      <View style={[styles.detailIconWrap, { backgroundColor: `${Palette.primary}16` }]}>
        <Feather name={icon} size={18} color={Palette.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: c.textSecondary, fontFamily: Font.medium }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: c.text, fontFamily: Font.semibold }]} selectable>
          {value}
        </Text>
      </View>
    </View>
  );
}

function DetailCard({
  title,
  children,
  c,
  cardLift,
}: {
  title: string;
  children: React.ReactNode;
  c: (typeof Colors)['light'];
  cardLift: object;
}) {
  return (
    <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.border }, cardLift]}>
      <Text style={[styles.sectionTitle, { color: c.text, fontFamily: Font.semibold }]}>{title}</Text>
      <View style={[styles.sectionDivider, { backgroundColor: c.border }]} />
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const cardLift = elevatedCard(isDark);

  const displayName = user?.name?.trim() || 'Account';
  const cr = user?.companyRole;
  const roleName = cr?.name?.trim() || '—';

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: Spacing.md,
            paddingHorizontal: Spacing.lg,
            backgroundColor: c.background,
            borderBottomColor: c.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.55 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: c.text, fontFamily: Font.semibold  }]}>Profile</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl, paddingHorizontal: Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.heroCard, cardLift]}>
          <Text style={[styles.heroKicker, { fontFamily: Font.medium }]}>PROFILE</Text>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={[styles.avatarText, { color: Palette.primary, fontFamily: Font.bold }]}>
              {initials(displayName)}
            </Text>
          </View>
          <Text style={[styles.name, { fontFamily: Font.bold }]} numberOfLines={2}>
            {displayName}
          </Text>
          <Text style={[styles.email, { fontFamily: Font.regular }]} numberOfLines={2}>
            {user?.email ?? '—'}
          </Text>
          <View style={styles.roleChip}>
            <Text style={[styles.roleChipText, { fontFamily: Font.semibold }]} numberOfLines={1}>
              {roleName}
            </Text>
          </View>
        </View>

        <DetailCard title="Account" c={c} cardLift={cardLift}>
          <DetailRow label="Name" value={displayScalar(user?.name)} icon="user" c={c} />
          <DetailRow label="Email" value={displayScalar(user?.email)} icon="mail" c={c} />
          <DetailRow label="Role" value={displayScalar(roleName)} icon="shield" c={c} />
        </DetailCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  topTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  topBarSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
  heroCard: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Palette.primary,
  },
  heroKicker: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.76)',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  avatarText: {
    fontSize: 28,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 30,
    letterSpacing: -0.9,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    color: '#ffffff',
    lineHeight: 34,
  },
  email: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'rgba(255,255,255,0.84)',
  },
  roleChip: {
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  roleChipText: {
    color: '#ffffff',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  section: {
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: Spacing.md,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
});

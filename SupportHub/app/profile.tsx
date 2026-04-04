import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import type { UserCompany } from '@/services/auth-service';
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

function formatPermissions(perms: Record<string, unknown>): string {
  try {
    return JSON.stringify(perms, null, 2);
  } catch {
    return '—';
  }
}

function isUserCompany(v: unknown): v is UserCompany {
  return (
    v != null &&
    typeof v === 'object' &&
    'uuid' in v &&
    typeof (v as UserCompany).uuid === 'string' &&
    'name' in v &&
    typeof (v as UserCompany).name === 'string'
  );
}

function DetailRow({
  label,
  value,
  mono,
  c,
}: {
  label: string;
  value: string;
  mono?: boolean;
  c: (typeof Colors)['light'];
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: c.textSecondary, fontFamily: Font.medium }]}>{label}</Text>
      <Text
        style={[styles.detailValue, { color: c.text, fontFamily: mono ? Font.mono : Font.regular }]}
        selectable
      >
        {value}
      </Text>
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
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const cardLift = elevatedCard(isDark);

  const displayName = user?.name?.trim() || 'Account';
  const company = user?.company;
  const companyOk = isUserCompany(company) ? company : null;
  const cr = user?.companyRole;

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
        <Text style={[styles.topTitle, { color: c.text, fontFamily: Font.semibold }]}>Profile</Text>
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
        <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.border }, cardLift]}>
          <View style={[styles.avatar, { backgroundColor: `${Palette.primary}22` }]}>
            <Text style={[styles.avatarText, { color: Palette.primary, fontFamily: Font.bold }]}>
              {initials(displayName)}
            </Text>
          </View>
          <Text style={[styles.name, { color: c.text, fontFamily: Font.bold }]} numberOfLines={2}>
            {displayName}
          </Text>
          <Text style={[styles.email, { color: c.textSecondary, fontFamily: Font.regular }]} numberOfLines={2}>
            {user?.email ?? '—'}
          </Text>
        </View>

        <DetailCard title="Account" c={c} cardLift={cardLift}>
          <DetailRow label="User ID" value={displayScalar(user?.id)} c={c} />
          <DetailRow label="Full name" value={displayScalar(user?.name)} c={c} />
          <DetailRow label="Email" value={displayScalar(user?.email)} c={c} />
          <DetailRow label="System role" value={displayScalar(user?.role)} c={c} />
          <DetailRow label="Company ID" value={displayScalar(user?.companyId)} c={c} />
          <DetailRow label="Company UUID" value={displayScalar(user?.companyUuid)} c={c} mono />
        </DetailCard>

        <DetailCard title="Company role" c={c} cardLift={cardLift}>
          {cr == null ? (
            <Text style={[styles.mutedLine, { color: c.textSecondary, fontFamily: Font.regular }]}>
              No company role assigned.
            </Text>
          ) : (
            <>
              <DetailRow label="Role ID" value={displayScalar(cr.id)} c={c} />
              <DetailRow label="Name" value={displayScalar(cr.name)} c={c} />
              <DetailRow label="Base role" value={displayScalar(cr.baseRole)} c={c} />
              <Text style={[styles.detailLabel, { color: c.textSecondary, fontFamily: Font.medium, marginTop: Spacing.md }]}>
                Permissions (JSON)
              </Text>
              <Text
                style={[styles.permissionsBlock, { color: c.text, fontFamily: Font.mono }]}
                selectable
              >
                {formatPermissions(cr.permissions ?? {})}
              </Text>
            </>
          )}
        </DetailCard>

        <DetailCard title="Organization" c={c} cardLift={cardLift}>
          {companyOk == null ? (
            <Text style={[styles.mutedLine, { color: c.textSecondary, fontFamily: Font.regular }]}>
              No organization details in session. Sign in again to refresh.
            </Text>
          ) : (
            <>
              <DetailRow label="UUID" value={displayScalar(companyOk.uuid)} c={c} mono />
              <DetailRow label="Name" value={displayScalar(companyOk.name)} c={c} />
              <DetailRow label="Country code" value={displayScalar(companyOk.countryCode)} c={c} />
              <DetailRow label="Industry" value={displayScalar(companyOk.industry)} c={c} />
              <DetailRow label="Phone" value={displayScalar(companyOk.phone)} c={c} />
              <DetailRow label="Website" value={displayScalar(companyOk.website)} c={c} />
              <DetailRow label="About" value={displayScalar(companyOk.about)} c={c} />
            </>
          )}
        </DetailCard>

        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => [
            styles.signOutBtn,
            {
              backgroundColor: c.surface,
              borderColor: Palette.danger,
              opacity: pressed ? 0.88 : 1,
            },
            cardLift,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Feather name="log-out" size={20} color={Palette.danger} />
          <Text style={[styles.signOutText, { color: Palette.danger, fontFamily: Font.semibold }]}>Sign out</Text>
        </Pressable>
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
    gap: Spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  avatarText: {
    fontSize: 28,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 22,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  detailRow: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: 11,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  permissionsBlock: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  mutedLine: {
    fontSize: 15,
    lineHeight: 22,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  signOutText: {
    fontSize: 16,
  },
});

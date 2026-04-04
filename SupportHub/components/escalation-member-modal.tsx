import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { listTeamMembers, type TeamMember } from '@/services/team-service';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function initials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  return t
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onAssign: (memberId: number) => void | Promise<void>;
  busyMemberId?: number | null;
};

export function EscalationMemberModal({ visible, onClose, onAssign, busyMemberId }: Props) {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { height: winH } = useWindowDimensions();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listTeamMembers();
      setMembers(list);
    } catch {
      Alert.alert('Error', 'Failed to load team members.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) void load();
  }, [visible, load]);

  const sheetMaxH = Math.min(winH * 0.78, 520);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.border, maxHeight: sheetMaxH }]}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroIconWrap}>
                <Feather name="users" size={20} color="#93c5fd" />
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.closeRound, { opacity: pressed ? 0.75 : 1 }]}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={20} color="#fff" />
              </Pressable>
            </View>
            <Text style={[styles.kicker, { fontFamily: Font.semibold }]}>ESCALATION DESK</Text>
            <Text style={[styles.title, { fontFamily: Font.bold }]}>Company team members</Text>
            <Text style={[styles.sub, { fontFamily: Font.regular }]}>
              Choose a teammate to assign this ticket. They will see it in their chat list and can continue the
              conversation in real time.
            </Text>
          </View>

          <View style={[styles.toolbar, { borderColor: c.border, backgroundColor: c.surfaceMuted }]}>
            <Text style={[styles.toolbarTitle, { color: c.text, fontFamily: Font.semibold }]}>
              Available team members
            </Text>
            <Text style={[styles.toolbarSub, { color: c.textSecondary, fontFamily: Font.regular }]}>
              {loading ? 'Loading members from backend…' : `${members.length} member${members.length === 1 ? '' : 's'} found`}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Palette.primary} />
            </View>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const busy = busyMemberId === item.id;
                return (
                  <Pressable
                    onPress={() => void onAssign(item.id)}
                    disabled={busy || busyMemberId != null}
                    style={({ pressed }) => [
                      styles.card,
                      {
                        borderColor: c.border,
                        backgroundColor: c.surface,
                        opacity: pressed && !busy ? 0.92 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Assign to ${item.fullName || 'member'}`}
                  >
                    <View style={[styles.avatar, { backgroundColor: `${Palette.primary}18` }]}>
                      <Text style={[styles.avatarText, { color: Palette.primary, fontFamily: Font.bold }]}>
                        {initials(item.fullName || item.email || '?')}
                      </Text>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={[styles.name, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={1}>
                        {item.fullName?.trim() || 'Unnamed member'}
                      </Text>
                      {item.email ? (
                        <Text
                          style={[styles.email, { color: c.textSecondary, fontFamily: Font.regular }]}
                          numberOfLines={1}
                        >
                          {item.email}
                        </Text>
                      ) : null}
                    </View>
                    {busy ? <ActivityIndicator color={Palette.primary} size="small" /> : <Feather name="chevron-right" size={20} color={c.icon} />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: c.textSecondary, fontFamily: Font.regular }]}>
                  No team members found.
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    zIndex: 1,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  hero: {
    backgroundColor: '#0f172a',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: '#7dd3fc',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(241,245,249,0.88)',
  },
  toolbar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  toolbarSub: {
    fontSize: 12,
  },
  loadingBox: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    lineHeight: 20,
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.xl,
    fontSize: 14,
  },
});

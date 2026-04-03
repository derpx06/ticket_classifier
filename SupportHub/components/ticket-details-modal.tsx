import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import type { Ticket, TicketStatus } from '@/services/ticket-service';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

function titleCase(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function statusLabel(status: TicketStatus): string {
  switch (status) {
    case 'escalated':
      return 'Escalated';
    case 'assigned':
      return 'Assigned';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Pending';
  }
}

function triagePillLabel(priority: Ticket['priority']): string {
  if (priority === 'low') return 'Low';
  if (priority === 'medium') return 'Neutral';
  return 'Urgent';
}

function formatCreatedAt(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM dd, hh:mm a');
  } catch {
    return '—';
  }
}

function assignedRoleLine(ticket: Ticket): string {
  if (ticket.assignedRoleName?.trim()) return ticket.assignedRoleName.trim();
  if (ticket.agentId) return `#${String(ticket.agentId)}`;
  return '—';
}

const TERMINAL: TicketStatus[] = ['resolved', 'escalated', 'closed'];

type Props = {
  ticket: Ticket | null;
  visible: boolean;
  onClose: () => void;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
  onEscalate: (id: string) => Promise<void>;
};

export function TicketDetailsModal({
  ticket,
  visible,
  onClose,
  onAccept,
  onReject,
  onResolve,
  onEscalate,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = Colors[colorScheme ?? 'light'];
  const { height: winH } = useWindowDimensions();
  const [busy, setBusy] = useState<'accept' | 'reject' | 'resolve' | 'escalate' | null>(null);

  if (!ticket) return null;

  const actionsBlocked = TERMINAL.includes(ticket.status);
  const isPending = ticket.status === 'pending';
  const isAssigned = ticket.status === 'assigned';

  const run = async (kind: 'accept' | 'reject' | 'resolve' | 'escalate', fn: () => Promise<void>) => {
    setBusy(kind);
    try {
      await fn();
      onClose();
    } catch {
      Alert.alert('Error', 'Could not complete that action. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const customerLine = ticket.customerName?.trim() || 'AI Chat User';

  const categoryPill = { bg: isDark ? '#3b2f5c' : '#ede9fe', fg: isDark ? '#ddd6fe' : '#5b21b6' };
  const priorityPill = { bg: isDark ? '#4a3008' : '#ffedd5', fg: isDark ? '#fdba74' : '#c2410c' };
  const triagePill = { bg: isDark ? '#374151' : '#f1f5f9', fg: isDark ? '#cbd5e1' : '#475569' };

  const statusPill = (() => {
    switch (ticket.status) {
      case 'escalated':
        return { bg: isDark ? '#451a03' : '#fee2e2', fg: isDark ? '#fca5a5' : '#b91c1c' };
      case 'assigned':
        return { bg: isDark ? '#1e3a5f' : '#dbeafe', fg: isDark ? '#93c5fd' : '#1d4ed8' };
      case 'resolved':
        return { bg: isDark ? '#14532d' : '#dcfce7', fg: isDark ? '#86efac' : '#166534' };
      case 'closed':
        return { bg: isDark ? '#374151' : '#e2e8f0', fg: isDark ? '#cbd5e1' : '#475569' };
      default:
        return { bg: isDark ? '#4b2e07' : '#fef3c7', fg: isDark ? '#fcd34d' : '#b45309' };
    }
  })();

  const sheetMaxH = Math.min(winH * 0.88, 640);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={[styles.sheet, { backgroundColor: c.surface, maxHeight: sheetMaxH }]} accessibilityViewIsModal>
          <View style={styles.headerBlue}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.75 : 1 }]}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={[styles.closeBtnText, { fontFamily: Font.semibold }]}>Close</Text>
            </Pressable>
            <Text style={[styles.headerKicker, { fontFamily: Font.medium }]}>TICKET DETAILS</Text>
            <Text style={[styles.headerId, { fontFamily: Font.bold }]} numberOfLines={2} selectable>
              {ticket.id}
            </Text>
            <Text style={[styles.headerSub, { fontFamily: Font.regular }]} numberOfLines={1}>
              {customerLine}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pillRow}>
              <View style={[styles.pill, { backgroundColor: statusPill.bg }]}>
                <Text style={[styles.pillText, { color: statusPill.fg, fontFamily: Font.semibold }]}>
                  {statusLabel(ticket.status)}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: categoryPill.bg }]}>
                <Text style={[styles.pillText, { color: categoryPill.fg, fontFamily: Font.semibold }]}>
                  {titleCase(ticket.category)}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: priorityPill.bg }]}>
                <Text style={[styles.pillText, { color: priorityPill.fg, fontFamily: Font.semibold }]}>
                  {titleCase(ticket.priority)}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: triagePill.bg }]}>
                <Text style={[styles.pillText, { color: triagePill.fg, fontFamily: Font.semibold }]}>
                  {triagePillLabel(ticket.priority)}
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionKicker, { color: c.textSecondary, fontFamily: Font.medium }]}>
              CUSTOMER MESSAGE
            </Text>
            <View style={[styles.messageBox, { borderColor: c.border, backgroundColor: c.surfaceMuted }]}>
              <Text style={[styles.messageText, { color: c.text, fontFamily: Font.regular }]} selectable>
                {ticket.subject}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.metaCell, { borderColor: c.border, backgroundColor: c.surfaceMuted }]}>
                <Text style={[styles.metaLabel, { color: c.textSecondary, fontFamily: Font.medium }]}>CREATED</Text>
                <Text style={[styles.metaValue, { color: c.text, fontFamily: Font.semibold }]}>
                  {formatCreatedAt(ticket.createdAt)}
                </Text>
              </View>
              <View style={[styles.metaCell, { borderColor: c.border, backgroundColor: c.surfaceMuted }]}>
                <Text style={[styles.metaLabel, { color: c.textSecondary, fontFamily: Font.medium }]}>
                  ASSIGNED ROLE
                </Text>
                <Text style={[styles.metaValue, { color: c.text, fontFamily: Font.semibold }]} numberOfLines={2}>
                  {assignedRoleLine(ticket)}
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionKicker, { color: c.textSecondary, fontFamily: Font.medium }]}>ACTIONS</Text>
            <View style={styles.actionRow}>
              {isPending && (
                <>
                  <ModalActionButton
                    label="Accept Ticket"
                    icon="check-circle"
                    variant="primary"
                    disabled={actionsBlocked}
                    loading={busy === 'accept'}
                    onPress={() => run('accept', () => onAccept(ticket.id))}
                    isDark={isDark}
                  />
                  <ModalActionButton
                    label="Reject Ticket"
                    icon="alert-triangle"
                    variant="danger"
                    disabled={actionsBlocked}
                    loading={busy === 'reject'}
                    onPress={() => run('reject', () => onReject(ticket.id))}
                    isDark={isDark}
                  />
                </>
              )}
              {isAssigned && (
                <>
                  <ModalActionButton
                    label="Resolve"
                    icon="check-circle"
                    variant="primary"
                    disabled={actionsBlocked}
                    loading={busy === 'resolve'}
                    onPress={() => run('resolve', () => onResolve(ticket.id))}
                    isDark={isDark}
                  />
                  <ModalActionButton
                    label="Escalate"
                    icon="alert-triangle"
                    variant="danger"
                    disabled={actionsBlocked}
                    loading={busy === 'escalate'}
                    onPress={() => run('escalate', () => onEscalate(ticket.id))}
                    isDark={isDark}
                  />
                </>
              )}
              {actionsBlocked && (
                <>
                  <ModalActionButton
                    label="Accept Ticket"
                    icon="check-circle"
                    variant="primary"
                    disabled
                    loading={false}
                    onPress={() => {}}
                    isDark={isDark}
                  />
                  <ModalActionButton
                    label="Reject Ticket"
                    icon="alert-triangle"
                    variant="danger"
                    disabled
                    loading={false}
                    onPress={() => {}}
                    isDark={isDark}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ModalActionButton({
  label,
  icon,
  variant,
  disabled,
  loading,
  onPress,
  isDark,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  variant: 'primary' | 'danger';
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  const primaryBg = isDark ? '#1e3a5f' : '#eff6ff';
  const primaryBorder = Palette.primary;
  const primaryFg = Palette.primary;
  const dangerBg = isDark ? '#450a0a' : '#fef2f2';
  const dangerBorder = Palette.danger;
  const dangerFg = Palette.danger;

  const bg = variant === 'primary' ? primaryBg : dangerBg;
  const border = variant === 'primary' ? primaryBorder : dangerBorder;
  const fg = variant === 'primary' ? primaryFg : dangerFg;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.modalBtn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.42 : pressed ? 0.88 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          <Feather name={icon} size={18} color={fg} style={styles.modalBtnIcon} />
          <Text style={[styles.modalBtnText, { color: fg, fontFamily: Font.semibold }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  sheet: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    zIndex: 1,
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
  headerBlue: {
    backgroundColor: '#2563eb',
    paddingTop: Spacing.xl + 4,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    zIndex: 2,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 12,
  },
  headerKicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  headerId: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    marginBottom: Spacing.xs,
    paddingRight: 88,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  scroll: {},
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  sectionKicker: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metaCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 72,
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  metaValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  modalBtnIcon: {
    marginRight: 2,
  },
  modalBtnText: {
    fontSize: 13,
    textAlign: 'center',
    flexShrink: 1,
  },
});

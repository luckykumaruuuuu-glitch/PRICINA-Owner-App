import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Lead, LeadStatus } from '@/context/AppContext';

export function BrandMark({ small = false }: { small?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.mark, small && styles.markSmall, { backgroundColor: colors.primary }]}>
      <Text style={[styles.markText, small && styles.markTextSmall, { color: colors.background }]}>
        P
      </Text>
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Pill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
}) {
  const colors = useColors();
  const palette = {
    default: { backgroundColor: colors.secondary, color: colors.secondaryForeground },
    primary: { backgroundColor: colors.accent, color: colors.primary },
    success: { backgroundColor: '#15352D', color: '#6AE3BB' },
    warning: { backgroundColor: '#3B2D1D', color: '#F7C979' },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.pillText, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

export function LeadCard({
  lead,
  onPress,
  compact = false,
}: {
  lead: Lead;
  onPress: () => void;
  compact?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open inquiry from ${lead.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.leadCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
      ]}
    >
      <View style={styles.leadTop}>
        <View style={styles.leadIdentity}>
          <Text numberOfLines={1} style={[styles.leadName, { color: colors.foreground }]}>
            {lead.name}
          </Text>
          <Text numberOfLines={1} style={[styles.leadBusiness, { color: colors.mutedForeground }]}>
            {lead.businessName}
          </Text>
        </View>
        {lead.status === 'new' ? <Pill label="NEW" tone="primary" /> : null}
      </View>
      <View style={styles.leadMeta}>
        <Text style={[styles.metaText, { color: colors.primary }]}>{lead.selectedPlan}</Text>
        <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
        <Text numberOfLines={1} style={[styles.metaText, { color: colors.mutedForeground }]}>
          {lead.phone}
        </Text>
      </View>
      {!compact ? (
        <View style={styles.leadBottom}>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            {formatDate(lead.createdAt)} · {formatTime(lead.createdAt)}
          </Text>
          {lead.isExisting ? <Pill label="EXISTING" tone="success" /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search inquiries',
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name="search" size={18} color={colors.mutedForeground} />
      <TextInput
        accessibilityLabel="Search inquiries"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.searchInput, { color: colors.foreground }]}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityLabel="Clear search">
          <Feather name="x-circle" size={17} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function StatusSelector({
  status,
  onChange,
}: {
  status: LeadStatus;
  onChange: (status: LeadStatus) => void;
}) {
  const colors = useColors();
  const statuses: LeadStatus[] = ['new', 'contacted', 'follow-up', 'converted', 'closed'];
  return (
    <View style={styles.statusWrap}>
      {statuses.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[
            styles.statusOption,
            {
              backgroundColor: option === status ? colors.primary : colors.secondary,
              borderColor: option === status ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.statusOptionText,
              { color: option === status ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function LoadingState() {
  const colors = useColors();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading inquiries…</Text>
    </View>
  );
}

export function formatDate(value: Lead['createdAt']) {
  if (!value) return 'Date not provided';
  let date: Date;
  if (value instanceof Date) date = value;
  else if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    date = value.toDate();
  } else date = new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return 'Date not provided';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(value: Lead['createdAt']) {
  if (!value) return 'Time not provided';
  let date: Date;
  if (value instanceof Date) date = value;
  else if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    date = value.toDate();
  } else date = new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return 'Time not provided';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  mark: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  markSmall: { width: 34, height: 34, borderRadius: 11 },
  markText: { fontSize: 25, fontWeight: '700', letterSpacing: -2 },
  markTextSmall: { fontSize: 19 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 },
  headerCopy: { gap: 5 },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 31, fontWeight: '700', letterSpacing: -1.1 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7 },
  leadCard: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 10, gap: 13 },
  leadTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  leadIdentity: { flex: 1, gap: 3 },
  leadName: { fontSize: 16, fontWeight: '700' },
  leadBusiness: { fontSize: 12 },
  leadMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { fontSize: 12, flexShrink: 1 },
  metaDot: { fontSize: 15 },
  leadBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: 11 },
  empty: { borderWidth: 1, borderRadius: 20, alignItems: 'center', paddingHorizontal: 24, paddingVertical: 35, gap: 9 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyBody: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  search: { borderWidth: 1, borderRadius: 15, minHeight: 50, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, minHeight: 48 },
  statusWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  statusOption: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  statusOptionText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { fontSize: 13 },
});
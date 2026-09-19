import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrandMark, ScreenHeader } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

function SettingRow({ icon, label, detail, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; detail: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={17} color={colors.primary} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.rowDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      {onPress ? <Feather name="chevron-right" size={17} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { user } = useApp();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="ACCOUNT" title="Profile" />
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <BrandMark small />
        <View style={styles.profileCopy}>
          <Text style={[styles.ownerName, { color: colors.foreground }]}>PRICINA Owner</Text>
          <Text style={[styles.ownerEmail, { color: colors.mutedForeground }]}>{user?.email ?? 'Owner account'}</Text>
        </View>
        <View style={[styles.secureBadge, { backgroundColor: '#15352D' }]}>
          <Feather name="shield" size={13} color="#6AE3BB" />
          <Text style={styles.secureText}>SECURE</Text>
        </View>
      </View>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREFERENCES</Text>
      <View style={[styles.settings, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow icon="bell" label="Notifications" detail="Inquiry alerts and activity" />
        <SettingRow icon="moon" label="Appearance" detail="Dark mode · PRICINA night" />
        <SettingRow icon="lock" label="Security" detail="Firebase owner authentication" />
        <SettingRow icon="info" label="About PRICINA" detail="Private lead management portal" />
      </View>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>PRICINA Owner Portal · Lead history is never deleted.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  profileCard: { borderWidth: 1, borderRadius: 20, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  profileCopy: { flex: 1, gap: 4 },
  ownerName: { fontSize: 15, fontWeight: '700' },
  ownerEmail: { fontSize: 12 },
  secureBadge: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
  secureText: { color: '#6AE3BB', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  sectionLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: '700', marginBottom: 10 },
  settings: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 15 },
  row: { minHeight: 68, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, gap: 4 },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowDetail: { fontSize: 11 },
  footer: { textAlign: 'center', fontSize: 10, marginTop: 20 },
});
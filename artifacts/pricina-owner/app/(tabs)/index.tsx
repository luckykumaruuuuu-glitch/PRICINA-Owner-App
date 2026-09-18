import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LeadCard, LoadingState, ScreenHeader, StatCard } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function DashboardScreen() {
  const colors = useColors();
  const { leads, isLeadsLoading, error, refresh } = useApp();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toDateString();
  const todaysLeads = leads.filter((lead) => {
    if (!lead.createdAt) return false;
    const value =
      lead.createdAt instanceof Date
        ? lead.createdAt
        : typeof lead.createdAt === 'object' && 'toDate' in lead.createdAt
          ? lead.createdAt.toDate()
          : new Date(lead.createdAt);
    return value.toDateString() === today;
  }).length;
  const newLeads = leads.filter((lead) => lead.status === 'new');
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="PRICINA / OWNER PORTAL" title={greeting} right={<Pressable accessibilityLabel="Open profile" onPress={() => router.push('/(tabs)/profile')} style={[styles.profileButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="user" size={18} color={colors.primary} /></Pressable>} />
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroKicker, { color: colors.primary }]}>LEAD OVERVIEW</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Stay close to every opportunity.</Text>
          <Text style={[styles.heroBody, { color: colors.mutedForeground }]}>Your latest customer inquiries, in one focused view.</Text>
        </View>
        <View style={[styles.heroOrb, { backgroundColor: colors.accent }]}><Feather name="activity" size={24} color={colors.primary} /></View>
      </View>
      {error ? <Pressable onPress={refresh} style={[styles.errorBanner, { backgroundColor: '#351D2A', borderColor: '#643044' }]}><Feather name="wifi-off" size={16} color={colors.destructive} /><Text style={[styles.errorBannerText, { color: '#FFB6C3' }]}>{error}</Text><Text style={[styles.retry, { color: colors.primary }]}>Retry</Text></Pressable> : null}
      <View style={styles.statGrid}>
        <StatCard icon="inbox" value={newLeads.length} label="New leads" accent />
        <StatCard icon="layers" value={leads.length} label="Total inquiries" />
        <StatCard icon="users" value={leads.filter((lead) => lead.isExisting).length} label="Existing clients" />
        <StatCard icon="sun" value={todaysLeads} label="Today's leads" />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Latest inquiries</Text>
        <Pressable onPress={() => router.push('/(tabs)/leads')} accessibilityRole="button"><Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text></Pressable>
      </View>
      {isLeadsLoading ? <LoadingState /> : newLeads.length ? newLeads.slice(0, 3).map((lead) => <LeadCard key={lead.id} lead={lead} onPress={() => router.push(`/leads/${lead.id}`)} />) : <View style={[styles.allCaughtUp, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="check-circle" size={20} color="#6AE3BB" /><View style={{ flex: 1 }}><Text style={[styles.caughtTitle, { color: colors.foreground }]}>You’re all caught up.</Text><Text style={[styles.caughtBody, { color: colors.mutedForeground }]}>New inquiries will appear here automatically.</Text></View></View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  profileButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 22, backgroundColor: '#0D2138', padding: 19, minHeight: 160, flexDirection: 'row', justifyContent: 'space-between', overflow: 'hidden', marginBottom: 15 },
  heroCopy: { flex: 1, maxWidth: 240, gap: 8 },
  heroKicker: { fontSize: 10, letterSpacing: 1.3, fontWeight: '700' },
  heroTitle: { fontSize: 23, lineHeight: 29, fontWeight: '700', letterSpacing: -0.6 },
  heroBody: { fontSize: 12, lineHeight: 18 },
  heroOrb: { width: 58, height: 58, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  errorBanner: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 },
  errorBannerText: { flex: 1, fontSize: 11, lineHeight: 16 },
  retry: { fontSize: 11, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 12, fontWeight: '700' },
  allCaughtUp: { borderWidth: 1, borderRadius: 18, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  caughtTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  caughtBody: { fontSize: 12 },
});

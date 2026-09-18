import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { EmptyState, LeadCard, LoadingState, ScreenHeader, SearchField } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const filters = ['all', 'new', 'contacted', 'follow-up', 'converted', 'closed'] as const;

export default function LeadsScreen() {
  const colors = useColors();
  const { leads, isLeadsLoading } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('new');
  const visibleLeads = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesFilter = filter === 'all' || lead.status === filter;
      const matchesSearch =
        !needle ||
        [lead.name, lead.phone, lead.email, lead.businessName].some((value) =>
          value.toLowerCase().includes(needle),
        );
      return matchesFilter && matchesSearch;
    });
  }, [filter, leads, search]);
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        eyebrow="INBOX"
        title="New leads"
        right={
          <View style={[styles.count, { backgroundColor: colors.accent }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{leads.filter((lead) => lead.status === 'new').length}</Text>
          </View>
        }
      />
      <SearchField value={search} onChangeText={setSearch} placeholder="Search name, phone, business…" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((option) => (
          <Pressable
            key={option}
            onPress={() => setFilter(option)}
            style={[styles.filter, { backgroundColor: option === filter ? colors.primary : colors.card, borderColor: option === filter ? colors.primary : colors.border }]}
          >
            <Text style={[styles.filterText, { color: option === filter ? colors.primaryForeground : colors.mutedForeground }]}>
              {option === 'all' ? 'All' : option}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.resultHeader}>
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>{visibleLeads.length} {visibleLeads.length === 1 ? 'inquiry' : 'inquiries'}</Text>
        <Feather name="sliders" size={15} color={colors.mutedForeground} />
      </View>
      {isLeadsLoading ? <LoadingState /> : visibleLeads.length ? visibleLeads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} onPress={() => router.push(`/leads/${lead.id}`)} />
      )) : (
        <EmptyState icon="inbox" title={search ? 'No matches found' : filter === 'new' ? 'No new inquiries' : 'Nothing here yet'} body={search ? 'Try a different name, phone number, or business.' : 'New customer inquiries will appear here automatically.'} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  count: { minWidth: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 15, fontWeight: '700' },
  filterRow: { gap: 7, paddingBottom: 18 },
  filter: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  filterText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  resultCount: { fontSize: 12 },
});
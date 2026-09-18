import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { EmptyState, LeadCard, LoadingState, ScreenHeader, SearchField } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ClientsScreen() {
  const colors = useColors();
  const { leads, isLeadsLoading } = useApp();
  const [search, setSearch] = useState('');
  const clients = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (!lead.isExisting) return false;
      return !needle || [lead.name, lead.phone, lead.businessName, lead.email].some((value) => value.toLowerCase().includes(needle));
    });
  }, [leads, search]);
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="RELATIONSHIPS" title="Clients" />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Historical inquiries grouped by phone number, so repeat customers stay connected to their full story.</Text>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search clients…" />
      {isLeadsLoading ? <LoadingState /> : clients.length ? clients.map((lead) => <LeadCard key={lead.id} lead={lead} onPress={() => router.push(`/leads/${lead.id}`)} />) : <EmptyState icon="users" title="No clients found" body={search ? 'Try another search.' : 'Repeat inquiries will be identified here automatically.'} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 20, maxWidth: 440 },
});
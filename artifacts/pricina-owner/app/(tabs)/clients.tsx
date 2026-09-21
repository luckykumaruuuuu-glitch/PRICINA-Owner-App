import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { EmptyState, LeadCard, LoadingState, ScreenHeader, SearchField } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function OldClientsScreen() {
  const colors = useColors();
  const { leads, isLeadsLoading } = useApp();
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();
  const clients = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.isExisting &&
          (!needle ||
            [lead.name, lead.phone, lead.businessName, lead.email].some((value) =>
              value.toLowerCase().includes(needle),
            )),
      ),
    [leads, needle],
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader eyebrow="HISTORY" title="Old clients" />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Previous requests grouped by customer phone number.
      </Text>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search old clients…" />
      {isLeadsLoading ? (
        <LoadingState />
      ) : clients.length ? (
        clients.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onPress={() => router.push(`/leads/${lead.id}`)} />
        ))
      ) : (
        <EmptyState
          icon="users"
          title={search ? 'No matches found' : 'No old clients yet'}
          body={search ? 'Try another search.' : 'Repeat customers will appear here automatically.'}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  intro: { fontSize: 13, lineHeight: 19, marginTop: -8, marginBottom: 18 },
});
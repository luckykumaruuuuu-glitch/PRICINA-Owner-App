import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { EmptyState, LeadCard, LoadingState, ScreenHeader, SearchField } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function RequestsScreen() {
  const colors = useColors();
  const { leads, notifications, isLeadsLoading } = useApp();
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();
  const visibleLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          !needle ||
          [lead.name, lead.phone, lead.email, lead.businessName].some((value) =>
            value.toLowerCase().includes(needle),
          ),
      ),
    [leads, needle],
  );
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        eyebrow="FIREBASE HISTORY"
        title="Requests"
        right={
          <Pressable
            accessibilityLabel="Open notifications"
            onPress={() => router.push('/(tabs)/notifications')}
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="bell" size={18} color={colors.primary} />
            {unread ? <View style={[styles.badge, { backgroundColor: colors.primary }]} /> : null}
          </Pressable>
        }
      />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        All customer requests, newest first.
      </Text>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search requests…" />
      <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
        {visibleLeads.length} {visibleLeads.length === 1 ? 'request' : 'requests'}
      </Text>
      {isLeadsLoading ? (
        <LoadingState />
      ) : visibleLeads.length ? (
        visibleLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onPress={() => router.push(`/leads/${lead.id}`)} />
        ))
      ) : (
        <EmptyState
          icon="inbox"
          title={search ? 'No matches found' : 'No requests yet'}
          body={search ? 'Try another name, phone number, or business.' : 'Requests will appear here automatically.'}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { position: 'absolute', right: 8, top: 7, width: 7, height: 7, borderRadius: 7 },
  intro: { fontSize: 13, lineHeight: 19, marginTop: -8, marginBottom: 18 },
  resultCount: { fontSize: 12, marginBottom: 11 },
});
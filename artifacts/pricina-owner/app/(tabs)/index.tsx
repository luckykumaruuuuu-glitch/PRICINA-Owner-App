import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { EmptyState, LeadCard, LoadingState, ScreenHeader, SearchField } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function NewClientsScreen() {
  const colors = useColors();
  const { leads, notifications, isLeadsLoading, error, refresh } = useApp();
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();
  const newClients = useMemo(
    () =>
      leads.filter(
        (lead) =>
          !lead.isExisting &&
          (!needle ||
            [lead.name, lead.phone, lead.businessName, lead.email].some((value) =>
              value.toLowerCase().includes(needle),
            )),
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
        eyebrow="PRICINA / OWNER"
        title="New clients"
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
        Recent customer requests from Firebase.
      </Text>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search new clients…" />
      {error ? (
        <Pressable
          onPress={refresh}
          style={[styles.error, { backgroundColor: '#351D2A', borderColor: '#643044' }]}
        >
          <Text style={[styles.errorText, { color: '#FFB6C3' }]}>{error}</Text>
          <Text style={[styles.retry, { color: colors.primary }]}>Retry</Text>
        </Pressable>
      ) : null}
      {isLeadsLoading ? (
        <LoadingState />
      ) : newClients.length ? (
        newClients.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onPress={() => router.push(`/leads/${lead.id}`)} />
        ))
      ) : (
        <EmptyState
          icon="user-plus"
          title={search ? 'No matches found' : 'No new clients yet'}
          body={
            search
              ? 'Try another name, phone number, or business.'
              : 'New customer requests will appear here automatically.'
          }
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
  error: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 11, lineHeight: 16 },
  retry: { fontSize: 11, fontWeight: '700' },
});
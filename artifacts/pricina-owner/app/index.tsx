import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { BrandMark } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function EntryScreen() {
  const colors = useColors();
  const { isLoading } = useApp();
  // The owner app opens directly to the dashboard. Firebase authentication
  // still gates the Firestore listener inside AppProvider; unauthenticated
  // sessions see the dashboard error state instead of a login screen.
  if (!isLoading) return <Redirect href="/(tabs)" />;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BrandMark />
      <Text style={[styles.brand, { color: colors.foreground }]}>PRICINA</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Owner Portal</Text>
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 28, fontWeight: '700', letterSpacing: 5, marginTop: 16 },
  subtitle: { fontSize: 13, marginTop: 8 },
  spinner: { marginTop: 34 },
});
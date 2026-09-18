import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="leads/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [fontGateTimedOut, setFontGateTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFontGateTimedOut(true);
      void SplashScreen.hideAsync();
    }, 1500);
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError && !fontGateTimedOut) {
    return <FontLoadingFallback />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function FontLoadingFallback() {
  const colors = useColors();
  return (
    <View style={[styles.fontFallback, { backgroundColor: colors.background }]}>
      <View style={[styles.fallbackMark, { backgroundColor: colors.primary }]}>
        <Text style={[styles.fallbackMarkText, { color: colors.background }]}>P</Text>
      </View>
      <Text style={[styles.fallbackBrand, { color: colors.foreground }]}>PRICINA</Text>
      <Text style={[styles.fallbackSubtitle, { color: colors.mutedForeground }]}>Owner Portal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fontFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackMark: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  fallbackMarkText: { fontSize: 25, fontWeight: '700' },
  fallbackBrand: { fontSize: 26, fontWeight: '700', letterSpacing: 5, marginTop: 15 },
  fallbackSubtitle: { fontSize: 13, marginTop: 7 },
});

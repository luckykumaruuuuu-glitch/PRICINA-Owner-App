import React from 'react';
import { Platform, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

function TabIcon({
  name,
  color,
}: {
  name: keyof typeof Feather.glyphMap;
  color: ColorValue;
}) {
  return <Feather name={name} size={20} color={color} />;
}

export default function TabLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 84 : 76,
          paddingBottom: Platform.OS === 'web' ? 28 : 14,
          paddingTop: 9,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'New clients', tabBarIcon: ({ color }) => <TabIcon name="user-plus" color={color} /> }}
      />
      <Tabs.Screen
        name="leads"
        options={{ title: 'Requests', tabBarIcon: ({ color }) => <TabIcon name="inbox" color={color} /> }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Old clients', tabBarIcon: ({ color }) => <TabIcon name="users" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} /> }}
      />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
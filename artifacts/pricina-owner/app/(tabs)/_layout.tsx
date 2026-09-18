import React from 'react';
import { Platform, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

function TabIcon({
  name,
  color,
}: {
  name: keyof typeof Feather.glyphMap;
  color: ColorValue;
}) {
  return <Feather name={name} size={21} color={color} />;
}

export default function TabLayout() {
  const colors = useColors();
  const { notifications } = useApp();
  const unread = notifications.filter((notification) => !notification.read).length;
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
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color }) => <TabIcon name="grid" color={color} /> }} />
      <Tabs.Screen name="leads" options={{ title: 'New leads', tabBarIcon: ({ color }) => <TabIcon name="inbox" color={color} /> }} />
      <Tabs.Screen name="clients" options={{ title: 'Clients', tabBarIcon: ({ color }) => <TabIcon name="users" color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarBadge: unread || undefined, tabBarIcon: ({ color }) => <TabIcon name="bell" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon name="user" color={color} /> }} />
    </Tabs>
  );
}

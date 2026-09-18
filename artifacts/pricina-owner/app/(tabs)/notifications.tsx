import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { EmptyState, ScreenHeader, formatDate } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function NotificationsScreen() {
  const colors = useColors();
  const { notifications, markNotificationRead } = useApp();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader eyebrow="ACTIVITY" title="Notifications" />
      {notifications.length ? notifications.map((notification) => (
        <Pressable
          key={notification.id}
          onPress={() => {
            markNotificationRead(notification.id);
            router.push(`/leads/${notification.leadId}`);
          }}
          style={[styles.notification, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.notificationIcon, { backgroundColor: notification.read ? colors.secondary : colors.accent }]}>
            <Feather name="bell" size={17} color={colors.primary} />
          </View>
          <View style={styles.notificationCopy}>
            <Text style={[styles.notificationTitle, { color: colors.foreground }]}>{notification.title}</Text>
            <Text style={[styles.notificationDetail, { color: colors.mutedForeground }]}>{notification.detail}</Text>
            <Text style={[styles.notificationDate, { color: colors.mutedForeground }]}>{formatDate(notification.createdAt)}</Text>
          </View>
          {!notification.read ? <View style={[styles.unread, { backgroundColor: colors.primary }]} /> : null}
        </Pressable>
      )) : <EmptyState icon="bell-off" title="You’re all caught up" body="New inquiry alerts will appear here when they arrive." />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 115 },
  notification: { borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  notificationIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  notificationCopy: { flex: 1, gap: 4 },
  notificationTitle: { fontSize: 14, fontWeight: '700' },
  notificationDetail: { fontSize: 12 },
  notificationDate: { fontSize: 10, marginTop: 3 },
  unread: { width: 7, height: 7, borderRadius: 7, marginTop: 4 },
});
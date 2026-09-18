import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LeadCard, Pill, ScreenHeader, StatusSelector, formatDate, formatTime } from '@/components/PricinaUI';
import { useApp, useLead } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const showNotProvided = (value: string) => (value === 'Not provided' ? 'Not provided' : value);

export default function LeadDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLead(id);
  const { leads, updateLeadStatus } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!lead) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Feather name="file-text" size={26} color={colors.primary} />
        <Text style={[styles.missingTitle, { color: colors.foreground }]}>This inquiry is no longer available.</Text>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.backText, { color: colors.primaryForeground }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const sameCustomer = lead.phone === 'Not provided' ? [] : leads.filter((item) => item.phone.replace(/\D/g, '').slice(-10) === lead.phone.replace(/\D/g, '').slice(-10) && item.id !== lead.id);
  const launch = async (url: string, message: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('unsupported');
      await Linking.openURL(url);
    } catch {
      if (Platform.OS === 'web') window.alert(message);
      else Alert.alert('Action unavailable', message);
    }
  };
  const call = () => lead.phone !== 'Not provided' && void launch(`tel:${lead.phone}`, 'This device cannot open the phone dialer.');
  const message = () => lead.phone !== 'Not provided' && void launch(`sms:${lead.phone}`, 'Messaging is not available on this device.');
  const email = () => lead.email !== 'Not provided' && void launch(`mailto:${lead.email}`, 'No email app is available on this device.');

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        eyebrow="INQUIRY DETAILS"
        title={lead.name}
        right={<Pressable accessibilityLabel="Close details" onPress={() => router.back()}><Feather name="x" size={21} color={colors.mutedForeground} /></Pressable>}
      />
      <View style={styles.subheader}>
        <Text style={[styles.business, { color: colors.mutedForeground }]}>{lead.businessName}</Text>
        <Pill label={lead.isExisting ? 'EXISTING CLIENT' : 'NEW INQUIRY'} tone={lead.isExisting ? 'success' : 'primary'} />
      </View>
      <View style={styles.actions}>
        <Pressable onPress={call} style={[styles.action, { backgroundColor: colors.primary }]}>
          <Feather name="phone" size={16} color={colors.primaryForeground} />
          <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Call</Text>
        </Pressable>
        <Pressable onPress={message} style={[styles.action, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Feather name="message-circle" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.foreground }]}>Message</Text>
        </Pressable>
        <Pressable onPress={email} style={[styles.action, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Feather name="mail" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.foreground }]}>Email</Text>
        </Pressable>
      </View>
      <Section title="Customer">
        <InfoRow icon="user" label="Name" value={lead.name} />
        <InfoRow icon="phone" label="Phone" value={showNotProvided(lead.phone)} onPress={call} />
        <InfoRow icon="mail" label="Email" value={showNotProvided(lead.email)} onPress={email} />
      </Section>
      <Section title="Business">
        <InfoRow icon="briefcase" label="Business name" value={lead.businessName} />
        <InfoRow icon="layers" label="Business type" value={lead.businessType} />
        <InfoRow icon="star" label="Selected plan" value={lead.selectedPlan} />
      </Section>
      <Section title="Services">
        <Text style={[styles.bodyText, { color: lead.services.length ? colors.foreground : colors.mutedForeground }]}>
          {lead.services.length ? lead.services.join('  ·  ') : 'Not provided'}
        </Text>
      </Section>
      <Section title="Message / requirements">
        <Text style={[styles.bodyText, { color: lead.message === 'Not provided' ? colors.mutedForeground : colors.foreground }]}>{lead.message}</Text>
      </Section>
      <Section title="Submission">
        <InfoRow icon="calendar" label="Date" value={formatDate(lead.createdAt)} />
        <InfoRow icon="clock" label="Time" value={formatTime(lead.createdAt)} />
      </Section>
      <Section title="Status">
        <StatusSelector
          status={lead.status}
          onChange={(status) => {
            setIsUpdating(true);
            void updateLeadStatus(lead.id, status)
              .then(() => {
                if (Platform.OS === 'web') window.alert('Status updated');
                else Alert.alert('Status updated');
              })
              .catch((caught) => {
                if (Platform.OS === 'web') window.alert(caught instanceof Error ? caught.message : 'Status could not be updated.');
                else Alert.alert('Could not update', caught instanceof Error ? caught.message : 'Please try again.');
              })
              .finally(() => setIsUpdating(false));
          }}
        />
        {isUpdating ? <Text style={[styles.updating, { color: colors.mutedForeground }]}>Saving status…</Text> : null}
      </Section>
      {sameCustomer.length ? (
        <Section title="Inquiry history">
          {sameCustomer.map((historyLead) => <LeadCard key={historyLead.id} lead={historyLead} compact onPress={() => router.push(`/leads/${historyLead.id}`)} />)}
        </Section>
      ) : null}
      <View style={[styles.noDeleteNote, { backgroundColor: colors.secondary }]}>
        <Feather name="archive" size={15} color={colors.mutedForeground} />
        <Text style={[styles.noDeleteText, { color: colors.mutedForeground }]}>Lead history is permanent. Inquiries are never deleted.</Text>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; onPress?: () => void }) {
  const colors = useColors();
  const content = (
    <>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: onPress ? colors.primary : colors.foreground }]} numberOfLines={3}>{value}</Text>
      {onPress ? <Feather name="external-link" size={13} color={colors.primary} /> : null}
    </>
  );
  return onPress ? <Pressable onPress={onPress} style={styles.infoRow}>{content}</Pressable> : <View style={styles.infoRow}>{content}</View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 45 },
  subheader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: -14, marginBottom: 20 },
  business: { fontSize: 14, flex: 1 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  action: { minHeight: 45, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, flex: 1 },
  actionText: { fontSize: 12, fontWeight: '700' },
  section: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 11, gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 26 },
  infoLabel: { fontSize: 11, width: 90 },
  infoValue: { fontSize: 13, fontWeight: '600', flex: 1 },
  bodyText: { fontSize: 14, lineHeight: 21 },
  updating: { fontSize: 11, marginTop: 1 },
  noDeleteNote: { borderRadius: 14, padding: 13, flexDirection: 'row', gap: 8, alignItems: 'center' },
  noDeleteText: { fontSize: 11, flex: 1, lineHeight: 16 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  missingTitle: { fontSize: 16, textAlign: 'center', fontWeight: '600' },
  backButton: { borderRadius: 13, paddingHorizontal: 18, paddingVertical: 12 },
  backText: { fontSize: 13, fontWeight: '700' },
});
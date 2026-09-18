import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandMark } from '@/components/PricinaUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const { signIn, error, clearError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const submit = async () => {
    clearError();
    setLocalError('');
    if (!email.trim() || !password) {
      setLocalError('Enter your owner email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandLockup}>
          <BrandMark />
          <Text style={[styles.brand, { color: colors.foreground }]}>PRICINA</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Owner Portal</Text>
        </View>
        <View style={styles.form}>
          <Text style={[styles.welcome, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>
            Sign in to review and manage incoming inquiries.
          </Text>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>OWNER EMAIL</Text>
          <TextInput
            accessibilityLabel="Owner email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>PASSWORD</Text>
          <View style={[styles.passwordWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              accessibilityLabel="Owner password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, { color: colors.foreground }]}
            />
            <Pressable
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((value) => !value)}
              hitSlop={10}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {localError || error ? (
            <View style={[styles.error, { backgroundColor: '#351D2A', borderColor: '#643044' }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: '#FFB6C3' }]}>{localError || error}</Text>
            </View>
          ) : null}
          <Pressable
            testID="login-button"
            accessibilityRole="button"
            accessibilityLabel="Sign in to PRICINA"
            onPress={submit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : pressed ? 0.84 : 1 },
            ]}
          >
            <Text style={[styles.loginButtonText, { color: colors.primaryForeground }]}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Text>
            {!isSubmitting ? <Feather name="arrow-right" size={18} color={colors.primaryForeground} /> : null}
          </Pressable>
          <Text style={[styles.privateNote, { color: colors.mutedForeground }]}>
            Private access for authorized PRICINA owners only.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 55 },
  brandLockup: { alignItems: 'center', marginBottom: 52 },
  brand: { fontSize: 27, fontWeight: '700', letterSpacing: 5, marginTop: 15 },
  subtitle: { fontSize: 13, marginTop: 7 },
  form: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  welcome: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  helper: { fontSize: 14, lineHeight: 21, marginBottom: 30 },
  label: { fontSize: 10, letterSpacing: 1.3, fontWeight: '700', marginBottom: 8, marginTop: 17 },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 52, paddingHorizontal: 15, fontSize: 15 },
  passwordWrap: { borderWidth: 1, borderRadius: 14, minHeight: 52, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, minHeight: 50, fontSize: 15 },
  error: { borderWidth: 1, borderRadius: 13, padding: 12, flexDirection: 'row', gap: 9, alignItems: 'center', marginTop: 18 },
  errorText: { fontSize: 12, flex: 1, lineHeight: 17 },
  loginButton: { borderRadius: 14, minHeight: 54, marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loginButtonText: { fontSize: 15, fontWeight: '700' },
  privateNote: { fontSize: 11, textAlign: 'center', marginTop: 22 },
});
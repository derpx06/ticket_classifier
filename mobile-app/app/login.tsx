import { Redirect, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSession } from '@/context/session-context';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoggingIn, login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password],
  );

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/queries" />;
  }

  const handleLogin = async () => {
    if (!canSubmit) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/queries');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>Support Login</Text>
          <Text style={styles.subtitle}>
            Sign in with your real backend account to access tickets and chat.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoggingIn}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              editable={!isLoggingIn}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={() => void handleLogin()}
            disabled={!canSubmit || isLoggingIn}
            style={[styles.button, (!canSubmit || isLoggingIn) && styles.buttonDisabled]}>
            {isLoggingIn ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>Signing In...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  error: {
    color: '#be123c',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth-service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Radius, Palette } from '@/constants/theme';
import { Font } from '@/constants/typography';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const c = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await login(email, password);
      await signIn(res.token, res.user);
    } catch (e: unknown) {
      console.log('Login error:', e);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={[styles.hero, { backgroundColor: c.surface }]}>
          <View style={[styles.logoMark, { backgroundColor: `${Palette.primary}18` }]}>
            <Feather name="headphones" size={32} color={Palette.primary} />
          </View>
          <Text style={[styles.brand, { color: c.text, fontFamily: Font.bold }]}>SupportHub</Text>
          <Text style={[styles.tagline, { color: c.textSecondary, fontFamily: Font.regular }]}>
            Employee sign in
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text, fontFamily: Font.semibold }]}>
            Welcome back
          </Text>
          <Text style={[styles.cardHint, { color: c.textSecondary, fontFamily: Font.regular }]}>
            Use your work email to continue
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary, fontFamily: Font.medium }]}>
              Email
            </Text>
            <View style={[styles.inputRow, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
              <Feather name="mail" size={18} color={c.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.text, fontFamily: Font.regular }]}
                placeholder="you@company.com"
                placeholderTextColor={c.icon}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary, fontFamily: Font.medium }]}>
              Password
            </Text>
            <View style={[styles.inputRow, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
              <Feather name="lock" size={18} color={c.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.text, fontFamily: Font.regular }]}
                placeholder="••••••••"
                placeholderTextColor={c.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: `${Palette.danger}14` }]}>
              <Feather name="alert-circle" size={16} color={Palette.danger} />
              <Text style={[styles.errorText, { color: Palette.danger, fontFamily: Font.medium }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: Palette.primary, opacity: loading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={[styles.buttonLabel, { fontFamily: Font.semibold }]}>Sign in</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: c.icon, fontFamily: Font.regular }]}>
          Secure access for authorized staff only
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  brand: {
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
      },
      android: { elevation: 3 },
    }),
  },
  cardTitle: {
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  cardHint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: Spacing.md,
    minHeight: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.xxl,
  },
});

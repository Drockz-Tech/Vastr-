import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, spacing } from '../../src/theme/tokens';
import { AuthCredentialsSchema } from '../../src/lib/validations';
import { useAuth } from '../../src/providers/AuthProvider';

export default function SignInScreen() {
  const router = useRouter();
  const { session, isLoading, initializationError, signIn, signUp } = useAuth();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(initializationError?.message ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayedError = errorMessage ?? initializationError?.message ?? null;

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  const submit = async () => {
    setErrorMessage(null);
    const parsed = AuthCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Check your details');
      return;
    }

    setIsSubmitting(true);
    const error = isCreatingAccount
      ? await signUp(parsed.data.email, parsed.data.password)
      : await signIn(parsed.data.email, parsed.data.password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace('/(tabs)');
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.eyebrow}>VASTRÉ</Text>
        <Text style={styles.title}>{isCreatingAccount ? 'Build your wardrobe.' : 'Welcome back.'}</Text>
        <Text style={styles.subtitle}>
          {isCreatingAccount
            ? 'Create an account to start curating your closet.'
            : 'Your personal style, ready for today.'}
        </Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.text.secondary}
          style={styles.input}
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.text.secondary}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {displayedError ? <Text style={styles.error}>{displayedError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={submit}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.primaryButtonText}>{isCreatingAccount ? 'Create account' : 'Sign in'}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsCreatingAccount((current) => !current)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            {isCreatingAccount ? 'Already have an account? Sign in' : 'New to Vastré? Create an account'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.text.inverse,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  error: {
    color: colors.accent,
    marginBottom: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 52,
    justifyContent: 'center',
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
  },
});

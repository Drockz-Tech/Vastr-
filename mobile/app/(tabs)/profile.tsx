import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, spacing } from '../../src/theme/tokens';
import { useWearAnalytics } from '../../src/hooks/useAnalytics';

export default function Profile() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setSigningOut] = useState(false);
  const { data: analytics, error: analyticsError, isLoading: analyticsLoading } = useWearAnalytics();

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);
    const signOutError = await signOut();
    setSigningOut(false);
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile & Stats</Text>
      <Text style={styles.subtitle}>{session?.user.email}</Text>
      {analyticsLoading ? <ActivityIndicator /> : analyticsError ? (
        <Text style={styles.error}>{analyticsError.message}</Text>
      ) : (
        <View style={styles.stats}>
          <Stat value={analytics?.totalWears ?? 0} label="Total wears" />
          <Stat value={analytics?.uniqueLooks ?? 0} label="Unique looks" />
          <Stat value={analytics?.recentWears ?? 0} label="Last 30 days" />
        </View>
      )}
      <Text style={styles.sectionTitle}>Recent history</Text>
      {analytics?.history.length ? analytics.history.map((log) => (
        <View key={log.id} style={styles.historyRow}>
          <Text style={styles.historyDate}>{log.worn_date}</Text>
          <Text style={styles.historyTag}>{log.event_tag ?? 'Everyday look'}</Text>
        </View>
      )) : <Text style={styles.subtitle}>Wear an outfit to start your history.</Text>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={isSigningOut} onPress={handleSignOut} style={styles.button}>
        {isSigningOut ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.buttonText}>Sign out</Text>}
      </Pressable>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: colors.secondary, flex: 1, justifyContent: 'center', padding: spacing.xl },
  title: { color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: spacing.md },
  subtitle: { color: colors.text.secondary, marginBottom: spacing.sm },
  sectionTitle: { alignSelf: 'stretch', color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.xl },
  stats: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg },
  stat: { backgroundColor: colors.text.inverse, borderRadius: 10, minWidth: 92, padding: spacing.md },
  statValue: { color: colors.text.primary, fontSize: 24, fontWeight: '700' },
  statLabel: { color: colors.text.secondary, fontSize: 12, marginTop: spacing.xs },
  historyRow: { alignItems: 'center', alignSelf: 'stretch', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  historyDate: { color: colors.text.primary, fontWeight: '600' },
  historyTag: { color: colors.text.secondary },
  error: { color: colors.accent, marginVertical: spacing.md },
  button: { backgroundColor: colors.primary, borderRadius: 8, marginTop: spacing.lg, minWidth: 140, padding: spacing.md },
  buttonText: { color: colors.text.inverse, fontWeight: '700', textAlign: 'center' },
});

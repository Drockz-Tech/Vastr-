import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../src/theme/tokens';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>VASTRÉ</Text>
      <Text style={styles.title}>What are you wearing today?</Text>
      <Text style={styles.subtitle}>Build your wardrobe once. Make getting dressed effortless.</Text>
      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/(tabs)/closet')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Open closet</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/swipe')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Find a look</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.secondary, flex: 1, justifyContent: 'center', padding: spacing.xl },
  eyebrow: { color: colors.text.secondary, fontSize: 12, fontWeight: '700', letterSpacing: 3, marginBottom: spacing.md },
  title: { color: colors.text.primary, fontSize: 34, fontWeight: '700', marginBottom: spacing.md },
  subtitle: { color: colors.text.secondary, fontSize: 16, lineHeight: 24, marginBottom: spacing.xl },
  actions: { gap: spacing.md },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, padding: spacing.md },
  primaryButtonText: { color: colors.text.inverse, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 10, borderWidth: 1, padding: spacing.md },
  secondaryButtonText: { color: colors.text.primary, fontWeight: '700' },
});

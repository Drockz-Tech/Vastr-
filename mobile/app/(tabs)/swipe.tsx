import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useLogOutfitWorn, useSwipeDeck } from '../../src/hooks/useOutfits';
import { spacing, ThemeColors } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/providers/ThemeProvider';

export default function Swipe() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: outfits, error, isLoading, refetch } = useSwipeDeck();
  const logMutation = useLogOutfitWorn();
  const [index, setIndex] = useState(0);
  const outfit = outfits?.[index];

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>We could not load your looks.</Text>
        <Text style={styles.subtitle}>{error.message}</Text>
        <Pressable onPress={() => refetch()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Your lookbook is empty.</Text>
        <Text style={styles.subtitle}>Create an outfit from your closet to start swiping.</Text>
      </View>
    );
  }

  const next = () => setIndex((current) => (current + 1) % (outfits?.length ?? 1));
  const wearToday = () => {
    logMutation.mutate(
      { outfitId: outfit.id },
      { onSuccess: next },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Style Swipe</Text>
      <Text style={styles.subtitle}>Choose a look for today.</Text>
      <View style={styles.card}>
        {outfit.imageUrl ? (
          <Image accessibilityLabel={outfit.name ?? 'Outfit'} source={{ uri: outfit.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Add a photo to this outfit</Text>
          </View>
        )}
        <Text style={styles.outfitName}>{outfit.name ?? 'Untitled look'}</Text>
      </View>
      {logMutation.error ? <Text style={styles.error}>{logMutation.error.message}</Text> : null}
      <View style={styles.actions}>
        <Pressable disabled={logMutation.isPending} onPress={next} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </Pressable>
        <Pressable disabled={logMutation.isPending} onPress={wearToday} style={styles.primaryButton}>
          {logMutation.isPending ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.primaryButtonText}>Wear today</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) { return StyleSheet.create({
  container: { backgroundColor: colors.secondary, flex: 1, padding: spacing.lg },
  centered: { alignItems: 'center', backgroundColor: colors.secondary, flex: 1, justifyContent: 'center', padding: spacing.xl },
  title: { color: colors.text.primary, fontSize: 28, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { color: colors.text.secondary, fontSize: 16, marginBottom: spacing.lg, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, elevation: 3, marginTop: spacing.md, overflow: 'hidden', shadowColor: colors.primary, shadowOpacity: 0.1, shadowRadius: 8 },
  image: { aspectRatio: 0.8, backgroundColor: colors.border, width: '100%' },
  imagePlaceholder: { alignItems: 'center', aspectRatio: 0.8, backgroundColor: colors.border, justifyContent: 'center' },
  placeholderText: { color: colors.text.secondary },
  outfitName: { color: colors.text.primary, fontSize: 20, fontWeight: '700', padding: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', marginTop: spacing.lg },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', minWidth: 120, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  primaryButtonText: { color: colors.text.inverse, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 8, borderWidth: 1, justifyContent: 'center', minWidth: 100, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  secondaryButtonText: { color: colors.text.primary, fontWeight: '700' },
  error: { color: colors.accent, marginTop: spacing.md, textAlign: 'center' },
}); }

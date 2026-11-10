import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Greeting, HomeHeader, OutfitThrowback, StyleInsights, StyleSwipeBanner,
  WardrobeHighlights, WardrobeStatus, WeeklyOutfits, YesterdayOutfit, openLogDetails,
} from '../../src/components/home/HomeSections';
import { useHomeData } from '../../src/hooks/useHome';
import { useLogOutfitWorn } from '../../src/hooks/useOutfits';
import { ThemeColors, spacing } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/providers/ThemeProvider';

const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function Home() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);
  const { data, isLoading, error, refetch, isFetching } = useHomeData();
  const wearMutation = useLogOutfitWorn();
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDate(yesterdayDate);
  const yesterdayLog = data?.history.find((log) => log.worn_date === yesterday);
  const throwback = useMemo(() => {
    if (!data) return undefined;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return data.history.find((log) => new Date(`${log.worn_date}T12:00:00`) < cutoff && log.outfit.id !== yesterdayLog?.outfit.id);
  }, [data, yesterdayLog?.outfit.id]);

  const confirmWear = () => {
    if (!throwback) return;
    Alert.alert('Wear it again?', 'This outfit will be added to today’s style diary.', [
      { text: 'Not now', style: 'cancel' },
      { text: 'Wear it again', onPress: () => wearMutation.mutate({ outfitId: throwback.outfit.id }) },
    ]);
  };

  return <SafeAreaView edges={['top']} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <HomeHeader isDark={isDark} onToggleTheme={toggleTheme} onProfile={() => router.push('/(tabs)/profile')} />
      <Greeting />
      {isLoading && !data ? <View style={styles.state}><ActivityIndicator color={colors.accent} /><Text style={styles.stateText}>Opening your style diary…</Text></View> : null}
      {error && !data ? <View style={styles.state}><Text style={styles.stateTitle}>Your diary is taking a moment.</Text><Text style={styles.stateText}>{error.message}</Text><Pressable onPress={() => refetch()} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable></View> : null}
      {data ? <>
        <YesterdayOutfit log={yesterdayLog} onExplore={() => router.push('/(tabs)/swipe')} />
        <WardrobeStatus counts={data.counts} />
        <WeeklyOutfits history={data.history} onOpen={openLogDetails} />
        <OutfitThrowback log={throwback} onWear={confirmWear} />
        {wearMutation.error ? <Text style={styles.mutationError}>{wearMutation.error.message}</Text> : null}
        <StyleSwipeBanner onPress={() => router.push('/(tabs)/swipe')} />
        <WardrobeHighlights data={data} />
        <StyleInsights data={data} />
      </> : null}
      {isFetching && data ? <Text style={styles.refreshing}>Updating your diary…</Text> : null}
    </ScrollView>
  </SafeAreaView>;
}

function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safeArea: { backgroundColor: colors.secondary, flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xl },
  state: { alignItems: 'center', backgroundColor: colors.card, justifyContent: 'center', marginVertical: spacing.lg, minHeight: 170, padding: spacing.lg },
  stateTitle: { color: colors.primary, fontFamily: 'Georgia', fontSize: 20 },
  stateText: { color: colors.taupe, fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
  retry: { borderBottomColor: colors.accent, borderBottomWidth: 1, marginTop: spacing.md, paddingBottom: 3 },
  retryText: { color: colors.accent, fontWeight: '600' },
  mutationError: { color: colors.accent, fontSize: 12, marginBottom: spacing.md },
  refreshing: { color: colors.taupe, fontSize: 11, marginBottom: spacing.sm, textAlign: 'center' },
  });
}

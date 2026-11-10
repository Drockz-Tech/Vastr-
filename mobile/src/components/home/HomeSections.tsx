import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { HomeData } from '../../hooks/useHome';
import { HomeItem, HomeWearLog } from '../../services/HomeService';
import { useAppTheme } from '../../providers/ThemeProvider';
import { ThemeColors, spacing } from '../../theme/tokens';

const serif = 'Georgia';
const dateLabel = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString(undefined, options);

function useHomeStyles() {
  const { colors } = useAppTheme();
  return useMemo(() => createStyles(colors), [colors]);
}

export function HomeHeader({ onProfile, onToggleTheme, isDark }: { onProfile: () => void; onToggleTheme: () => void; isDark: boolean }) {
  const styles = useHomeStyles();
  const { colors } = useAppTheme();
  return <View style={styles.header}>
    <Text style={styles.brand}>Vastré<Text style={styles.brandDot}>.</Text></Text>
    <View style={styles.headerActions}>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: isDark }} accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onPress={onToggleTheme} style={styles.headerIcon}>
        <Text style={[styles.iconText, { color: colors.accent }]}>{isDark ? '☀' : '☾'}</Text>
      </Pressable>
      <Pressable accessibilityLabel="Search your wardrobe" onPress={() => Alert.alert('Search', 'Search your wardrobe from the Closet tab.')} style={styles.headerIcon}><Text style={styles.iconText}>⌕</Text></Pressable>
      <Pressable accessibilityLabel="Notifications" onPress={() => Alert.alert('Notifications', 'You’re all caught up.')} style={styles.headerIcon}><Text style={styles.iconText}>♧</Text></Pressable>
      <Pressable accessibilityLabel="Profile" onPress={onProfile} style={styles.headerIcon}><Text style={styles.iconText}>◯</Text></Pressable>
    </View>
  </View>;
}

export function Greeting() {
  const styles = useHomeStyles();
  return <View style={styles.greeting}>
    <Text style={styles.greetingTitle}>Your style diary.</Text>
    <Text style={styles.greetingSub}>A little look into your wardrobe life.</Text>
    <Text style={styles.todayDate}>{dateLabel(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
  </View>;
}

export function YesterdayOutfit({ log, onExplore }: { log?: HomeData['history'][number]; onExplore: () => void }) {
  const styles = useHomeStyles();
  const { width } = useWindowDimensions();
  const imageHeight = Math.min(width * 0.58, 240);
  return <View style={styles.section}>
    <View style={styles.sectionHeadingRow}>
      <Text style={styles.sectionTitle}>Yesterday, you wore</Text>
      <Text style={styles.datePill}>{dateLabel(yesterday(), { month: 'short', day: 'numeric' })}</Text>
    </View>
    {log ? <Pressable onPress={() => Alert.alert(log.outfit.name ?? 'Your outfit', itemDescription(log.outfit.items))}>
      {log.outfit.imageUrl ? <Image accessibilityLabel={log.outfit.name ?? 'Yesterday’s outfit'} source={{ uri: log.outfit.imageUrl }} style={[styles.heroImage, { height: imageHeight }]} /> : (
        <View style={[styles.imagePlaceholder, styles.heroPlaceholder, { height: imageHeight }]}><Text style={styles.placeholderGlyph}>✳</Text><Text style={styles.placeholderText}>Your outfit photo</Text></View>
      )}
      <Text style={styles.outfitName}>{log.outfit.name ?? 'A look from your wardrobe'}</Text>
      <Text style={styles.outfitDescription}>{itemDescription(log.outfit.items)}</Text>
    </Pressable> : <Pressable onPress={onExplore} style={styles.emptyHero}>
      <Text style={styles.emptyHeroMark}>✳</Text>
      <Text style={styles.emptyHeroTitle}>A page still to fill.</Text>
      <Text style={styles.emptyHeroText}>No outfit was logged yesterday. Your style diary starts whenever you’re ready.</Text>
      <Text style={styles.emptyHeroLink}>Log an outfit <Text style={styles.accent}>→</Text></Text>
    </Pressable>}
  </View>;
}

export function WardrobeStatus({ counts }: { counts: HomeData['counts'] }) {
  const styles = useHomeStyles();
  const metrics = [
    { icon: '◈', label: 'Total items', value: counts.total },
    { icon: '✧', label: 'Clean', value: counts.clean },
    { icon: '◷', label: 'In laundry', value: counts.laundry },
  ];
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>Your wardrobe status</Text>
    <View style={styles.metricsRow}>{metrics.map((metric) => <View key={metric.label} style={styles.metricCard}>
      <Text style={styles.metricIcon}>{metric.icon}</Text><Text style={styles.metricValue}>{metric.value}</Text><Text numberOfLines={1} style={styles.metricLabel}>{metric.label}</Text>
    </View>)}</View>
  </View>;
}

export function WeeklyOutfits({ history, onOpen }: { history: HomeData['history']; onOpen: (log: HomeData['history'][number]) => void }) {
  const styles = useHomeStyles();
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const logs = history.filter((log) => new Date(`${log.worn_date}T00:00:00`) >= sevenDaysAgo).slice(0, 7);
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>Your week in outfits</Text><Text style={styles.sectionSubtitle}>A look back at what you wore this week.</Text>
    {logs.length ? <ScrollView horizontal contentContainerStyle={styles.gallery} showsHorizontalScrollIndicator={false}>{logs.map((log) => <Pressable key={log.id} onPress={() => onOpen(log)} style={styles.galleryCard}>
      {log.outfit.imageUrl ? <Image source={{ uri: log.outfit.imageUrl }} style={styles.galleryImage} /> : <View style={[styles.imagePlaceholder, styles.galleryImage]}><Text style={styles.placeholderGlyph}>✳</Text></View>}
      <Text style={styles.galleryDate}>{dateLabel(new Date(`${log.worn_date}T12:00:00`), { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
      <Text numberOfLines={1} style={styles.galleryName}>{log.outfit.name ?? 'Untitled look'}</Text>
    </Pressable>)}</ScrollView> : <Text style={styles.quietEmpty}>Your outfit notes from this week will find a home here.</Text>}
  </View>;
}

export function OutfitThrowback({ log, onWear }: { log?: HomeData['history'][number]; onWear: () => void }) {
  const styles = useHomeStyles();
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>A look from your past</Text>
    {log ? <>
      {log.outfit.imageUrl ? <Image source={{ uri: log.outfit.imageUrl }} style={styles.throwbackImage} /> : <View style={[styles.imagePlaceholder, styles.throwbackImage]}><Text style={styles.placeholderGlyph}>✳</Text></View>}
      <Text style={styles.throwbackPrompt}>Remember this combination?</Text>
      <Text style={styles.sectionSubtitle}>Rediscover an outfit you haven’t worn recently.</Text>
      <Text style={styles.throwbackName}>{log.outfit.name ?? 'A look from your wardrobe'}</Text>
      <Pressable onPress={onWear}><Text style={styles.actionText}>Wear it again <Text style={styles.accent}>→</Text></Text></Pressable>
    </> : <Text style={styles.quietEmpty}>As you log more outfits, we’ll bring a favorite back into the light.</Text>}
  </View>;
}

export function StyleSwipeBanner({ onPress }: { onPress: () => void }) {
  const styles = useHomeStyles();
  return <Pressable onPress={onPress} style={styles.swipeBanner}>
    <View style={styles.bannerOrnament}><Text style={styles.bannerSpark}>✳</Text><Text style={styles.bannerSmall}>A little inspiration</Text></View>
    <Text style={styles.bannerTitle}>Feeling uninspired?</Text>
    <Text style={styles.bannerCopy}>Rediscover outfits you’ve already created.</Text>
    <Text style={styles.bannerAction}>Explore Style Swipe <Text style={styles.bannerArrow}>→</Text></Text>
  </Pressable>;
}

export function WardrobeHighlights({ data }: { data: HomeData }) {
  const styles = useHomeStyles();
  const wearCounts = new Map<string, number>();
  data.history.forEach((log) => log.outfit.items.forEach((item) => wearCounts.set(item.id, (wearCounts.get(item.id) ?? 0) + 1)));
  const ranked = data.items.map((item) => ({ ...item, wears: wearCounts.get(item.id) ?? 0 }));
  const most = [...ranked].filter((item) => item.wears > 0).sort((a, b) => b.wears - a.wears).slice(0, 8);
  const least = [...ranked].sort((a, b) => a.wears - b.wears).slice(0, 8);
  return <>
    <ItemStrip title="Most worn items" items={most} empty="Your most worn pieces will appear as you log outfits." />
    <ItemStrip title="Least worn items" items={least} empty="Your wardrobe is waiting for its first wear notes." />
  </>;
}

function ItemStrip({ title, items, empty }: { title: string; items: Array<HomeData['items'][number] & { wears: number }>; empty: string }) {
  const styles = useHomeStyles();
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items.length ? <ScrollView horizontal contentContainerStyle={styles.gallery} showsHorizontalScrollIndicator={false}>{items.map((item) => <View key={item.id} style={styles.itemCard}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> : <View style={[styles.imagePlaceholder, styles.itemImage]}><Text style={styles.placeholderGlyph}>✳</Text></View>}
      <Text numberOfLines={1} style={styles.galleryDate}>{item.category}</Text>
      <Text style={styles.galleryName}>{item.wears} {item.wears === 1 ? 'wear' : 'wears'}</Text>
    </View>)}</ScrollView> : <Text style={styles.quietEmpty}>{empty}</Text>}
  </View>;
}

export function StyleInsights({ data }: { data: HomeData }) {
  const styles = useHomeStyles();
  const categoryCounts = new Map<string, number>(); const colorCounts = new Map<string, number>();
  data.history.forEach((log) => log.outfit.items.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
    if (item.color) colorCounts.set(item.color, (colorCounts.get(item.color) ?? 0) + 1);
  }));
  const mostCategory = [...categoryCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const mostColor = [...colorCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const month = new Date(); const monthWears = data.history.filter((log) => {
    const date = new Date(`${log.worn_date}T12:00:00`); return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
  }).length;
  return <View style={[styles.section, styles.insights]}>
    <Text style={styles.sectionTitle}>Your style insights</Text>
    <Text style={styles.insightsSub}>A few notes from your wardrobe life.</Text>
    <Insight label="Most-used category" value={mostCategory} /><Insight label="Most-used colour" value={mostColor} /><Insight label="Outfits worn this month" value={String(monthWears)} last />
  </View>;
}

function Insight({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const styles = useHomeStyles();
  return <View style={[styles.insightRow, last && styles.lastInsight]}><Text style={styles.insightLabel}>{label}</Text><Text style={styles.insightValue}>{value}</Text></View>;
}

export function openLogDetails(log: HomeWearLog) {
  Alert.alert(log.outfit?.name ?? 'Your outfit', itemDescription(log.outfit?.items ?? []));
}

function itemDescription(items: HomeItem[]) {
  return items.map((item) => [item.color, item.category].filter(Boolean).join(' ')).join(' · ') || 'Pieces from your wardrobe';
}

function yesterday() { const date = new Date(); date.setDate(date.getDate() - 1); return date; }

function createStyles(themeColors: ThemeColors) { return StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.xs, paddingBottom: spacing.md },
  brand: { color: themeColors.primary, fontFamily: serif, fontSize: 29, letterSpacing: -1 }, brandDot: { color: themeColors.accent },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, headerIcon: { alignItems: 'center', height: 40, justifyContent: 'center', width: 36 }, iconText: { color: themeColors.primary, fontSize: 23 },
  greeting: { marginTop: spacing.sm, marginBottom: spacing.lg }, greetingTitle: { color: themeColors.primary, fontFamily: serif, fontSize: 31, letterSpacing: -0.6 }, greetingSub: { color: themeColors.taupe, fontSize: 14, marginTop: spacing.xs }, todayDate: { color: themeColors.accent, fontSize: 11, fontWeight: '600', letterSpacing: 1.2, marginTop: spacing.sm, textTransform: 'uppercase' },
  section: { marginBottom: spacing.xl }, sectionHeadingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }, sectionTitle: { color: themeColors.primary, fontFamily: serif, fontSize: 22, letterSpacing: -0.25 }, sectionSubtitle: { color: themeColors.taupe, fontSize: 13, lineHeight: 19, marginTop: spacing.xs, marginBottom: spacing.md }, datePill: { color: themeColors.taupe, fontSize: 11, letterSpacing: 0.4 },
  heroImage: { backgroundColor: themeColors.card, borderRadius: 3, width: '100%' }, imagePlaceholder: { alignItems: 'center', backgroundColor: themeColors.card, justifyContent: 'center' }, heroPlaceholder: { borderRadius: 3, width: '100%' }, placeholderGlyph: { color: themeColors.taupe, fontFamily: serif, fontSize: 28 }, placeholderText: { color: themeColors.taupe, fontSize: 12, marginTop: spacing.xs }, outfitName: { color: themeColors.primary, fontFamily: serif, fontSize: 20, marginTop: spacing.sm }, outfitDescription: { color: themeColors.taupe, fontSize: 12, marginTop: spacing.xs },
  emptyHero: { alignItems: 'center', backgroundColor: themeColors.card, justifyContent: 'center', minHeight: 178, padding: spacing.lg }, emptyHeroMark: { color: themeColors.accent, fontSize: 21 }, emptyHeroTitle: { color: themeColors.primary, fontFamily: serif, fontSize: 20, marginTop: spacing.xs }, emptyHeroText: { color: themeColors.taupe, fontSize: 12, lineHeight: 18, marginTop: spacing.xs, maxWidth: 290, textAlign: 'center' }, emptyHeroLink: { color: themeColors.primary, fontSize: 12, fontWeight: '600', marginTop: spacing.sm }, accent: { color: themeColors.accent },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }, metricCard: { alignItems: 'flex-start', backgroundColor: themeColors.card, borderRadius: 4, flex: 1, minHeight: 90, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }, metricIcon: { color: themeColors.accent, fontSize: 15 }, metricValue: { color: themeColors.primary, fontFamily: serif, fontSize: 23, marginTop: 2 }, metricLabel: { color: themeColors.taupe, fontSize: 10, marginTop: 1 },
  gallery: { gap: spacing.md, paddingRight: spacing.md, paddingTop: spacing.sm }, galleryCard: { width: 142 }, galleryImage: { backgroundColor: themeColors.card, borderRadius: 3, height: 174, width: 142 }, galleryDate: { color: themeColors.taupe, fontSize: 11, marginTop: spacing.sm }, galleryName: { color: themeColors.primary, fontFamily: serif, fontSize: 15, marginTop: 2 }, quietEmpty: { color: themeColors.taupe, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, throwbackImage: { backgroundColor: themeColors.card, borderRadius: 3, height: 220, marginTop: spacing.md, width: '100%' }, throwbackPrompt: { color: themeColors.primary, fontFamily: serif, fontSize: 21, marginTop: spacing.md }, throwbackName: { color: themeColors.taupe, fontSize: 12, marginBottom: spacing.sm }, actionText: { color: themeColors.primary, fontSize: 13, fontWeight: '600', marginTop: spacing.xs },
  swipeBanner: { backgroundColor: themeColors.banner, marginBottom: spacing.xl, minHeight: 190, padding: spacing.lg }, bannerOrnament: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, bannerSpark: { color: '#D8BDA5', fontSize: 17 }, bannerSmall: { color: '#D8BDA5', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' }, bannerTitle: { color: themeColors.onBanner, fontFamily: serif, fontSize: 26, marginTop: spacing.md }, bannerCopy: { color: '#D8CFC4', fontSize: 13, marginTop: spacing.xs }, bannerAction: { color: themeColors.onBanner, fontSize: 12, fontWeight: '600', marginTop: spacing.lg }, bannerArrow: { color: '#D8BDA5' },
  itemCard: { width: 116 }, itemImage: { backgroundColor: themeColors.card, borderRadius: 3, height: 138, width: 116 }, insights: { backgroundColor: themeColors.card, padding: spacing.md }, insightsSub: { color: themeColors.taupe, fontSize: 12, marginTop: spacing.xs, marginBottom: spacing.sm }, insightRow: { alignItems: 'center', borderBottomColor: themeColors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm }, lastInsight: { borderBottomWidth: 0 }, insightLabel: { color: themeColors.taupe, fontSize: 12 }, insightValue: { color: themeColors.primary, fontFamily: serif, fontSize: 15 },
});
}

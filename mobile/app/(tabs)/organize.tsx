import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useActiveCloset } from '../../src/hooks/useCloset';
import { useAddItemToCapsule, useCapsules, useCreateCapsule } from '../../src/hooks/useCapsules';
import { CreateCapsuleSchema } from '../../src/lib/validations';
import { spacing, ThemeColors } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/providers/ThemeProvider';

export default function Organize() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: capsules, error, isLoading } = useCapsules();
  const { data: items } = useActiveCloset();
  const createMutation = useCreateCapsule();
  const addMutation = useAddItemToCapsule();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const createTrip = () => {
    const parsed = CreateCapsuleSchema.safeParse({
      name,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check trip details');
      return;
    }
    setFormError(null);
    createMutation.mutate(parsed.data, {
      onSuccess: (capsule) => {
        setSelectedCapsuleId(capsule.id);
        setName('');
        setStartDate('');
        setEndDate('');
      },
    });
  };

  const addSelected = async () => {
    if (!selectedCapsuleId) return;
    for (const itemId of selectedItemIds) {
      await addMutation.mutateAsync({ capsuleId: selectedCapsuleId, itemId });
    }
    setSelectedItemIds([]);
  };

  if (isLoading) return <ActivityIndicator style={styles.centered} />;
  if (error) return <View style={styles.centered}><Text style={styles.title}>We could not load your trips.</Text><Text style={styles.error}>{error.message}</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trips & packing</Text>
      <Text style={styles.subtitle}>Build a capsule from the clothes you already own.</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Trip name" placeholderTextColor={colors.text.secondary} style={styles.input} />
      <View style={styles.row}>
        <TextInput value={startDate} onChangeText={setStartDate} placeholder="Start YYYY-MM-DD" placeholderTextColor={colors.text.secondary} style={[styles.input, styles.half]} />
        <TextInput value={endDate} onChangeText={setEndDate} placeholder="End YYYY-MM-DD" placeholderTextColor={colors.text.secondary} style={[styles.input, styles.half]} />
      </View>
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Pressable disabled={createMutation.isPending} onPress={createTrip} style={styles.button}>
        {createMutation.isPending ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.buttonText}>Create trip</Text>}
      </Pressable>

      <Text style={styles.sectionTitle}>Your trips</Text>
      {capsules?.map((capsule) => (
        <Pressable key={capsule.id} onPress={() => setSelectedCapsuleId(capsule.id)} style={[styles.trip, selectedCapsuleId === capsule.id && styles.selectedTrip]}>
          <Text style={styles.tripName}>{capsule.name}</Text>
          <Text style={styles.tripDates}>{capsule.start_date ?? 'No start'} - {capsule.end_date ?? 'No end'}</Text>
        </Pressable>
      ))}

      {selectedCapsuleId ? (
        <>
          <Text style={styles.sectionTitle}>Select items to pack</Text>
          <View style={styles.itemGrid}>
            {items?.map((item) => {
              const selected = selectedItemIds.includes(item.id);
              return (
                <Pressable key={item.id} onPress={() => setSelectedItemIds((current) => selected ? current.filter((id) => id !== item.id) : [...current, item.id])} style={[styles.item, selected && styles.selectedItem]}>
                  <Text style={styles.itemText}>{item.category}</Text>
                  {item.color ? <Text style={styles.itemSubtext}>{item.color}</Text> : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable disabled={!selectedItemIds.length || addMutation.isPending} onPress={addSelected} style={[styles.button, (!selectedItemIds.length || addMutation.isPending) && styles.disabled]}>
            {addMutation.isPending ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.buttonText}>Pack selected ({selectedItemIds.length})</Text>}
          </Pressable>
          {addMutation.error ? <Text style={styles.error}>{addMutation.error.message}</Text> : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) { return StyleSheet.create({
  container: { backgroundColor: colors.secondary, flexGrow: 1, padding: spacing.lg },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: spacing.xl },
  title: { color: colors.text.primary, fontSize: 28, fontWeight: '700', marginBottom: spacing.sm },
  subtitle: { color: colors.text.secondary, fontSize: 16, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.xl },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text.primary, marginBottom: spacing.md, padding: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', padding: spacing.md },
  buttonText: { color: colors.text.inverse, fontWeight: '700' },
  error: { color: colors.accent, marginBottom: spacing.md },
  trip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, marginBottom: spacing.sm, padding: spacing.md },
  selectedTrip: { borderColor: colors.primary, borderWidth: 2 },
  tripName: { color: colors.text.primary, fontWeight: '700' },
  tripDates: { color: colors.text.secondary, marginTop: spacing.xs },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  item: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, minWidth: '30%', padding: spacing.md },
  selectedItem: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemText: { color: colors.text.primary, fontWeight: '700' },
  itemSubtext: { color: colors.text.secondary, marginTop: spacing.xs },
  disabled: { opacity: 0.4 },
}); }

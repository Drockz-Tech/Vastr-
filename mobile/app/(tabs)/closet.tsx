import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useActiveCloset, useCreateItem, useSendToLaundry, ClosetItem } from '../../src/hooks/useCloset';
import { useCreateOutfit } from '../../src/hooks/useOutfits';
import { CreateItemPayload, CreateItemSchema, CreateOutfitSchema, ItemCategoryEnum } from '../../src/lib/validations';
import { spacing, ThemeColors } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/providers/ThemeProvider';

export default function Closet() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [page] = useState(0);
  const { data: items, error, isLoading, isFetching, refetch } = useActiveCloset(page);
  const laundryMutation = useSendToLaundry(page);
  const createItemMutation = useCreateItem();
  const createOutfitMutation = useCreateOutfit();
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLookModalVisible, setLookModalVisible] = useState(false);

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>We could not load your closet.</Text>
        <Text style={styles.subtitle}>{error.message}</Text>
        <Pressable onPress={() => refetch()} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <FlatList
      contentContainerStyle={items?.length ? styles.list : styles.emptyList}
      data={items ?? []}
      keyExtractor={(item) => item.id}
      numColumns={2}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.title}>Your closet is ready.</Text>
          <Text style={styles.subtitle}>Add your first item to start building looks.</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Your Closet</Text>
          <View style={styles.headerActions}>
            {isFetching ? <ActivityIndicator size="small" /> : null}
            <Pressable onPress={() => setAddModalVisible(true)} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
            <Pressable
              disabled={!selectedIds.length}
              onPress={() => setLookModalVisible(true)}
              style={[styles.addButton, !selectedIds.length && styles.disabledButton]}
            >
              <Text style={styles.addButtonText}>Look ({selectedIds.length})</Text>
            </Pressable>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <ClosetCard
          item={item}
          isSaving={laundryMutation.isPending && laundryMutation.variables === item.id}
          isSelected={selectedIds.includes(item.id)}
          onLaundry={() => laundryMutation.mutate(item.id)}
          onSelect={() => setSelectedIds((current) => current.includes(item.id)
            ? current.filter((id) => id !== item.id)
            : [...current, item.id])}
        />
      )}
      />
      <AddItemModal
      error={createItemMutation.error}
      isSubmitting={createItemMutation.isPending}
      onClose={() => {
        if (!createItemMutation.isPending) {
          setAddModalVisible(false);
          createItemMutation.reset();
        }
      }}
        onSubmit={(imageUri, payload) => {
          createItemMutation.mutate(
            { imageUri, payload },
            {
              onSuccess: () => {
                setAddModalVisible(false);
                createItemMutation.reset();
              },
            },
          );
        }}
        visible={isAddModalVisible}
      />
      <CreateLookModal
        error={createOutfitMutation.error}
        isSubmitting={createOutfitMutation.isPending}
        onClose={() => {
          if (!createOutfitMutation.isPending) {
            setLookModalVisible(false);
            createOutfitMutation.reset();
          }
        }}
        onSubmit={(name) => {
          const parsed = CreateOutfitSchema.safeParse({ name: name || undefined, itemIds: selectedIds });
          if (!parsed.success || !items?.length) {
            return;
          }
          const firstItem = items.find((item) => item.id === selectedIds[0]);
          createOutfitMutation.mutate(
            { ...parsed.data, imagePath: firstItem?.image_path },
            {
              onSuccess: () => {
                setSelectedIds([]);
                setLookModalVisible(false);
              },
            },
          );
        }}
        visible={isLookModalVisible}
      />
    </>
  );
}

function AddItemModal({
  visible,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  isSubmitting: boolean;
  error: Error | null;
  onClose: () => void;
  onSubmit: (imageUri: string, payload: CreateItemPayload) => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<typeof ItemCategoryEnum._output>('Top');
  const [color, setColor] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const chooseImage = async () => {
    setValidationError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setValidationError('Photo library access is required to add an item.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submit = () => {
    const parsed = CreateItemSchema.safeParse({
      imagePath: imageUri ?? '',
      category,
      color: color.trim() || undefined,
    });
    if (!parsed.success || !imageUri) {
      setValidationError(parsed.success ? 'Choose an image first.' : parsed.error.issues[0]?.message ?? 'Check the item details.');
      return;
    }
    setValidationError(null);
    onSubmit(imageUri, parsed.data);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add to closet</Text>
          <Pressable disabled={isSubmitting} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
        <Pressable disabled={isSubmitting} onPress={chooseImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <Text style={styles.pickerText}>Choose a photo</Text>
          )}
        </Pressable>
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {ItemCategoryEnum.options.map((option) => (
            <Pressable
              key={option}
              onPress={() => setCategory(option)}
              style={[styles.categoryOption, category === option && styles.categoryOptionSelected]}
            >
              <Text style={category === option ? styles.categoryOptionTextSelected : styles.categoryOptionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          onChangeText={setColor}
          placeholder="Color (optional)"
          placeholderTextColor={colors.text.secondary}
          style={styles.input}
          value={color}
        />
        {validationError || error ? <Text style={styles.error}>{validationError ?? error?.message}</Text> : null}
        <Pressable disabled={isSubmitting} onPress={submit} style={styles.button}>
          {isSubmitting ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.buttonText}>Save item</Text>}
        </Pressable>
      </View>
    </Modal>
  );
}

function ClosetCard({
  item,
  isSaving,
  isSelected,
  onLaundry,
  onSelect,
}: {
  item: ClosetItem;
  isSaving: boolean;
  isSelected: boolean;
  onLaundry: () => void;
  onSelect: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onSelect} style={[styles.card, isSelected && styles.selectedCard]}>
      {item.imageUrl ? <Image accessibilityLabel={`${item.category} item`} source={{ uri: item.imageUrl }} style={styles.image} /> : (
        <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>No image</Text></View>
      )}
      <Text numberOfLines={1} style={styles.category}>{item.category}</Text>
      {item.color ? <Text numberOfLines={1} style={styles.color}>{item.color}</Text> : null}
      <Pressable disabled={isSaving} onPress={onLaundry} style={styles.laundryButton}>
        {isSaving ? <ActivityIndicator size="small" /> : <Text style={styles.laundryText}>Laundry</Text>}
      </Pressable>
    </Pressable>
  );
}

function CreateLookModal({
  visible,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  isSubmitting: boolean;
  error: Error | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState('');
  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Save this look</Text>
          <Pressable disabled={isSubmitting} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
        </View>
        <TextInput
          autoFocus
          onChangeText={setName}
          placeholder="Look name (optional)"
          placeholderTextColor={colors.text.secondary}
          style={styles.input}
          value={name}
        />
        {error ? <Text style={styles.error}>{error.message}</Text> : null}
        <Pressable disabled={isSubmitting} onPress={() => onSubmit(name.trim())} style={styles.button}>
          {isSubmitting ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.buttonText}>Save look</Text>}
        </Pressable>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) { return StyleSheet.create({
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: spacing.xl },
  emptyList: { flexGrow: 1 },
  list: { padding: spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, width: '100%' },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  addButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  addButtonText: { color: colors.text.inverse, fontWeight: '700' },
  disabledButton: { opacity: 0.4 },
  title: { color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { color: colors.text.secondary, fontSize: 16, marginBottom: spacing.lg, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  buttonText: { color: colors.text.inverse, fontWeight: '700' },
  card: { flex: 1, margin: spacing.sm, maxWidth: '50%' },
  selectedCard: { borderColor: colors.primary, borderRadius: 10, borderWidth: 3 },
  image: { aspectRatio: 0.8, backgroundColor: colors.border, borderRadius: 8, width: '100%' },
  imagePlaceholder: { alignItems: 'center', aspectRatio: 0.8, backgroundColor: colors.border, borderRadius: 8, justifyContent: 'center' },
  placeholderText: { color: colors.text.secondary },
  category: { color: colors.text.primary, fontWeight: '700', marginTop: spacing.sm },
  color: { color: colors.text.secondary, marginTop: spacing.xs },
  laundryButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 6, borderWidth: 1, marginTop: spacing.sm, padding: spacing.sm },
  laundryText: { color: colors.text.primary, fontSize: 12, fontWeight: '600' },
  modal: { backgroundColor: colors.secondary, flex: 1, padding: spacing.xl },
  modalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  modalTitle: { color: colors.text.primary, fontSize: 24, fontWeight: '700' },
  cancelText: { color: colors.text.secondary, fontWeight: '600' },
  imagePicker: { alignItems: 'center', aspectRatio: 1, backgroundColor: colors.border, borderRadius: 12, justifyContent: 'center', marginBottom: spacing.xl, overflow: 'hidden' },
  preview: { height: '100%', width: '100%' },
  pickerText: { color: colors.text.secondary, fontSize: 16, fontWeight: '600' },
  fieldLabel: { color: colors.text.primary, fontWeight: '700', marginBottom: spacing.sm },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  categoryOption: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  categoryOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryOptionText: { color: colors.text.primary },
  categoryOptionTextSelected: { color: colors.text.inverse, fontWeight: '700' },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text.primary, marginBottom: spacing.md, padding: spacing.md },
  error: { color: colors.accent, marginBottom: spacing.md },
}); }

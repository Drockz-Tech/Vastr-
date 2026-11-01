import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ItemService } from '../services/ItemService';
import { Item } from '../types/database';
import { StorageService } from '../services/StorageService';
import { CreateItemPayload } from '../lib/validations';
import { useAuth } from '../providers/AuthProvider';

export const CLOSET_QUERY_KEY = ['closet'];
export type ClosetItem = Item & { imageUrl: string | null };

/**
 * Custom React Query hook for fetching and caching the user's active closet.
 * Provides caching, offline support, and stale-while-revalidate out of the box.
 */
export function useActiveCloset(page: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: [...CLOSET_QUERY_KEY, page, limit],
    queryFn: async () => {
      const { data, error } = await ItemService.getActiveCloset(page, limit);
      if (error) throw error;
      if (!data) return [];
      return Promise.all(data.map(async (item) => {
        const imageResponse = await StorageService.getSignedImageUrl(item.image_path);
        return {
          ...item,
          imageUrl: imageResponse.success ? imageResponse.data : null,
        };
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
}

/**
 * Mutation hook for moving an item to the laundry basket.
 * Uses Optimistic UI updates to make the app feel instantly responsive.
 */
export function useSendToLaundry(page: number = 0, limit: number = 20) {
  const queryClient = useQueryClient();
  const queryKey = [...CLOSET_QUERY_KEY, page, limit];

  return useMutation({
    mutationFn: (itemId: string) => ItemService.sendToLaundry(itemId),
    onMutate: async (itemId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousCloset = queryClient.getQueryData<ClosetItem[]>(queryKey);

      // Optimistically update to the new value (remove the item from the grid)
      queryClient.setQueryData<ClosetItem[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== itemId);
      });

      return { previousCloset };
    },
    onError: (err, itemId, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousCloset) {
        queryClient.setQueryData(queryKey, context.previousCloset);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server sync
      queryClient.invalidateQueries({ queryKey: CLOSET_QUERY_KEY });
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ imageUri, payload }: { imageUri: string; payload: CreateItemPayload }) => {
      if (!session?.user.id) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      const uploadResponse = await StorageService.uploadImage(session.user.id, imageUri);
      if (!uploadResponse.success || !uploadResponse.data) {
        throw uploadResponse.error ?? new Error('Unable to upload image');
      }

      const response = await ItemService.createItem(session.user.id, {
        ...payload,
        imagePath: uploadResponse.data,
      });
      if (!response.success || !response.data) {
        await StorageService.deleteImage(uploadResponse.data);
        throw response.error ?? new Error('Unable to create item');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOSET_QUERY_KEY });
    },
  });
}

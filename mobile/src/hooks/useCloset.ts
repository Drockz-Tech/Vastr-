import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ItemService } from '../services/ItemService';
import { Item } from '../types/database';

export const CLOSET_QUERY_KEY = ['closet'];

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
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
}

/**
 * Mutation hook for moving an item to the laundry basket.
 * Uses Optimistic UI updates to make the app feel instantly responsive.
 */
export function useSendToLaundry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => ItemService.sendToLaundry(itemId),
    onMutate: async (itemId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: CLOSET_QUERY_KEY });

      // Snapshot the previous value
      const previousCloset = queryClient.getQueryData(CLOSET_QUERY_KEY);

      // Optimistically update to the new value (remove the item from the grid)
      queryClient.setQueryData(CLOSET_QUERY_KEY, (old: any) => {
        if (!old) return old;
        // In a real paginated cache, this update logic is more complex, but this demonstrates the concept
        return old.filter((item: Item) => item.id !== itemId);
      });

      return { previousCloset };
    },
    onError: (err, itemId, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousCloset) {
        queryClient.setQueryData(CLOSET_QUERY_KEY, context.previousCloset);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server sync
      queryClient.invalidateQueries({ queryKey: CLOSET_QUERY_KEY });
    },
  });
}

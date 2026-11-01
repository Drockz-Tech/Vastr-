import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CreateOutfitPayload } from '../lib/validations';
import { useAuth } from '../providers/AuthProvider';
import { LogService } from '../services/LogService';
import { OutfitService } from '../services/OutfitService';
import { StorageService } from '../services/StorageService';
import { Outfit } from '../types/database';

export const OUTFITS_QUERY_KEY = ['outfits'];
export type SwipeOutfit = Outfit & { imageUrl: string | null };

export function useSwipeDeck() {
  return useQuery({
    queryKey: OUTFITS_QUERY_KEY,
    queryFn: async () => {
      const response = await OutfitService.getSwipeDeck();
      if (!response.success || !response.data) {
        throw response.error ?? new Error('Unable to load outfits');
      }

      return Promise.all(response.data.map(async (outfit) => {
        const imageResponse = outfit.image_path
          ? await StorageService.getSignedImageUrl(outfit.image_path)
          : null;
        return {
          ...outfit,
          imageUrl: imageResponse?.success ? imageResponse.data : null,
        };
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOutfitPayload & { imagePath?: string }) =>
      OutfitService.createCombination(payload.itemIds, payload.name, payload.imagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTFITS_QUERY_KEY });
    },
  });
}

export function useLogOutfitWorn() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ outfitId, eventTag }: { outfitId: string; eventTag?: string }) => {
      if (!session?.user.id) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      const response = await LogService.logOutfitWorn(session.user.id, outfitId, eventTag);
      if (!response.success || !response.data) {
        throw response.error ?? new Error('Unable to log outfit');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTFITS_QUERY_KEY });
    },
  });
}

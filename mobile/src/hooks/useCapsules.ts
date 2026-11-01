import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CreateCapsulePayload } from '../lib/validations';
import { useAuth } from '../providers/AuthProvider';
import { CapsuleService } from '../services/CapsuleService';

export const CAPSULES_QUERY_KEY = ['capsules'];

export function useCapsules() {
  return useQuery({
    queryKey: CAPSULES_QUERY_KEY,
    queryFn: async () => {
      const response = await CapsuleService.getCapsules();
      if (!response.success || !response.data) {
        throw response.error ?? new Error('Unable to load trips');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCapsule() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCapsulePayload) => {
      if (!session?.user.id) throw new Error('Your session has expired. Please sign in again.');
      const response = await CapsuleService.createCapsule(
        session.user.id,
        payload.name,
        payload.startDate,
        payload.endDate,
      );
      if (!response.success || !response.data) {
        throw response.error ?? new Error('Unable to create trip');
      }
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CAPSULES_QUERY_KEY }),
  });
}

export function useAddItemToCapsule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ capsuleId, itemId }: { capsuleId: string; itemId: string }) =>
      CapsuleService.addItemToCapsule(capsuleId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CAPSULES_QUERY_KEY }),
  });
}

import { useQuery } from '@tanstack/react-query';

import { LogService } from '../services/LogService';
import { summarizeWearHistory } from '../lib/analytics';

export const ANALYTICS_QUERY_KEY = ['analytics'];

export function useWearAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEY,
    queryFn: async () => {
      const response = await LogService.getWearHistory(100);
      if (!response.success || !response.data) {
        throw response.error ?? new Error('Unable to load wear history');
      }

      return summarizeWearHistory(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

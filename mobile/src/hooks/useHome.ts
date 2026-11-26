import { useQuery } from '@tanstack/react-query';
import { HomeService, HomeWearLog, WardrobeItem } from '../services/HomeService';
import { StorageService } from '../services/StorageService';

export const HOME_QUERY_KEY = ['home'];
export type HomeData = {
  counts: { total: number; clean: number; laundry: number };
  history: Array<HomeWearLog & { outfit: NonNullable<HomeWearLog['outfit']> & { imageUrl: string | null } }>;
  items: Array<WardrobeItem & { imageUrl: string | null }>;
};

export function useHomeData() {
  return useQuery({
    queryKey: HOME_QUERY_KEY,
    queryFn: async (): Promise<HomeData> => {
      const [countsResponse, historyResponse, itemsResponse] = await Promise.all([
        HomeService.getWardrobeCounts(), HomeService.getWearHistory(100), HomeService.getWardrobeItems(),
      ]);
      if (!countsResponse.success || !countsResponse.data) throw countsResponse.error ?? new Error('Unable to load wardrobe status');
      if (!historyResponse.success || !historyResponse.data) throw historyResponse.error ?? new Error('Unable to load outfit history');
      if (!itemsResponse.success || !itemsResponse.data) throw itemsResponse.error ?? new Error('Unable to load wardrobe items');

      const paths = new Set<string>();
      itemsResponse.data.forEach((item) => paths.add(item.image_path));
      historyResponse.data.forEach((log) => {
        if (log.outfit?.image_path) paths.add(log.outfit.image_path);
        log.outfit?.items.forEach((item) => paths.add(item.image_path));
      });
      const urls = new Map<string, string | null>();
      await Promise.all([...paths].map(async (path) => {
        const response = await StorageService.getSignedImageUrl(path);
        urls.set(path, response.success ? response.data : null);
      }));

      return {
        counts: countsResponse.data,
        history: historyResponse.data.flatMap((log) => log.outfit ? [{
          ...log,
          outfit: { ...log.outfit, imageUrl: log.outfit.image_path ? urls.get(log.outfit.image_path) ?? null : null },
        }] : []),
        items: itemsResponse.data.map((item) => ({ ...item, imageUrl: urls.get(item.image_path) ?? null })),
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

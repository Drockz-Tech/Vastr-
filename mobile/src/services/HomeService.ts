import { supabase } from '../db/supabase';
import { createResponse, ServiceResponse, toError } from './BaseService';

export type HomeItem = { id: string; image_path: string; category: string; color: string | null };
export type HomeOutfit = {
  id: string;
  name: string | null;
  image_path: string | null;
  items: HomeItem[];
};
export type HomeWearLog = { id: string; worn_date: string; outfit: HomeOutfit | null };
export type WardrobeCounts = { total: number; clean: number; laundry: number };
export type WardrobeItem = HomeItem & { in_laundry: boolean };

export const HomeService = {
  async getWardrobeCounts(): Promise<ServiceResponse<WardrobeCounts>> {
    try {
      const [total, clean, laundry] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('items').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('in_laundry', false),
        supabase.from('items').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('in_laundry', true),
      ]);
      if (total.error) throw total.error;
      if (clean.error) throw clean.error;
      if (laundry.error) throw laundry.error;
      return createResponse({ total: total.count ?? 0, clean: clean.count ?? 0, laundry: laundry.count ?? 0 });
    } catch (error: unknown) {
      return createResponse<WardrobeCounts>(null, toError(error));
    }
  },

  async getWearHistory(limit = 100): Promise<ServiceResponse<HomeWearLog[]>> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('id,worn_date,outfit:outfits(id,name,image_path,outfit_items(item:items(id,image_path,category,color)))')
        .order('worn_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;

      const logs = (data ?? []).map((row) => {
        const record = row as unknown as {
          id: string; worn_date: string;
          outfit: null | { id: string; name: string | null; image_path: string | null; outfit_items: Array<{ item: HomeItem | null }> };
        };
        return {
          id: record.id,
          worn_date: record.worn_date,
          outfit: record.outfit ? {
            id: record.outfit.id,
            name: record.outfit.name,
            image_path: record.outfit.image_path,
            items: record.outfit.outfit_items.map(({ item }) => item).filter((item): item is HomeItem => item !== null),
          } : null,
        };
      });
      return createResponse(logs);
    } catch (error: unknown) {
      return createResponse<HomeWearLog[]>(null, toError(error));
    }
  },

  async getWardrobeItems(): Promise<ServiceResponse<WardrobeItem[]>> {
    try {
      const { data, error } = await supabase.from('items')
        .select('id,image_path,category,color,in_laundry')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return createResponse((data ?? []) as WardrobeItem[]);
    } catch (error: unknown) {
      return createResponse<WardrobeItem[]>(null, toError(error));
    }
  },
};

import { supabase } from '../db/supabase';
import { Outfit } from '../types/database';
import { createResponse, ServiceResponse, toError } from './BaseService';

export const OutfitService = {
  /**
   * Creates a new combination outfit from multiple wardrobe items.
   * This is an atomic transaction: it creates the outfit, then links the items.
   */
  async createCombination(itemIds: string[], name?: string, imagePath?: string): Promise<ServiceResponse<Outfit>> {
    try {
      if (itemIds.length === 0) {
        throw new Error('An outfit must contain at least one item');
      }

      const { data, error } = await supabase.rpc('create_outfit_with_items', {
        p_name: name ?? null,
        p_image_path: imagePath ?? null,
        p_item_ids: itemIds,
      }).single();

      if (error) throw error;
      return createResponse<Outfit>(data);
    } catch (error: unknown) {
      return createResponse<Outfit>(null, toError(error));
    }
  },

  /**
   * Fetches the user's outfit deck for the Style Swipe feature.
   */
  async getSwipeDeck(): Promise<ServiceResponse<Outfit[]>> {
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse<Outfit[]>(data);
    } catch (error: unknown) {
      return createResponse<Outfit[]>(null, toError(error));
    }
  }
};

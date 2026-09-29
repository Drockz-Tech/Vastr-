import { supabase } from '../db/supabase';
import { Outfit } from '../types/database';
import { createResponse, ServiceResponse } from './BaseService';

export const OutfitService = {
  /**
   * Creates a new combination outfit from multiple wardrobe items.
   * This is an atomic transaction: it creates the outfit, then links the items.
   */
  async createCombination(userId: string, itemIds: string[], name?: string): Promise<ServiceResponse<Outfit>> {
    try {
      // 1. Create the base outfit record
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert([{ user_id: userId, name }])
        .select()
        .single();

      if (outfitError) throw outfitError;

      // 2. Prepare the mapping rows for outfit_items
      const outfitItems = itemIds.map(itemId => ({
        outfit_id: outfit.id,
        item_id: itemId
      }));

      // 3. Insert the relationships
      const { error: mappingError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (mappingError) {
        // Rollback: if mapping fails, delete the orphaned outfit
        await supabase.from('outfits').delete().eq('id', outfit.id);
        throw mappingError;
      }

      return createResponse<Outfit>(outfit);
    } catch (error: any) {
      return createResponse<Outfit>(null, error);
    }
  },

  /**
   * Fetches the user's outfit deck for the Style Swipe feature.
   */
  async getSwipeDeck(): Promise<ServiceResponse<Outfit[]>> {
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`*, items:outfit_items(item:items(*))`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse<Outfit[]>(data);
    } catch (error: any) {
      return createResponse<Outfit[]>(null, error);
    }
  }
};

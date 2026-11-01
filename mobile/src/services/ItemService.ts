import { supabase } from '../db/supabase';
import { Item } from '../types/database';
import { createResponse, ServiceResponse, toError } from './BaseService';
import { CreateItemPayload } from '../lib/validations';

/**
 * Data Access Layer for Wardrobe Items.
 * This ensures UI components never write direct SQL queries, maintaining a clean architecture.
 */
export const ItemService = {
  /**
   * Fetches all clean items with Pagination.
   * @param page The page number (0-indexed)
   * @param limit Items per page (default 20)
   */
  async getActiveCloset(page: number = 0, limit: number = 20): Promise<ServiceResponse<Item[]>> {
    try {
      if (!Number.isInteger(page) || page < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error('Invalid closet pagination values');
      }

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('in_laundry', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);
      if (error) throw error;
      return createResponse<Item[]>(data);
    } catch (error: unknown) {
      return createResponse<Item[]>(null, toError(error));
    }
  },

  /**
   * Moves a specific item to the laundry basket.
   */
  async sendToLaundry(itemId: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!itemId) {
        throw new Error('An item id is required');
      }

      const { error } = await supabase
        .from('items')
        .update({ in_laundry: true })
        .eq('id', itemId);
      if (error) throw error;
      return createResponse(true);
    } catch (error: unknown) {
      return createResponse(false, toError(error));
    }
  },

  async createItem(userId: string, payload: CreateItemPayload): Promise<ServiceResponse<Item>> {
    try {
      if (!userId) {
        throw new Error('A signed-in user is required');
      }

      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: userId,
          image_path: payload.imagePath,
          category: payload.category,
          color: payload.color || null,
          season: payload.season || null,
        })
        .select()
        .single();

      if (error) throw error;
      return createResponse<Item>(data);
    } catch (error: unknown) {
      return createResponse<Item>(null, toError(error));
    }
  },
};

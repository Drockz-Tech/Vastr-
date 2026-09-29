import { supabase } from '../db/supabase';
import { Item } from '../types/database';

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
  async getActiveCloset(page: number = 0, limit: number = 20): Promise<{ data: Item[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('in_laundry', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching closet:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Moves a specific item to the laundry basket.
   */
  async sendToLaundry(itemId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('items')
        .update({ in_laundry: true })
        .eq('id', itemId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error sending to laundry:', error.message);
      return { success: false, error };
    }
  },
};

import { supabase } from '../db/supabase';
import { Capsule } from '../types/database';
import { createResponse, ServiceResponse } from './BaseService';

export const CapsuleService = {
  /**
   * Creates a new travel packing capsule.
   */
  async createCapsule(userId: string, name: string, startDate?: string, endDate?: string): Promise<ServiceResponse<Capsule>> {
    try {
      const { data, error } = await supabase
        .from('capsules')
        .insert([{ user_id: userId, name, start_date: startDate, end_date: endDate }])
        .select()
        .single();

      if (error) throw error;
      return createResponse<Capsule>(data);
    } catch (error: any) {
      return createResponse<Capsule>(null, error);
    }
  },

  /**
   * Adds an item to a specific packing capsule.
   */
  async addItemToCapsule(capsuleId: string, itemId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('capsule_items')
        .insert([{ capsule_id: capsuleId, item_id: itemId }]);

      if (error) throw error;
      return createResponse<boolean>(true);
    } catch (error: any) {
      return createResponse<boolean>(false, error);
    }
  }
};

import { supabase } from '../db/supabase';
import { Log } from '../types/database';
import { createResponse, ServiceResponse } from './BaseService';

export const LogService = {
  /**
   * Logs an outfit as worn today. Critical for the core habit loop.
   */
  async logOutfitWorn(userId: string, outfitId: string, eventTag?: string): Promise<ServiceResponse<Log>> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .insert([{ 
          user_id: userId, 
          outfit_id: outfitId, 
          event_tag: eventTag,
          worn_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        }])
        .select()
        .single();

      if (error) throw error;

      // Enterprise Feature: Asynchronously trigger a background job or update 
      // the `items` worn count if we add that to the schema later.
      
      return createResponse<Log>(data);
    } catch (error: any) {
      return createResponse<Log>(null, error);
    }
  }
};

import { supabase } from '../db/supabase';
import { createResponse, ServiceResponse } from './BaseService';

export const StorageService = {
  /**
   * Uploads an image to Supabase Storage.
   * Uses the user's ID to securely namespace their files.
   */
  async uploadImage(userId: string, uri: string, bucket: string = 'wardrobe'): Promise<ServiceResponse<string>> {
    try {
      // Extract file extension and create a unique file name
      const ext = uri.substring(uri.lastIndexOf('.') + 1) || 'jpg';
      const fileName = `${userId}/${Date.now()}.${ext}`;

      // Fetch the file from the local filesystem (React Native specific approach)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(fileName, blob, {
          upsert: false,
          contentType: `image/${ext}`
        });

      if (error) throw error;

      // Generate the public URL to store in the database
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      
      return createResponse<string>(publicUrlData.publicUrl);
    } catch (error: any) {
      return createResponse<string>(null, error);
    }
  },

  /**
   * Deletes an image from storage (used when an item is deleted).
   */
  async deleteImage(filePath: string, bucket: string = 'wardrobe'): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) throw error;
      return createResponse<boolean>(true);
    } catch (error: any) {
      return createResponse<boolean>(false, error);
    }
  }
};

import { supabase } from '../db/supabase';
import { createResponse, ServiceResponse, toError } from './BaseService';

export const StorageService = {
  /**
   * Uploads an image to Supabase Storage.
   * Uses the user's ID to securely namespace their files.
   */
  async uploadImage(userId: string, uri: string, bucket: string = 'wardrobe'): Promise<ServiceResponse<string>> {
    try {
      const extensionMatch = uri.match(/\.([a-z0-9]+)(?:\?.*)?$/i);
      const ext = extensionMatch?.[1]?.toLowerCase() ?? 'jpg';
      const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
      if (!allowedExtensions.has(ext)) {
        throw new Error('Unsupported image type');
      }

      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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

      return createResponse<string>(data.path);
    } catch (error: unknown) {
      return createResponse<string>(null, toError(error));
    }
  },

  async getSignedImageUrl(
    filePath: string,
    expiresInSeconds: number = 3600,
    bucket: string = 'wardrobe',
  ): Promise<ServiceResponse<string>> {
    try {
      if (!filePath || expiresInSeconds < 1 || expiresInSeconds > 86400) {
        throw new Error('Invalid image URL parameters');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) throw error;
      return createResponse(data.signedUrl);
    } catch (error: unknown) {
      return createResponse<string>(null, toError(error));
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
    } catch (error: unknown) {
      return createResponse<boolean>(false, toError(error));
    }
  }
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          user_id: string
          image_url: string
          category: string
          color: string | null
          season: string | null
          in_laundry: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          category: string
          color?: string | null
          season?: string | null
          in_laundry?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          category?: string
          color?: string | null
          season?: string | null
          in_laundry?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string | null
          image_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
  }
}

// Helper types for easier imports
export type Item = Database['public']['Tables']['items']['Row']
export type Outfit = Database['public']['Tables']['outfits']['Row']

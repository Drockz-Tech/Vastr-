export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string;

interface ItemRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  image_path: string;
  category: string;
  color: string | null;
  season: string | null;
  in_laundry: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
}

interface OutfitRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  name: string | null;
  image_path: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
}

interface OutfitItemRow {
  [key: string]: unknown;
  outfit_id: string;
  item_id: string;
}

interface LogRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  outfit_id: string;
  event_tag: string | null;
  worn_date: string;
  created_at: Timestamp;
}

interface CapsuleRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface CapsuleItemRow {
  [key: string]: unknown;
  capsule_id: string;
  item_id: string;
}

type TableDefinition<Row> = {
  Row: Record<string, unknown> & Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      items: TableDefinition<ItemRow>;
      outfits: TableDefinition<OutfitRow>;
      outfit_items: TableDefinition<OutfitItemRow>;
      logs: TableDefinition<LogRow>;
      capsules: TableDefinition<CapsuleRow>;
      capsule_items: TableDefinition<CapsuleItemRow>;
    };
    Views: Record<string, never>;
    Functions: {
      create_outfit_with_items: {
        Args: {
          p_name: string | null;
          p_image_path: string | null;
          p_item_ids: string[];
        };
        Returns: OutfitRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Item = Database['public']['Tables']['items']['Row'];
export type Outfit = Database['public']['Tables']['outfits']['Row'];
export type OutfitItem = Database['public']['Tables']['outfit_items']['Row'];
export type Log = Database['public']['Tables']['logs']['Row'];
export type Capsule = Database['public']['Tables']['capsules']['Row'];
export type CapsuleItem = Database['public']['Tables']['capsule_items']['Row'];

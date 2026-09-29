-- Vastré Backend Schema (PostgreSQL for Supabase) - Enterprise Grade

-- 1. Items (The Closet)
CREATE TABLE items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory')),
    color TEXT,
    season TEXT CHECK (season IN ('Spring', 'Summer', 'Fall', 'Winter', 'All') OR season IS NULL),
    in_laundry BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- SOFT DELETE: Never truly delete data
);

-- 2. Outfits (Combinations & Swipe Deck)
CREATE TABLE outfits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT, 
    image_url TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- SOFT DELETE
);

-- 3. Outfit Items (Mapping table)
CREATE TABLE outfit_items (
    outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (outfit_id, item_id)
);

-- 4. Logs (Tracking what you wore and when)
CREATE TABLE logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
    event_tag TEXT,
    worn_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Capsules (Travel Packing)
CREATE TABLE capsules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Capsule Items (Mapping table)
CREATE TABLE capsule_items (
    capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (capsule_id, item_id)
);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: INDEXES
-- Critical for scaling: Foreign keys must be indexed to prevent slow JOIN queries.
-- ============================================================================
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_item_id ON outfit_items(item_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_outfit_id ON logs(outfit_id);
CREATE INDEX idx_capsules_user_id ON capsules(user_id);
CREATE INDEX idx_capsule_items_capsule_id ON capsule_items(capsule_id);
CREATE INDEX idx_capsule_items_item_id ON capsule_items(item_id);

-- ============================================================================
-- SECURITY: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_items ENABLE ROW LEVEL SECURITY;

-- Ensure users only see items/outfits that are NOT soft deleted
CREATE POLICY "Users manage their own items" ON items FOR ALL USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users manage their own outfits" ON outfits FOR ALL USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users manage their own logs" ON logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own capsules" ON capsules FOR ALL USING (auth.uid() = user_id);
-- Mapping tables derive security from their parent records (user_id is not directly on the mapping table, but we restrict it)
CREATE POLICY "Users manage their outfit items" ON outfit_items FOR ALL USING (
  EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
);
CREATE POLICY "Users manage their capsule items" ON capsule_items FOR ALL USING (
  EXISTS (SELECT 1 FROM capsules WHERE capsules.id = capsule_items.capsule_id AND capsules.user_id = auth.uid())
);

-- ============================================================================
-- AUTOMATED TRIGGERS (Updated At)
-- ============================================================================
-- PostgreSQL doesn't automatically update the `updated_at` column. 
-- We must create a function and attach it to our tables.
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_modtime
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_outfits_modtime
    BEFORE UPDATE ON outfits
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_capsules_modtime
    BEFORE UPDATE ON capsules
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ============================================================================
-- STORAGE BUCKETS & SECURITY
-- ============================================================================
-- Assuming we create a storage bucket called 'wardrobe' via the dashboard.
-- We must secure it so users can only access their own uploaded clothing photos.

-- 1. Create the bucket (if running via SQL, though often done in UI)
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe', 'wardrobe', true);

-- 2. Storage RLS Policies
-- Users can upload files ONLY to a folder named with their own User ID.
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wardrobe' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wardrobe' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: Read access can be public if the bucket is public, or restricted by user.

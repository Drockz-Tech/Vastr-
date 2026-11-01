-- Harden ownership, soft-delete, relationship integrity, and image privacy.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE items RENAME COLUMN image_url TO image_path;
ALTER TABLE outfits RENAME COLUMN image_url TO image_path;

ALTER TABLE items
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN in_laundry SET DEFAULT false;

ALTER TABLE outfits
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE logs
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN outfit_id SET NOT NULL;

ALTER TABLE capsules
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE capsules
  ADD CONSTRAINT capsules_valid_date_range
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

GRANT SELECT, INSERT, UPDATE ON items, outfits, logs, capsules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON outfit_items, capsule_items TO authenticated;

DROP POLICY IF EXISTS "Users manage their own items" ON items;
DROP POLICY IF EXISTS "Users manage their own outfits" ON outfits;
DROP POLICY IF EXISTS "Users manage their own logs" ON logs;
DROP POLICY IF EXISTS "Users manage their own capsules" ON capsules;
DROP POLICY IF EXISTS "Users manage their outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users manage their capsule items" ON capsule_items;

CREATE POLICY "Users read active items"
  ON items FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users create items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users update their items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read active outfits"
  ON outfits FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users create outfits"
  ON outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users update their outfits"
  ON outfits FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own logs"
  ON logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own capsules"
  ON capsules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their outfit items"
  ON outfit_items FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM outfits o
      JOIN items i ON i.id = outfit_items.item_id
      WHERE o.id = outfit_items.outfit_id
        AND o.user_id = auth.uid()
        AND o.deleted_at IS NULL
        AND i.user_id = auth.uid()
        AND i.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM outfits o
      JOIN items i ON i.id = outfit_items.item_id
      WHERE o.id = outfit_items.outfit_id
        AND o.user_id = auth.uid()
        AND o.deleted_at IS NULL
        AND i.user_id = auth.uid()
        AND i.deleted_at IS NULL
    )
  );

CREATE POLICY "Users manage their capsule items"
  ON capsule_items FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM capsules c
      JOIN items i ON i.id = capsule_items.item_id
      WHERE c.id = capsule_items.capsule_id
        AND c.user_id = auth.uid()
        AND i.user_id = auth.uid()
        AND i.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM capsules c
      JOIN items i ON i.id = capsule_items.item_id
      WHERE c.id = capsule_items.capsule_id
        AND c.user_id = auth.uid()
        AND i.user_id = auth.uid()
        AND i.deleted_at IS NULL
    )
  );

UPDATE storage.buckets
SET public = false
WHERE id = 'wardrobe';

DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;

CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wardrobe'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wardrobe'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'wardrobe'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'wardrobe'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wardrobe'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE OR REPLACE FUNCTION create_outfit_with_items(
  p_name text,
  p_image_path text,
  p_item_ids uuid[]
)
RETURNS SETOF outfits
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  created_outfit outfits;
BEGIN
  IF p_item_ids IS NULL OR cardinality(p_item_ids) = 0 THEN
    RAISE EXCEPTION 'An outfit must contain at least one item';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_item_ids) item_id
    LEFT JOIN items i ON i.id = item_id
    WHERE i.id IS NULL
       OR i.user_id <> auth.uid()
       OR i.deleted_at IS NOT NULL
       OR i.in_laundry
  ) THEN
    RAISE EXCEPTION 'Outfit contains an invalid or unavailable item';
  END IF;

  INSERT INTO outfits (user_id, name, image_path)
  VALUES (auth.uid(), NULLIF(trim(p_name), ''), p_image_path)
  RETURNING * INTO created_outfit;

  INSERT INTO outfit_items (outfit_id, item_id)
  SELECT created_outfit.id, item_id
  FROM unnest(p_item_ids) item_id;

  RETURN NEXT created_outfit;
END;
$$;

GRANT EXECUTE ON FUNCTION create_outfit_with_items(text, text, uuid[]) TO authenticated;

-- Ensure permissive, safe policies for public uploads to 'advertisement-images' bucket
-- We only allow SELECT and INSERT for anon on this bucket. No UPDATE/DELETE.
-- Clean up potentially conflicting prior policies by name (if they exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read advertisement images'
  ) THEN
    EXECUTE 'DROP POLICY "Public can read advertisement images" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can upload advertisement images'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can upload advertisement images" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own advertisement images'
  ) THEN
    EXECUTE 'DROP POLICY "Users can upload their own advertisement images" ON storage.objects';
  END IF;
END $$;

-- Explicit read for public (anon) on this bucket
CREATE POLICY "Public can read advertisement images"
ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'advertisement-images');

-- Allow anonymous uploads specifically to this bucket
CREATE POLICY "Anyone can upload advertisement images"
ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'advertisement-images');

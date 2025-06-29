-- Create storage bucket for shared map images
-- 
-- IMPORTANT: The bucket creation must be done through the Supabase Dashboard, not SQL
-- 
-- To create the bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Set these values:
--    - Name: shared-maps
--    - Public bucket: ON (checked)
--    - File size limit: 50 MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp
-- 
-- After creating the bucket through the dashboard, run the policies below:

-- Storage policies for shared-maps bucket
CREATE POLICY "Authenticated users can upload shared maps" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'shared-maps' AND 
    auth.role() = 'authenticated' AND
    -- Ensure users can only upload to their own folder
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view shared map images" ON storage.objects
  FOR SELECT USING (bucket_id = 'shared-maps');

CREATE POLICY "Users can delete their own shared maps" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'shared-maps' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own shared maps" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'shared-maps' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verify bucket exists (optional check)
-- This should return one row if the bucket was created successfully
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'shared-maps';
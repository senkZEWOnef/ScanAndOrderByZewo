-- Storage Buckets Configuration for ScanAndOrderByZewo
-- Run this SQL in your Supabase SQL Editor after creating the buckets

-- First, create the storage buckets in the Supabase Dashboard:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a bucket named "menu-images" (make it public)
-- 3. Create a bucket named "vendor-logos" (make it public)
-- 4. Create a bucket named "vendor-banners" (make it public)

-- Storage policies for menu-images bucket
CREATE POLICY "Allow public read access to menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Allow authenticated users to upload menu images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own menu images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'menu-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own menu images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'menu-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for vendor-logos bucket
CREATE POLICY "Allow public read access to vendor logos" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-logos');

CREATE POLICY "Allow authenticated users to upload vendor logos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'vendor-logos' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own vendor logos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'vendor-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own vendor logos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'vendor-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for vendor-banners bucket
CREATE POLICY "Allow public read access to vendor banners" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-banners');

CREATE POLICY "Allow authenticated users to upload vendor banners" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'vendor-banners' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own vendor banners" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'vendor-banners' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own vendor banners" ON storage.objects
FOR DELETE USING (
    bucket_id = 'vendor-banners' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
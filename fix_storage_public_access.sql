-- Fix storage bucket public access
-- This ensures uploaded images can be viewed publicly
-- Run this in your Supabase SQL Editor

-- Make sure all storage buckets are public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('vendor-logos', 'vendor-banners', 'menu-images');

-- Drop any restrictive storage policies
DROP POLICY IF EXISTS "Public read vendor logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload vendor logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow update vendor logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete vendor logos" ON storage.objects;

DROP POLICY IF EXISTS "Public read vendor banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload vendor banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow update vendor banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete vendor banners" ON storage.objects;

DROP POLICY IF EXISTS "Public read menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete menu images" ON storage.objects;

-- Create simple, permissive storage policies for all operations

-- Vendor Logos policies
CREATE POLICY "Anyone can view vendor logos" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-logos');

CREATE POLICY "Anyone can upload vendor logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vendor-logos');

CREATE POLICY "Anyone can update vendor logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'vendor-logos');

CREATE POLICY "Anyone can delete vendor logos" ON storage.objects
FOR DELETE USING (bucket_id = 'vendor-logos');

-- Vendor Banners policies
CREATE POLICY "Anyone can view vendor banners" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-banners');

CREATE POLICY "Anyone can upload vendor banners" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vendor-banners');

CREATE POLICY "Anyone can update vendor banners" ON storage.objects
FOR UPDATE USING (bucket_id = 'vendor-banners');

CREATE POLICY "Anyone can delete vendor banners" ON storage.objects
FOR DELETE USING (bucket_id = 'vendor-banners');

-- Menu Images policies
CREATE POLICY "Anyone can view menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Anyone can upload menu images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Anyone can update menu images" ON storage.objects
FOR UPDATE USING (bucket_id = 'menu-images');

CREATE POLICY "Anyone can delete menu images" ON storage.objects
FOR DELETE USING (bucket_id = 'menu-images');

-- Verify bucket public status
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id IN ('vendor-logos', 'vendor-banners', 'menu-images');
-- Fix Storage Policies for Testing
-- Run this in your Supabase SQL Editor

-- First, create the storage buckets in the Supabase Dashboard if they don't exist:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create bucket "vendor-logos" (make it public)
-- 3. Create bucket "vendor-banners" (make it public)  
-- 4. Create bucket "menu-images" (make it public)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to vendor logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload vendor logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own vendor logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own vendor logos" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access to vendor banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload vendor banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own vendor banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own vendor banners" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access to menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own menu images" ON storage.objects;

-- Create simplified policies for testing (allow all operations for now)

-- Vendor Logos policies
CREATE POLICY "Public read vendor logos" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-logos');

CREATE POLICY "Allow upload vendor logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vendor-logos');

CREATE POLICY "Allow update vendor logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'vendor-logos');

CREATE POLICY "Allow delete vendor logos" ON storage.objects
FOR DELETE USING (bucket_id = 'vendor-logos');

-- Vendor Banners policies
CREATE POLICY "Public read vendor banners" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-banners');

CREATE POLICY "Allow upload vendor banners" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vendor-banners');

CREATE POLICY "Allow update vendor banners" ON storage.objects
FOR UPDATE USING (bucket_id = 'vendor-banners');

CREATE POLICY "Allow delete vendor banners" ON storage.objects
FOR DELETE USING (bucket_id = 'vendor-banners');

-- Menu Images policies  
CREATE POLICY "Public read menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Allow upload menu images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Allow update menu images" ON storage.objects
FOR UPDATE USING (bucket_id = 'menu-images');

CREATE POLICY "Allow delete menu images" ON storage.objects
FOR DELETE USING (bucket_id = 'menu-images');
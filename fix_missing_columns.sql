-- Add missing image URL columns to vendor_profiles table
-- Run this in your Supabase SQL Editor

-- Check if logo_url column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_profiles' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE vendor_profiles ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Added logo_url column to vendor_profiles';
    ELSE
        RAISE NOTICE 'logo_url column already exists';
    END IF;
END $$;

-- Check if banner_url column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_profiles' 
        AND column_name = 'banner_url'
    ) THEN
        ALTER TABLE vendor_profiles ADD COLUMN banner_url TEXT;
        RAISE NOTICE 'Added banner_url column to vendor_profiles';
    ELSE
        RAISE NOTICE 'banner_url column already exists';
    END IF;
END $$;

-- Test updating a vendor with image URLs
DO $$
DECLARE
    test_vendor_id UUID;
    update_result RECORD;
BEGIN
    -- Get first vendor
    SELECT id INTO test_vendor_id FROM vendor_profiles LIMIT 1;
    
    IF test_vendor_id IS NOT NULL THEN
        -- Test update
        UPDATE vendor_profiles 
        SET 
            logo_url = 'https://example.com/test-logo.jpg',
            banner_url = 'https://example.com/test-banner.jpg'
        WHERE id = test_vendor_id;
        
        -- Check if update worked
        SELECT logo_url, banner_url INTO update_result
        FROM vendor_profiles 
        WHERE id = test_vendor_id;
        
        RAISE NOTICE 'Test update successful for vendor %. Logo: %, Banner: %', 
                     test_vendor_id, update_result.logo_url, update_result.banner_url;
        
        -- Clean up test data
        UPDATE vendor_profiles 
        SET logo_url = NULL, banner_url = NULL 
        WHERE id = test_vendor_id;
        
        RAISE NOTICE 'Cleaned up test data';
    ELSE
        RAISE NOTICE 'No vendors found for testing';
    END IF;
END $$;

-- Show current vendor_profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vendor_profiles' 
ORDER BY ordinal_position;
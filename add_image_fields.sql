-- Add image URL fields to vendor_profiles table if they don't exist
-- Run this in your Supabase SQL Editor

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add logo_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_profiles' AND column_name = 'logo_url') THEN
        ALTER TABLE vendor_profiles ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Added logo_url column';
    ELSE
        RAISE NOTICE 'logo_url column already exists';
    END IF;

    -- Add banner_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_profiles' AND column_name = 'banner_url') THEN
        ALTER TABLE vendor_profiles ADD COLUMN banner_url TEXT;
        RAISE NOTICE 'Added banner_url column';
    ELSE
        RAISE NOTICE 'banner_url column already exists';
    END IF;
END $$;

-- Test that we can update these fields
DO $$
DECLARE
    test_vendor_id UUID;
BEGIN
    -- Get the first vendor ID for testing
    SELECT id INTO test_vendor_id FROM vendor_profiles LIMIT 1;
    
    IF test_vendor_id IS NOT NULL THEN
        -- Test updating logo_url
        UPDATE vendor_profiles 
        SET logo_url = 'test-logo-url' 
        WHERE id = test_vendor_id;
        
        -- Test updating banner_url
        UPDATE vendor_profiles 
        SET banner_url = 'test-banner-url' 
        WHERE id = test_vendor_id;
        
        RAISE NOTICE 'Successfully tested updates for vendor %', test_vendor_id;
        
        -- Reset to NULL
        UPDATE vendor_profiles 
        SET logo_url = NULL, banner_url = NULL 
        WHERE id = test_vendor_id;
        
        RAISE NOTICE 'Reset test values';
    ELSE
        RAISE NOTICE 'No vendors found for testing';
    END IF;
END $$;
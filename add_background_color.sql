-- Add background color customization to vendor_profiles table
-- Run this in your Supabase SQL Editor

-- Add background_color column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_profiles' 
        AND column_name = 'background_color'
    ) THEN
        ALTER TABLE vendor_profiles ADD COLUMN background_color TEXT DEFAULT '#f8f9fa';
        RAISE NOTICE 'Added background_color column to vendor_profiles';
    ELSE
        RAISE NOTICE 'background_color column already exists';
    END IF;
END $$;

-- Add header_color column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_profiles' 
        AND column_name = 'header_color'
    ) THEN
        ALTER TABLE vendor_profiles ADD COLUMN header_color TEXT DEFAULT '#ffffff';
        RAISE NOTICE 'Added header_color column to vendor_profiles';
    ELSE
        RAISE NOTICE 'header_color column already exists';
    END IF;
END $$;

-- Set default background color for existing vendors
UPDATE vendor_profiles 
SET background_color = '#f8f9fa' 
WHERE background_color IS NULL;

-- Set default header color for existing vendors
UPDATE vendor_profiles 
SET header_color = '#ffffff' 
WHERE header_color IS NULL;

-- Add contact_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_profiles' 
        AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE vendor_profiles ADD COLUMN contact_email TEXT;
        RAISE NOTICE 'Added contact_email column to vendor_profiles';
    ELSE
        RAISE NOTICE 'contact_email column already exists';
    END IF;
END $$;

-- Show current vendor_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vendor_profiles' 
ORDER BY ordinal_position;
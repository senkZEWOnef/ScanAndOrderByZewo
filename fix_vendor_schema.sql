-- Fix vendor_profiles table for testing without auth
-- Run this in your Supabase SQL Editor

-- Option 1: Add the slug column first (from previous script)
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_slug ON vendor_profiles(slug);

-- Option 2: Temporarily drop the foreign key constraint for testing
-- (You can add it back later when you implement proper auth)
ALTER TABLE vendor_profiles 
DROP CONSTRAINT IF EXISTS vendor_profiles_id_fkey;

-- Option 3: Make id auto-generate if not provided
ALTER TABLE vendor_profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_slug(business_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                trim(business_name), 
                '[^a-zA-Z0-9\s]', '', 'g'
            ), 
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION set_vendor_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := generate_slug(NEW.business_name) || '-' || substr(NEW.id::text, 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_vendor_slug ON vendor_profiles;
CREATE TRIGGER trigger_set_vendor_slug
    BEFORE INSERT ON vendor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_vendor_slug();

-- Update RLS policy for testing
DROP POLICY IF EXISTS "Users can insert their own vendor profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Allow anonymous vendor creation for testing" ON vendor_profiles;

CREATE POLICY "Allow vendor creation for testing" ON vendor_profiles
FOR INSERT WITH CHECK (true);

-- Update existing vendors with slugs if they don't have them
UPDATE vendor_profiles 
SET slug = generate_slug(business_name) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;
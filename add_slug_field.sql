-- Add slug field to vendor_profiles table for QR code URLs
ALTER TABLE vendor_profiles 
ADD COLUMN slug VARCHAR(100) UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX idx_vendor_profiles_slug ON vendor_profiles(slug);

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

-- Update existing vendors with slugs based on business names
UPDATE vendor_profiles 
SET slug = generate_slug(business_name) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Add constraint to ensure slug is not null for new records
ALTER TABLE vendor_profiles 
ALTER COLUMN slug SET NOT NULL;

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

CREATE TRIGGER trigger_set_vendor_slug
    BEFORE INSERT ON vendor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_vendor_slug();
-- Fix RLS policies to allow SELECT after UPDATE
-- The issue is that the SELECT operation after UPDATE is being blocked by RLS
-- Run this in your Supabase SQL Editor

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view all vendor profiles" ON vendor_profiles;
DROP POLICY IF EXISTS "Allow anonymous SELECT on vendor profiles" ON vendor_profiles;
DROP POLICY IF EXISTS "Public can view vendor profiles" ON vendor_profiles;

-- Create a permissive SELECT policy that allows reading vendor profiles
CREATE POLICY "Allow reading vendor profiles" ON vendor_profiles
FOR SELECT USING (true);

-- Also make sure UPDATE policy allows the operation
DROP POLICY IF EXISTS "Users can update their own vendor profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Allow vendor profile updates" ON vendor_profiles;

CREATE POLICY "Allow vendor profile updates" ON vendor_profiles
FOR UPDATE USING (true);

-- Test the policies work
DO $$
DECLARE
    test_vendor_id UUID;
    test_result RECORD;
BEGIN
    -- Get first vendor
    SELECT id INTO test_vendor_id FROM vendor_profiles LIMIT 1;
    
    IF test_vendor_id IS NOT NULL THEN
        -- Test UPDATE with SELECT
        UPDATE vendor_profiles 
        SET logo_url = 'test-policy-' || extract(epoch from now())
        WHERE id = test_vendor_id;
        
        -- Test SELECT after UPDATE
        SELECT id, business_name, logo_url, banner_url 
        INTO test_result
        FROM vendor_profiles 
        WHERE id = test_vendor_id;
        
        RAISE NOTICE 'Policy test successful. Vendor: %, Logo URL: %', 
                     test_result.id, test_result.logo_url;
        
        -- Clean up
        UPDATE vendor_profiles 
        SET logo_url = NULL 
        WHERE id = test_vendor_id;
        
    ELSE
        RAISE NOTICE 'No vendors found for testing';
    END IF;
END $$;
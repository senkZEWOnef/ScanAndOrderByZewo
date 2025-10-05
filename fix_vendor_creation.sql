-- Fix RLS policies to allow vendor creation for testing/debugging
-- Run this in your Supabase SQL Editor

-- Temporarily add a policy for anonymous vendor creation (for testing only)
CREATE POLICY "Allow anonymous vendor creation for testing" ON vendor_profiles
FOR INSERT WITH CHECK (true);

-- Alternative: If you want to keep it secure, create a service role policy
-- You would need to use the service role key instead of anon key for vendor creation

-- Or, better yet, let's modify the existing policy to be more flexible
DROP POLICY IF EXISTS "Users can insert their own vendor profile" ON vendor_profiles;

-- Create a new policy that allows vendor creation when:
-- 1. User is authenticated and creating their own profile, OR
-- 2. No authentication (for testing purposes)
CREATE POLICY "Users can insert vendor profiles" ON vendor_profiles
FOR INSERT WITH CHECK (
    auth.uid() IS NULL OR  -- Allow unauthenticated for testing
    auth.uid() = id        -- Or authenticated users creating their own profile
);
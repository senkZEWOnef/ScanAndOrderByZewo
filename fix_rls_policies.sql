-- Fix RLS policies for vendor_profiles table
-- This will allow vendors to update their own profiles

-- First, check if RLS is enabled on vendor_profiles
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can view their own profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Vendors can update their own profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Vendors can insert their own profile" ON vendor_profiles;

-- Allow vendors to view their own profile
CREATE POLICY "Vendors can view their own profile" ON vendor_profiles 
FOR SELECT USING (auth.uid() = id);

-- Allow vendors to update their own profile
CREATE POLICY "Vendors can update their own profile" ON vendor_profiles 
FOR UPDATE USING (auth.uid() = id);

-- Allow vendors to insert their own profile (for signup)
CREATE POLICY "Vendors can insert their own profile" ON vendor_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Also ensure menu_items policies are correct
DROP POLICY IF EXISTS "Vendors can manage their menu items" ON menu_items;
CREATE POLICY "Vendors can manage their menu items" ON menu_items 
FOR ALL USING (auth.uid() = vendor_id);

-- Ensure orders policies are correct  
DROP POLICY IF EXISTS "Vendors can view their orders" ON orders;
CREATE POLICY "Vendors can view their orders" ON orders 
FOR SELECT USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can update their orders" ON orders;
CREATE POLICY "Vendors can update their orders" ON orders 
FOR UPDATE USING (auth.uid() = vendor_id);

-- Allow public to insert orders (for customers)
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders 
FOR INSERT WITH CHECK (true);

-- Allow public to view orders for tracking (with phone verification in app)
DROP POLICY IF EXISTS "Public can view orders for tracking" ON orders;
CREATE POLICY "Public can view orders for tracking" ON orders 
FOR SELECT USING (true);

-- Customers table policies
DROP POLICY IF EXISTS "Anyone can create customers" ON customers;
CREATE POLICY "Anyone can create customers" ON customers 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view customers" ON customers;  
CREATE POLICY "Anyone can view customers" ON customers 
FOR SELECT USING (true);

-- Order items policies
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items" ON order_items 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
CREATE POLICY "Anyone can view order items" ON order_items 
FOR SELECT USING (true);
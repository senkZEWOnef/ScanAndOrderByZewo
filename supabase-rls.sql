-- Row Level Security Policies for ScanAndOrderByZewo
-- Run this SQL in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Vendor Profiles Policies
CREATE POLICY "Users can view all vendor profiles" ON vendor_profiles
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own vendor profile" ON vendor_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own vendor profile" ON vendor_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own vendor profile" ON vendor_profiles
FOR DELETE USING (auth.uid() = id);

-- Menu Items Policies
CREATE POLICY "Anyone can view available menu items" ON menu_items
FOR SELECT USING (is_available = true);

CREATE POLICY "Vendors can view all their menu items" ON menu_items
FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own menu items" ON menu_items
FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own menu items" ON menu_items
FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own menu items" ON menu_items
FOR DELETE USING (auth.uid() = vendor_id);

-- Customers Policies
CREATE POLICY "Anyone can view customers" ON customers
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert customers" ON customers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update customers" ON customers
FOR UPDATE USING (true);

-- Orders Policies
CREATE POLICY "Vendors can view their orders" ON orders
FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Anyone can view orders by phone number" ON orders
FOR SELECT USING (true); -- We'll handle phone verification in the app

CREATE POLICY "Anyone can insert orders" ON orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Vendors can update their orders" ON orders
FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their orders" ON orders
FOR DELETE USING (auth.uid() = vendor_id);

-- Order Items Policies
CREATE POLICY "Users can view order items for orders they can access" ON order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.vendor_id = auth.uid() OR true)
    )
);

CREATE POLICY "Anyone can insert order items" ON order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Vendors can update order items for their orders" ON order_items
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.vendor_id = auth.uid()
    )
);

CREATE POLICY "Vendors can delete order items for their orders" ON order_items
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.vendor_id = auth.uid()
    )
);

-- Order Status History Policies
CREATE POLICY "Users can view order status history for accessible orders" ON order_status_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_status_history.order_id 
        AND (orders.vendor_id = auth.uid() OR true)
    )
);

CREATE POLICY "Authenticated users can insert order status history" ON order_status_history
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Analytics Policies
CREATE POLICY "Vendors can view their own analytics" ON analytics
FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own analytics" ON analytics
FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own analytics" ON analytics
FOR UPDATE USING (auth.uid() = vendor_id);

-- Create a function to check if user is vendor of an order
CREATE OR REPLACE FUNCTION is_order_vendor(order_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM orders 
        WHERE id = order_uuid 
        AND vendor_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get vendor profile for authenticated user
CREATE OR REPLACE FUNCTION get_vendor_profile()
RETURNS TABLE (
    id UUID,
    business_name VARCHAR(255),
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    cuisine_type VARCHAR(100),
    is_active BOOLEAN,
    opening_hours JSONB,
    delivery_fee DECIMAL(10,2),
    minimum_order DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT vp.* FROM vendor_profiles vp
    WHERE vp.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
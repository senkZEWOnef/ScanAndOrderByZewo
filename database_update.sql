-- Add customization fields to vendor_profiles
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#667eea';
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#764ba2';
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#ffc107';
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR DEFAULT 'american';

-- Create business_food_library table for custom items
CREATE TABLE IF NOT EXISTS business_food_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendor_profiles(id),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR,
  image_url TEXT,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create daily_sales view for analytics
CREATE OR REPLACE VIEW daily_sales AS
SELECT 
  vendor_id,
  DATE(created_at) as sale_date,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders 
WHERE payment_status = 'paid'
GROUP BY vendor_id, DATE(created_at);

-- Enable RLS
ALTER TABLE business_food_library ENABLE ROW LEVEL SECURITY;

-- Policies for business_food_library
CREATE POLICY "Vendors can manage their food library" ON business_food_library 
FOR ALL USING (auth.uid() = vendor_id);

-- Add order_type field to orders table to distinguish between QR and cashier orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR DEFAULT 'qr_code';

-- Add name field to customers table (optional)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR;

-- Add category field to menu_items table to enable menu categorization
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category VARCHAR;
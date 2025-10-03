# Supabase Setup Instructions

## Complete Setup Process

### 1. Create New Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New project"
3. Choose your organization
4. Set project name: "ScanAndOrderByZewo"
5. Create a strong database password
6. Select your region
7. Click "Create new project"

### 2. Get Your Project Credentials
Once your project is created:
1. Go to Settings → API
2. Copy your Project URL
3. Copy your anon/public key
4. Update `frontend/src/lib/supabase.js` with these values

### 3. Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create all tables, functions, and triggers

### 4. Setup Storage Buckets
1. Go to Storage in your Supabase dashboard
2. Create these buckets (make them public):
   - `menu-images`
   - `vendor-logos`
   - `vendor-banners`
3. Go back to SQL Editor
4. Copy and paste the contents of `supabase-storage.sql`
5. Click "Run" to set up storage policies

### 5. Apply Row Level Security
1. In SQL Editor, copy and paste the contents of `supabase-rls.sql`
2. Click "Run" to enable RLS and create security policies

### 6. Enable Authentication
1. Go to Authentication → Settings
2. Enable Email authentication
3. Optionally enable other providers (Google, etc.)
4. Configure your site URL in "Site URL" field

### 7. Update Your App Configuration
Replace the values in `frontend/src/lib/supabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_PROJECT_URL_HERE";
const supabaseAnonKey = "YOUR_ANON_KEY_HERE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 8. Environment Variables (Optional but Recommended)
Create a `.env.local` file in your frontend directory:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Then update `supabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Database Tables Created

- `vendor_profiles` - Restaurant/vendor information
- `menu_items` - Food items with prices and details
- `customers` - Customer information
- `orders` - Order records with status tracking
- `order_items` - Individual items in each order
- `order_status_history` - Track order status changes
- `analytics` - Daily business analytics

## Storage Buckets Created

- `menu-images` - Food item photos
- `vendor-logos` - Restaurant logos
- `vendor-banners` - Restaurant banner images

## Features Enabled

- Real-time subscriptions for live order updates
- Row Level Security for data protection
- Automatic analytics tracking
- Order status history
- File storage for images
- Authentication system

## Next Steps

1. Test the connection by running your app: `npm run dev`
2. Try creating a vendor account to verify database connectivity
3. Upload a test menu item with image to verify storage functionality
4. Place a test order to verify the complete flow

If you encounter any issues, check the Supabase logs in your dashboard for detailed error messages.
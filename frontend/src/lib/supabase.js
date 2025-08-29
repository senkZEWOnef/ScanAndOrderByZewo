import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://igpewzuqrlfbidutbyuu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncGV3enVxcmxmYmlkdXRieXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MzY2NTQsImV4cCI6MjA3MjAxMjY1NH0.xDz-6EdjvSp4QI4yZZ6RMYKr1o9H-gD5_vLR1Ny_qrU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

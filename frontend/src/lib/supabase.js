import { createClient } from "@supabase/supabase-js";

// TODO: Replace with your new Supabase project credentials
// Get these from: Supabase Dashboard → Settings → API
const supabaseUrl = "https://glrhcntdappxhrmpcuzy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscmhjbnRkYXBweGhybXBjdXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzgzMDksImV4cCI6MjA3NTAxNDMwOX0.wXKaN10k2KGtEuSgENzqp1Uprb0rgOwMzc3ebgC69Ws";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

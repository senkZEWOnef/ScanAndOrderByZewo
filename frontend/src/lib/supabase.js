import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lhdmjgwasbjqxmkqmhan.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZG1qZ3dhc2JqcXhta3FtaGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTQ3NjAsImV4cCI6MjA2NzY3MDc2MH0.w-mR3eRRXo7ZUAvO6QYUt8t5fICdGc7HBBuImtZHL5M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

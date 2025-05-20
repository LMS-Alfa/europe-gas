import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = "https://tkwdalcfwsxclnpwtjvy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd2RhbGNmd3N4Y2xucHd0anZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3Mjg1MjQsImV4cCI6MjA2MjMwNDUyNH0.PGcLWfifjeenaciWh3wMcfSw4pR3LqEpIGmpYEgA140";
const supabaseRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd2RhbGNmd3N4Y2xucHd0anZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyODUyNCwiZXhwIjoyMDYyMzA0NTI0fQ.LvlT2y_XY8i-fqavioS_4riJV9nMqI8P0TVSIFKPJUk";

// Singleton pattern to ensure only one instance exists
let supabaseInstance = null;
let supabaseAdminInstance = null;

// Get or create the Supabase client
const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'supabase_auth_token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

// Get or create the Supabase Admin client
const getSupabaseAdminClient = () => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseRoleKey, {
      auth: {
        storageKey: 'supabase_admin_auth_token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  }
  return supabaseAdminInstance;
};

// Initialize the standard Supabase client (uses anon key, respects RLS)
const supabase = getSupabaseClient();

// Initialize the Supabase Admin client (uses service_role key, bypasses RLS - USE WITH EXTREME CAUTION IN FRONTEND)
export const supabaseAdmin = getSupabaseAdminClient();

export default supabase; 
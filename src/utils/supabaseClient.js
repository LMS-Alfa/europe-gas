import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = "https://tkwdalcfwsxclnpwtjvy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd2RhbGNmd3N4Y2xucHd0anZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3Mjg1MjQsImV4cCI6MjA2MjMwNDUyNH0.PGcLWfifjeenaciWh3wMcfSw4pR3LqEpIGmpYEgA140";

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 
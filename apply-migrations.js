import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Get Supabase credentials from environment variables or use the default ones from supabaseClient.js
const supabaseUrl = process.env.SUPABASE_URL || "https://tkwdalcfwsxclnpwtjvy.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd2RhbGNmd3N4Y2xucHd0anZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3Mjg1MjQsImV4cCI6MjA2MjMwNDUyNH0.PGcLWfifjeenaciWh3wMcfSw4pR3LqEpIGmpYEgA140";

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  console.log('Starting migrations...');
  
  try {
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.error('Migrations directory not found:', migrationsDir);
      return;
    }
    
    // Read all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations are applied in order
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      }
      
      console.log(`Successfully applied migration: ${file}`);
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

applyMigrations(); 
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('');
    console.error('To get your service role key:');
    console.error('1. Go to your Supabase project dashboard');
    console.error('2. Navigate to Settings > API');
    console.error('3. Copy the "service_role" key (keep it secret!)');
    console.error('4. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
  }

  // Read the migration file
  const migrationPath = path.join(__dirname, '../migration_add_base64_column.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('🚀 Running migration: Add base64_data column to media_files table');
  console.log('📄 Migration file:', migrationPath);
  console.log('');

  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Supabase doesn't allow direct SQL execution via JS client for security
    // We need to use the Management API or create a database function
    // For now, we'll use a workaround: create a temporary function and execute it
    
    // Actually, the best approach is to use Supabase's REST API with a custom function
    // But since that requires setup, we'll provide clear instructions
    
    console.log('⚠️  Supabase JS client cannot execute raw SQL directly.');
    console.log('');
    console.log('📋 Please run this migration using one of these methods:');
    console.log('');
    console.log('Method 1: Supabase Dashboard (Easiest)');
    console.log('  1. Go to: https://supabase.com/dashboard/project/_/sql');
    console.log('  2. Replace "_" with your project reference ID');
    console.log('  3. Copy and paste the SQL below');
    console.log('  4. Click "Run"');
    console.log('');
    console.log('Method 2: Using the Supabase CLI');
    console.log('  supabase db push --file migration_add_base64_column.sql');
    console.log('');
    console.log('📄 Migration SQL:');
    console.log('═'.repeat(70));
    console.log(migrationSQL);
    console.log('═'.repeat(70));
    console.log('');
    console.log('✅ After running the migration, you can test your application!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();


const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('Note: Service role key is required for DDL operations like ALTER TABLE');
    process.exit(1);
  }

  // Read the migration file
  const migrationPath = path.join(__dirname, '../migration_add_base64_column.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('🚀 Running migration: Add base64_data column to media_files table');
  console.log('📄 Migration file:', migrationPath);
  console.log('');

  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute the migration SQL
    // Note: Supabase JS client doesn't support raw SQL execution directly
    // We'll use the REST API instead
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });

    if (!response.ok) {
      // If the RPC doesn't exist, try direct SQL execution via PostgREST
      // Actually, Supabase doesn't expose raw SQL execution via REST API for security
      // We need to use psql or the Supabase dashboard SQL editor
      console.log('⚠️  Direct SQL execution via API is not available.');
      console.log('');
      console.log('📋 Please run this migration using one of these methods:');
      console.log('');
      console.log('Method 1: Supabase Dashboard (Recommended)');
      console.log('  1. Go to your Supabase project dashboard');
      console.log('  2. Navigate to SQL Editor');
      console.log('  3. Copy and paste the contents of migration_add_base64_column.sql');
      console.log('  4. Click "Run"');
      console.log('');
      console.log('Method 2: Using psql (if you have it installed)');
      console.log(`  psql "${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}" -f migration_add_base64_column.sql`);
      console.log('');
      console.log('📄 Migration SQL:');
      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      process.exit(0);
    }

    const result = await response.json();
    console.log('✅ Migration executed successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.log('');
    console.log('📋 Alternative: Run this SQL in Supabase SQL Editor:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    process.exit(1);
  }
}

runMigration();


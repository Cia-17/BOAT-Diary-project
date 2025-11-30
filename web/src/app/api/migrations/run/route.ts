import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials. SUPABASE_SERVICE_ROLE_KEY is required.' },
        { status: 500 }
      );
    }

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migration_add_base64_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Execute the migration using RPC or direct query
    // Note: Supabase JS client doesn't support raw SQL directly
    // We'll use the REST API to execute via a function
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
      // Fallback: Try using Supabase's postgres functions
      // Since direct SQL execution isn't available, we'll return instructions
      return NextResponse.json(
        {
          message: 'Direct SQL execution via API is not available in Supabase.',
          instruction: 'Please run this migration in the Supabase SQL Editor',
          sql: migrationSQL,
        },
        { status: 200 }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run migration' },
      { status: 500 }
    );
  }
}


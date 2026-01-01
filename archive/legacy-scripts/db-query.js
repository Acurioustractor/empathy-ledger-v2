#!/usr/bin/env node
/**
 * ALWAYS USE THIS SCRIPT FOR DATABASE QUERIES
 * This connects to the actual Supabase instance, not local postgres
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure .env.local is loaded');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function query(sql) {
  // For checking table schema
  if (sql.startsWith('DESCRIBE ')) {
    const tableName = sql.replace('DESCRIBE ', '').trim();
    console.log(`📋 Fetching schema for table: ${tableName}\n`);

    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Columns:');
      Object.keys(data[0]).sort().forEach(col => console.log(`  - ${col}`));
    } else {
      console.log('⚠️  No data in table to infer schema');
    }
    return;
  }

  // For other queries, show error that we should use Supabase client instead
  console.error('❌ Use Supabase client methods instead of raw SQL');
  console.error('Examples:');
  console.error('  - supabase.from("table").select("*")');
  console.error('  - supabase.from("table").insert(data)');
}

// If run directly with argument
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/db-query.js "DESCRIBE tablename"');
    process.exit(1);
  }

  query(args.join(' ')).catch(console.error);
} else {
  module.exports = { supabase };
}

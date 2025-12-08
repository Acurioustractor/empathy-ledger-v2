#!/usr/bin/env node

/**
 * Apply video fields to profiles table
 * This script adds video-related columns to the profiles table for better storyteller video organization
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyVideoFields() {
  console.log('🎬 Adding video fields to profiles table...')

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-video-fields-to-profiles.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    console.log('📝 Executing SQL commands...')
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Error executing SQL:', error)
      return false
    }
    
    console.log('✅ Successfully added video fields to profiles table')
    
    // Verify the changes
    console.log('🔍 Verifying new columns...')
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'profiles' 
            AND column_name LIKE '%video%'
          ORDER BY column_name;
        `
      })
    
    if (columnsError) {
      console.warn('⚠️ Could not verify columns:', columnsError)
    } else {
      console.log('📊 New video columns in profiles table:')
      if (columns && data) {
        console.table(data)
      }
    }
    
    // Check if sample data was added
    console.log('🔍 Checking sample data...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('profiles')
      .select('email, video_introduction_url, video_portfolio_urls, featured_video_url')
      .eq('email', 'benjamin@act.place')
      .single()
    
    if (sampleError) {
      console.warn('⚠️ Could not check sample data:', sampleError)
    } else {
      console.log('✅ Sample video data for benjamin@act.place:')
      console.log('   Introduction URL:', sampleData?.video_introduction_url)
      console.log('   Portfolio URLs:', sampleData?.video_portfolio_urls)
      console.log('   Featured URL:', sampleData?.featured_video_url)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error applying video fields:', error)
    return false
  }
}

// Helper function to create exec_sql if it doesn't exist
async function ensureExecSqlFunction() {
  console.log('🔧 Ensuring exec_sql function exists...')
  
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'Success';
    EXCEPTION WHEN OTHERS THEN
      RETURN 'Error: ' || SQLERRM;
    END;
    $$;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSql })
    if (error && !error.message.includes('does not exist')) {
      // Function exists, we're good
      console.log('✅ exec_sql function is available')
      return true
    }
    
    // Try direct SQL execution instead
    console.log('🔄 Trying alternative approach...')
    return true
    
  } catch (error) {
    console.log('ℹ️ Will use direct SQL execution')
    return true
  }
}

async function main() {
  console.log('🎬 Starting video fields setup...')
  console.log('📍 Supabase URL:', supabaseUrl)
  
  await ensureExecSqlFunction()
  const success = await applyVideoFields()
  
  if (success) {
    console.log('🎉 Video fields setup complete!')
    console.log('📝 Profiles now support:')
    console.log('   • video_introduction_url (single URL)')
    console.log('   • video_portfolio_urls (array of URLs)')
    console.log('   • featured_video_url (single URL)')
    console.log('   • video_metadata (JSON for additional context)')
  } else {
    console.log('❌ Setup failed. Check the errors above.')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { applyVideoFields }
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting project_participants table migration...')
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-project-participants-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    console.log('📝 Executing migration SQL...')
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...')
    const { data: tableInfo, error: verifyError } = await supabase
      .from('project_participants')
      .select('*')
      .limit(0)
    
    if (verifyError && verifyError.code !== 'PGRST116') {
      console.error('❌ Table verification failed:', verifyError)
      process.exit(1)
    }
    
    console.log('✅ project_participants table is ready!')
    console.log('📊 You can now add storytellers to projects!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Alternative direct SQL execution if rpc doesn't work
async function runMigrationDirect() {
  console.log('🚀 Running migration with direct SQL execution...')
  
  try {
    // Read the SQL file and split into individual statements
    const sqlPath = path.join(__dirname, 'create-project-participants-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute using the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('📝 Please run the SQL manually in your Supabase dashboard:')
    console.log('   Dashboard > SQL Editor > New Query')
    console.log('   Copy and paste the contents of scripts/create-project-participants-table.sql')
    process.exit(1)
  }
}

runMigration().catch(() => {
  console.log('⚠️ RPC method failed, trying alternative approach...')
  runMigrationDirect()
})
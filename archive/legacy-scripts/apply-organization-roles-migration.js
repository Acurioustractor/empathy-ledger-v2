const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('🚀 Applying organization_roles table migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250913005713_create_organization_roles_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded, executing SQL...')
    
    // Execute the entire migration as one SQL block since it contains complex multi-line statements
    console.log('📝 Executing migration as a single SQL block...')
    
    try {
      // Use fetch to directly call the SQL REST API with the full migration
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ sql: migrationSQL })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Migration failed:`, response.status, errorText)
      } else {
        console.log(`✅ Migration executed successfully!`)
      }
    } catch (execError) {
      console.error(`❌ Migration execution error:`, execError.message)
    }
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'organization_roles')
      .eq('table_schema', 'public')
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError)
    } else if (tables && tables.length > 0) {
      console.log('✅ organization_roles table created successfully!')
      
      // Check the table structure
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'organization_roles')
        .eq('table_schema', 'public')
        .order('ordinal_position')
      
      if (!columnsError && columns) {
        console.log('📋 Table structure:')
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`)
        })
      }
    } else {
      console.log('❌ Table was not created')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

applyMigration()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testCorrectedMigration() {
  try {
    console.log('🧹 Cleaning up: Dropping existing organization_roles table...')
    
    // Step 1: Drop existing table and its dependencies
    const dropTableSQL = `
      DROP TABLE IF EXISTS organization_roles CASCADE;
    `
    
    const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: dropTableSQL })
    })
    
    if (response1.ok) {
      console.log('✅ Existing table dropped successfully')
    } else {
      const errorText = await response1.text()
      console.log('⚠️ Drop table response:', errorText)
    }
    
    console.log('🔧 Applying corrected migration...')
    
    // Step 2: Apply the corrected migration
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250913005713_create_organization_roles_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    })
    
    if (response2.ok) {
      console.log('✅ Corrected migration applied successfully!')
    } else {
      const errorText = await response2.text()
      console.error('❌ Migration failed:', errorText)
      return
    }
    
    console.log('🔍 Testing table functionality...')
    
    // Step 3: Test basic table operations
    const testOperationsSQL = `
      -- Test 1: Insert a test role assignment
      INSERT INTO organization_roles (organization_id, profile_id, role) 
      VALUES (
        (SELECT id FROM organizations LIMIT 1),
        (SELECT id FROM profiles LIMIT 1),
        'admin'
      );
      
      -- Test 2: Query the inserted data
      SELECT id, role, is_active, created_at 
      FROM organization_roles 
      LIMIT 1;
    `
    
    const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: testOperationsSQL })
    })
    
    if (response3.ok) {
      console.log('✅ Table operations test passed!')
    } else {
      const errorText = await response3.text()
      console.error('❌ Table operations test failed:', errorText)
      return
    }
    
    console.log('🔧 Testing helper functions...')
    
    // Step 4: Test the helper functions
    const testFunctionsSQL = `
      -- Test the helper functions
      SELECT 
        get_user_organization_role(
          (SELECT id FROM organizations LIMIT 1),
          (SELECT id FROM profiles LIMIT 1)
        ) as user_role,
        user_has_organization_role(
          (SELECT id FROM organizations LIMIT 1),
          'admin',
          (SELECT id FROM profiles LIMIT 1)
        ) as has_admin_role;
    `
    
    const response4 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: testFunctionsSQL })
    })
    
    if (response4.ok) {
      console.log('✅ Helper functions test passed!')
    } else {
      const errorText = await response4.text()
      console.error('❌ Helper functions test failed:', errorText)
    }
    
    console.log('🧹 Cleaning up test data...')
    
    // Step 5: Clean up test data
    const cleanupSQL = `DELETE FROM organization_roles WHERE role = 'admin';`
    
    const response5 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: cleanupSQL })
    })
    
    if (response5.ok) {
      console.log('✅ Test data cleaned up')
    }
    
    console.log('🎉 Migration test completed successfully!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testCorrectedMigration()
const { createClient } = require('@supabase/supabase-js')

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

async function testTableCreation() {
  try {
    console.log('🧪 Testing simple table creation...')
    
    // First test: Check if organization_role_enum exists
    console.log('1️⃣ Checking if organization_role_enum exists...')
    
    const enumCheck = `
      SELECT enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'organization_role_enum'
    `
    
    const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: enumCheck })
    })
    
    if (response1.ok) {
      console.log('✅ organization_role_enum exists')
    } else {
      console.log('❌ organization_role_enum missing, creating it...')
      
      const createEnum = `
        CREATE TYPE organization_role_enum AS ENUM (
          'member',
          'contributor', 
          'moderator',
          'admin',
          'super_admin'
        );
      `
      
      const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ sql: createEnum })
      })
      
      if (response2.ok) {
        console.log('✅ organization_role_enum created')
      } else {
        const errorText = await response2.text()
        console.error('❌ Failed to create enum:', errorText)
        return
      }
    }
    
    // Second test: Create a simple version of the table
    console.log('2️⃣ Creating simple organization_roles table...')
    
    const createSimpleTable = `
      CREATE TABLE IF NOT EXISTS organization_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id),
        profile_id UUID NOT NULL REFERENCES profiles(id), 
        role organization_role_enum NOT NULL DEFAULT 'member',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: createSimpleTable })
    })
    
    if (response3.ok) {
      console.log('✅ Simple organization_roles table created')
    } else {
      const errorText = await response3.text()
      console.error('❌ Failed to create table:', errorText)
      return
    }
    
    // Third test: Enable RLS
    console.log('3️⃣ Enabling RLS...')
    
    const enableRLS = `ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;`
    
    const response4 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql: enableRLS })
    })
    
    if (response4.ok) {
      console.log('✅ RLS enabled')
    } else {
      const errorText = await response4.text()
      console.error('❌ Failed to enable RLS:', errorText)
    }
    
    console.log('🎉 Simple table creation completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testTableCreation()
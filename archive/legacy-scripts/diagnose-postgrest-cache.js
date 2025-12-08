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

async function diagnosePostgRESTCache() {
  try {
    console.log('🔍 DIAGNOSING POSTGREST SCHEMA CACHE ISSUE')
    console.log('=' .repeat(60))
    
    // Step 1: Verify table exists in database
    console.log('1️⃣ Checking if organization_roles table exists in database...')
    
    const tableExistsSQL = `
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasrls
      FROM pg_tables 
      WHERE tablename = 'organization_roles' AND schemaname = 'public';
    `
    
    const tableExistsResult = await execSQL(tableExistsSQL, 'Table existence check')
    
    // Step 2: Check table permissions
    console.log('2️⃣ Checking table permissions and ownership...')
    
    const permissionsSQL = `
      SELECT 
        grantee,
        privilege_type,
        is_grantable
      FROM information_schema.role_table_grants 
      WHERE table_name = 'organization_roles' 
        AND table_schema = 'public'
      ORDER BY grantee, privilege_type;
    `
    
    await execSQL(permissionsSQL, 'Permissions check')
    
    // Step 3: Check RLS policies
    console.log('3️⃣ Checking RLS policies...')
    
    const rlsSQL = `
      SELECT 
        policyname,
        permissive,
        roles,
        cmd,
        qual IS NOT NULL as has_condition
      FROM pg_policies 
      WHERE tablename = 'organization_roles' AND schemaname = 'public';
    `
    
    await execSQL(rlsSQL, 'RLS policies check')
    
    // Step 4: Test direct REST API access
    console.log('4️⃣ Testing direct REST API access...')
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/organization_roles?select=*&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      const responseText = await response.text()
      console.log('   Response status:', response.status)
      console.log('   Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('   Response body:', responseText.substring(0, 200) + '...')
      
      if (response.ok) {
        console.log('   ✅ Direct REST API access working!')
      } else {
        console.log('   ❌ Direct REST API access failed')
        
        if (responseText.includes('schema cache')) {
          console.log('   🔄 Confirmed: PostgREST schema cache issue')
        }
      }
    } catch (error) {
      console.log('   ❌ REST API test error:', error.message)
    }
    
    // Step 5: Check PostgREST introspection endpoint
    console.log('5️⃣ Checking PostgREST introspection...')
    
    try {
      const introspectResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Accept': 'application/openapi+json'
        }
      })
      
      if (introspectResponse.ok) {
        const openApiSpec = await introspectResponse.json()
        const hasOrgRolesPath = openApiSpec.paths && openApiSpec.paths['/organization_roles']
        
        console.log('   PostgREST introspection status:', introspectResponse.status)
        console.log('   organization_roles in OpenAPI spec:', hasOrgRolesPath ? 'YES' : 'NO')
        
        if (!hasOrgRolesPath) {
          console.log('   🔄 Table not in PostgREST schema - cache issue confirmed')
        } else {
          console.log('   ✅ Table in PostgREST schema - access issue elsewhere')
        }
      }
    } catch (error) {
      console.log('   ❌ PostgREST introspection failed:', error.message)
    }
    
    // Step 6: Try schema reload approaches
    console.log('6️⃣ Attempting schema reload methods...')
    
    // Method 1: NOTIFY postgrest
    try {
      await execSQL("NOTIFY pgrst, 'reload schema';", 'NOTIFY postgrest reload')
    } catch (error) {
      console.log('   ⚠️ NOTIFY method not available:', error.message)
    }
    
    // Method 2: Check for reload config function
    try {
      const reloadSQL = `
        SELECT 
          proname 
        FROM pg_proc 
        WHERE proname ILIKE '%reload%' OR proname ILIKE '%refresh%'
        ORDER BY proname;
      `
      
      await execSQL(reloadSQL, 'Available reload functions')
    } catch (error) {
      console.log('   ⚠️ Could not check reload functions:', error.message)
    }
    
    // Step 7: Alternative access test via supabase-js
    console.log('7️⃣ Testing access via supabase-js client...')
    
    try {
      const { data, error } = await supabase
        .from('organization_roles')
        .select('id, role, is_active')
        .limit(1)
      
      if (!error) {
        console.log('   ✅ Supabase-js client access working!')
        console.log('   Data:', data)
      } else {
        console.log('   ❌ Supabase-js client access failed:', error.message)
      }
    } catch (error) {
      console.log('   ❌ Supabase-js test error:', error.message)
    }
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('🔍 POSTGREST CACHE DIAGNOSIS COMPLETE')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('❌ Diagnosis error:', error)
  }
}

async function execSQL(sql, description) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ sql })
    })
    
    if (response.ok) {
      console.log(`   ✅ ${description} completed`)
      return true
    } else {
      const errorText = await response.text()
      console.log(`   ❌ ${description} failed:`, errorText)
      return false
    }
  } catch (error) {
    console.log(`   ❌ ${description} error:`, error.message)
    return false
  }
}

diagnosePostgRESTCache()
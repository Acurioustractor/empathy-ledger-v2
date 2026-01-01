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

async function forceSchemaRefresh() {
  try {
    console.log('🔄 FORCING POSTGREST SCHEMA REFRESH')
    console.log('=' .repeat(60))
    
    // Method 1: NOTIFY postgrest with schema reload
    console.log('1️⃣ Sending NOTIFY postgrest reload signal...')
    
    const notifySQL = `NOTIFY pgrst, 'reload schema';`
    
    await execSQL(notifySQL, 'NOTIFY signal sent')
    
    // Method 2: Try to trigger refresh by modifying schema comment
    console.log('2️⃣ Triggering refresh with schema modification...')
    
    const triggerRefreshSQL = `
      COMMENT ON TABLE organization_roles IS 'Manages user roles within organizations with full audit trail - Updated to trigger PostgREST refresh';
    `
    
    await execSQL(triggerRefreshSQL, 'Schema comment updated')
    
    // Method 3: Check if we can access postgrest config
    console.log('3️⃣ Checking PostgREST configuration...')
    
    try {
      const configResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      })
      
      console.log('   PostgREST HEAD response status:', configResponse.status)
      console.log('   Response headers:', Object.fromEntries(configResponse.headers.entries()))
      
    } catch (error) {
      console.log('   ❌ PostgREST config check failed:', error.message)
    }
    
    // Method 4: Try creating and dropping a test table to trigger refresh
    console.log('4️⃣ Creating test table to trigger schema refresh...')
    
    const createTestTableSQL = `
      CREATE TABLE IF NOT EXISTS _test_schema_refresh (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    await execSQL(createTestTableSQL, 'Test table created')
    
    // Wait a moment
    console.log('   ⏳ Waiting 5 seconds...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Drop the test table
    const dropTestTableSQL = `DROP TABLE IF EXISTS _test_schema_refresh;`
    await execSQL(dropTestTableSQL, 'Test table dropped')
    
    // Method 5: Multiple NOTIFY attempts
    console.log('5️⃣ Sending multiple NOTIFY signals...')
    
    const notifyMethods = [
      "NOTIFY pgrst, 'reload schema';",
      "NOTIFY pgrst, 'reload config';",
      "NOTIFY postgrest;",
    ]
    
    for (const notify of notifyMethods) {
      await execSQL(notify, `NOTIFY: ${notify}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Method 6: Test if the refresh worked
    console.log('6️⃣ Testing if schema refresh worked...')
    
    // Wait a bit longer
    console.log('   ⏳ Waiting 10 seconds for PostgREST to process...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Test REST API access
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/organization_roles?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('   REST API test status:', response.status)
      
      if (response.ok) {
        console.log('   ✅ SUCCESS! PostgREST schema refresh worked!')
        const data = await response.json()
        console.log('   Response data:', data)
      } else {
        const errorText = await response.text()
        console.log('   ❌ Still not working:', errorText)
        
        if (errorText.includes('schema cache')) {
          console.log('   🔄 Schema cache still not refreshed')
        }
      }
    } catch (error) {
      console.log('   ❌ REST API test error:', error.message)
    }
    
    // Method 7: Alternative - check OpenAPI spec
    console.log('7️⃣ Checking OpenAPI specification...')
    
    try {
      const openApiResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Accept': 'application/openapi+json'
        }
      })
      
      if (openApiResponse.ok) {
        const spec = await openApiResponse.json()
        const hasOrgRoles = spec.paths && spec.paths['/organization_roles']
        
        console.log('   OpenAPI spec updated:', hasOrgRoles ? 'YES ✅' : 'NO ❌')
        
        if (hasOrgRoles) {
          console.log('   🎉 organization_roles is now in PostgREST schema!')
        } else {
          console.log('   ⏳ Still waiting for schema update...')
        }
      }
    } catch (error) {
      console.log('   ❌ OpenAPI check error:', error.message)
    }
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('🔄 SCHEMA REFRESH ATTEMPTS COMPLETE')
    console.log('=' .repeat(60))
    console.log('')
    console.log('📝 NOTES:')
    console.log('• PostgREST schema refresh can take 30-60 seconds')
    console.log('• NOTIFY signals sent - PostgREST should pick them up')
    console.log('• If still not working, may need to wait or restart PostgREST')
    console.log('• Database functions work fine - only REST API affected')
    
  } catch (error) {
    console.error('❌ Schema refresh error:', error)
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
      console.log(`   ✅ ${description}`)
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

forceSchemaRefresh()
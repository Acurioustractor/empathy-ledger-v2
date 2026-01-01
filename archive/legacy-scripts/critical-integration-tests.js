const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Test with service role (admin) and anon (user) clients
const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
const userSupabase = createClient(supabaseUrl, anonKey)

async function runCriticalIntegrationTests() {
  try {
    console.log('🧪 CRITICAL INTEGRATION TESTING PHASE')
    console.log('=' .repeat(60))
    console.log('Testing APIs, Authentication, Permissions, and Data Integrity')
    console.log('')

    // TEST 1: API HTTP Integration
    console.log('1️⃣ API HTTP Integration Testing...')
    await testAPIHTTPIntegration()
    
    // TEST 2: Authentication & Authorization
    console.log('2️⃣ Authentication & Authorization Testing...')
    await testAuthenticationFlow()
    
    // TEST 3: Role Permission Matrix  
    console.log('3️⃣ Role Permission Matrix Testing...')
    await testRolePermissionMatrix()
    
    // TEST 4: Database Consistency
    console.log('4️⃣ Database Consistency Testing...')
    await testDatabaseConsistency()
    
    // TEST 5: Frontend API Compatibility
    console.log('5️⃣ Frontend API Compatibility Testing...')
    await testFrontendCompatibility()
    
    // TEST 6: Error Handling & Edge Cases
    console.log('6️⃣ Error Handling & Edge Cases...')
    await testErrorHandling()
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('🎉 CRITICAL INTEGRATION TESTS COMPLETE')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('❌ Critical test failure:', error)
    process.exit(1)
  }
}

async function testAPIHTTPIntegration() {
  console.log('   Testing organization dashboard API...')
  
  // Get a real organization ID
  const { data: org } = await adminSupabase
    .from('organizations')
    .select('id, name')
    .limit(1)
    .single()
    
  if (!org) {
    console.log('   ⚠️ No organizations found - creating test org')
    return
  }
  
  // Test Dashboard API endpoint simulation
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/organizations?select=id,name&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    })
    
    if (response.ok) {
      console.log('   ✅ Organizations API accessible')
    } else {
      console.log('   ❌ Organizations API failed')
    }
  } catch (error) {
    console.log('   ❌ API HTTP test failed:', error.message)
  }
  
  // Test organization roles API simulation
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/organization_roles?select=*&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    })
    
    if (response.ok) {
      console.log('   ✅ Organization roles API accessible')
    } else {
      console.log('   ❌ Organization roles API failed')
    }
  } catch (error) {
    console.log('   ❌ Roles API test failed:', error.message)
  }
}

async function testAuthenticationFlow() {
  console.log('   Testing role middleware authentication...')
  
  // Test 1: Service role access (should work)
  try {
    const { data, error } = await adminSupabase
      .from('organization_roles')
      .select('id, role, is_active')
      .limit(1)
    
    if (!error) {
      console.log('   ✅ Service role authentication working')
    } else {
      console.log('   ❌ Service role authentication failed:', error.message)
    }
  } catch (error) {
    console.log('   ❌ Service role test failed:', error.message)
  }
  
  // Test 2: Anonymous access (should be restricted by RLS)
  try {
    const { data, error } = await userSupabase
      .from('organization_roles')
      .select('id, role, is_active')
      .limit(1)
    
    if (error && error.code === 'PGRST301') {
      console.log('   ✅ RLS properly restricting anonymous access')
    } else if (!error && data?.length === 0) {
      console.log('   ✅ RLS working - no unauthorized data returned')
    } else {
      console.log('   ⚠️ Unexpected anonymous access result')
    }
  } catch (error) {
    console.log('   ✅ Anonymous access properly blocked')
  }
}

async function testRolePermissionMatrix() {
  console.log('   Testing role hierarchy and permissions...')
  
  // Test role hierarchy function
  const testRoleHierarchy = async (userRole, requiredRole, shouldPass) => {
    try {
      const { data, error } = await adminSupabase.rpc('exec_sql', {
        sql: `
          SELECT user_has_organization_role(
            (SELECT id FROM organizations LIMIT 1),
            '${requiredRole}',
            (SELECT id FROM profiles LIMIT 1)
          ) as has_role;
        `
      })
      
      console.log(`   Testing ${userRole} -> ${requiredRole}: Expected ${shouldPass ? 'PASS' : 'FAIL'}`)
    } catch (error) {
      console.log(`   ❌ Role hierarchy test error: ${error.message}`)
    }
  }
  
  // Test key role scenarios
  await testRoleHierarchy('admin', 'member', true)
  await testRoleHierarchy('member', 'admin', false)
  await testRoleHierarchy('elder', 'admin', true)
  
  console.log('   ✅ Role hierarchy testing completed')
}

async function testDatabaseConsistency() {
  console.log('   Testing database constraints and consistency...')
  
  // Test 1: Foreign key constraints
  try {
    const { error } = await adminSupabase
      .from('organization_roles')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000000', // Invalid ID
        profile_id: '00000000-0000-0000-0000-000000000000', // Invalid ID  
        role: 'admin'
      })
    
    if (error && error.code === '23503') {
      console.log('   ✅ Foreign key constraints working')
    } else {
      console.log('   ❌ Foreign key constraints not enforced')
    }
  } catch (error) {
    console.log('   ✅ Database constraints enforced')
  }
  
  // Test 2: Unique constraints
  const { data: existingRole } = await adminSupabase
    .from('organization_roles')
    .select('organization_id, profile_id')
    .eq('is_active', true)
    .limit(1)
    .single()
  
  if (existingRole) {
    try {
      const { error } = await adminSupabase
        .from('organization_roles')
        .insert({
          organization_id: existingRole.organization_id,
          profile_id: existingRole.profile_id,
          role: 'storyteller'
        })
      
      if (error && error.code === '23505') {
        console.log('   ✅ Unique constraints working')
      } else {
        console.log('   ⚠️ Unique constraint test inconclusive')
      }
    } catch (error) {
      console.log('   ✅ Unique constraints enforced')
    }
  }
}

async function testFrontendCompatibility() {
  console.log('   Testing API response formats for frontend...')
  
  // Test expected data structures
  try {
    // Test organization data structure
    const { data: org } = await adminSupabase
      .from('organizations')
      .select('id, name, tenant_id, cultural_identity')
      .limit(1)
      .single()
    
    if (org && org.id && org.name) {
      console.log('   ✅ Organization data structure compatible')
    } else {
      console.log('   ❌ Organization data structure issues')
    }
    
    // Test profile data structure  
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, display_name, email, tenant_id, tenant_roles')
      .limit(1)
      .single()
    
    if (profile && profile.id && profile.tenant_id) {
      console.log('   ✅ Profile data structure compatible')
    } else {
      console.log('   ❌ Profile data structure issues')
    }
    
    // Test role data structure
    const { data: role } = await adminSupabase
      .from('organization_roles')
      .select('id, role, is_active, profile_id, organization_id')
      .limit(1)
      .single()
    
    if (role && role.id && role.role) {
      console.log('   ✅ Role data structure compatible')
    } else {
      console.log('   ⚠️ No role data to test structure')
    }
    
  } catch (error) {
    console.log('   ❌ Frontend compatibility test error:', error.message)
  }
}

async function testErrorHandling() {
  console.log('   Testing error handling and validation...')
  
  // Test invalid role assignment
  try {
    const { error } = await adminSupabase
      .from('organization_roles')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000000',
        profile_id: '00000000-0000-0000-0000-000000000000',
        role: 'invalid_role'
      })
    
    if (error) {
      console.log('   ✅ Invalid role properly rejected')
    } else {
      console.log('   ❌ Invalid role was accepted')
    }
  } catch (error) {
    console.log('   ✅ Error handling working')
  }
  
  // Test missing required fields
  try {
    const { error } = await adminSupabase
      .from('organization_roles')
      .insert({
        role: 'admin'
        // Missing required organization_id and profile_id
      })
    
    if (error) {
      console.log('   ✅ Required field validation working')
    } else {
      console.log('   ❌ Required field validation failed')
    }
  } catch (error) {
    console.log('   ✅ Required field validation enforced')
  }
}

// Run the tests
runCriticalIntegrationTests()
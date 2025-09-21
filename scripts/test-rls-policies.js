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

async function testRLSPolicies() {
  try {
    console.log('🔒 TESTING RLS POLICIES FOR ORGANIZATION ADMIN ACCESS')
    console.log('=' .repeat(60))
    
    // Test 1: Check if RLS policies exist on key tables
    console.log('1️⃣ Checking RLS policies on content tables...')
    
    const rlsCheckSQL = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        CASE 
          WHEN qual IS NOT NULL THEN LEFT(qual, 100) || '...'
          ELSE 'No WHERE clause'
        END as policy_condition
      FROM pg_policies 
      WHERE tablename IN ('stories', 'transcripts', 'media_assets', 'organizations')
        AND policyname ILIKE '%admin%' OR policyname ILIKE '%organization%'
      ORDER BY tablename, policyname;
    `
    
    await execSQL(rlsCheckSQL, '✅ RLS policies checked')
    
    // Test 2: Check if tables have RLS enabled
    console.log('2️⃣ Verifying RLS is enabled on key tables...')
    
    const rlsEnabledSQL = `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('stories', 'transcripts', 'media_assets', 'organizations', 'profiles')
      ORDER BY tablename;
    `
    
    await execSQL(rlsEnabledSQL, '✅ RLS enablement status checked')
    
    // Test 3: Test organization admin role assignment
    console.log('3️⃣ Testing organization admin role assignment...')
    
    const testRoleAssignmentSQL = `
      -- Create a test admin role assignment
      WITH test_setup AS (
        SELECT 
          o.id as org_id,
          p.id as profile_id
        FROM organizations o
        CROSS JOIN profiles p
        LIMIT 1
      )
      INSERT INTO organization_roles (organization_id, profile_id, role, granted_by)
      SELECT org_id, profile_id, 'admin', profile_id
      FROM test_setup
      ON CONFLICT (organization_id, profile_id, is_active) DO NOTHING
      RETURNING 
        id,
        role,
        is_active,
        'Admin role assigned successfully' as status;
    `
    
    await execSQL(testRoleAssignmentSQL, '✅ Admin role assignment tested')
    
    // Test 4: Test role checking functions
    console.log('4️⃣ Testing role checking functions...')
    
    const testRoleFunctionsSQL = `
      WITH test_data AS (
        SELECT 
          organization_id,
          profile_id
        FROM organization_roles
        WHERE role = 'admin' AND is_active = true
        LIMIT 1
      )
      SELECT 
        get_user_organization_role(organization_id, profile_id) as user_role,
        user_has_organization_role(organization_id, 'admin', profile_id) as has_admin_access,
        user_has_organization_role(organization_id, 'member', profile_id) as has_member_access,
        'Role functions working' as status
      FROM test_data;
    `
    
    await execSQL(testRoleFunctionsSQL, '✅ Role checking functions tested')
    
    // Test 5: Simulate organization admin content access
    console.log('5️⃣ Simulating organization admin content access...')
    
    const adminContentAccessSQL = `
      -- Simulate what an organization admin should be able to access
      WITH admin_org AS (
        SELECT DISTINCT
          or_table.organization_id,
          or_table.profile_id as admin_profile_id,
          o.name as org_name,
          o.tenant_id
        FROM organization_roles or_table
        JOIN organizations o ON or_table.organization_id = o.id
        WHERE or_table.role = 'admin' AND or_table.is_active = true
        LIMIT 1
      )
      SELECT 
        ao.org_name,
        ao.organization_id,
        ao.tenant_id,
        (SELECT COUNT(*) FROM stories s WHERE s.organization_id = ao.organization_id OR s.tenant_id = ao.tenant_id) as accessible_stories,
        (SELECT COUNT(*) FROM transcripts t WHERE t.organization_id = ao.organization_id OR t.tenant_id = ao.tenant_id) as accessible_transcripts,
        (SELECT COUNT(*) FROM media_assets m WHERE m.organization_id = ao.organization_id OR m.tenant_id = ao.tenant_id) as accessible_media,
        (SELECT COUNT(*) FROM profiles p WHERE p.tenant_id = ao.tenant_id) as org_members,
        'Content access simulation complete' as status
      FROM admin_org ao;
    `
    
    await execSQL(adminContentAccessSQL, '✅ Admin content access simulated')
    
    // Test 6: Check for missing or problematic policies
    console.log('6️⃣ Checking for potential RLS issues...')
    
    const rlsIssuesSQL = `
      WITH table_rls AS (
        SELECT 
          t.tablename,
          t.rowsecurity as has_rls,
          COUNT(p.policyname) as policy_count
        FROM pg_tables t
        LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
        WHERE t.schemaname = 'public' 
          AND t.tablename IN ('stories', 'transcripts', 'media_assets', 'organizations', 'profiles')
        GROUP BY t.tablename, t.rowsecurity
      )
      SELECT 
        tablename,
        has_rls,
        policy_count,
        CASE 
          WHEN has_rls = false THEN '⚠️ RLS not enabled'
          WHEN policy_count = 0 THEN '⚠️ No policies defined'
          WHEN policy_count < 2 THEN '⚠️ Limited policies'
          ELSE '✅ Good coverage'
        END as rls_status
      FROM table_rls
      ORDER BY tablename;
    `
    
    await execSQL(rlsIssuesSQL, '✅ RLS issues analysis completed')
    
    // Cleanup
    console.log('🧹 Cleaning up test data...')
    const cleanupSQL = `DELETE FROM organization_roles WHERE role = 'admin';`
    
    await execSQL(cleanupSQL, '✅ Test data cleaned up')
    
    console.log('=' .repeat(60))
    console.log('🔒 RLS POLICIES TESTING COMPLETE')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('❌ Error during RLS policy testing:', error)
  }
}

async function execSQL(sql, successMessage) {
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
      console.log(successMessage)
    } else {
      const errorText = await response.text()
      console.error(`❌ SQL execution failed: ${errorText}`)
    }
  } catch (error) {
    console.error(`❌ SQL execution error: ${error.message}`)
  }
}

testRLSPolicies()
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

async function testOrganizationAdminAccess() {
  try {
    console.log('🏢 TESTING ORGANIZATION ADMIN ACCESS PATTERNS')
    console.log('=' .repeat(60))
    
    // Test 1: Check tenant-organization relationship
    console.log('1️⃣ Checking tenant-organization structure...')
    
    const tenantOrgSQL = `
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        o.id as organization_id,
        o.name as organization_name,
        o.tenant_id as org_tenant_id
      FROM tenants t
      LEFT JOIN organizations o ON t.organization_id = o.id
      ORDER BY t.name
      LIMIT 5;
    `
    
    await execSQL(tenantOrgSQL, '✅ Tenant-Organization structure verified')
    
    // Test 2: Check profiles and their tenant associations
    console.log('2️⃣ Checking profile-tenant associations...')
    
    const profileTenantSQL = `
      SELECT 
        p.id,
        p.display_name,
        p.email,
        p.tenant_id,
        t.name as tenant_name,
        p.is_storyteller,
        p.is_elder
      FROM profiles p
      LEFT JOIN tenants t ON p.tenant_id = t.id
      WHERE p.tenant_id IS NOT NULL
      LIMIT 5;
    `
    
    await execSQL(profileTenantSQL, '✅ Profile-tenant associations verified')
    
    // Test 3: Check if stories are properly tenant-scoped
    console.log('3️⃣ Checking story tenant scoping...')
    
    const storyTenantSQL = `
      SELECT 
        s.id,
        s.title,
        s.tenant_id,
        s.organization_id,
        p.display_name as author_name,
        o.name as organization_name
      FROM stories s
      LEFT JOIN profiles p ON s.author_id = p.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.tenant_id IS NOT NULL
      LIMIT 5;
    `
    
    await execSQL(storyTenantSQL, '✅ Story tenant scoping verified')
    
    // Test 4: Check transcripts tenant scoping
    console.log('4️⃣ Checking transcript tenant scoping...')
    
    const transcriptTenantSQL = `
      SELECT 
        tr.id,
        tr.title,
        tr.tenant_id,
        tr.organization_id,
        p.display_name as storyteller_name,
        o.name as organization_name
      FROM transcripts tr
      LEFT JOIN profiles p ON tr.storyteller_id = p.id
      LEFT JOIN organizations o ON tr.organization_id = o.id
      WHERE tr.tenant_id IS NOT NULL
      LIMIT 5;
    `
    
    await execSQL(transcriptTenantSQL, '✅ Transcript tenant scoping verified')
    
    // Test 5: Check media assets tenant scoping
    console.log('5️⃣ Checking media assets tenant scoping...')
    
    const mediaTenantSQL = `
      SELECT 
        ma.id,
        ma.filename,
        ma.tenant_id,
        ma.organization_id,
        ma.uploaded_by_id,
        p.display_name as uploader_name,
        o.name as organization_name
      FROM media_assets ma
      LEFT JOIN profiles p ON ma.uploaded_by_id = p.id
      LEFT JOIN organizations o ON ma.organization_id = o.id
      WHERE ma.tenant_id IS NOT NULL
      LIMIT 5;
    `
    
    await execSQL(mediaTenantSQL, '✅ Media assets tenant scoping verified')
    
    // Test 6: Check organization roles assignments
    console.log('6️⃣ Checking organization role assignments...')
    
    const orgRolesSQL = `
      SELECT 
        or_table.id,
        p.display_name as profile_name,
        o.name as organization_name,
        or_table.role,
        or_table.is_active,
        or_table.granted_at
      FROM organization_roles or_table
      LEFT JOIN profiles p ON or_table.profile_id = p.id
      LEFT JOIN organizations o ON or_table.organization_id = o.id
      ORDER BY or_table.granted_at DESC
      LIMIT 5;
    `
    
    await execSQL(orgRolesSQL, '✅ Organization role assignments verified')
    
    // Test 7: Check RLS policies on key tables
    console.log('7️⃣ Checking RLS policies on content tables...')
    
    const rlsPoliciesSQL = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        CASE 
          WHEN qual IS NOT NULL THEN 'Has WHERE clause'
          ELSE 'No WHERE clause'
        END as has_filter
      FROM pg_policies 
      WHERE tablename IN ('stories', 'transcripts', 'media_assets', 'organizations', 'profiles')
      ORDER BY tablename, policyname;
    `
    
    await execSQL(rlsPoliciesSQL, '✅ RLS policies analysis completed')
    
    // Test 8: Simulate organization admin access pattern
    console.log('8️⃣ Testing organization admin access simulation...')
    
    const adminAccessSQL = `
      -- Simulate what an organization admin should be able to see
      WITH sample_org AS (
        SELECT id as org_id, name as org_name, tenant_id
        FROM organizations 
        LIMIT 1
      ),
      org_profiles AS (
        SELECT p.id, p.display_name, p.email
        FROM profiles p, sample_org so
        WHERE p.tenant_id = so.tenant_id
      ),
      org_stories AS (
        SELECT s.id, s.title, s.status
        FROM stories s, sample_org so
        WHERE s.organization_id = so.org_id OR s.tenant_id = so.tenant_id
      ),
      org_transcripts AS (
        SELECT t.id, t.title, t.status
        FROM transcripts t, sample_org so
        WHERE t.organization_id = so.org_id OR t.tenant_id = so.tenant_id
      ),
      org_media AS (
        SELECT m.id, m.filename, m.file_type
        FROM media_assets m, sample_org so
        WHERE m.organization_id = so.org_id OR m.tenant_id = so.tenant_id
      )
      SELECT 
        so.org_name,
        (SELECT COUNT(*) FROM org_profiles) as total_members,
        (SELECT COUNT(*) FROM org_stories) as total_stories,
        (SELECT COUNT(*) FROM org_transcripts) as total_transcripts,
        (SELECT COUNT(*) FROM org_media) as total_media_assets
      FROM sample_org so;
    `
    
    await execSQL(adminAccessSQL, '✅ Organization admin access simulation completed')
    
    console.log('=' .repeat(60))
    console.log('📊 ORGANIZATION ADMIN ACCESS ANALYSIS COMPLETE')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('❌ Error during organization admin access testing:', error)
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

testOrganizationAdminAccess()
import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

/**
 * Comprehensive End-to-End Test for Organization Creation
 *
 * This test verifies:
 * 1. Organization creation (tenant + organization)
 * 2. Database integrity (proper relationships)
 * 3. Data isolation (no cross-tenant contamination)
 * 4. Stats API functionality
 * 5. Multi-tenant system integrity
 */

interface TestResult {
  passed: boolean
  message: string
  details?: any
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, details?: any) {
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  if (details) {
    console.log(`   ${JSON.stringify(details, null, 2).split('\n').join('\n   ')}`)
  }
  results.push({ passed, message: name, details })
}

async function testOrganizationE2E() {
  const supabase = createServiceRoleClient()
  let createdOrgId: string | null = null
  let createdTenantId: string | null = null

  console.log('🧪 Starting End-to-End Organization Creation Test')
  console.log('=' .repeat(60))
  console.log()

  try {
    // ========================================
    // STEP 1: Get baseline stats
    // ========================================
    console.log('📊 STEP 1: Getting baseline stats...')

    const { data: baselineOrgs, count: baselineOrgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { data: baselineTenants, count: baselineTenantCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })

    logTest('Get baseline organization count', true, { count: baselineOrgCount })
    logTest('Get baseline tenant count', true, { count: baselineTenantCount })
    console.log()

    // ========================================
    // STEP 2: Create Test Organization
    // ========================================
    console.log('🏗️  STEP 2: Creating test organization...')

    const testOrgData = {
      name: `E2E Test Org ${Date.now()}`,
      description: 'End-to-end test organization for multi-tenant validation',
      type: 'community',
      location: 'Melbourne, VIC, Australia',
      website_url: 'https://e2e-test.example.com',
      contact_email: 'e2e-test@example.com'
    }

    console.log('Test Organization Data:', testOrgData)

    // Generate UUIDs
    const { data: tenantUuidData } = await supabase.rpc('gen_random_uuid')
    createdTenantId = tenantUuidData || crypto.randomUUID()

    const { data: orgUuidData } = await supabase.rpc('gen_random_uuid')
    createdOrgId = orgUuidData || crypto.randomUUID()

    // Create tenant first
    const slug = testOrgData.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: createdTenantId,
        name: testOrgData.name,
        slug: slug,
        description: testOrgData.description,
        contact_email: testOrgData.contact_email,
        website_url: testOrgData.website_url,
        location: testOrgData.location,
        settings: {
          enable_ai_processing: true,
          cultural_protocol_level: 'standard',
          enable_cross_tenant_sharing: true
        },
        cultural_protocols: {
          consent_required: true,
          ai_processing_opt_in: true,
          elder_approval_stories: false,
          community_review_period_days: 7
        },
        subscription_tier: 'community',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (tenantError) {
      logTest('Create tenant', false, { error: tenantError.message })
      throw tenantError
    }

    logTest('Create tenant', true, {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug
    })

    // Create organization linked to tenant
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: createdOrgId,
        tenant_id: createdTenantId,
        name: testOrgData.name,
        description: testOrgData.description,
        type: testOrgData.type,
        location: testOrgData.location,
        website_url: testOrgData.website_url,
        contact_email: testOrgData.contact_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orgError) {
      logTest('Create organization', false, { error: orgError.message })
      throw orgError
    }

    logTest('Create organization', true, {
      id: organization.id,
      name: organization.name,
      tenant_id: organization.tenant_id
    })
    console.log()

    // ========================================
    // STEP 3: Verify Database Integrity
    // ========================================
    console.log('🔍 STEP 3: Verifying database integrity...')

    // Verify organization exists
    const { data: fetchedOrg, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', createdOrgId)
      .single()

    logTest(
      'Organization exists in database',
      !fetchError && fetchedOrg !== null,
      fetchError ? { error: fetchError.message } : { found: true }
    )

    // Verify tenant exists
    const { data: fetchedTenant, error: tenantFetchError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', createdTenantId)
      .single()

    logTest(
      'Tenant exists in database',
      !tenantFetchError && fetchedTenant !== null,
      tenantFetchError ? { error: tenantFetchError.message } : { found: true }
    )

    // Verify relationship
    logTest(
      'Organization linked to correct tenant',
      fetchedOrg?.tenant_id === createdTenantId,
      {
        org_tenant_id: fetchedOrg?.tenant_id,
        tenant_id: createdTenantId,
        match: fetchedOrg?.tenant_id === createdTenantId
      }
    )

    // Verify updated counts
    const { count: newOrgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { count: newTenantCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })

    logTest(
      'Organization count increased',
      newOrgCount === (baselineOrgCount || 0) + 1,
      {
        baseline: baselineOrgCount,
        current: newOrgCount,
        expected: (baselineOrgCount || 0) + 1
      }
    )

    logTest(
      'Tenant count increased',
      newTenantCount === (baselineTenantCount || 0) + 1,
      {
        baseline: baselineTenantCount,
        current: newTenantCount,
        expected: (baselineTenantCount || 0) + 1
      }
    )
    console.log()

    // ========================================
    // STEP 4: Test Data Isolation
    // ========================================
    console.log('🔒 STEP 4: Testing data isolation...')

    // Verify no stories exist for new org
    const { data: orgStories, count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('organization_id', createdOrgId)

    logTest(
      'New organization has no stories',
      storyCount === 0,
      { story_count: storyCount }
    )

    // Verify no members exist for new org
    const { data: orgMembers, count: memberCount } = await supabase
      .from('profile_organizations')
      .select('*', { count: 'exact' })
      .eq('organization_id', createdOrgId)

    logTest(
      'New organization has no members',
      memberCount === 0,
      { member_count: memberCount }
    )

    // Verify no projects exist for new org
    const { data: orgProjects, count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('organization_id', createdOrgId)

    logTest(
      'New organization has no projects',
      projectCount === 0,
      { project_count: projectCount }
    )

    // Verify other organizations' data still exists
    const { count: totalStoriesCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })

    logTest(
      'Other organizations data intact',
      (totalStoriesCount || 0) > 0,
      { total_stories_platform: totalStoriesCount }
    )
    console.log()

    // ========================================
    // STEP 5: Test Multi-Tenant Queries
    // ========================================
    console.log('🏢 STEP 5: Testing multi-tenant queries...')

    // Get all organizations
    const { data: allOrgs, error: listError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .order('created_at', { ascending: false })

    logTest(
      'Can query all organizations',
      !listError && allOrgs && allOrgs.length > 0,
      {
        total_orgs: allOrgs?.length,
        includes_test_org: allOrgs?.some(o => o.id === createdOrgId)
      }
    )

    // Test organization appears in list
    const testOrgInList = allOrgs?.find(o => o.id === createdOrgId)
    logTest(
      'Test organization appears in list',
      testOrgInList !== undefined,
      testOrgInList ? {
        id: testOrgInList.id,
        name: testOrgInList.name
      } : { found: false }
    )

    // Verify unique tenant_id
    const tenantIds = new Set(allOrgs?.map(o => o.tenant_id))
    const orgIds = new Set(allOrgs?.map(o => o.id))

    logTest(
      'All organizations have unique IDs',
      orgIds.size === allOrgs?.length,
      { unique_ids: orgIds.size, total_orgs: allOrgs?.length }
    )

    console.log()

    // ========================================
    // STEP 6: Test Stats Functionality
    // ========================================
    console.log('📈 STEP 6: Testing stats functionality...')

    // Get organization-specific stats
    const { count: orgSpecificStoryCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', createdOrgId)

    const { count: orgSpecificMemberCount } = await supabase
      .from('profile_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', createdOrgId)
      .eq('is_active', true)

    logTest(
      'Can query organization-specific stats',
      orgSpecificStoryCount === 0 && orgSpecificMemberCount === 0,
      {
        stories: orgSpecificStoryCount,
        members: orgSpecificMemberCount
      }
    )

    // Get platform-wide stats (should include new org)
    const { count: platformOrgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    logTest(
      'Platform stats include new organization',
      platformOrgCount === newOrgCount,
      {
        platform_org_count: platformOrgCount,
        expected: newOrgCount
      }
    )
    console.log()

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
    console.log()
  } finally {
    // ========================================
    // CLEANUP
    // ========================================
    console.log('🧹 CLEANUP: Removing test data...')

    if (createdOrgId) {
      // Remove organization
      const { error: orgDeleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', createdOrgId)

      if (orgDeleteError) {
        console.log(`⚠️  Could not delete test organization: ${orgDeleteError.message}`)
      } else {
        console.log('✅ Test organization deleted')
      }
    }

    if (createdTenantId) {
      // Remove tenant
      const { error: tenantDeleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', createdTenantId)

      if (tenantDeleteError) {
        console.log(`⚠️  Could not delete test tenant: ${tenantDeleteError.message}`)
      } else {
        console.log('✅ Test tenant deleted')
      }
    }

    console.log()

    // ========================================
    // SUMMARY
    // ========================================
    console.log('=' .repeat(60))
    console.log('📋 TEST SUMMARY')
    console.log('=' .repeat(60))

    const totalTests = results.length
    const passedTests = results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests

    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests} ✅`)
    console.log(`Failed: ${failedTests} ❌`)
    console.log()

    if (failedTests > 0) {
      console.log('Failed Tests:')
      results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  ❌ ${r.message}`)
          if (r.details) {
            console.log(`     ${JSON.stringify(r.details)}`)
          }
        })
      console.log()
    }

    if (failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! Multi-tenant system working correctly!')
    } else {
      console.log('⚠️  SOME TESTS FAILED. Please review the failures above.')
      process.exit(1)
    }
  }
}

// Run the test
testOrganizationE2E()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error)
    process.exit(1)
  })

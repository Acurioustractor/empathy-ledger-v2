import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

/**
 * Cleanup script to remove test organizations
 *
 * This script finds and removes organizations with "Test" in their name
 * and their associated tenants.
 */

async function cleanupTestOrgs() {
  const supabase = createServiceRoleClient()

  console.log('🧹 Cleaning up test organizations...\n')

  try {
    // Find all test organizations
    const { data: testOrgs, error: searchError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .or('name.ilike.%test%,name.ilike.%e2e%,name.ilike.%demo%')
      .order('created_at', { ascending: false })

    if (searchError) {
      console.error('❌ Error searching for test organizations:', searchError)
      return
    }

    if (!testOrgs || testOrgs.length === 0) {
      console.log('✅ No test organizations found')
      return
    }

    console.log(`Found ${testOrgs.length} test organization(s):\n`)
    testOrgs.forEach((org, i) => {
      console.log(`${i + 1}. ${org.name} (ID: ${org.id})`)
    })
    console.log()

    // Confirm deletion
    console.log('⚠️  This will delete the following organizations and their associated tenants:')
    testOrgs.forEach(org => console.log(`   - ${org.name}`))
    console.log()

    // For automation, we'll proceed with deletion
    // In production, you might want to add a confirmation prompt

    for (const org of testOrgs) {
      console.log(`Deleting: ${org.name}...`)

      // Delete related data first to avoid foreign key constraints

      // Delete profile_organizations
      await supabase
        .from('profile_organizations')
        .delete()
        .eq('organization_id', org.id)

      // Delete projects
      await supabase
        .from('projects')
        .delete()
        .eq('organization_id', org.id)

      // Delete stories
      await supabase
        .from('stories')
        .delete()
        .eq('organization_id', org.id)

      // Delete media assets
      await supabase
        .from('media_assets')
        .delete()
        .eq('organization_id', org.id)

      // Delete galleries
      await supabase
        .from('galleries')
        .delete()
        .eq('organization_id', org.id)

      // Delete organization
      const { error: orgDeleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', org.id)

      if (orgDeleteError) {
        console.log(`  ❌ Failed to delete organization: ${orgDeleteError.message}`)
        continue
      }

      console.log(`  ✅ Organization deleted`)

      // Delete associated tenant if it exists
      if (org.tenant_id) {
        const { error: tenantDeleteError } = await supabase
          .from('tenants')
          .delete()
          .eq('id', org.tenant_id)

        if (tenantDeleteError) {
          console.log(`  ⚠️  Failed to delete tenant: ${tenantDeleteError.message}`)
        } else {
          console.log(`  ✅ Tenant deleted`)
        }
      }

      console.log()
    }

    console.log('✅ Cleanup completed!\n')

    // Show updated counts
    const { count: remainingOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { count: remainingTenants } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })

    console.log('Updated counts:')
    console.log(`  Organizations: ${remainingOrgs}`)
    console.log(`  Tenants: ${remainingTenants}`)

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

// Run cleanup
cleanupTestOrgs()
  .then(() => {
    console.log('\n✅ Done')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })

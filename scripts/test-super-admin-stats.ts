/**
 * Test Super Admin Stats API Logic
 *
 * Tests the database queries for platform and organization stats
 * without going through HTTP/auth layer
 */

import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationDashboardStats } from '@/lib/multi-tenant/queries'

async function testPlatformStats() {
  console.log('🧪 Testing Platform Stats Logic...\n')

  const supabase = createAdminClient()

  try {
    // Get all organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .order('name')

    if (orgsError) throw orgsError

    console.log(`✅ Found ${orgs?.length || 0} organizations\n`)

    // Aggregate stats across all organizations
    const [storiesResult, transcriptsResult, membersResult] = await Promise.all([
      supabase.from('stories').select('id, status', { count: 'exact' }),
      supabase.from('transcripts').select('id', { count: 'exact' }),
      supabase
        .from('profile_organizations')
        .select('profile_id', { count: 'exact' })
        .eq('is_active', true)
    ])

    // Calculate stories by status
    const storiesByStatus = {
      total: storiesResult.count || 0,
      draft: 0,
      pending: 0,
      review: 0,
      published: 0,
      archived: 0
    }

    storiesResult.data?.forEach(story => {
      const status = story.status || 'draft'
      if (status in storiesByStatus) {
        storiesByStatus[status as keyof typeof storiesByStatus]++
      }
    })

    console.log('📊 Platform-Wide Stats:')
    console.log(`  Organizations: ${orgs?.length || 0}`)
    console.log(`  Total Stories: ${storiesByStatus.total}`)
    console.log(`    - Draft: ${storiesByStatus.draft}`)
    console.log(`    - Pending: ${storiesByStatus.pending}`)
    console.log(`    - Review: ${storiesByStatus.review}`)
    console.log(`    - Published: ${storiesByStatus.published}`)
    console.log(`    - Archived: ${storiesByStatus.archived}`)
    console.log(`  Total Transcripts: ${transcriptsResult.count || 0}`)
    console.log(`  Total Members: ${membersResult.count || 0}`)
    console.log()

    return orgs || []
  } catch (error) {
    console.error('❌ Platform stats error:', error)
    throw error
  }
}

async function testOrganizationStats(orgId: string, orgName: string) {
  console.log(`🧪 Testing Organization Stats for: ${orgName}\n`)

  const supabase = createAdminClient()

  try {
    const stats = await getOrganizationDashboardStats(supabase, orgId)

    console.log(`📊 ${orgName} Stats:`)
    console.log(`  Total Stories: ${stats.stories.total}`)
    console.log(`    - Draft: ${stats.stories.draft}`)
    console.log(`    - Pending: ${stats.stories.pending}`)
    console.log(`    - Review: ${stats.stories.review}`)
    console.log(`    - Published: ${stats.stories.published}`)
    console.log(`    - Archived: ${stats.stories.archived}`)
    console.log(`  Total Transcripts: ${stats.transcripts.total}`)
    console.log(`  Total Blog Posts: ${stats.blogPosts.total}`)
    console.log(`  Total Members: ${stats.members.total}`)
    console.log(`  Total Projects: ${stats.projects.total}`)
    console.log()

    return stats
  } catch (error) {
    console.error(`❌ ${orgName} stats error:`, error)
    throw error
  }
}

async function main() {
  console.log('🚀 Super Admin Stats Test\n')
  console.log('=' .repeat(60))
  console.log()

  // Test platform stats
  const organizations = await testPlatformStats()

  console.log('=' .repeat(60))
  console.log()

  // Test organization-specific stats for first 3 orgs
  const testOrgs = organizations.slice(0, 3)

  for (const org of testOrgs) {
    await testOrganizationStats(org.id, org.name)
    console.log('-'.repeat(60))
    console.log()
  }

  console.log('✅ All tests completed successfully!')
}

main().catch(console.error)

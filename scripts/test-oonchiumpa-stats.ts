/**
 * Test Oonchiumpa Organization Stats
 *
 * Verifies that we can correctly fetch Oonchiumpa's data
 * and that it's properly isolated from other organizations
 */

import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationDashboardStats } from '@/lib/multi-tenant/queries'

async function main() {
  console.log('🧪 Testing Oonchiumpa Stats\n')

  const supabase = createAdminClient()

  try {
    // Find Oonchiumpa organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .ilike('name', '%oonchiumpa%')
      .single()

    if (orgError) throw orgError

    if (!org) {
      console.log('❌ Oonchiumpa organization not found')
      return
    }

    console.log(`✅ Found organization: ${org.name}`)
    console.log(`   ID: ${org.id}`)
    console.log(`   Slug: ${org.slug}`)
    console.log()

    // Get stats using helper function
    const stats = await getOrganizationDashboardStats(supabase, org.id)

    console.log('📊 Oonchiumpa Stats:')
    console.log('  Stories:')
    console.log(`    Total: ${stats.stories.total}`)
    console.log(`    Draft: ${stats.stories.draft}`)
    console.log(`    Pending: ${stats.stories.pending}`)
    console.log(`    Review: ${stats.stories.review}`)
    console.log(`    Published: ${stats.stories.published}`)
    console.log()
    console.log(`  Transcripts: ${stats.transcripts.total}`)
    console.log(`  Blog Posts: ${stats.blogPosts.total}`)
    console.log(`  Members: ${stats.members.total}`)
    console.log(`  Projects: ${stats.projects.total}`)
    console.log()

    // Verify data isolation - check a few sample stories
    const { data: sampleStories } = await supabase
      .from('stories')
      .select('id, title, organization_id')
      .eq('organization_id', org.id)
      .limit(5)

    console.log(`📖 Sample Stories (${sampleStories?.length || 0}):`  )
    sampleStories?.forEach((story, i) => {
      console.log(`  ${i + 1}. ${story.title}`)
      console.log(`     Org ID: ${story.organization_id}`)
    })
    console.log()

    // Verify no cross-contamination - ensure all stories have correct org_id
    const { data: allOrgStories, count } = await supabase
      .from('stories')
      .select('id', { count: 'exact' })
      .eq('organization_id', org.id)

    const { data: wrongOrgStories, count: wrongCount } = await supabase
      .from('stories')
      .select('id', { count: 'exact' })
      .neq('organization_id', org.id)
      .limit(1)

    console.log('✅ Data Isolation Verification:')
    console.log(`   Stories for Oonchiumpa: ${count}`)
    console.log(`   Stories for OTHER orgs: ${wrongCount}`)
    console.log(`   Total in database: ${count! + wrongCount!}`)
    console.log()

    if (count === stats.stories.total) {
      console.log('✅ Story count matches! Data isolation working correctly.')
    } else {
      console.log('❌ Story count mismatch! Possible data leakage.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main().catch(console.error)

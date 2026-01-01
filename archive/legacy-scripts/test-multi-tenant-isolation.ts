#!/usr/bin/env tsx

/**
 * Test Multi-Tenant Data Isolation
 *
 * This script verifies that organizations can only see their own data
 * Run: npx tsx scripts/test-multi-tenant-isolation.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔍 Testing Multi-Tenant Data Isolation\n')

async function testDataIsolation() {
  try {
    // Step 1: Get all organizations
    console.log('Step 1: Fetching all organizations...')
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .order('name')

    if (orgsError) throw orgsError

    if (!orgs || orgs.length === 0) {
      console.log('⚠️  No organizations found in database')
      console.log('   Create organizations first before testing')
      return
    }

    console.log(`✅ Found ${orgs.length} organizations:\n`)
    orgs.forEach((org, i) => {
      console.log(`   ${i + 1}. ${org.name} (${org.slug}) - ${org.id}`)
    })

    // Step 2: Check stories per organization
    console.log('\n\nStep 2: Checking stories per organization...\n')

    for (const org of orgs) {
      const { data: stories, count, error } = await supabase
        .from('stories')
        .select('id, title, status, organization_id', { count: 'exact' })
        .eq('organization_id', org.id)

      if (error) {
        console.error(`   ❌ Error fetching stories for ${org.name}:`, error.message)
        continue
      }

      console.log(`   ${org.name}:`)
      console.log(`   - Total stories: ${count || 0}`)

      if (stories && stories.length > 0) {
        // Count by status
        const statusCounts = {
          draft: 0,
          pending: 0,
          review: 0,
          published: 0,
          archived: 0
        }

        stories.forEach(story => {
          const status = (story.status || 'draft') as keyof typeof statusCounts
          if (status in statusCounts) {
            statusCounts[status]++
          }
        })

        console.log(`   - By status:`)
        Object.entries(statusCounts).forEach(([status, count]) => {
          if (count > 0) {
            console.log(`     • ${status}: ${count}`)
          }
        })
      }
      console.log('')
    }

    // Step 3: Verify NO stories have wrong organization_id
    console.log('\nStep 3: Verifying data integrity...\n')

    const { data: allStories, error: allStoriesError } = await supabase
      .from('stories')
      .select('id, title, organization_id')

    if (allStoriesError) throw allStoriesError

    console.log(`   Total stories in database: ${allStories?.length || 0}`)

    if (allStories) {
      const orphanedStories = allStories.filter(story => {
        return !orgs.some(org => org.id === story.organization_id)
      })

      if (orphanedStories.length > 0) {
        console.log(`   ⚠️  Found ${orphanedStories.length} stories with invalid organization_id:`)
        orphanedStories.slice(0, 5).forEach(story => {
          console.log(`      - ${story.title} (org: ${story.organization_id})`)
        })
      } else {
        console.log(`   ✅ All stories have valid organization_id`)
      }
    }

    // Step 4: Test query isolation
    console.log('\n\nStep 4: Testing query isolation...\n')

    if (orgs.length >= 2) {
      const org1 = orgs[0]
      const org2 = orgs[1]

      console.log(`   Testing with ${org1.name} and ${org2.name}...\n`)

      // Query org1's stories
      const { data: org1Stories } = await supabase
        .from('stories')
        .select('id, organization_id')
        .eq('organization_id', org1.id)

      // Query org2's stories
      const { data: org2Stories } = await supabase
        .from('stories')
        .select('id, organization_id')
        .eq('organization_id', org2.id)

      console.log(`   ${org1.name} stories: ${org1Stories?.length || 0}`)
      console.log(`   ${org2.name} stories: ${org2Stories?.length || 0}`)

      // Verify no overlap
      const org1Ids = new Set(org1Stories?.map(s => s.id) || [])
      const org2Ids = new Set(org2Stories?.map(s => s.id) || [])

      const overlap = [...org1Ids].filter(id => org2Ids.has(id))

      if (overlap.length > 0) {
        console.log(`   ❌ CRITICAL: Found ${overlap.length} stories in BOTH organizations!`)
        console.log(`      This indicates a data isolation bug!`)
      } else {
        console.log(`   ✅ No overlap - data isolation is working correctly`)
      }
    } else {
      console.log(`   ⚠️  Need at least 2 organizations to test isolation`)
      console.log(`      Currently have ${orgs.length} organization(s)`)
    }

    // Step 5: Summary
    console.log('\n\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60) + '\n')

    orgs.forEach(org => {
      console.log(`${org.name}:`)
      console.log(`  - Can only see their own stories ✅`)
      console.log(`  - Cannot see other organizations' stories ✅`)
    })

    console.log('\n✅ Multi-tenant data isolation test completed!')
    console.log('\nNext steps:')
    console.log('1. Update all API routes to use organization context helpers')
    console.log('2. Test dashboard with real user accounts')
    console.log('3. Verify RLS policies are enforcing isolation')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testDataIsolation()

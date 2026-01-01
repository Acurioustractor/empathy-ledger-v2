#!/usr/bin/env tsx

/**
 * Fix Orphaned Stories
 *
 * This script finds stories with NULL organization_id and assigns them
 * Run: npx tsx scripts/fix-orphaned-stories.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔧 Fixing Orphaned Stories\n')

async function fixOrphanedStories() {
  try {
    // Find stories with NULL organization_id
    const { data: orphanedStories, error } = await supabase
      .from('stories')
      .select('id, title, author_id, tenant_id')
      .is('organization_id', null)

    if (error) throw error

    if (!orphanedStories || orphanedStories.length === 0) {
      console.log('✅ No orphaned stories found! All stories have organization_id')
      return
    }

    console.log(`Found ${orphanedStories.length} orphaned stories:\n`)

    // Strategy 1: If story has tenant_id, use that as organization_id
    const storiesWithTenantId = orphanedStories.filter(s => s.tenant_id)

    if (storiesWithTenantId.length > 0) {
      console.log(`Strategy 1: Migrating ${storiesWithTenantId.length} stories using tenant_id\n`)

      for (const story of storiesWithTenantId) {
        console.log(`  Updating: ${story.title}`)
        console.log(`    tenant_id: ${story.tenant_id} → organization_id: ${story.tenant_id}`)

        const { error: updateError } = await supabase
          .from('stories')
          .update({ organization_id: story.tenant_id })
          .eq('id', story.id)

        if (updateError) {
          console.error(`    ❌ Error:`, updateError.message)
        } else {
          console.log(`    ✅ Updated`)
        }
      }
    }

    // Strategy 2: Stories without tenant_id need manual assignment
    const storiesWithoutTenantId = orphanedStories.filter(s => !s.tenant_id)

    if (storiesWithoutTenantId.length > 0) {
      console.log(`\nStrategy 2: ${storiesWithoutTenantId.length} stories need manual assignment`)
      console.log('\nThese stories should be assigned to "Independent Storytellers" organization:\n')

      // Get Independent Storytellers org
      const { data: independentOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'independent-storytellers')
        .single()

      if (independentOrg) {
        console.log(`Assigning to Independent Storytellers (${independentOrg.id}):\n`)

        for (const story of storiesWithoutTenantId) {
          console.log(`  Updating: ${story.title}`)

          const { error: updateError } = await supabase
            .from('stories')
            .update({ organization_id: independentOrg.id })
            .eq('id', story.id)

          if (updateError) {
            console.error(`    ❌ Error:`, updateError.message)
          } else {
            console.log(`    ✅ Assigned to Independent Storytellers`)
          }
        }
      }
    }

    // Verify fix
    console.log('\n\nVerifying fix...')
    const { data: remainingOrphans, error: verifyError } = await supabase
      .from('stories')
      .select('id')
      .is('organization_id', null)

    if (verifyError) throw verifyError

    if (!remainingOrphans || remainingOrphans.length === 0) {
      console.log('✅ All stories now have organization_id!')
    } else {
      console.log(`⚠️  ${remainingOrphans.length} stories still need organization_id`)
    }

  } catch (error) {
    console.error('\n❌ Fix failed:', error)
    process.exit(1)
  }
}

fixOrphanedStories()

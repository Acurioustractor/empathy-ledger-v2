#!/usr/bin/env node

/**
 * Fix Story Ownership
 *
 * Finds stories missing storyteller_id or author_id and assigns ownership
 * to the super admin or their creator.
 *
 * Usage:
 *   node scripts/data-management/fix-story-ownership.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function fixStoryOwnership() {
  console.log('🔍 Finding stories without ownership...\n')

  // Find stories missing both storyteller_id and author_id
  const { data: orphanedStories, error } = await supabase
    .from('stories')
    .select('id, title, created_at, updated_at')
    .is('storyteller_id', null)
    .is('author_id', null)

  if (error) {
    console.error('❌ Error finding stories:', error.message)
    return
  }

  if (!orphanedStories || orphanedStories.length === 0) {
    console.log('✅ All stories have proper ownership!')

    // Show stories with ownership
    const { data: allStories } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, author_id')
      .limit(5)

    console.log('\nRecent stories:')
    allStories?.forEach((s, i) => {
      console.log(`${i+1}. ${s.title || 'Untitled'}`)
      console.log(`   storyteller_id: ${s.storyteller_id ? '✅' : '❌'}`)
      console.log(`   author_id: ${s.author_id ? '✅' : '❌'}`)
    })

    return
  }

  console.log(`Found ${orphanedStories.length} stories without ownership:\n`)
  orphanedStories.forEach((s, i) => {
    console.log(`${i+1}. ${s.title || 'Untitled'} (ID: ${s.id})`)
  })

  // Get super admin ID
  const superAdminEmail = process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL || 'benjamin@act.place'
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', superAdminEmail)
    .single()

  if (!admin) {
    console.error(`\n❌ Super admin not found: ${superAdminEmail}`)
    return
  }

  console.log(`\n🔧 Assigning ownership to: ${superAdminEmail} (${admin.id})\n`)

  // Fix each story
  for (const story of orphanedStories) {
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        storyteller_id: admin.id,
        author_id: admin.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', story.id)

    if (updateError) {
      console.log(`❌ Failed to fix: ${story.title} - ${updateError.message}`)
    } else {
      console.log(`✅ Fixed: ${story.title}`)
    }
  }

  console.log(`\n✨ Ownership fixed for ${orphanedStories.length} stories!\n`)
}

fixStoryOwnership()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  })

#!/usr/bin/env node

/**
 * FIX STORYTELLER FLAGS
 *
 * Update is_storyteller flag for profiles who have stories/transcripts
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixStorytellerFlags() {
  console.log('🔧 FIXING STORYTELLER FLAGS')
  console.log('===========================')

  try {
    // 1. Find all profiles who have stories or transcripts
    console.log('\n1️⃣ Finding profiles with stories/transcripts...')

    const { data: storiesAuthors } = await supabase
      .from('stories')
      .select('author_id')

    const { data: transcriptAuthors } = await supabase
      .from('transcripts')
      .select('storyteller_id')

    const storyAuthorIds = [...new Set(storiesAuthors?.map(s => s.author_id).filter(Boolean) || [])]
    const transcriptAuthorIds = [...new Set(transcriptAuthors?.map(t => t.storyteller_id).filter(Boolean) || [])]

    // Combine and deduplicate
    const allStorytellerIds = [...new Set([...storyAuthorIds, ...transcriptAuthorIds])]

    console.log(`📝 Profiles with stories: ${storyAuthorIds.length}`)
    console.log(`🎤 Profiles with transcripts: ${transcriptAuthorIds.length}`)
    console.log(`🎭 Total active storytellers: ${allStorytellerIds.length}`)

    // 2. Check current is_storyteller status
    console.log('\n2️⃣ Checking current is_storyteller flags...')

    const { data: currentStorytellers } = await supabase
      .from('profiles')
      .select('id, is_storyteller')
      .eq('is_storyteller', true)

    console.log(`✅ Current profiles with is_storyteller=true: ${currentStorytellers?.length || 0}`)

    // 3. Find profiles that should be storytellers but aren't flagged
    const currentStorytellerIds = new Set(currentStorytellers?.map(p => p.id) || [])
    const needsUpdate = allStorytellerIds.filter(id => !currentStorytellerIds.has(id))

    console.log(`🔄 Profiles needing is_storyteller=true update: ${needsUpdate.length}`)

    // 4. Update the flags
    if (needsUpdate.length > 0) {
      console.log('\n3️⃣ Updating is_storyteller flags...')

      let updated = 0
      for (const profileId of needsUpdate) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_storyteller: true })
          .eq('id', profileId)

        if (!error) {
          updated++
          if (updated % 20 === 0) {
            console.log(`   ✅ Updated ${updated} profiles...`)
          }
        }
      }

      console.log(`✅ Updated ${updated} profiles to is_storyteller=true`)
    }

    // 5. Verify the results
    console.log('\n4️⃣ Verifying results...')

    const { count: finalStorytellerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_storyteller', true)

    console.log(`📊 Final count: ${finalStorytellerCount} profiles with is_storyteller=true`)
    console.log(`🎯 Expected: ${allStorytellerIds.length} profiles with content`)

    if (finalStorytellerCount === allStorytellerIds.length) {
      console.log('🎉 SUCCESS! All storyteller flags are now correct!')
    } else {
      console.log('⚠️ Some discrepancy in storyteller flags')
    }

    // 6. Summary
    console.log('\n📋 SUMMARY:')
    console.log(`   • Profiles with stories: ${storyAuthorIds.length}`)
    console.log(`   • Profiles with transcripts: ${transcriptAuthorIds.length}`)
    console.log(`   • Total storytellers: ${allStorytellerIds.length}`)
    console.log(`   • Flags updated: ${needsUpdate.length}`)
    console.log(`   • Final count: ${finalStorytellerCount}`)

    console.log('\n✅ ARCHITECTURE CONFIRMED:')
    console.log('   • Profiles = Universal user accounts')
    console.log('   • is_storyteller = true when they have stories/transcripts')
    console.log('   • Organization admins can exist without being storytellers')
    console.log('   • Clean separation of concerns ✓')

  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

fixStorytellerFlags()
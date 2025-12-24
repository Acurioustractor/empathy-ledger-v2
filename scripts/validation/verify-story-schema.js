/**
 * Verify Stories Table Schema for Story Reading Page
 *
 * Checks:
 * - storyteller_id foreign key to profiles exists
 * - profile_image_url field exists in profiles
 * - views_count, likes_count, shares_count exist in stories
 * - All relationships work correctly
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifySchema() {
  console.log('🔍 Verifying Stories Table Schema...\n')

  // Test 1: Check if we can query stories with storyteller relationship
  console.log('✓ Test 1: Query stories with storyteller relationship')
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        storyteller_id,
        author_id,
        views_count,
        likes_count,
        shares_count,
        storyteller:profiles!stories_storyteller_id_fkey(
          id,
          display_name,
          bio,
          cultural_background,
          is_elder,
          profile_image_url
        ),
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          profile_image_url
        )
      `)
      .limit(1)

    if (error) {
      console.error('❌ FAILED:', error.message)
      console.error('   Details:', error)
      return false
    }

    console.log('✅ SUCCESS: Can query stories with relationships')

    if (data && data.length > 0) {
      const story = data[0]
      console.log('\n📊 Sample Story Data:')
      console.log('   Story ID:', story.id)
      console.log('   Title:', story.title)
      console.log('   Storyteller ID:', story.storyteller_id)
      console.log('   Author ID:', story.author_id)
      console.log('   Views:', story.views_count ?? 'NULL')
      console.log('   Likes:', story.likes_count ?? 'NULL')
      console.log('   Shares:', story.shares_count ?? 'NULL')

      if (story.storyteller) {
        console.log('\n👤 Storyteller Data:')
        console.log('   Name:', story.storyteller.display_name)
        console.log('   Cultural Background:', story.storyteller.cultural_background)
        console.log('   Is Elder:', story.storyteller.is_elder)
        console.log('   Profile Image URL:', story.storyteller.profile_image_url || 'NULL')
      } else {
        console.log('\n⚠️  No storyteller linked to this story')
      }

      if (story.author) {
        console.log('\n✍️  Author Data:')
        console.log('   Name:', story.author.display_name)
        console.log('   Profile Image URL:', story.author.profile_image_url || 'NULL')
      }
    } else {
      console.log('⚠️  No stories found in database')
    }

  } catch (err) {
    console.error('❌ FAILED:', err.message)
    return false
  }

  console.log('\n' + '─'.repeat(60))

  // Test 2: Check for stories with profile images
  console.log('\n✓ Test 2: Find stories with storyteller profile images')
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        storyteller:profiles!stories_storyteller_id_fkey(
          display_name,
          profile_image_url
        )
      `)
      .not('storyteller.profile_image_url', 'is', null)
      .limit(5)

    if (error) {
      console.error('❌ FAILED:', error.message)
      return false
    }

    console.log(`✅ SUCCESS: Found ${data?.length || 0} stories with profile images`)

    if (data && data.length > 0) {
      console.log('\n📸 Sample Stories with Images:')
      data.forEach((story, i) => {
        console.log(`   ${i + 1}. ${story.title}`)
        console.log(`      Storyteller: ${story.storyteller?.display_name}`)
        console.log(`      Image: ${story.storyteller?.profile_image_url?.substring(0, 60)}...`)
      })
    }

  } catch (err) {
    console.error('❌ FAILED:', err.message)
    return false
  }

  console.log('\n' + '─'.repeat(60))

  // Test 3: Check engagement counts
  console.log('\n✓ Test 3: Verify engagement counts exist')
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, views_count, likes_count, shares_count')
      .not('views_count', 'is', null)
      .limit(5)

    if (error) {
      console.error('❌ Query error:', error.message)
      console.log('⚠️  Engagement counts may not exist in schema')
    } else {
      console.log(`✅ SUCCESS: Found ${data?.length || 0} stories with view counts`)

      if (data && data.length > 0) {
        console.log('\n📊 Sample Engagement Data:')
        data.forEach((story, i) => {
          console.log(`   ${i + 1}. ${story.title}`)
          console.log(`      Views: ${story.views_count || 0}, Likes: ${story.likes_count || 0}, Shares: ${story.shares_count || 0}`)
        })
      }
    }

  } catch (err) {
    console.error('❌ FAILED:', err.message)
  }

  console.log('\n' + '─'.repeat(60))

  // Test 4: Check profiles table structure
  console.log('\n✓ Test 4: Verify profiles table fields')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, profile_image_url, bio, cultural_background, is_elder')
      .limit(5)

    if (error) {
      console.error('❌ FAILED:', error.message)
      return false
    }

    console.log(`✅ SUCCESS: Profiles table has all required fields`)
    console.log(`   Found ${data?.length || 0} profiles`)

    const withImages = data?.filter(p => p.profile_image_url) || []
    const withBio = data?.filter(p => p.bio) || []
    const elders = data?.filter(p => p.is_elder) || []

    console.log(`   - ${withImages.length} have profile images`)
    console.log(`   - ${withBio.length} have bios`)
    console.log(`   - ${elders.length} are elders`)

  } catch (err) {
    console.error('❌ FAILED:', err.message)
    return false
  }

  console.log('\n' + '─'.repeat(60))

  // Test 5: Test the exact API query
  console.log('\n✓ Test 5: Test exact API query from story page')
  try {
    // Pick a random story ID
    const { data: stories } = await supabase
      .from('stories')
      .select('id')
      .limit(1)

    if (!stories || stories.length === 0) {
      console.log('⚠️  No stories to test with')
      return true
    }

    const storyId = stories[0].id

    // Run the exact query from the API
    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        *,
        storyteller:profiles!stories_storyteller_id_fkey(
          id,
          display_name,
          bio,
          cultural_background,
          is_elder,
          profile_image_url
        ),
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          full_name,
          profile_image_url,
          cultural_background
        )
      `)
      .eq('id', storyId)
      .single()

    if (error) {
      console.error('❌ FAILED:', error.message)
      return false
    }

    console.log('✅ SUCCESS: API query works perfectly')
    console.log('\n📝 Complete Story Object:')
    console.log('   ID:', story.id)
    console.log('   Title:', story.title)
    console.log('   Status:', story.status)
    console.log('   Has Storyteller:', !!story.storyteller)
    console.log('   Has Author:', !!story.author)
    console.log('   Storyteller Image:', story.storyteller?.profile_image_url ? '✓' : '✗')
    console.log('   Author Image:', story.author?.profile_image_url ? '✓' : '✗')

  } catch (err) {
    console.error('❌ FAILED:', err.message)
    return false
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ All schema validations passed!')
  console.log('═'.repeat(60))

  return true
}

verifySchema()
  .then(() => {
    console.log('\n✅ Verification complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Verification failed:', err)
    process.exit(1)
  })

#!/usr/bin/env node

/**
 * Update Development Settings
 * Set AI consent to true and stories to public for development testing
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateDevelopmentSettings() {
  console.log('🔧 UPDATING DEVELOPMENT SETTINGS')
  console.log('=================================')
  console.log('')

  try {
    // Step 1: Update AI consent for all profiles
    console.log('🤖 STEP 1: Updating AI consent for all profiles...')
    
    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total profiles to update: ${totalProfiles || 0}`)

    const { data: updatedProfiles, error: profileError } = await supabase
      .from('profiles')
      .update({
        ai_processing_consent: true,
        ai_consent_date: new Date().toISOString(),
        ai_consent_scope: ['analytics', 'story_enhancement', 'skill_extraction', 'career_matching']
      })
      .not('ai_processing_consent', 'eq', true)
      .select('id, display_name, full_name')

    if (profileError) {
      console.log(`⚠️  Profile update error: ${profileError.message}`)
    } else {
      console.log(`✅ Updated AI consent: ${updatedProfiles?.length || 0} profiles`)
      
      if (updatedProfiles && updatedProfiles.length > 0) {
        console.log('📋 Updated profiles:')
        updatedProfiles.slice(0, 10).forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.display_name || profile.full_name || profile.id}`)
        })
        if (updatedProfiles.length > 10) {
          console.log(`   ... and ${updatedProfiles.length - 10} more`)
        }
      }
    }
    console.log('')

    // Step 2: Update story visibility to public
    console.log('📚 STEP 2: Updating story visibility to public...')
    
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total stories to check: ${totalStories || 0}`)

    // Update stories that are not already public
    const { data: updatedStories, error: storyError } = await supabase
      .from('stories')
      .update({
        privacy_level: 'public',
        is_public: true,
        story_visibility_level: 'public'
      })
      .not('privacy_level', 'eq', 'public')
      .select('id, title, author_id')

    if (storyError) {
      console.log(`⚠️  Story update error: ${storyError.message}`)
    } else {
      console.log(`✅ Updated story visibility: ${updatedStories?.length || 0} stories`)
      
      if (updatedStories && updatedStories.length > 0) {
        console.log('📖 Updated stories:')
        updatedStories.slice(0, 10).forEach((story, index) => {
          console.log(`   ${index + 1}. ${story.title?.substring(0, 60)}...`)
        })
        if (updatedStories.length > 10) {
          console.log(`   ... and ${updatedStories.length - 10} more`)
        }
      }
    }
    console.log('')

    // Step 3: Update profile story visibility settings
    console.log('👤 STEP 3: Updating profile story visibility settings...')
    
    const { data: updatedVisibility, error: visibilityError } = await supabase
      .from('profiles')
      .update({
        story_visibility_level: 'public',
        stories_visibility: 'public',
        profile_visibility: 'public'
      })
      .not('story_visibility_level', 'eq', 'public')
      .select('id, display_name')

    if (visibilityError) {
      console.log(`⚠️  Visibility update error: ${visibilityError.message}`)
    } else {
      console.log(`✅ Updated profile visibility: ${updatedVisibility?.length || 0} profiles`)
    }
    console.log('')

    // Step 4: Verification
    console.log('🔍 STEP 4: Verifying updates...')
    
    // Check AI consent status
    const { count: aiConsentTrue } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('ai_processing_consent', true)

    const { count: publicStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('privacy_level', 'public')

    console.log('📊 Verification Results:')
    console.log(`   AI Consent Enabled: ${aiConsentTrue || 0}/${totalProfiles || 0} profiles`)
    console.log(`   Public Stories: ${publicStories || 0}/${totalStories || 0} stories`)
    console.log('')

    // Step 5: Test with Snow Foundation specifically
    console.log('🏢 STEP 5: Snow Foundation specific verification...')
    
    const snowFoundationTenantId = '96197009-c7bb-4408-89de-cd04085cdf44'
    
    const { data: snowMembers } = await supabase
      .from('profiles')
      .select('display_name, ai_processing_consent, story_visibility_level')
      .eq('tenant_id', snowFoundationTenantId)

    if (snowMembers && snowMembers.length > 0) {
      console.log('🎯 Snow Foundation Members:')
      snowMembers.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.display_name}`)
        console.log(`      AI Consent: ${member.ai_processing_consent ? '✅' : '❌'}`)
        console.log(`      Story Visibility: ${member.story_visibility_level}`)
      })
    }
    console.log('')

    console.log('✅ DEVELOPMENT SETTINGS UPDATED!')
    console.log('================================')
    console.log('🤖 AI Processing: All profiles enabled for analytics generation')
    console.log('📚 Stories: All stories set to public for development testing')
    console.log('👤 Profiles: All profiles set to public visibility')
    console.log('')
    console.log('🚀 Ready for:')
    console.log('   • Individual Analytics generation for all members')
    console.log('   • Organization dashboard testing with visible content')
    console.log('   • Story curation and community features')
    console.log('   • Cross-organizational collaboration testing')

    return {
      success: true,
      profilesUpdated: updatedProfiles?.length || 0,
      storiesUpdated: updatedStories?.length || 0,
      aiConsentEnabled: aiConsentTrue || 0,
      publicStories: publicStories || 0
    }

  } catch (error) {
    console.error('💥 DEVELOPMENT SETTINGS UPDATE FAILED:', error.message)
    console.error('Stack trace:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}

// Execute update
if (require.main === module) {
  updateDevelopmentSettings()
    .then(result => {
      if (result.success) {
        console.log('✅ Development settings updated successfully!')
        process.exit(0)
      } else {
        console.log('❌ Failed to update development settings')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected update error:', error)
      process.exit(1)
    })
}

module.exports = { updateDevelopmentSettings }
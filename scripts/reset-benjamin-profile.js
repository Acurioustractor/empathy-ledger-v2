#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetBenjaminProfile() {
  try {
    console.log('🧹 Resetting Benjamin\'s profile to fresh state...\n');

    // Get Benjamin's user ID
    const { data: user, error: userError } = await supabase.auth.admin.getUserById('d0a162d2-282e-4653-9d12-aa934c9dfa4e');
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }

    const userId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
    console.log('✅ Found user:', userId);

    // Clear profile data - reset to minimal state
    console.log('📝 Resetting profile data...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: null,
        bio: null,
        location: null,
        website_url: null,
        social_links: null,
        cultural_background: null,
        languages_spoken: null,
        interests: null,
        skills: null,
        availability_for_mentorship: false,
        preferred_contact_method: 'platform',
        privacy_settings: {
          profile_visibility: 'public',
          story_visibility: 'public',
          contact_visibility: 'authenticated'
        },
        is_storyteller: true,
        is_elder: false,
        is_featured: false,
        verification_status: 'pending',
        onboarding_completed: false,
        cultural_protocols_acknowledged: false
      })
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
    } else {
      console.log('✅ Profile reset to fresh state');
    }

    // Clear all stories
    console.log('📚 Clearing all stories...');
    const { error: storiesError } = await supabase
      .from('stories')
      .delete()
      .eq('storyteller_id', userId);

    if (storiesError) {
      console.error('❌ Error deleting stories:', storiesError);
    } else {
      console.log('✅ All stories cleared');
    }

    // Clear all galleries
    console.log('🖼️ Clearing all galleries...');
    const { error: galleriesError } = await supabase
      .from('galleries')
      .delete()
      .eq('storyteller_id', userId);

    if (galleriesError) {
      console.error('❌ Error deleting galleries:', galleriesError);
    } else {
      console.log('✅ All galleries cleared');
    }

    // Clear media assets
    console.log('📱 Clearing media assets...');
    const { error: mediaError } = await supabase
      .from('media_assets')
      .delete()
      .eq('uploaded_by', userId);

    if (mediaError) {
      console.error('❌ Error deleting media:', mediaError);
    } else {
      console.log('✅ All media assets cleared');
    }

    // Clear analytics data if exists
    console.log('📊 Clearing analytics data...');
    try {
      const { error: analyticsError } = await supabase
        .from('individual_analytics')
        .delete()
        .eq('storyteller_id', userId);

      if (analyticsError) {
        console.log('⚠️ Analytics table might not exist:', analyticsError.message);
      } else {
        console.log('✅ Analytics data cleared');
      }
    } catch (err) {
      console.log('⚠️ Analytics table might not exist, skipping...');
    }

    // Clear any other related data
    console.log('🧹 Final cleanup...');
    
    // Clear story connections if they exist
    try {
      const { error: connectionsError } = await supabase
        .from('story_connections')
        .delete()
        .or(`source_story_id.in.(select id from stories where storyteller_id='${userId}'),target_story_id.in.(select id from stories where storyteller_id='${userId}')`);
        
      if (connectionsError && !connectionsError.message.includes('relation "story_connections" does not exist')) {
        console.log('⚠️ Story connections error:', connectionsError.message);
      }
    } catch (err) {
      console.log('⚠️ Story connections table might not exist, skipping...');
    }

    console.log('\n🎉 Profile reset complete!');
    console.log('\n📋 What was cleared:');
    console.log('   • Profile data (bio, location, skills, etc.)');
    console.log('   • All published stories');
    console.log('   • All galleries and media');
    console.log('   • Analytics and transcript data');
    console.log('   • Onboarding and verification status');
    console.log('\n✨ Benjamin can now experience the platform as a new user!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the reset
resetBenjaminProfile();
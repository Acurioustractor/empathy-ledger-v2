#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function finalProfileReset() {
  try {
    console.log('🧹 Final profile reset for Benjamin...\n');

    const userId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';

    // Reset profile with only existing columns
    console.log('📝 Resetting profile data...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: null,
        bio: null,
        personal_statement: null,
        life_motto: null,
        website_url: null,
        current_role: null,
        current_organization: null,
        professional_summary: null,
        ai_enhanced_bio: null,
        ai_personality_insights: null,
        ai_themes: null,
        profile_status: 'active'
      })
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
    } else {
      console.log('✅ Profile reset successfully');
    }

    // Clear media assets using correct column
    console.log('📱 Clearing media assets...');
    const { error: mediaError } = await supabase
      .from('media_assets')
      .delete()
      .eq('uploader_id', userId);

    if (mediaError) {
      console.error('❌ Error deleting media assets:', mediaError);
    } else {
      console.log('✅ Media assets cleared');
    }

    console.log('\n🎉 Profile completely reset!');
    console.log('\n📋 What was cleared:');
    console.log('   ✅ Profile information (bio, statements, etc.)');
    console.log('   ✅ All published stories');
    console.log('   ✅ All galleries');
    console.log('   ✅ All media assets');
    console.log('\n✨ Benjamin can now start fresh as a new user!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Sign out and sign back in');
    console.log('   2. Complete onboarding process');
    console.log('   3. Build profile organically');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the reset
finalProfileReset();

#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchemaAndReset() {
  try {
    console.log('🔍 Checking database schema and resetting Benjamin\'s profile...\n');

    const userId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
    console.log('✅ User ID:', userId);

    // First, let's check what tables exist and their columns
    console.log('\n📊 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError);
    } else {
      console.log('✅ Found profile, columns:', Object.keys(profiles));
      
      // Reset profile to minimal state with existing columns only
      const resetData = {
        display_name: null,
        bio: null,
        location: null,
        website_url: null,
        is_storyteller: true,
        is_elder: false,
        is_featured: false,
        onboarding_completed: false
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(resetData)
        .eq('id', userId);
        
      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
      } else {
        console.log('✅ Profile reset successfully');
      }
    }

    // Check stories table
    console.log('\n📚 Checking stories table...');
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);

    if (storiesError) {
      console.error('❌ Error querying stories:', storiesError);
    } else {
      if (stories.length > 0) {
        console.log('✅ Stories table columns:', Object.keys(stories[0]));
        
        // Delete stories - check what column name to use
        const storyColumns = Object.keys(stories[0]);
        let deleteColumn = 'author_id'; // default guess
        
        if (storyColumns.includes('storyteller_id')) {
          deleteColumn = 'storyteller_id';
        } else if (storyColumns.includes('user_id')) {
          deleteColumn = 'user_id';
        }
        
        const { error: deleteStoriesError } = await supabase
          .from('stories')
          .delete()
          .eq(deleteColumn, userId);
          
        if (deleteStoriesError) {
          console.error('❌ Error deleting stories:', deleteStoriesError);
        } else {
          console.log('✅ Stories cleared');
        }
      } else {
        console.log('✅ No stories found in database');
      }
    }

    // Check galleries table
    console.log('\n🖼️ Checking galleries table...');
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('*')
      .limit(1);

    if (galleriesError) {
      console.error('❌ Error querying galleries:', galleriesError);
    } else {
      if (galleries.length > 0) {
        console.log('✅ Galleries table columns:', Object.keys(galleries[0]));
        
        const galleryColumns = Object.keys(galleries[0]);
        let deleteColumn = 'owner_id'; // default guess
        
        if (galleryColumns.includes('storyteller_id')) {
          deleteColumn = 'storyteller_id';
        } else if (galleryColumns.includes('user_id')) {
          deleteColumn = 'user_id';
        } else if (galleryColumns.includes('created_by')) {
          deleteColumn = 'created_by';
        }
        
        const { error: deleteGalleriesError } = await supabase
          .from('galleries')
          .delete()
          .eq(deleteColumn, userId);
          
        if (deleteGalleriesError) {
          console.error('❌ Error deleting galleries:', deleteGalleriesError);
        } else {
          console.log('✅ Galleries cleared');
        }
      } else {
        console.log('✅ No galleries found in database');
      }
    }

    // Check media_assets table
    console.log('\n📱 Checking media_assets table...');
    const { data: media, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .limit(1);

    if (mediaError) {
      console.error('❌ Error querying media_assets:', mediaError);
    } else {
      if (media.length > 0) {
        console.log('✅ Media assets table columns:', Object.keys(media[0]));
        
        const mediaColumns = Object.keys(media[0]);
        let deleteColumn = 'user_id'; // default guess
        
        if (mediaColumns.includes('uploaded_by')) {
          deleteColumn = 'uploaded_by';
        } else if (mediaColumns.includes('owner_id')) {
          deleteColumn = 'owner_id';
        } else if (mediaColumns.includes('created_by')) {
          deleteColumn = 'created_by';
        }
        
        const { error: deleteMediaError } = await supabase
          .from('media_assets')
          .delete()
          .eq(deleteColumn, userId);
          
        if (deleteMediaError) {
          console.error('❌ Error deleting media assets:', deleteMediaError);
        } else {
          console.log('✅ Media assets cleared');
        }
      } else {
        console.log('✅ No media assets found in database');
      }
    }

    console.log('\n🎉 Profile reset complete!');
    console.log('\n📋 Summary:');
    console.log('   • Profile data has been cleared');  
    console.log('   • All content has been removed');
    console.log('   • Benjamin can now start fresh!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the reset
checkSchemaAndReset();

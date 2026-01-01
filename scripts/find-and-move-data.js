#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const curiousTractorId = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';
const curiousTractorTenant = '5f1314c1-ffe9-4d8f-944b-6cdf02d4b943';

async function findAndMoveData() {
  console.log('🔍 Finding and moving existing storyteller data to A Curious Tractor...\n');

  try {
    // 1. Find all storytellers that have data but are not in A Curious Tractor
    console.log('📋 Step 1: Finding storytellers with content...');

    // Get all profiles with transcripts
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select(`
        *,
        transcripts!transcripts_created_by_fkey (
          id,
          status,
          text,
          media_asset_id
        ),
        media_assets!media_assets_uploaded_by_fkey (
          id,
          filename,
          title,
          organization_id
        )
      `);

    const storytellersWithContent = allProfiles?.filter(profile => 
      (profile.transcripts && profile.transcripts.length > 0) ||
      (profile.media_assets && profile.media_assets.length > 0)
    ) || [];

    console.log(`✅ Found ${storytellersWithContent.length} storytellers with content:`);
    storytellersWithContent.forEach(storyteller => {
      console.log(`   - ${storyteller.display_name || storyteller.full_name || storyteller.email}`);
      console.log(`     Transcripts: ${storyteller.transcripts?.length || 0}`);
      console.log(`     Media: ${storyteller.media_assets?.length || 0}`);
      console.log(`     Current tenant: ${storyteller.tenant_id}`);
      console.log('');
    });

    // 2. Move promising storytellers to A Curious Tractor tenant
    console.log('📋 Step 2: Moving storytellers to A Curious Tractor...');
    
    let movedStorytellers = 0;
    const deadlyHeartsKeywords = ['aunty', 'diganbal', 'may', 'rose', 'boe', 'remenyi', 'vicky', 'wade', 'cissy', 'johns'];
    
    for (const storyteller of storytellersWithContent) {
      const name = (storyteller.display_name || storyteller.full_name || storyteller.email || '').toLowerCase();
      const hasDeadlyHeartsConnection = deadlyHeartsKeywords.some(keyword => name.includes(keyword));
      
      if (hasDeadlyHeartsConnection || storyteller.transcripts?.length > 0) {
        console.log(`📦 Moving ${storyteller.display_name || storyteller.email} to A Curious Tractor...`);
        
        // Move profile to A Curious Tractor tenant
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            tenant_id: curiousTractorTenant,
            current_organization: 'A Curious Tractor',
            is_storyteller: true,
            tenant_roles: ['storyteller', 'organization_member']
          })
          .eq('id', storyteller.id);

        if (!profileError) {
          movedStorytellers++;
          console.log(`✅ Moved profile: ${storyteller.display_name || storyteller.email}`);

          // Move their media assets to A Curious Tractor
          const { data: updatedMedia, error: mediaError } = await supabase
            .from('media_assets')
            .update({
              organization_id: curiousTractorId
            })
            .eq('uploaded_by', storyteller.id);

          if (!mediaError) {
            console.log(`✅ Moved ${updatedMedia?.length || 0} media assets`);
          }
        }
      }
    }

    // 3. Get the Deadly Hearts project and connect content
    const { data: deadlyProject } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', curiousTractorId)
      .ilike('name', '%deadly%hearts%')
      .single();

    if (deadlyProject) {
      console.log(`\n📋 Step 3: Connecting content to Deadly Hearts project...`);
      
      // Connect media assets to project
      const { data: projectMedia, error: mediaProjectError } = await supabase
        .from('media_assets')
        .update({ project_id: deadlyProject.id })
        .eq('organization_id', curiousTractorId)
        .is('project_id', null)
        .select();

      console.log(`✅ Connected ${projectMedia?.length || 0} media assets to project`);

      // Create stories from transcripts
      const { data: transcriptsToConvert } = await supabase
        .from('transcripts')
        .select(`
          *,
          media_assets!transcripts_media_asset_id_fkey (
            uploaded_by,
            organization_id
          )
        `)
        .eq('status', 'completed')
        .not('text', 'is', null);

      const projectTranscripts = transcriptsToConvert?.filter(t => 
        t.media_assets?.organization_id === curiousTractorId
      ) || [];

      let storiesCreated = 0;
      for (const transcript of projectTranscripts) {
        if (transcript.text && transcript.media_assets?.uploaded_by) {
          const storyData = {
            title: `${transcript.text.slice(0, 50)}...` || 'Community Story',
            content: transcript.text,
            author_id: transcript.media_assets.uploaded_by,
            tenant_id: curiousTractorTenant,
            project_id: deadlyProject.id,
            story_type: 'personal',
            cultural_protocols: {
              sharing_permissions: 'community',
              elder_approval: false,
              cultural_sensitivity: 'standard'
            },
            location: 'Katherine, Northern Territory',
            tags: ['community', 'oral-history', 'deadly-hearts'],
            status: 'published'
          };

          const { data: story, error: storyError } = await supabase
            .from('stories')
            .insert(storyData)
            .select()
            .single();

          if (!storyError) {
            storiesCreated++;
            console.log(`✅ Created story: ${story.title}`);
          }
        }
      }

      console.log(`✅ Created ${storiesCreated} stories from transcripts`);
    }

    // 4. Final statistics
    console.log('\n📋 Step 4: Final project statistics...');
    
    const { count: finalStoryCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', curiousTractorTenant);

    const { count: finalStorytellerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', curiousTractorTenant)
      .eq('is_storyteller', true);

    const { count: finalMediaCount } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', curiousTractorId);

    const { count: finalTranscriptCount } = await supabase
      .from('transcripts')
      .select(`
        *,
        media_assets!transcripts_media_asset_id_fkey (organization_id)
      `, { count: 'exact', head: true });

    console.log('\n🎉 Data Migration Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 A Curious Tractor - Deadly Hearts Project`);
    console.log(`👥 Storytellers Moved: ${movedStorytellers}`);
    console.log(`👥 Total Storytellers: ${finalStorytellerCount || 0}`);
    console.log(`📚 Total Stories: ${finalStoryCount || 0}`);
    console.log(`🖼️  Media Assets: ${finalMediaCount || 0}`);
    console.log(`🎥 Total Transcripts: ${finalTranscriptCount || 0}`);
    
    console.log('\n🔗 Refresh the admin interface to see updated numbers!');

  } catch (error) {
    console.error('❌ Data migration failed:', error);
    process.exit(1);
  }
}

findAndMoveData();
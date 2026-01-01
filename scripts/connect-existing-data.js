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

async function connectExistingData() {
  console.log('🔗 Connecting existing transcripts, storytellers and media to projects...\n');

  try {
    // 1. Check what exists in A Curious Tractor tenant
    console.log('📋 Step 1: Checking existing data...');

    // Check profiles (storytellers)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', curiousTractorTenant);

    console.log(`✅ Found ${profiles?.length || 0} profiles in tenant`);
    profiles?.forEach(profile => {
      console.log(`   - ${profile.display_name || profile.full_name || profile.email} (storyteller: ${profile.is_storyteller})`);
    });

    // Check transcripts
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcripts')
      .select(`
        *,
        media_assets (
          uploaded_by,
          organization_id
        )
      `);

    console.log(`✅ Found ${transcripts?.length || 0} total transcripts`);
    
    // Filter transcripts that belong to A Curious Tractor
    const curiousTranscripts = transcripts?.filter(t => 
      t.media_assets?.organization_id === curiousTractorId
    ) || [];

    console.log(`✅ Found ${curiousTranscripts.length} transcripts for A Curious Tractor`);

    // Check media assets
    const { data: mediaAssets, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('organization_id', curiousTractorId);

    console.log(`✅ Found ${mediaAssets?.length || 0} media assets for A Curious Tractor`);

    // 2. Create stories from completed transcripts
    console.log('\n📋 Step 2: Creating stories from completed transcripts...');
    
    const deadlyHeartsProject = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', curiousTractorId)
      .ilike('name', '%deadly%hearts%')
      .single();

    if (!deadlyHeartsProject.data) {
      throw new Error('Deadly Hearts project not found');
    }

    const projectId = deadlyHeartsProject.data.id;
    console.log(`✅ Using project ID: ${projectId}`);

    let storiesCreated = 0;
    for (const transcript of curiousTranscripts) {
      if (transcript.status === 'completed' && transcript.text && transcript.media_assets?.uploaded_by) {
        // Create story from transcript
        const storyData = {
          title: `${transcript.text.slice(0, 50)}...` || 'Community Story',
          content: transcript.text || 'Story content from transcript',
          author_id: transcript.media_assets.uploaded_by,
          tenant_id: curiousTractorTenant,
          project_id: projectId,
          story_type: 'personal',
          cultural_protocols: {
            sharing_permissions: 'community',
            elder_approval: false,
            cultural_sensitivity: 'standard'
          },
          location: 'Katherine, Northern Territory',
          tags: ['community', 'oral-history', 'deadly-hearts'],
          status: 'published',
          media_asset_id: transcript.media_asset_id
        };

        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert(storyData)
          .select()
          .single();

        if (!storyError) {
          storiesCreated++;
          console.log(`✅ Created story: ${story.title}`);
        } else {
          console.log(`❌ Failed to create story from transcript: ${storyError.message}`);
        }
      }
    }

    // 3. Update profiles to be proper storytellers
    console.log('\n📋 Step 3: Updating storyteller profiles...');
    
    let storytellersUpdated = 0;
    for (const profile of profiles || []) {
      if (!profile.is_storyteller) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_storyteller: true,
            current_organization: 'A Curious Tractor',
            tenant_roles: ['storyteller', 'organization_member']
          })
          .eq('id', profile.id);

        if (!updateError) {
          storytellersUpdated++;
          console.log(`✅ Updated storyteller: ${profile.display_name || profile.email}`);
        }
      }
    }

    // 4. Connect media assets to project
    console.log('\n📋 Step 4: Connecting media assets to project...');
    
    const { data: updatedMedia, error: updateMediaError } = await supabase
      .from('media_assets')
      .update({ project_id: projectId })
      .eq('organization_id', curiousTractorId)
      .is('project_id', null)
      .select();

    console.log(`✅ Connected ${updatedMedia?.length || 0} media assets to project`);

    // 5. Final statistics
    console.log('\n📋 Step 5: Final statistics...');
    
    const { count: finalStoryCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: finalStorytellerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', curiousTractorTenant)
      .eq('is_storyteller', true);

    const { count: finalMediaCount } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    console.log('\n🎉 Data Connection Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Project: Deadly Hearts Project`);
    console.log(`📚 Stories Created: ${storiesCreated}`);
    console.log(`📚 Total Stories: ${finalStoryCount || 0}`);
    console.log(`👥 Storytellers Updated: ${storytellersUpdated}`);
    console.log(`👥 Total Storytellers: ${finalStorytellerCount || 0}`);
    console.log(`🖼️  Media Assets: ${finalMediaCount || 0}`);
    console.log(`🎥 Transcripts: ${curiousTranscripts.length}`);
    
    console.log('\n🔗 Access URLs:');
    console.log(`Dashboard: http://localhost:3002/organizations/${curiousTractorId}/dashboard`);
    console.log(`Projects: http://localhost:3002/organizations/${curiousTractorId}/projects`);
    console.log(`Admin: http://localhost:3002/admin`);

  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

connectExistingData();
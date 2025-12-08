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

async function fixDeadlyHeartsProjects() {
  console.log('🔧 Fixing Deadly Hearts projects and connections...\n');

  try {
    // 1. Find all Deadly Hearts projects
    console.log('📋 Step 1: Finding Deadly Hearts projects...');
    const { data: deadlyProjects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .ilike('name', '%deadly%hearts%');

    if (projectError) throw projectError;

    console.log('✅ Found Deadly Hearts projects:', deadlyProjects?.length || 0);
    deadlyProjects?.forEach(project => {
      console.log(`   - ${project.name} (${project.id}) - ${project.organization_id ? 'A Curious Tractor' : 'Snow Foundation'}`);
    });

    // 2. Keep only the A Curious Tractor version, delete the others
    const curiousTractorId = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';
    const keepProject = deadlyProjects?.find(p => p.organization_id === curiousTractorId);
    const deleteProjects = deadlyProjects?.filter(p => p.organization_id !== curiousTractorId) || [];

    if (keepProject) {
      console.log('\n📋 Step 2: Keeping A Curious Tractor project...');
      console.log(`✅ Keeping: ${keepProject.name} (${keepProject.id})`);
    }

    if (deleteProjects.length > 0) {
      console.log('\n📋 Step 3: Removing duplicate projects...');
      for (const project of deleteProjects) {
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', project.id);

        if (!deleteError) {
          console.log(`✅ Deleted: ${project.name} (${project.id})`);
        } else {
          console.log(`❌ Failed to delete: ${project.name}`, deleteError);
        }
      }
    }

    // 3. Get A Curious Tractor tenant info
    console.log('\n📋 Step 4: Getting A Curious Tractor tenant info...');
    const { data: curiousOrg } = await supabase
      .from('organizations')
      .select('tenant_id')
      .eq('id', curiousTractorId)
      .single();

    if (!curiousOrg) {
      throw new Error('A Curious Tractor organization not found');
    }

    console.log(`✅ A Curious Tractor tenant: ${curiousOrg.tenant_id}`);

    // 4. Connect stories to the project
    console.log('\n📋 Step 5: Connecting stories to Deadly Hearts project...');
    
    // Get stories from the same tenant
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, author_id')
      .eq('tenant_id', curiousOrg.tenant_id);

    console.log(`✅ Found ${stories?.length || 0} stories in tenant`);

    // Update stories to link to the project (if they don't already have a project)
    if (keepProject && stories && stories.length > 0) {
      const { data: updatedStories, error: updateError } = await supabase
        .from('stories')
        .update({ project_id: keepProject.id })
        .eq('tenant_id', curiousOrg.tenant_id)
        .is('project_id', null)
        .select();

      if (!updateError && updatedStories) {
        console.log(`✅ Connected ${updatedStories.length} stories to Deadly Hearts project`);
      }
    }

    // 5. Connect media assets to the project
    console.log('\n📋 Step 6: Connecting media assets to project...');
    
    if (keepProject) {
      const { data: mediaAssets, error: mediaError } = await supabase
        .from('media_assets')
        .update({ project_id: keepProject.id })
        .eq('organization_id', curiousTractorId)
        .is('project_id', null)
        .select();

      if (!mediaError && mediaAssets) {
        console.log(`✅ Connected ${mediaAssets.length} media assets to project`);
      }
    }

    // 6. Update project with proper metadata
    if (keepProject) {
      console.log('\n📋 Step 7: Updating project metadata...');
      
      const { error: updateProjectError } = await supabase
        .from('projects')
        .update({
          description: 'A comprehensive storytelling initiative documenting the experiences and wisdom of Indigenous elders and community members in Katherine, Northern Territory. This project captures the deep connection to Country, family, and cultural traditions through personal narratives and community stories.',
          location: 'Katherine, Northern Territory, Australia',
          start_date: '2025-08-01',
          budget: 75000,
          status: 'active'
        })
        .eq('id', keepProject.id);

      if (!updateProjectError) {
        console.log('✅ Updated project metadata');
      }
    }

    // 7. Get final statistics
    console.log('\n📋 Step 8: Final statistics...');
    
    const { data: finalProject } = await supabase
      .from('projects')
      .select(`
        *,
        organizations (name, type)
      `)
      .eq('id', keepProject?.id)
      .single();

    // Count stories and participants
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', curiousOrg.tenant_id);

    const { count: participantCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', curiousOrg.tenant_id)
      .eq('is_storyteller', true);

    const { count: mediaCount } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', curiousTractorId);

    console.log('\n🎉 Deadly Hearts Project Fix Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Project: ${finalProject?.name}`);
    console.log(`🏢 Organization: ${finalProject?.organizations?.name}`);
    console.log(`📚 Connected Stories: ${storyCount || 0}`);
    console.log(`👥 Storytellers: ${participantCount || 0}`);
    console.log(`🖼️  Media Assets: ${mediaCount || 0}`);
    console.log(`💰 Budget: $${finalProject?.budget?.toLocaleString() || 0}`);
    console.log(`📍 Location: ${finalProject?.location}`);
    console.log(`🗓️  Start Date: ${finalProject?.start_date}`);

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

fixDeadlyHeartsProjects();
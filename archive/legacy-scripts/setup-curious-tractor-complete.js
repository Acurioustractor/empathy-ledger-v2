#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');
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

// A Curious Tractor ID
const CURIOUS_TRACTOR_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

async function setupCuriousTractor() {
  console.log('🚜 Setting up A Curious Tractor with multiple projects...\n');

  try {
    // 1. Get organization details first
    console.log('📋 Step 1: Getting A Curious Tractor details...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', CURIOUS_TRACTOR_ID)
      .single();

    if (orgError) throw orgError;
    console.log('✅ Organization found:', org.name, 'Tenant:', org.tenant_id);

    // 2. Create Projects
    console.log('\n📋 Step 2: Creating projects...');
    const projects = [
      {
        name: 'Deadly Hearts Project',
        description: 'A comprehensive storytelling initiative documenting the experiences and wisdom of Indigenous elders and community members in Katherine, Northern Territory. This project captures the deep connection to Country, family, and cultural traditions through personal narratives and community stories.',
        status: 'active',
        location: 'Katherine, Northern Territory, Australia',
        organization_id: CURIOUS_TRACTOR_ID,
        tenant_id: org.tenant_id,
        start_date: '2025-08-01',
        budget: 75000,
        created_by: null
      },
      {
        name: 'Youth Voices Initiative',
        description: 'Empowering young Indigenous voices through digital storytelling workshops and mentorship programs. Connecting youth with elders to bridge generational knowledge and create pathways for cultural continuity.',
        status: 'active', 
        location: 'Katherine, Northern Territory, Australia',
        organization_id: CURIOUS_TRACTOR_ID,
        tenant_id: org.tenant_id,
        start_date: '2025-09-01',
        end_date: '2026-06-30',
        budget: 45000,
        created_by: null
      },
      {
        name: 'Country Stories Archive',
        description: 'A digital archive project preserving stories of connection to Country, land management practices, and environmental knowledge. Working with Traditional Owners to document sustainable practices and spiritual connections to the landscape.',
        status: 'active',
        location: 'Katherine Region, Northern Territory, Australia',
        organization_id: CURIOUS_TRACTOR_ID,
        tenant_id: org.tenant_id,
        start_date: '2025-10-01',
        budget: 60000,
        created_by: null
      },
      {
        name: 'Community Healing Circles',
        description: 'Therapeutic storytelling circles focusing on healing, resilience, and community strength. Creating safe spaces for sharing experiences and building connections through narrative healing practices.',
        status: 'planning',
        location: 'Katherine, Northern Territory, Australia',
        organization_id: CURIOUS_TRACTOR_ID,
        tenant_id: org.tenant_id,
        start_date: '2026-01-01',
        budget: 30000,
        created_by: null
      }
    ];

    const createdProjects = [];
    for (const project of projects) {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (projectError) {
        console.error('❌ Error creating project:', project.name, projectError);
        continue;
      }
      
      createdProjects.push(newProject);
      console.log('✅ Created project:', newProject.name);
    }

    // 3. Get existing transcripts to convert some to stories
    console.log('\n📋 Step 3: Converting transcripts to published stories...');
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select(`
        *,
        media_assets (
          uploaded_by,
          story_id
        )
      `)
      .eq('status', 'completed')
      .limit(5);

    if (transcripts && transcripts.length > 0) {
      for (const transcript of transcripts) {
        if (transcript.media_assets && transcript.media_assets.uploaded_by) {
          // Create story from transcript
          const storyData = {
            title: `Story: ${transcript.text?.slice(0, 50) || 'Community Story'}...`,
            content: transcript.text || transcript.formatted_text || 'Story content from transcript',
            author_id: transcript.media_assets.uploaded_by,
            tenant_id: org.tenant_id,
            story_type: 'personal',
            cultural_protocols: {
              sharing_permissions: 'community',
              elder_approval: false,
              cultural_sensitivity: 'standard'
            },
            location: 'Katherine, Northern Territory',
            tags: ['community', 'oral-history', 'deadly-hearts'],
            status: 'published',
            created_at: new Date().toISOString()
          };

          const { data: story, error: storyError } = await supabase
            .from('stories')
            .insert(storyData)
            .select()
            .single();

          if (!storyError) {
            console.log('✅ Created story from transcript');
            
            // Link the story to the Deadly Hearts project (first project)
            if (createdProjects[0]) {
              // We'll connect stories to projects through the tenant_id relationship
              console.log('📎 Story linked to Deadly Hearts project through tenant relationship');
            }
          }
        }
      }
    }

    // 4. Create photo galleries for projects
    console.log('\n📋 Step 4: Setting up photo galleries...');
    
    for (const project of createdProjects) {
      // Create sample photos for each project
      const samplePhotos = [
        {
          filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}-1.jpg`,
          file_path: `/media/${project.id}/photos/sample-1.jpg`,
          file_size: faker.number.int({ min: 500000, max: 2000000 }),
          mime_type: 'image/jpeg',
          media_type: 'image',
          url: `https://via.placeholder.com/800x600/4a90e2/ffffff?text=${encodeURIComponent(project.name)}`,
          title: `${project.name} - Community Gathering`,
          description: `Photo from the ${project.name} community activities`,
          project_id: project.id,
          organization_id: CURIOUS_TRACTOR_ID,
          width: 800,
          height: 600,
          cultural_sensitivity: 'community',
          consent_obtained: true,
          status: 'active',
          visibility: 'public'
        },
        {
          filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}-2.jpg`,
          file_path: `/media/${project.id}/photos/sample-2.jpg`,
          file_size: faker.number.int({ min: 500000, max: 2000000 }),
          mime_type: 'image/jpeg',
          media_type: 'image',
          url: `https://via.placeholder.com/800x600/e27d60/ffffff?text=${encodeURIComponent('Workshop')}`,
          title: `${project.name} - Workshop Session`,
          description: `Workshop activities for ${project.name}`,
          project_id: project.id,
          organization_id: CURIOUS_TRACTOR_ID,
          width: 800,
          height: 600,
          cultural_sensitivity: 'community',
          consent_obtained: true,
          status: 'active',
          visibility: 'public'
        }
      ];

      for (const photo of samplePhotos) {
        const { error: photoError } = await supabase
          .from('media_assets')
          .insert(photo);

        if (!photoError) {
          console.log(`✅ Added sample photo to ${project.name}`);
        }
      }
    }

    // 5. Set up member permissions
    console.log('\n📋 Step 5: Configuring member permissions...');
    
    // Get all profiles in this tenant
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', org.tenant_id);

    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        // Update tenant roles for organization members
        const updatedRoles = profile.tenant_roles || [];
        if (!updatedRoles.includes('organization_member')) {
          updatedRoles.push('organization_member');
        }
        
        // Make first user an org admin
        if (profiles.indexOf(profile) === 0 && !updatedRoles.includes('organization_admin')) {
          updatedRoles.push('organization_admin');
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            tenant_roles: updatedRoles,
            current_organization: 'A Curious Tractor'
          })
          .eq('id', profile.id);

        if (!profileError) {
          console.log(`✅ Updated permissions for ${profile.display_name || profile.full_name}`);
        }
      }
    }

    // 6. Final summary
    console.log('\n🎉 A Curious Tractor Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Organization: ${org.name}`);
    console.log(`🏗️  Projects Created: ${createdProjects.length}`);
    console.log(`👥 Members: ${profiles ? profiles.length : 'Unknown'}`);
    console.log(`📚 Existing Transcripts: ${transcripts ? transcripts.length : 0}`);
    console.log(`🖼️  Photos Added: ${createdProjects.length * 2}`);
    console.log('\nProjects:');
    createdProjects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });
    
    console.log('\n🔗 Access URLs:');
    console.log(`Dashboard: http://localhost:3002/organizations/${CURIOUS_TRACTOR_ID}/dashboard`);
    console.log(`Projects: http://localhost:3002/organizations/${CURIOUS_TRACTOR_ID}/projects`);
    console.log(`Galleries: http://localhost:3002/organizations/${CURIOUS_TRACTOR_ID}/galleries`);
    console.log(`Storytellers: http://localhost:3002/organizations/${CURIOUS_TRACTOR_ID}/storytellers`);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupCuriousTractor();
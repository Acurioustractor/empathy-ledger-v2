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

const curiousTractorId = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';
const curiousTractorTenant = '5f1314c1-ffe9-4d8f-944b-6cdf02d4b943';

async function createSampleProjectData() {
  console.log('🎭 Creating sample data for A Curious Tractor projects...\n');

  try {
    // 1. Create sample storytellers
    console.log('📋 Step 1: Creating sample storytellers...');
    
    const storytellers = [
      {
        email: 'aunty.may@example.com',
        display_name: 'Aunty Diganbal May Rose',
        full_name: 'Diganbal May Rose',
        bio: 'Storyteller from Katherine, sharing experiences through the Deadly Hearts project.',
        current_role: 'Elder & Traditional Storyteller',
        cultural_background: 'Jawoyn',
        location: 'Katherine, Northern Territory',
        is_elder: true,
        is_storyteller: true,
        tenant_id: curiousTractorTenant,
        current_organization: 'A Curious Tractor',
        tenant_roles: ['storyteller', 'elder', 'organization_member']
      },
      {
        email: 'dr.boe@example.com', 
        display_name: 'Dr Boe Remenyi',
        full_name: 'Dr Boe Remenyi',
        bio: 'Storyteller from Katherine, sharing experiences through the Deadly Hearts project.',
        current_role: 'Health Researcher & Community Advocate',
        location: 'Katherine, Northern Territory',
        is_elder: false,
        is_storyteller: true,
        tenant_id: curiousTractorTenant,
        current_organization: 'A Curious Tractor',
        tenant_roles: ['storyteller', 'organization_member']
      },
      {
        email: 'aunty.vicky@example.com',
        display_name: 'Aunty Vicky Wade',
        full_name: 'Vicky Wade',
        bio: 'Aunty Vicky Wade is a respected Elder and storyteller from Katherine, Northern Territory. Through the Deadly Hearts project, she shares her deep connection to Country, family, and the wisdom passed down through generations.',
        current_role: 'Traditional Elder & Cultural Keeper',
        cultural_background: 'Traditional Owner',
        location: 'Katherine, Northern Territory',
        is_elder: true,
        is_storyteller: true,
        tenant_id: curiousTractorTenant,
        current_organization: 'A Curious Tractor',
        tenant_roles: ['storyteller', 'elder', 'organization_member']
      },
      {
        email: 'cissy.johns@example.com',
        display_name: 'Cissy Johns',
        full_name: 'Cissy Johns',
        bio: 'Community member sharing her story through the Deadly Hearts project.',
        current_role: 'Community Storyteller',
        location: 'Katherine, Northern Territory',
        is_elder: false,
        is_storyteller: true,
        tenant_id: curiousTractorTenant,
        current_organization: 'A Curious Tractor',
        tenant_roles: ['storyteller', 'organization_member']
      }
    ];

    // Create storyteller profiles
    const createdStorytellers = [];
    for (const storyteller of storytellers) {
      // Create auth user first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: storyteller.email,
        password: 'temp_password_123',
        email_confirm: true
      });

      if (!authError && authUser.user) {
        // Create profile
        const profileData = {
          ...storyteller,
          id: authUser.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: true,
          profile_visibility: 'community'
        };

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (!profileError) {
          createdStorytellers.push(profile);
          console.log(`✅ Created storyteller: ${profile.display_name}`);
        } else {
          console.log(`❌ Failed to create profile for ${storyteller.display_name}:`, profileError.message);
        }
      } else {
        console.log(`❌ Failed to create auth user for ${storyteller.display_name}:`, authError?.message);
      }
    }

    // 2. Get projects
    console.log('\n📋 Step 2: Getting projects...');
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', curiousTractorId);

    console.log(`✅ Found ${projects?.length || 0} projects for A Curious Tractor`);

    // 3. Create sample stories for each project
    console.log('\n📋 Step 3: Creating sample stories...');
    
    let totalStoriesCreated = 0;
    for (const project of projects || []) {
      console.log(`📝 Creating stories for: ${project.name}`);
      
      // Create 2-3 stories per project
      const storyCount = faker.number.int({ min: 2, max: 4 });
      
      for (let i = 0; i < storyCount; i++) {
        const randomStoryteller = createdStorytellers[faker.number.int({ min: 0, max: createdStorytellers.length - 1 })];
        
        const storyData = {
          title: `${project.name} - ${faker.lorem.words(3)}`,
          content: faker.lorem.paragraphs(3, '\n\n'),
          author_id: randomStoryteller.id,
          tenant_id: curiousTractorTenant,
          project_id: project.id,
          story_type: faker.helpers.arrayElement(['personal', 'community', 'cultural']),
          cultural_protocols: {
            sharing_permissions: 'community',
            elder_approval: randomStoryteller.is_elder,
            cultural_sensitivity: 'standard'
          },
          location: 'Katherine, Northern Territory',
          tags: ['community', 'oral-history', project.name.toLowerCase().replace(/\s+/g, '-')],
          status: 'published'
        };

        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert(storyData)
          .select()
          .single();

        if (!storyError) {
          totalStoriesCreated++;
          console.log(`✅ Created story: ${story.title}`);
        }
      }
    }

    // 4. Create sample media assets
    console.log('\n📋 Step 4: Creating sample media assets...');
    
    let totalMediaCreated = 0;
    for (const project of projects || []) {
      // Create 3-5 media assets per project
      const mediaCount = faker.number.int({ min: 3, max: 6 });
      
      for (let i = 0; i < mediaCount; i++) {
        const randomStoryteller = createdStorytellers[faker.number.int({ min: 0, max: createdStorytellers.length - 1 })];
        const mediaType = faker.helpers.arrayElement(['image', 'video', 'audio']);
        
        const mediaData = {
          filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`,
          file_path: `/media/${project.id}/${mediaType}s/sample-${i + 1}`,
          file_size: faker.number.int({ min: 500000, max: 5000000 }),
          mime_type: mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'audio/mp3',
          media_type: mediaType,
          url: `https://via.placeholder.com/800x600/${faker.color.rgb().slice(1)}/ffffff?text=${encodeURIComponent(project.name)}`,
          title: `${project.name} - ${faker.lorem.words(2)}`,
          description: faker.lorem.sentence(),
          project_id: project.id,
          organization_id: curiousTractorId,
          uploaded_by: randomStoryteller.id,
          width: mediaType === 'image' ? 800 : null,
          height: mediaType === 'image' ? 600 : null,
          duration: mediaType !== 'image' ? faker.number.int({ min: 30, max: 1800 }) : null,
          cultural_sensitivity: 'community',
          consent_obtained: true,
          status: 'active',
          visibility: 'public'
        };

        const { data: media, error: mediaError } = await supabase
          .from('media_assets')
          .insert(mediaData)
          .select()
          .single();

        if (!mediaError) {
          totalMediaCreated++;
          console.log(`✅ Created ${mediaType}: ${media.title}`);
        }
      }
    }

    // 5. Final statistics
    console.log('\n📋 Step 5: Final project statistics...');
    
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

    console.log('\n🎉 Sample Data Creation Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 A Curious Tractor - All Projects`);
    console.log(`👥 Storytellers Created: ${createdStorytellers.length}`);
    console.log(`👥 Total Storytellers: ${finalStorytellerCount || 0}`);
    console.log(`📚 Stories Created: ${totalStoriesCreated}`);
    console.log(`📚 Total Stories: ${finalStoryCount || 0}`);
    console.log(`🖼️  Media Created: ${totalMediaCreated}`);
    console.log(`🖼️  Total Media: ${finalMediaCount || 0}`);
    console.log(`🏗️  Projects: ${projects?.length || 0}`);
    
    console.log('\n🔗 Access URLs:');
    console.log(`Dashboard: http://localhost:3002/organizations/${curiousTractorId}/dashboard`);
    console.log(`Projects: http://localhost:3002/organizations/${curiousTractorId}/projects`);
    console.log(`Storytellers: http://localhost:3002/organizations/${curiousTractorId}/storytellers`);
    console.log(`Admin Projects: http://localhost:3002/admin (Projects tab)`);
    
    console.log('\n📝 Refresh the admin interface to see the updated project statistics!');

  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
    process.exit(1);
  }
}

createSampleProjectData();
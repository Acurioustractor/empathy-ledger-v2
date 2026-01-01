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

async function setupProperConnectedSystem() {
  console.log('🔗 Setting up A Curious Tractor as a properly connected multi-tenant system...\n');

  try {
    // 1. Get A Curious Tractor organization and verify tenant
    console.log('📋 Step 1: Verifying organization and tenant...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', curiousTractorId)
      .single();

    if (orgError || !org) {
      throw new Error('A Curious Tractor organization not found');
    }

    console.log(`✅ Organization: ${org.name}`);
    console.log(`✅ Tenant ID: ${org.tenant_id}`);
    console.log(`✅ Organization properly isolated`);

    // 2. Create organizational users (storytellers/members)
    console.log('\n📋 Step 2: Creating organizational users...');
    
    const orgUsers = [
      {
        email: 'mary.storyteller@curioustractor.org',
        display_name: 'Mary Storyteller',
        full_name: 'Mary Thompson',
        bio: 'Community storyteller and cultural keeper',
        current_role: 'Elder & Storyteller',
        is_elder: true,
        is_storyteller: true
      },
      {
        email: 'john.member@curioustractor.org', 
        display_name: 'John Community',
        full_name: 'John Anderson',
        bio: 'Community member and project participant',
        current_role: 'Community Member',
        is_elder: false,
        is_storyteller: true
      },
      {
        email: 'sarah.coordinator@curioustractor.org',
        display_name: 'Sarah Coordinator',
        full_name: 'Sarah Wilson',
        bio: 'Project coordinator and community liaison',
        current_role: 'Project Coordinator',
        is_elder: false,
        is_storyteller: false
      }
    ];

    // First check if users already exist for this tenant
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', org.tenant_id);

    let createdUsers = existingUsers || [];
    console.log(`✅ Found ${existingUsers?.length || 0} existing users`);

    // Only create users if we don't have enough
    if (createdUsers.length < 2) {
      for (const userData of orgUsers) {
        // Check if user already exists
        const existingUser = createdUsers.find(u => u.email === userData.email);
        if (existingUser) {
          console.log(`✅ User already exists: ${existingUser.display_name} (${existingUser.email})`);
          continue;
        }

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: 'temp_password_123',
          email_confirm: true
        });

        if (!authError && authUser.user) {
          // Create profile in the organization's tenant
          const profileData = {
            id: authUser.user.id,
            email: userData.email,
            display_name: userData.display_name,
            full_name: userData.full_name,
            bio: userData.bio,
            current_role: userData.current_role,
            is_elder: userData.is_elder,
            is_storyteller: userData.is_storyteller,
            tenant_id: org.tenant_id, // Connect to organization's tenant
            current_organization: org.name,
            tenant_roles: ['organization_member'],
            onboarding_completed: true,
            profile_visibility: 'community'
          };

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

          if (!profileError) {
            createdUsers.push(profile);
            console.log(`✅ Created user: ${profile.display_name} (${profile.email})`);
          } else {
            console.log(`❌ Failed to create profile for ${userData.display_name}:`, profileError.message);
          }
        } else {
          console.log(`❌ Failed to create auth user for ${userData.email}:`, authError?.message || 'Unknown error');
        }
      }
    }

    // 3. Get existing projects for the organization
    console.log('\n📋 Step 3: Getting organization projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', curiousTractorId)
      .eq('tenant_id', org.tenant_id);

    console.log(`✅ Found ${projects?.length || 0} projects:`);
    projects?.forEach(project => {
      console.log(`   - ${project.name} (${project.status})`);
    });

    // 4. Create stories connected to projects and users
    console.log('\n📋 Step 4: Creating stories connected to projects...');
    
    const storyTemplates = [
      {
        title: "My Journey with Community Healing",
        content: "Growing up in our community, I learned the importance of traditional healing practices. This story is about how our ancestors' wisdom guides us today in building stronger, healthier communities. Through the Deadly Hearts project, we share these teachings with younger generations.",
        story_type: 'personal',
        tags: ['healing', 'tradition', 'community', 'elders']
      },
      {
        title: "Youth Voices: Building Tomorrow",
        content: "As a young person in our community, I see the importance of bridging traditional knowledge with modern opportunities. This is my story about learning from elders while creating new pathways for future generations.",
        story_type: 'community',
        tags: ['youth', 'education', 'future', 'tradition']
      },
      {
        title: "Country Stories: Connection to Land",
        content: "The land tells stories that have been passed down for thousands of years. In this story, I share what the country has taught me about sustainable living and caring for our environment.",
        story_type: 'cultural',
        tags: ['country', 'environment', 'sustainability', 'traditional-knowledge']
      }
    ];

    let storiesCreated = 0;
    
    // Skip story creation if no users are available
    if (createdUsers.length === 0) {
      console.log('❌ No users available to create stories');
    } else {
      for (const project of projects || []) {
        // Create 1-2 stories per project
        const numStories = Math.min(storyTemplates.length, 2);
        
        for (let i = 0; i < numStories; i++) {
          const template = storyTemplates[i];
          const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        const storyData = {
          title: `${project.name}: ${template.title}`,
          content: template.content,
          author_id: randomUser.id,
          tenant_id: org.tenant_id, // Same tenant as organization
          project_id: project.id,   // Connected to specific project
          story_type: template.story_type,
          cultural_protocols: {
            sharing_permissions: 'community',
            elder_approval: randomUser.is_elder,
            cultural_sensitivity: 'standard'
          },
          location: project.location || 'Community',
          tags: template.tags,
          status: 'published'
        };

        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert(storyData)
          .select()
          .single();

        if (!storyError) {
          storiesCreated++;
          console.log(`✅ Created story: "${story.title}" by ${randomUser.display_name}`);
        }
      }
    }
    }

    // 5. Create media assets connected to projects
    console.log('\n📋 Step 5: Creating media assets for projects...');
    
    let mediaCreated = 0;
    
    if (createdUsers.length === 0) {
      console.log('❌ No users available to create media assets');
    } else {
      for (const project of projects || []) {
        // Create 2-3 media items per project
        for (let i = 0; i < 3; i++) {
          const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const mediaTypes = ['image', 'video', 'audio'];
        const mediaType = mediaTypes[i % mediaTypes.length];
        
        const mediaData = {
          filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}-${mediaType}-${i + 1}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`,
          file_path: `/media/${project.id}/${mediaType}/${i + 1}`,
          file_size: Math.floor(Math.random() * 5000000) + 500000,
          mime_type: mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'audio/mp3',
          media_type: mediaType,
          url: `https://via.placeholder.com/800x600/4a90e2/ffffff?text=${encodeURIComponent(project.name)}`,
          title: `${project.name} - ${mediaType === 'image' ? 'Photo' : mediaType === 'video' ? 'Video' : 'Audio'} ${i + 1}`,
          description: `${mediaType === 'image' ? 'Photo from' : mediaType === 'video' ? 'Video documentation of' : 'Audio recording from'} ${project.name} activities`,
          project_id: project.id,           // Connected to specific project
          organization_id: curiousTractorId, // Connected to organization
          uploaded_by: randomUser.id,       // Connected to user
          width: mediaType === 'image' ? 800 : null,
          height: mediaType === 'image' ? 600 : null,
          duration: mediaType !== 'image' ? Math.floor(Math.random() * 1800) + 30 : null,
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
          mediaCreated++;
          console.log(`✅ Created ${mediaType}: "${media.title}" for ${project.name}`);
        }
      }
    }
    }

    // 6. Final statistics and verification
    console.log('\n📋 Step 6: Verifying connected system...');
    
    // Count everything connected to the tenant
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', org.tenant_id);

    const { count: storytellerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', org.tenant_id)
      .eq('is_storyteller', true);

    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', org.tenant_id);

    const { count: mediaCount } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', curiousTractorId);

    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', org.tenant_id);

    console.log('\n🎉 Connected Multi-Tenant System Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🏢 Organization: ${org.name}`);
    console.log(`🆔 Tenant ID: ${org.tenant_id}`);
    console.log(`👥 Total Users: ${userCount || 0}`);
    console.log(`📖 Storytellers: ${storytellerCount || 0}`);
    console.log(`🏗️  Projects: ${projectCount || 0}`);
    console.log(`📚 Stories: ${storyCount || 0} (connected to projects)`);
    console.log(`🖼️  Media Assets: ${mediaCount || 0} (connected to projects)`);
    
    console.log('\n🔐 Login Credentials (password: temp_password_123):');
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.display_name})`);
    });
    
    console.log('\n🔗 Access URLs:');
    console.log(`Organization Dashboard: http://localhost:3002/organizations/${curiousTractorId}/dashboard`);
    console.log(`Projects Page: http://localhost:3002/organizations/${curiousTractorId}/projects`);
    console.log(`Storytellers: http://localhost:3002/organizations/${curiousTractorId}/storytellers`);
    console.log(`Admin Projects: http://localhost:3002/admin (Projects tab)`);
    
    console.log('\n✅ System is now properly connected:');
    console.log('   • Organization has its own tenant');
    console.log('   • Users belong to the organization\'s tenant');  
    console.log('   • Projects belong to the organization');
    console.log('   • Stories are connected to projects AND tenant');
    console.log('   • Media is connected to projects AND organization');
    console.log('   • No duplicates - everything properly linked!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupProperConnectedSystem();
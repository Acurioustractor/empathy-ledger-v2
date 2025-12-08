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

// Snow Foundation ID
const SNOW_FOUNDATION_ID = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';

async function setupSnowFoundation() {
  console.log('🏔️ Setting up Snow Foundation with complete data...\n');

  try {
    // 1. Update Snow Foundation details
    console.log('📋 Step 1: Updating Snow Foundation details...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .update({
        name: 'Snow Foundation',
        type: 'nonprofit',
        description: 'The Snow Foundation is dedicated to preserving Indigenous cultural heritage through storytelling, art, and community engagement. We work with elders and youth to document traditional knowledge and create spaces for cultural exchange.',
        location: 'Winnipeg, Manitoba, Canada',
        website_url: 'https://snowfoundation.org',
        contact_email: 'info@snowfoundation.org',
        slug: 'snow-foundation',
        cultural_significance: 'A leading Indigenous cultural preservation organization working with communities across Treaty 1 territory to protect and share traditional knowledge.',
        cultural_protocols: {
          acknowledgment: 'We acknowledge that we are on Treaty 1 territory, the traditional territory of Anishinaabeg, Cree, Oji-Cree, Dakota, and Dene Peoples, and the homeland of the Métis Nation.',
          guidelines: [
            'Respect elder knowledge keepers',
            'Seek permission before sharing stories',
            'Honor traditional protocols',
            'Ensure cultural safety in all activities'
          ]
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', SNOW_FOUNDATION_ID)
      .select()
      .single();

    if (orgError) throw orgError;
    console.log('✅ Organization updated:', org.name);

    // 2. Create Storytellers for Snow Foundation
    console.log('\n📋 Step 2: Creating storytellers...');
    const storytellers = [
      {
        email: 'mary.snowbird@example.com',
        display_name: 'Elder Mary Snowbird',
        full_name: 'Mary Snowbird',
        bio: 'Elder Mary Snowbird is a respected knowledge keeper and traditional storyteller from the Cree Nation. She has dedicated her life to preserving oral histories and teaching young people about their cultural heritage.',
        current_role: 'Elder & Cultural Advisor',
        cultural_background: 'Cree Nation',
        is_elder: true,
        is_storyteller: true
      },
      {
        email: 'joseph.littlebear@example.com',
        display_name: 'Joseph Little Bear',
        full_name: 'Joseph Little Bear',
        bio: 'Joseph is a multimedia artist and storyteller who combines traditional narratives with modern technology to create immersive cultural experiences for youth.',
        current_role: 'Digital Storyteller & Artist',
        cultural_background: 'Anishinaabe',
        is_elder: false,
        is_storyteller: true
      },
      {
        email: 'sarah.whitecrow@example.com',
        display_name: 'Sarah White Crow',
        full_name: 'Sarah White Crow',
        bio: 'Sarah is a language keeper and educator who works to revitalize Indigenous languages through storytelling and interactive learning programs.',
        current_role: 'Language Keeper & Educator',
        cultural_background: 'Dakota',
        is_elder: false,
        is_storyteller: true
      },
      {
        email: 'william.runningwater@example.com',
        display_name: 'Elder William Running Water',
        full_name: 'William Running Water',
        bio: 'Elder William has spent decades documenting traditional ceremonies and spiritual practices, ensuring they are preserved for future generations.',
        current_role: 'Spiritual Leader & Elder',
        cultural_background: 'Lakota',
        is_elder: true,
        is_storyteller: true
      }
    ];

    const createdStorytellers = [];
    for (const storyteller of storytellers) {
      // First check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', storyteller.email)
        .single();

      let profileId;
      if (existingProfile) {
        profileId = existingProfile.id;
        // Update existing profile
        await supabase
          .from('profiles')
          .update({
            ...storyteller,
            organization_id: SNOW_FOUNDATION_ID,
            tenant_roles: ['storyteller'],
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId);
      } else {
        // Create new profile with generated ID
        profileId = faker.string.uuid();
        await supabase
          .from('profiles')
          .insert({
            id: profileId,
            ...storyteller,
            organization_id: SNOW_FOUNDATION_ID,
            tenant_roles: ['storyteller'],
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      createdStorytellers.push({ id: profileId, ...storyteller });
      console.log(`✅ Storyteller created: ${storyteller.display_name}`);
    }

    // 3. Create Projects
    console.log('\n📋 Step 3: Creating projects...');
    const projects = [
      {
        id: faker.string.uuid(),
        title: 'Oral Histories Documentation Initiative',
        description: 'A comprehensive project to document and preserve oral histories from elders across multiple Indigenous communities.',
        organization_id: SNOW_FOUNDATION_ID,
        status: 'active',
        start_date: '2024-01-01',
        metadata: {
          cultural_context: 'Multi-nation collaborative project respecting individual cultural protocols',
          objectives: [
            'Document 100+ oral histories',
            'Create digital archive',
            'Develop educational materials',
            'Train youth in documentation techniques'
          ]
        }
      },
      {
        id: faker.string.uuid(),
        title: 'Youth Cultural Exchange Program',
        description: 'Connecting Indigenous youth with elders to learn traditional skills, stories, and cultural practices.',
        organization_id: SNOW_FOUNDATION_ID,
        status: 'active',
        start_date: '2024-03-15',
        metadata: {
          cultural_context: 'Intergenerational knowledge transfer following traditional teaching methods',
          objectives: [
            'Monthly elder-youth gatherings',
            'Skills workshops',
            'Story circles',
            'Cultural camps'
          ]
        }
      },
      {
        id: faker.string.uuid(),
        title: 'Traditional Medicine Garden',
        description: 'Establishing and maintaining a traditional medicine garden with educational programs about plant medicines.',
        organization_id: SNOW_FOUNDATION_ID,
        status: 'active',
        start_date: '2024-05-01',
        metadata: {
          cultural_context: 'Sacred plant knowledge shared with proper protocols and permissions',
          objectives: [
            'Cultivate traditional medicine plants',
            'Educational workshops',
            'Elder-led plant walks',
            'Create plant medicine guide'
          ]
        }
      }
    ];

    for (const project of projects) {
      const { error } = await supabase
        .from('projects')
        .insert({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (!error) {
        console.log(`✅ Project created: ${project.title}`);
      }
    }

    // 4. Create Galleries
    console.log('\n📋 Step 4: Creating galleries...');
    const galleries = [
      {
        id: faker.string.uuid(),
        title: 'Elder Portraits Collection',
        description: 'A powerful collection of portraits celebrating our knowledge keepers and their wisdom.',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        featured: true,
        cover_image: '/images/gallery-elder-portraits.jpg'
      },
      {
        id: faker.string.uuid(),
        title: 'Cultural Ceremonies',
        description: 'Respectful documentation of cultural ceremonies and gatherings with proper permissions.',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: false, // Private - requires permission
        featured: false,
        cover_image: '/images/gallery-ceremonies.jpg'
      },
      {
        id: faker.string.uuid(),
        title: 'Youth Storytellers',
        description: 'Showcasing the next generation of Indigenous storytellers and their creative expressions.',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        featured: true,
        cover_image: '/images/gallery-youth.jpg'
      },
      {
        id: faker.string.uuid(),
        title: 'Land and Territory',
        description: 'Visual stories of our connection to the land, water, and sacred sites.',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        featured: false,
        cover_image: '/images/gallery-land.jpg'
      }
    ];

    const createdGalleries = [];
    for (const gallery of galleries) {
      const { data, error } = await supabase
        .from('galleries')
        .insert({
          ...gallery,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (!error && data) {
        createdGalleries.push(data);
        console.log(`✅ Gallery created: ${gallery.title}`);
      }
    }

    // 5. Create Media Assets
    console.log('\n📋 Step 5: Creating media assets...');
    const mediaAssets = [];
    
    // Create media for each gallery
    for (const gallery of createdGalleries) {
      const assetCount = faker.number.int({ min: 5, max: 10 });
      
      for (let i = 0; i < assetCount; i++) {
        const mediaType = faker.helpers.arrayElement(['image', 'video', 'audio']);
        const asset = {
          id: faker.string.uuid(),
          filename: faker.system.fileName(),
          media_type: mediaType,
          title: faker.lorem.sentence(3),
          description: faker.lorem.paragraph(),
          cultural_context: faker.lorem.sentence(),
          permissions: {
            can_download: faker.datatype.boolean(),
            can_share: true,
            requires_attribution: true,
            cultural_restrictions: faker.helpers.arrayElement([null, 'Elder permission required', 'Seasonal viewing only'])
          },
          metadata: {
            gallery_id: gallery.id,
            tags: faker.helpers.arrayElements(['traditional', 'ceremony', 'elder', 'youth', 'land', 'story', 'teaching'], 3),
            location: faker.location.city(),
            date_captured: faker.date.past().toISOString()
          },
          file_size: faker.number.int({ min: 100000, max: 50000000 }),
          mime_type: mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'audio/mp3',
          organization_id: SNOW_FOUNDATION_ID,
          uploaded_by: createdStorytellers[faker.number.int({ min: 0, max: createdStorytellers.length - 1 })].id,
          url: `https://storage.example.com/${gallery.id}/${faker.string.alphanumeric(10)}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`
        };
        mediaAssets.push(asset);
      }
    }

    // Insert all media assets
    for (const asset of mediaAssets) {
      const { error } = await supabase
        .from('media_assets')
        .insert({
          ...asset,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (!error) {
        console.log(`✅ Media asset created: ${asset.title}`);
      }
    }

    // 6. Create Stories with Transcripts
    console.log('\n📋 Step 6: Creating stories with transcripts...');
    const stories = [
      {
        id: faker.string.uuid(),
        title: 'The Teaching of the Seven Fires',
        content: 'Elder Mary Snowbird shares the ancient prophecy of the Seven Fires, a teaching that guides us through different eras of our people\'s journey. This sacred teaching speaks of unity, healing, and the importance of maintaining our connection to traditional ways while embracing positive change.',
        summary: 'A sacred teaching about the prophecy that guides our people through seven distinct eras.',
        author_id: createdStorytellers[0].id, // Elder Mary
        storyteller_id: createdStorytellers[0].id,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        cultural_sensitivity_level: 'general',
        language: 'en',
        tags: ['prophecy', 'teaching', 'tradition', 'elder-wisdom'],
        has_explicit_consent: true,
        consent_details: {
          obtained_date: '2024-01-15',
          consent_type: 'full',
          restrictions: []
        }
      },
      {
        id: faker.string.uuid(),
        title: 'Medicine Wheel Teachings for Youth',
        content: 'Joseph Little Bear presents traditional Medicine Wheel teachings in a contemporary format, helping young people understand the four directions, seasons, and stages of life. Through digital art and storytelling, ancient wisdom becomes accessible to the next generation.',
        summary: 'Contemporary interpretation of Medicine Wheel teachings for young learners.',
        author_id: createdStorytellers[1].id, // Joseph
        storyteller_id: createdStorytellers[1].id,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        cultural_sensitivity_level: 'general',
        language: 'en',
        tags: ['medicine-wheel', 'youth', 'education', 'digital-storytelling'],
        has_explicit_consent: true,
        consent_details: {
          obtained_date: '2024-02-20',
          consent_type: 'full',
          restrictions: []
        }
      },
      {
        id: faker.string.uuid(),
        title: 'Revitalizing Our Language Through Story',
        content: 'Sarah White Crow demonstrates how traditional stories serve as vehicles for language preservation. Each story contains not just words, but the rhythm, emotion, and cultural context that gives our language its life and meaning.',
        summary: 'Using storytelling as a tool for Indigenous language revitalization.',
        author_id: createdStorytellers[2].id, // Sarah
        storyteller_id: createdStorytellers[2].id,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        cultural_sensitivity_level: 'general',
        language: 'en',
        tags: ['language', 'preservation', 'education', 'culture'],
        has_explicit_consent: true,
        consent_details: {
          obtained_date: '2024-03-10',
          consent_type: 'full',
          restrictions: []
        }
      },
      {
        id: faker.string.uuid(),
        title: 'Sacred Water Ceremonies',
        content: 'Elder William Running Water shares the significance of water in our spiritual practices and ceremonies. Water is life, and through these teachings, we understand our responsibility as water protectors and the sacred relationship between water and all living beings.',
        summary: 'Understanding the spiritual significance of water in Indigenous ceremonies.',
        author_id: createdStorytellers[3].id, // Elder William
        storyteller_id: createdStorytellers[3].id,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: false, // Restricted - ceremony content
        cultural_sensitivity_level: 'restricted',
        language: 'en',
        tags: ['ceremony', 'water', 'spiritual', 'sacred'],
        has_explicit_consent: true,
        consent_details: {
          obtained_date: '2024-04-05',
          consent_type: 'limited',
          restrictions: ['Community members only', 'Not for public sharing']
        }
      }
    ];

    const createdStories = [];
    for (const story of stories) {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...story,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (!error && data) {
        createdStories.push(data);
        console.log(`✅ Story created: ${story.title}`);
      }
    }

    // 7. Create Transcripts for Stories
    console.log('\n📋 Step 7: Creating transcripts for stories...');
    for (const story of createdStories) {
      // Create a media asset for the story (audio/video)
      const storyMedia = {
        id: faker.string.uuid(),
        filename: `${story.id}-recording.mp4`,
        media_type: 'video',
        title: `${story.title} - Video Recording`,
        story_id: story.id,
        organization_id: SNOW_FOUNDATION_ID,
        uploaded_by: story.author_id,
        file_size: faker.number.int({ min: 10000000, max: 100000000 }),
        mime_type: 'video/mp4',
        url: `https://storage.example.com/stories/${story.id}/recording.mp4`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: mediaData, error: mediaError } = await supabase
        .from('media_assets')
        .insert(storyMedia)
        .select()
        .single();

      if (!mediaError && mediaData) {
        // Create transcript
        const transcript = {
          id: faker.string.uuid(),
          media_asset_id: mediaData.id,
          text: story.content,
          formatted_text: `<p>${story.content}</p>`,
          language: 'en',
          status: 'completed',
          duration: faker.number.float({ min: 300, max: 1800 }), // 5-30 minutes
          word_count: story.content.split(' ').length,
          confidence: faker.number.float({ min: 0.85, max: 0.99 }),
          segments: [
            {
              start: 0,
              end: 60,
              text: story.content.substring(0, 200),
              confidence: 0.95
            }
          ],
          metadata: {
            story_id: story.id,
            storyteller: story.storyteller_id,
            transcribed_by: 'AI + Human Review',
            review_status: 'approved'
          },
          created_by: story.author_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: transcriptError } = await supabase
          .from('transcripts')
          .insert(transcript);

        if (!transcriptError) {
          // Update story with transcript reference
          await supabase
            .from('stories')
            .update({ 
              transcript_id: transcript.id,
              media_attachments: [mediaData.id]
            })
            .eq('id', story.id);
            
          console.log(`✅ Transcript created for: ${story.title}`);
        }
      }
    }

    // 8. Create Media Usage Tracking
    console.log('\n📋 Step 8: Setting up media usage tracking...');
    
    // Link some media assets to stories
    for (let i = 0; i < Math.min(5, mediaAssets.length); i++) {
      const tracking = {
        media_asset_id: mediaAssets[i].id,
        used_in_type: 'story',
        used_in_id: createdStories[i % createdStories.length].id,
        usage_context: 'Story illustration',
        usage_role: faker.helpers.arrayElement(['primary', 'thumbnail', 'inline']),
        added_by: createdStorytellers[0].id,
        ordinal_position: i
      };

      await supabase
        .from('media_usage_tracking')
        .insert({
          ...tracking,
          created_at: new Date().toISOString()
        });
    }

    // Link media to galleries
    for (const gallery of createdGalleries) {
      const galleryMedia = mediaAssets.filter(m => m.metadata.gallery_id === gallery.id);
      for (let i = 0; i < galleryMedia.length; i++) {
        const tracking = {
          media_asset_id: galleryMedia[i].id,
          used_in_type: 'gallery',
          used_in_id: gallery.id,
          usage_context: 'Gallery item',
          usage_role: i === 0 ? 'thumbnail' : 'inline',
          added_by: galleryMedia[i].uploaded_by,
          ordinal_position: i
        };

        await supabase
          .from('media_usage_tracking')
          .insert({
            ...tracking,
            created_at: new Date().toISOString()
          });
      }
    }

    console.log('✅ Media usage tracking complete');

    // 9. Create Organization Members
    console.log('\n📋 Step 9: Adding organization members...');
    
    // Add storytellers as organization members
    for (const storyteller of createdStorytellers) {
      const member = {
        id: faker.string.uuid(),
        organization_id: SNOW_FOUNDATION_ID,
        user_id: storyteller.id,
        role: storyteller.is_elder ? 'elder' : 'member',
        permissions: storyteller.is_elder ? ['approve_stories', 'manage_content'] : ['create_stories'],
        joined_at: faker.date.past().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('organization_members')
        .insert(member);

      if (!error) {
        console.log(`✅ Added member: ${storyteller.display_name}`);
      }
    }

    // Summary
    console.log('\n🎉 Snow Foundation setup complete!');
    console.log('📊 Summary:');
    console.log(`   - Organization: Snow Foundation`);
    console.log(`   - Storytellers: ${createdStorytellers.length}`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Galleries: ${createdGalleries.length}`);
    console.log(`   - Media Assets: ${mediaAssets.length}`);
    console.log(`   - Stories: ${createdStories.length}`);
    console.log(`   - Transcripts: ${createdStories.length}`);
    
    console.log('\n🔗 Access Snow Foundation at:');
    console.log(`   Organization: http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}`);
    console.log(`   Dashboard: http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/dashboard`);
    console.log(`   Projects: http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/projects`);
    console.log(`   Galleries: http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/galleries`);
    console.log(`   Stories: http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/stories`);
    console.log(`   Members: http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/members`);

  } catch (error) {
    console.error('❌ Error setting up Snow Foundation:', error);
  }
}

// Run the setup
setupSnowFoundation();
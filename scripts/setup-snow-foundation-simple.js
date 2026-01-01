#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SNOW_FOUNDATION_ID = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';

// Helper to generate UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function setupSnowFoundation() {
  console.log('🏔️ Setting up Snow Foundation - Simplified Version\n');

  try {
    // 1. Create sample galleries
    console.log('📸 Creating galleries...');
    const galleries = [
      {
        id: uuid(),
        title: 'Elder Wisdom Collection',
        description: 'Portraits and stories from our knowledge keepers',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        featured: true
      },
      {
        id: uuid(),
        title: 'Youth Voices',
        description: 'Creative expressions from the next generation',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        featured: false
      },
      {
        id: uuid(),
        title: 'Land and Water',
        description: 'Our connection to traditional territories',
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        featured: false
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
      
      if (data) {
        createdGalleries.push(data);
        console.log(`✅ Gallery: ${gallery.title}`);
      } else if (error) {
        console.log(`❌ Gallery error:`, error.message);
      }
    }

    // 2. Create sample media assets
    console.log('\n📹 Creating media assets...');
    const mediaTypes = ['image', 'video', 'audio'];
    const mediaAssets = [];
    
    for (let i = 1; i <= 15; i++) {
      const mediaType = mediaTypes[i % 3];
      const asset = {
        id: uuid(),
        filename: `snow-foundation-${i}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`,
        original_filename: `snow-foundation-${i}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`,
        media_type: mediaType,
        title: `${mediaType === 'image' ? 'Photo' : mediaType === 'video' ? 'Video' : 'Recording'} ${i}`,
        description: `Sample ${mediaType} content for Snow Foundation gallery`,
        organization_id: SNOW_FOUNDATION_ID,
        file_size: Math.floor(Math.random() * 10000000) + 100000,
        mime_type: mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'audio/mp3',
        url: `https://placeholder.com/${mediaType}/${i}`,
        metadata: {
          gallery_id: createdGalleries[i % createdGalleries.length]?.id,
          tags: ['culture', 'heritage', 'storytelling']
        }
      };
      
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          ...asset,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (data) {
        mediaAssets.push(data);
        console.log(`✅ Media: ${asset.title}`);
      } else if (error) {
        console.log(`❌ Media error:`, error.message);
      }
    }

    // 3. Create sample stories with Benjamin as author
    console.log('\n📚 Creating stories...');
    const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
    
    const stories = [
      {
        id: uuid(),
        title: 'The Seven Sacred Teachings',
        content: 'The Seven Sacred Teachings, also known as the Seven Grandfather Teachings, are a set of teachings that demonstrate what it means to live a good life. They include: Wisdom, Love, Respect, Bravery, Honesty, Humility, and Truth. Each teaching is represented by an animal that exemplifies the quality. The beaver represents wisdom because it uses its natural gifts wisely for survival. The eagle represents love because of its ability to see far and wide, caring for all of creation. The buffalo represents respect for its giving nature, providing everything needed for life. The bear represents bravery, facing danger with courage to protect its young. The raven represents honesty, accepting itself and its role in creation. The wolf represents humility, living in harmony with others in the pack. The turtle represents truth, one of the oldest animals on Earth, carrying the teachings of life on its back.',
        summary: 'Traditional Indigenous teachings about living a good life through seven sacred principles.',
        author_id: benjaminId,
        storyteller_id: benjaminId,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        cultural_sensitivity_level: 'general',
        tags: ['teachings', 'tradition', 'wisdom', 'culture'],
        has_explicit_consent: true
      },
      {
        id: uuid(),
        title: 'The Medicine Wheel',
        content: 'The Medicine Wheel is a sacred symbol used by many Indigenous peoples of North America. It represents the cyclical nature of life, the four directions, the four seasons, and the four stages of life. East represents spring, childhood, and new beginnings, symbolized by the color yellow. South represents summer, youth, and growth, symbolized by the color red. West represents autumn, adulthood, and introspection, symbolized by the color black. North represents winter, elderhood, and wisdom, symbolized by the color white. At the center is Mother Earth, connecting all directions and all beings. The Medicine Wheel teaches us about balance, harmony, and our connection to all of creation. It reminds us that all stages of life are sacred and that we must honor each direction and season in our journey.',
        summary: 'Understanding the sacred Medicine Wheel and its teachings about life cycles and balance.',
        author_id: benjaminId,
        storyteller_id: benjaminId,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        cultural_sensitivity_level: 'general',
        tags: ['medicine-wheel', 'sacred', 'balance', 'teachings'],
        has_explicit_consent: true
      },
      {
        id: uuid(),
        title: 'Water is Life: Nibi Stories',
        content: 'In Anishinaabe teachings, water (Nibi) is sacred and is considered the lifeblood of Mother Earth. Water is the first medicine, the first environment we experience in the womb. Women are the water carriers and protectors, holding a special relationship with water as life-givers. The story tells of how water was given to the Earth to sustain all life, flowing through rivers like veins, collecting in lakes like organs, and falling as rain like tears of joy or sorrow. Every drop of water has been here since the beginning of time, cycling through clouds, rain, rivers, and oceans. When we protect water, we protect life itself. The teachings remind us that water has memory and consciousness, and that our thoughts and prayers can influence its structure. This is why we offer tobacco to the water and speak our gratitude before taking a drink.',
        summary: 'Sacred teachings about water as the source of life and our responsibility to protect it.',
        author_id: benjaminId,
        storyteller_id: benjaminId,
        organization_id: SNOW_FOUNDATION_ID,
        is_public: true,
        cultural_sensitivity_level: 'general',
        tags: ['water', 'sacred', 'environment', 'protection'],
        has_explicit_consent: true
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
      
      if (data) {
        createdStories.push(data);
        console.log(`✅ Story: ${story.title}`);
      } else if (error) {
        console.log(`❌ Story error:`, error.message);
      }
    }

    // 4. Create transcripts for media
    console.log('\n📝 Creating transcripts...');
    const audioVideoAssets = mediaAssets.filter(a => a.media_type !== 'image');
    
    for (const asset of audioVideoAssets.slice(0, 5)) {
      const transcript = {
        id: uuid(),
        media_asset_id: asset.id,
        text: `This is a sample transcript for ${asset.title}. In a real implementation, this would contain the actual transcribed content from the ${asset.media_type} file. The transcript helps make the content accessible and searchable.`,
        formatted_text: `<p>This is a sample transcript for ${asset.title}.</p><p>In a real implementation, this would contain the actual transcribed content from the ${asset.media_type} file.</p><p>The transcript helps make the content accessible and searchable.</p>`,
        language: 'en',
        status: 'completed',
        duration: Math.floor(Math.random() * 600) + 60,
        word_count: Math.floor(Math.random() * 500) + 100,
        confidence: 0.95,
        metadata: {
          auto_generated: true,
          reviewed: false
        }
      };

      const { data, error } = await supabase
        .from('transcripts')
        .insert({
          ...transcript,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (data) {
        console.log(`✅ Transcript for: ${asset.title}`);
      } else if (error) {
        console.log(`❌ Transcript error:`, error.message);
      }
    }

    // 5. Link media to galleries (media usage tracking)
    console.log('\n🔗 Linking media to galleries...');
    for (const gallery of createdGalleries) {
      const galleryMedia = mediaAssets.filter(m => m.metadata?.gallery_id === gallery.id);
      for (let i = 0; i < galleryMedia.length; i++) {
        const { error } = await supabase
          .from('media_usage_tracking')
          .insert({
            id: uuid(),
            media_asset_id: galleryMedia[i].id,
            used_in_type: 'gallery',
            used_in_id: gallery.id,
            usage_context: 'Gallery display',
            usage_role: i === 0 ? 'thumbnail' : 'inline',
            ordinal_position: i,
            created_at: new Date().toISOString()
          });
        
        if (!error) {
          console.log(`✅ Linked media to ${gallery.title}`);
        }
      }
    }

    // 6. Link some media to stories
    console.log('\n🔗 Linking media to stories...');
    for (let i = 0; i < createdStories.length; i++) {
      if (mediaAssets[i]) {
        const { error } = await supabase
          .from('media_usage_tracking')
          .insert({
            id: uuid(),
            media_asset_id: mediaAssets[i].id,
            used_in_type: 'story',
            used_in_id: createdStories[i].id,
            usage_context: 'Story illustration',
            usage_role: 'primary',
            ordinal_position: 0,
            created_at: new Date().toISOString()
          });
        
        if (!error) {
          console.log(`✅ Linked media to story: ${createdStories[i].title}`);
        }
      }
    }

    // Summary
    console.log('\n✨ Snow Foundation setup complete!');
    console.log('\n📊 Created:');
    console.log(`   - Galleries: ${createdGalleries.length}`);
    console.log(`   - Media Assets: ${mediaAssets.length}`);
    console.log(`   - Stories: ${createdStories.length}`);
    console.log(`   - Transcripts: ${audioVideoAssets.slice(0, 5).length}`);
    
    console.log('\n🔗 View Snow Foundation:');
    console.log(`   http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}`);
    console.log(`   http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/galleries`);
    console.log(`   http://localhost:3001/organizations/${SNOW_FOUNDATION_ID}/stories`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupSnowFoundation();
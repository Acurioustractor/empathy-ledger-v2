#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findPhotoTables() {
  console.log('🔍 Looking for photo-related tables...\n');

  // Try different possible photo table names
  const possibleTables = ['photos', 'media', 'media_files', 'images', 'photo_gallery_items'];

  for (const table of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (!error && data) {
        console.log(`✅ Found table: ${table}`);
        if (data[0]) {
          console.log('   Columns:', Object.keys(data[0]));
          console.log('   Sample record:', JSON.stringify(data[0], null, 2));
        }
        console.log('');
      }
    } catch (err) {
      // Table doesn't exist, continue
    }
  }

  // Check photo_gallery_items structure more carefully
  const { data: galleryItems } = await supabase
    .from('photo_gallery_items')
    .select('*')
    .eq('gallery_id', '1a4344c7-94a9-4b34-918c-62c4b25b6824')
    .limit(3);

  console.log('📋 Photo gallery items structure:');
  if (galleryItems && galleryItems.length > 0) {
    console.log('Columns:', Object.keys(galleryItems[0]));
    galleryItems.forEach((item, i) => {
      console.log(`Item ${i+1}:`, JSON.stringify(item, null, 2));
    });
  }

  // Try to find media table with deadly hearts content
  try {
    const { data: deadlyMedia } = await supabase
      .from('media')
      .select('*')
      .ilike('filename', '%deadly%')
      .limit(5);

    if (deadlyMedia && deadlyMedia.length > 0) {
      console.log('\n🔍 Found Deadly Hearts media files:');
      deadlyMedia.forEach(m => {
        console.log(`   - ${m.filename} (ID: ${m.id})`);
      });
    }
  } catch (err) {
    console.log('No media table or no deadly content found');
  }
}

findPhotoTables();
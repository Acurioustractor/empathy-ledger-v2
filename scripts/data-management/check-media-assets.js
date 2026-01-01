#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMediaAssets() {
  console.log('🔍 Checking media assets...\n');

  // Get a few media asset IDs from the gallery
  const { data: galleryItems } = await supabase
    .from('photo_gallery_items')
    .select('media_asset_id, caption')
    .eq('gallery_id', '1a4344c7-94a9-4b34-918c-62c4b25b6824')
    .limit(5);

  if (galleryItems && galleryItems.length > 0) {
    console.log('📋 Gallery items with media asset IDs:');
    galleryItems.forEach((item, i) => {
      console.log(`   ${i+1}. ${item.caption} - Asset ID: ${item.media_asset_id}`);
    });

    // Try to find these assets in media_assets table
    const assetIds = galleryItems.map(item => item.media_asset_id);

    try {
      const { data: mediaAssets, error } = await supabase
        .from('media_assets')
        .select('*')
        .in('id', assetIds)
        .limit(5);

      if (error) {
        console.log('\n❌ Error accessing media_assets:', error.message);

        // Try alternative table names
        const alternatives = ['media', 'assets', 'files', 'media_files'];
        for (const table of alternatives) {
          try {
            const { data: altData, error: altError } = await supabase
              .from(table)
              .select('*')
              .in('id', assetIds)
              .limit(1);

            if (!altError && altData && altData.length > 0) {
              console.log(`✅ Found assets in table: ${table}`);
              console.log('Sample asset:', JSON.stringify(altData[0], null, 2));
              break;
            }
          } catch (err) {
            // Continue trying
          }
        }
      } else if (mediaAssets && mediaAssets.length > 0) {
        console.log('\n✅ Found media assets:');
        mediaAssets.forEach((asset, i) => {
          console.log(`   ${i+1}. ${asset.filename || asset.title || 'Unknown'}`);
          console.log(`      Type: ${asset.media_type || asset.type}`);
          console.log(`      Size: ${asset.file_size_bytes || asset.size || 0} bytes`);
        });
      } else {
        console.log('\n❌ No media assets found for these IDs');
      }
    } catch (err) {
      console.log('\n❌ Could not access media_assets table:', err.message);
    }
  }

  // Check total count in photo_gallery_items
  const { count: totalItems } = await supabase
    .from('photo_gallery_items')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', '1a4344c7-94a9-4b34-918c-62c4b25b6824');

  console.log(`\n📊 Total gallery items: ${totalItems || 0}`);

  // Check if we can find any tables with 'media' or 'asset' in the name
  console.log('\n🔍 Searching for any media-related content...');

  // Try to find deadly hearts content in any media table
  const mediaSearchTerms = ['deadly', 'hearts', 'trek', 'snow', 'foundation'];

  for (const term of mediaSearchTerms) {
    const tables = ['media', 'media_assets', 'files', 'assets'];

    for (const table of tables) {
      try {
        const { data } = await supabase
          .from(table)
          .select('id, filename, title')
          .or(`filename.ilike.%${term}%,title.ilike.%${term}%`)
          .limit(3);

        if (data && data.length > 0) {
          console.log(`Found ${data.length} items in ${table} matching '${term}':`);
          data.forEach(item => {
            console.log(`   - ${item.filename || item.title} (${item.id})`);
          });
        }
      } catch (err) {
        // Table doesn't exist or access error
      }
    }
  }
}

checkMediaAssets();
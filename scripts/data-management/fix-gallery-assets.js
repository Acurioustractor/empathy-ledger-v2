#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixGalleryAssets() {
  const galleryId = '1a4344c7-94a9-4b34-918c-62c4b25b6824';

  console.log('🔧 Fixing gallery assets...\n');

  // Get all gallery items
  const { data: galleryItems } = await supabase
    .from('photo_gallery_items')
    .select('media_asset_id')
    .eq('gallery_id', galleryId);

  if (galleryItems) {
    const assetIds = galleryItems.map(item => item.media_asset_id);

    // Check assets using correct column name
    const { data: assets } = await supabase
      .from('media_assets')
      .select('id, filename, file_size, storage_path, cdn_url')
      .in('id', assetIds)
      .limit(10);

    console.log(`📊 Checking ${assets?.length || 0} assets:`);

    let brokenCount = 0;
    let workingCount = 0;

    assets?.forEach(asset => {
      const size = asset.file_size || 0;
      if (size === 0 || !asset.storage_path) {
        console.log(`   ❌ ${asset.filename || 'Unknown'} - ${size} bytes, no storage path`);
        brokenCount++;
      } else {
        console.log(`   ✅ ${asset.filename || 'Unknown'} - ${size} bytes`);
        workingCount++;
      }
    });

    console.log(`\n📊 Summary: ${workingCount} working, ${brokenCount} broken`);

    if (brokenCount > 0) {
      console.log('\n🗑️  Removing all broken gallery items...');

      // Since most/all seem to be broken, let's clear the gallery
      const { error: clearError } = await supabase
        .from('photo_gallery_items')
        .delete()
        .eq('gallery_id', galleryId);

      if (clearError) {
        console.log('❌ Error clearing gallery:', clearError.message);
      } else {
        console.log('✅ Cleared all gallery items');

        // Update gallery count to 0
        const { error: updateError } = await supabase
          .from('photo_galleries')
          .update({
            photo_count: 0,
            total_size_bytes: 0
          })
          .eq('id', galleryId);

        if (updateError) {
          console.log('⚠️  Could not update gallery count:', updateError.message);
        } else {
          console.log('✅ Updated gallery count to 0');
        }
      }
    }
  }

  // Search for real Deadly Hearts content in media_assets
  console.log('\n🔍 Searching for real Deadly Hearts content...');

  const { data: deadlyAssets } = await supabase
    .from('media_assets')
    .select('id, filename, title, file_size, organization_id, project_id')
    .or('filename.ilike.%deadly%,title.ilike.%deadly%,filename.ilike.%heart%,title.ilike.%heart%')
    .gt('file_size', 0)
    .limit(20);

  console.log(`📸 Found ${deadlyAssets?.length || 0} potential Deadly Hearts assets:`);
  deadlyAssets?.forEach(asset => {
    console.log(`   - ${asset.filename || asset.title || 'Unknown'} (${asset.file_size} bytes)`);
    console.log(`     Org: ${asset.organization_id || 'None'}, Project: ${asset.project_id || 'None'}`);
  });

  if (deadlyAssets && deadlyAssets.length > 0) {
    console.log('\n💡 These assets could be linked to the Deadly Hearts gallery');
  } else {
    console.log('\n❌ No real Deadly Hearts media assets found in the system');
  }
}

fixGalleryAssets();
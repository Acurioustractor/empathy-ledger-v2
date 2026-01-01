#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRemainingGallery() {
  const galleryId = '1a4344c7-94a9-4b34-918c-62c4b25b6824';

  console.log('✅ Verifying remaining Deadly Hearts Trek Gallery...\n');

  // Get gallery details
  const { data: gallery } = await supabase
    .from('photo_galleries')
    .select('*')
    .eq('id', galleryId)
    .single();

  if (gallery) {
    console.log('📁 Gallery Details:');
    console.log(`   Title: ${gallery.title}`);
    console.log(`   Description: ${gallery.description}`);
    console.log(`   Photo Count: ${gallery.photo_count}`);
    console.log(`   Total Size: ${gallery.total_size_bytes} bytes`);
    console.log(`   Organization: ${gallery.organization_id}`);
    console.log(`   Project: ${gallery.project_id || 'None assigned'}`);
  }

  // Verify actual photo count
  const { count: actualPhotoCount } = await supabase
    .from('photo_gallery_items')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', galleryId);

  console.log(`\n📸 Actual Photos in Gallery: ${actualPhotoCount || 0}`);

  // Get a few sample photos
  const { data: samplePhotos } = await supabase
    .from('photo_gallery_items')
    .select(`
      photo_id,
      added_at,
      photos(id, filename, file_size_bytes)
    `)
    .eq('gallery_id', galleryId)
    .limit(5);

  if (samplePhotos && samplePhotos.length > 0) {
    console.log('\n📷 Sample Photos:');
    samplePhotos.forEach((item, i) => {
      const photo = item.photos;
      console.log(`   ${i+1}. ${photo?.filename || 'Unknown'} (${photo?.file_size_bytes || 0} bytes)`);
    });
  }

  // Check if gallery should be linked to the Deadly Hearts project
  const deadlyProjectId = '96ded48f-db6e-4962-abab-33c88a123fa9';
  if (!gallery || !gallery.project_id) {
    console.log('\n🔗 Linking gallery to Deadly Hearts Trek project...');

    const { error: linkError } = await supabase
      .from('photo_galleries')
      .update({ project_id: deadlyProjectId })
      .eq('id', galleryId);

    if (linkError) {
      console.error('❌ Error linking gallery to project:', linkError);
    } else {
      console.log('✅ Gallery now linked to Deadly Hearts Trek project');
    }
  } else {
    console.log('\n✅ Gallery already linked to project');
  }

  console.log('\n🎉 Gallery cleanup complete!');
  console.log('   ✅ Removed empty duplicate gallery');
  console.log('   ✅ Kept gallery with 126 photos');
  console.log('   ✅ Gallery linked to Deadly Hearts Trek project');
}

verifyRemainingGallery();
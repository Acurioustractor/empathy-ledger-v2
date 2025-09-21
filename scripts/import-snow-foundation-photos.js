const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importSnowFoundationPhotos() {
  try {
    console.log('🏔️ Importing Snow Foundation photos...\n');
    
    const GALLERY_ID = '35814c50-3379-413d-b2c9-7150a8ab7a8d'; // Deadly Hearts Trek 2025
    const ORG_ID = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'; // Snow Foundation
    const PROJECT_ID = '1007ca9b-6020-4ab1-be02-42b2661b6d34'; // Deadly Hearts Trek
    const STORYTELLER_ID = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e'; // Benjamin Knight
    const TENANT_ID = '96197009-c7bb-4408-89de-cd04085cdf44'; // From photo_galleries record
    
    // 1. Get all the photo files from the bucket
    console.log('📁 Getting all photos from media bucket...');
    const { data: photoFiles, error: filesError } = await supabase.storage
      .from('media')
      .list('c22fcf84-5a09-4893-a8ef-758c781e88a8/media', { limit: 200 });
    
    if (filesError) {
      console.error('❌ Error getting files:', filesError.message);
      return;
    }
    
    console.log(`✅ Found ${photoFiles.length} photos to import\n`);
    
    // 2. Create media_assets records for each photo
    const mediaAssets = [];
    let successCount = 0;
    let errorCount = 0;
    
    console.log('📄 Creating media_assets records...');
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      
      // Generate proper UUID
      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      
      const mediaAssetId = generateUUID();
      const filePath = `c22fcf84-5a09-4893-a8ef-758c781e88a8/media/${file.name}`;
      
      console.log(`   ${i + 1}/${photoFiles.length}: ${file.name}`);
      
      // Create media asset record
      const { data: mediaAsset, error: assetError } = await supabase
        .from('media_assets')
        .insert({
          id: mediaAssetId,
          filename: file.name,
          original_filename: file.name,
          file_type: file.name.toLowerCase().includes('.jpg') || file.name.toLowerCase().includes('.jpeg') ? 'image' : 'image',
          file_path: filePath,
          title: `Snow Foundation Photo ${i + 1}`,
          description: `Photo from the Deadly Hearts Trek project - ${file.name}`,
          organization_id: ORG_ID,
          storage_bucket: 'media',
          storage_path: filePath,
          tenant_id: TENANT_ID,
          uploader_id: STORYTELLER_ID,
          file_size: file.metadata?.size || 0,
          mime_type: file.name.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg',
          url: `https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/${filePath}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (assetError) {
        console.log(`     ❌ Error: ${assetError.message}`);
        errorCount++;
        continue;
      }
      
      mediaAssets.push({
        id: mediaAssetId,
        filename: file.name,
        filePath: filePath
      });
      successCount++;
    }
    
    console.log(`\\n✅ Created ${successCount} media assets (${errorCount} errors)\\n`);
    
    // 3. Link media assets to the photo gallery
    console.log('🖼️ Linking photos to gallery...');
    let galleryLinkCount = 0;
    
    for (let i = 0; i < mediaAssets.length; i++) {
      const asset = mediaAssets[i];
      
      console.log(`   ${i + 1}/${mediaAssets.length}: Linking ${asset.filename}`);
      
      const { data: galleryItem, error: galleryError } = await supabase
        .from('photo_gallery_items')
        .insert({
          gallery_id: GALLERY_ID,
          media_asset_id: asset.id,
          added_by: STORYTELLER_ID
        })
        .select()
        .single();
      
      if (galleryError) {
        console.log(`     ❌ Error: ${galleryError.message}`);
      } else {
        galleryLinkCount++;
      }
    }
    
    console.log(`\\n✅ Linked ${galleryLinkCount} photos to gallery\\n`);
    
    // 4. Update the photo_galleries count
    console.log('📊 Updating gallery photo count...');
    const { data: updatedGallery, error: updateError } = await supabase
      .from('photo_galleries')
      .update({
        photo_count: galleryLinkCount,
        last_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', GALLERY_ID)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Error updating gallery:', updateError.message);
    } else {
      console.log('✅ Updated gallery photo count to:', updatedGallery.photo_count);
    }
    
    // 5. Summary
    console.log('\\n🎉 Import Summary:');
    console.log(`   📸 Photos found: ${photoFiles.length}`);
    console.log(`   📄 Media assets created: ${successCount}`);
    console.log(`   🖼️ Photos linked to gallery: ${galleryLinkCount}`);
    console.log(`   🏔️ Gallery: Deadly Hearts Trek 2025`);
    console.log(`   🏢 Organization: Snow Foundation`);
    console.log(`   📁 Source path: c22fcf84-5a09-4893-a8ef-758c781e88a8/media/`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

importSnowFoundationPhotos();
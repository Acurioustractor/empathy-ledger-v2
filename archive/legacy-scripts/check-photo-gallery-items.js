const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotoGalleryItems() {
  try {
    const GALLERY_ID = '35814c50-3379-413d-b2c9-7150a8ab7a8d';
    
    console.log('🔍 Checking photo_gallery_items for gallery:', GALLERY_ID);
    
    // Check items in the table
    const { data: items, error: itemsError } = await supabase
      .from('photo_gallery_items')
      .select('*')
      .eq('gallery_id', GALLERY_ID)
      .limit(10);
    
    if (itemsError) {
      console.error('❌ Error:', itemsError.message);
      return;
    }
    
    console.log('✅ Found', items?.length || 0, 'photo gallery items');
    if (items?.length > 0) {
      console.log('📋 Sample item:', items[0]);
    }
    
    // Check if media_assets exist for these items
    if (items?.length > 0) {
      console.log('\n🔍 Checking corresponding media_assets...');
      
      for (let i = 0; i < Math.min(5, items.length); i++) {
        const item = items[i];
        console.log(`\n📸 Item ${i + 1}: ${item.media_asset_id}`);
        
        const { data: mediaAsset, error: mediaError } = await supabase
          .from('media_assets')
          .select('id, filename, title, url, file_size')
          .eq('id', item.media_asset_id)
          .single();
        
        if (mediaError) {
          console.log(`   ❌ Media asset not found: ${mediaError.message}`);
        } else {
          console.log(`   ✅ Media asset: ${mediaAsset.filename} (${mediaAsset.title})`);
        }
      }
    }
    
    // Test the full JOIN query from the API
    console.log('\n🔍 Testing full JOIN query...');
    const { data: joinResult, error: joinError } = await supabase
      .from('photo_gallery_items')
      .select(`
        *,
        media_assets(
          id,
          filename,
          original_filename,
          file_type,
          title,
          description,
          url,
          file_size,
          mime_type,
          created_at,
          uploader_id,
          profiles!media_assets_uploader_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq('gallery_id', GALLERY_ID)
      .limit(5);
    
    if (joinError) {
      console.error('❌ JOIN Error:', joinError.message);
    } else {
      console.log('✅ JOIN result:', joinResult?.length || 0, 'items');
      if (joinResult?.length > 0) {
        console.log('📋 Sample joined record:');
        console.log('   Gallery item:', {
          id: joinResult[0].id,
          gallery_id: joinResult[0].gallery_id,
          media_asset_id: joinResult[0].media_asset_id
        });
        console.log('   Media asset:', joinResult[0].media_assets ? {
          id: joinResult[0].media_assets.id,
          filename: joinResult[0].media_assets.filename,
          title: joinResult[0].media_assets.title
        } : 'null');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPhotoGalleryItems();
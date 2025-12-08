const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMediaStructure() {
  try {
    console.log('🔍 Checking media structure and photo_galleries connection...\n');
    
    // 1. Check the photo_galleries record in detail
    const { data: photoGallery, error: pgError } = await supabase
      .from('photo_galleries')
      .select('*')
      .eq('organization_id', '4a1c31e8-89b7-476d-a74b-0c8b37efc850')
      .single();
    
    if (pgError) {
      console.log('❌ photo_galleries error:', pgError.message);
    } else {
      console.log('✅ Snow Foundation photo gallery:');
      console.log('  - Title:', photoGallery.title);
      console.log('  - Project ID:', photoGallery.project_id);
      console.log('  - Storyteller ID:', photoGallery.storyteller_id);
      console.log('  - Photo count:', photoGallery.photo_count);
      console.log('  - Gallery type:', photoGallery.gallery_type);
      console.log('  - Privacy level:', photoGallery.privacy_level);
      console.log('');
    }

    // 2. Check if there's a photos table that links to photo_galleries
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('gallery_id', photoGallery?.id)
      .limit(5);
    
    if (photosError) {
      console.log('❌ photos table error:', photosError.message);
    } else {
      console.log('✅ Found', photos?.length || 0, 'photos linked to this gallery');
      if (photos?.length > 0) {
        console.log('📸 Sample photo:', photos[0]);
      }
      console.log('');
    }

    // 3. Check the projects table with correct column
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', photoGallery?.project_id);
    
    if (projectError) {
      console.log('❌ Projects error:', projectError.message);
    } else if (projects?.length > 0) {
      console.log('✅ Deadly Hearts Trek project:');
      console.log('  - ID:', projects[0].id);
      console.log('  - Name:', projects[0].name || 'No name field');
      console.log('  - Description:', projects[0].description);
      console.log('  - Status:', projects[0].status);
      console.log('');
    }

    // 4. Check media bucket structure in more detail
    console.log('📁 Media bucket structure:');
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('media')
      .list('', { limit: 100 });
    
    if (bucketError) {
      console.log('❌ Media bucket error:', bucketError.message);
    } else {
      console.log('  - Total items:', bucketFiles?.length || 0);
      for (const file of bucketFiles || []) {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      }
      console.log('');
    }

    // 5. Check for any existing media_assets that might be linked
    const { data: mediaAssets, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('organization_id', '4a1c31e8-89b7-476d-a74b-0c8b37efc850');
    
    if (mediaError) {
      console.log('❌ media_assets error:', mediaError.message);
    } else {
      console.log('✅ Found', mediaAssets?.length || 0, 'media_assets for Snow Foundation');
      if (mediaAssets?.length > 0) {
        console.log('📄 Sample media asset:', mediaAssets[0]);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMediaStructure();
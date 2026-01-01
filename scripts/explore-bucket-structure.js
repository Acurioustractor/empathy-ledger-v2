const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function exploreBucketStructure() {
  try {
    console.log('🔍 Exploring deeper bucket structure...\n');
    
    // Check what's inside the two directories we found
    console.log('📁 Exploring bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/...');
    const { data: dir1Files, error: dir1Error } = await supabase.storage
      .from('media')
      .list('bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025', { limit: 100 });
    
    if (!dir1Error && dir1Files?.length > 0) {
      console.log(`✅ Found ${dir1Files.length} items:`);
      for (const file of dir1Files.slice(0, 20)) {  // Show first 20
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      }
      if (dir1Files.length > 20) {
        console.log(`   ... and ${dir1Files.length - 20} more files`);
      }
    } else {
      console.log('❌ Error or no files:', dir1Error?.message || 'No files found');
    }
    
    console.log('\n📁 Exploring c22fcf84-5a09-4893-a8ef-758c781e88a8/media/...');
    const { data: dir2Files, error: dir2Error } = await supabase.storage
      .from('media')
      .list('c22fcf84-5a09-4893-a8ef-758c781e88a8/media', { limit: 100 });
    
    if (!dir2Error && dir2Files?.length > 0) {
      console.log(`✅ Found ${dir2Files.length} items:`);
      for (const file of dir2Files.slice(0, 20)) {  // Show first 20
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      }
      if (dir2Files.length > 20) {
        console.log(`   ... and ${dir2Files.length - 20} more files`);
      }
    } else {
      console.log('❌ Error or no files:', dir2Error?.message || 'No files found');
    }

    // Let's also check the photo_gallery_items table schema
    console.log('\n📋 Checking photo_gallery_items table structure...');
    const { data: galleryItems, error: galleryError } = await supabase
      .from('photo_gallery_items')
      .select('*')
      .limit(1);
    
    if (galleryError) {
      console.log('❌ Error:', galleryError.message);
    } else {
      console.log('✅ photo_gallery_items table exists (empty)');
      
      // Let's try to understand the schema by inserting a test record
      console.log('\n🧪 Testing photo_gallery_items schema...');
      const testInsert = await supabase
        .from('photo_gallery_items')
        .insert({
          gallery_id: '35814c50-3379-413d-b2c9-7150a8ab7a8d', // The existing gallery
          filename: 'test.jpg',
          file_path: 'test/path',
          title: 'Test Photo'
        })
        .select();
      
      if (testInsert.error) {
        console.log('Schema hints from error:', testInsert.error.message);
      } else {
        console.log('✅ Test insert successful:', testInsert.data);
        
        // Clean up test record
        await supabase
          .from('photo_gallery_items')
          .delete()
          .eq('filename', 'test.jpg');
      }
    }

    // Check if there are other storage buckets
    console.log('\n🪣 Checking other storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (!bucketsError) {
      console.log('📂 Available buckets:');
      for (const bucket of buckets || []) {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        
        // Check each bucket for photos
        if (bucket.name !== 'media') {
          try {
            const { data: bucketFiles, error: bucketError } = await supabase.storage
              .from(bucket.name)
              .list('', { limit: 10 });
            
            if (!bucketError && bucketFiles?.length > 0) {
              console.log(`     └── Contains ${bucketFiles.length} files: ${bucketFiles.slice(0, 3).map(f => f.name).join(', ')}`);
            }
          } catch (err) {
            console.log(`     └── Cannot access bucket: ${err.message}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

exploreBucketStructure();
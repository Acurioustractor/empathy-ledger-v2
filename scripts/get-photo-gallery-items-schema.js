const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getPhotoGalleryItemsSchema() {
  try {
    console.log('🔍 Getting photo_gallery_items schema...\n');
    
    // Try different possible column combinations
    const schemaCombinations = [
      ['gallery_id', 'photo_id', 'filename', 'display_order'],
      ['gallery_id', 'media_asset_id', 'filename', 'created_at'],
      ['gallery_id', 'file_path', 'filename', 'title'],
      ['gallery_id', 'url', 'filename', 'metadata'],
      ['gallery_id', 'storage_path', 'original_filename', 'file_size'],
      ['gallery_id', 'bucket_path', 'mime_type', 'width', 'height'],
      ['id', 'gallery_id', 'filename', 'created_at'],
      ['id', 'gallery_id', 'photo_path', 'title', 'description'],
      ['id', 'gallery_id', 'storage_bucket', 'storage_key', 'filename']
    ];

    for (let i = 0; i < schemaCombinations.length; i++) {
      const columns = schemaCombinations[i];
      console.log(`🧪 Testing schema ${i + 1}: ${columns.join(', ')}`);
      
      try {
        const { data, error } = await supabase
          .from('photo_gallery_items')
          .select(columns.join(','))
          .limit(1);
        
        if (!error) {
          console.log(`✅ Schema ${i + 1} works! Columns: ${columns.join(', ')}`);
          return columns;
        } else {
          console.log(`❌ Schema ${i + 1} failed: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Schema ${i + 1} error: ${err.message}`);
      }
    }

    // If none work, try to get all columns by doing an insert and seeing what fails
    console.log('\n🔬 Trying to discover schema through insert attempts...');
    
    const testCases = [
      { gallery_id: '35814c50-3379-413d-b2c9-7150a8ab7a8d' },
      { gallery_id: '35814c50-3379-413d-b2c9-7150a8ab7a8d', filename: 'test.jpg' },
      { gallery_id: '35814c50-3379-413d-b2c9-7150a8ab7a8d', photo_path: 'test/path' },
      { gallery_id: '35814c50-3379-413d-b2c9-7150a8ab7a8d', storage_path: 'test/path' },
      { gallery_id: '35814c50-3379-413d-b2c9-7150a8ab7a8d', url: 'http://test.com/test.jpg' }
    ];

    for (let i = 0; i < testCases.length; i++) {
      console.log(`🧪 Test insert ${i + 1}:`, testCases[i]);
      
      const { data, error } = await supabase
        .from('photo_gallery_items')
        .insert(testCases[i])
        .select();
      
      if (!error) {
        console.log(`✅ Insert ${i + 1} successful:`, data);
        
        // Clean up
        await supabase
          .from('photo_gallery_items')
          .delete()
          .eq('gallery_id', '35814c50-3379-413d-b2c9-7150a8ab7a8d');
        
        return Object.keys(testCases[i]);
      } else {
        console.log(`❌ Insert ${i + 1} failed: ${error.message}`);
        
        // Extract column info from error message
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const match = error.message.match(/column "([^"]+)"/);
          if (match) {
            console.log(`   Missing column detected: ${match[1]}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

getPhotoGalleryItemsSchema();
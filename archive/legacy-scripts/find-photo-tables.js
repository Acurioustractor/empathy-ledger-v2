const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findPhotoTables() {
  try {
    console.log('🔍 Looking for photo-related tables...\n');
    
    const tablesToCheck = [
      'photos', 
      'gallery_photos', 
      'photo_items',
      'photo_records',
      'photo_assets',
      'gallery_items',
      'photo_gallery_items'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Found table: ${tableName}`);
          if (data?.length > 0) {
            console.log('   Sample record:', data[0]);
          } else {
            console.log('   Table is empty');
          }
          console.log('');
        }
      } catch (err) {
        // Table doesn't exist, continue
      }
    }

    // Let's also check if there are photos stored in different bucket paths
    console.log('📁 Checking bucket paths...\n');
    
    const pathsToCheck = [
      'photos',
      'gallery-photos', 
      'deadly-hearts-trek',
      'snow-foundation',
      'organization-photos',
      'project-photos'
    ];
    
    for (const path of pathsToCheck) {
      try {
        const { data: files, error } = await supabase.storage
          .from('media')
          .list(path, { limit: 10 });
        
        if (!error && files?.length > 0) {
          console.log(`✅ Found files in path: media/${path}`);
          console.log(`   Files: ${files.slice(0, 5).map(f => f.name).join(', ')}`);
          console.log('');
        }
      } catch (err) {
        // Path doesn't exist, continue
      }
    }

    // Check if the 80 photos are stored differently - maybe in a specific folder
    console.log('🔍 Checking deeper paths...\n');
    
    // List all directories in the media bucket
    const { data: allFiles, error: allError } = await supabase.storage
      .from('media')
      .list('', { limit: 1000 });
    
    if (!allError) {
      console.log('📂 All media bucket contents:');
      for (const file of allFiles || []) {
        console.log(`   - ${file.name}`);
        
        // If it looks like a directory, check inside it
        if (!file.name.includes('.')) {
          try {
            const { data: subFiles, error: subError } = await supabase.storage
              .from('media')
              .list(file.name, { limit: 10 });
            
            if (!subError && subFiles?.length > 0) {
              console.log(`     └── Contains ${subFiles.length} files: ${subFiles.slice(0, 3).map(f => f.name).join(', ')}`);
            }
          } catch (err) {
            // Not a directory
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

findPhotoTables();
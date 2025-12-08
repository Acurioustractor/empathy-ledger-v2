const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotoTables() {
  try {
    console.log('🔍 Checking for photo-related tables...');
    
    // Check for photo_galleries table
    const { data: photoGalleries, error: pgError } = await supabase
      .from('photo_galleries')
      .select('*')
      .limit(5);
    
    if (pgError) {
      console.log('❌ photo_galleries table error:', pgError.message);
    } else {
      console.log('✅ photo_galleries table exists with', photoGalleries?.length || 0, 'records (showing first 5)');
      if (photoGalleries?.length > 0) {
        console.log('📋 Sample record:', photoGalleries[0]);
      }
    }

    // Check if there's a media bucket with photos
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('media')
      .list('', { limit: 10 });
    
    if (bucketError) {
      console.log('❌ Media bucket error:', bucketError.message);
    } else {
      console.log('✅ Media bucket exists with', bucketFiles?.length || 0, 'items (showing first 10)');
      if (bucketFiles?.length > 0) {
        console.log('📁 Sample files:', bucketFiles.slice(0, 3).map(f => f.name));
      }
    }

    // Check for deadly hearts trek project
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .ilike('title', '%deadly%hearts%trek%');
    
    if (projectError) {
      console.log('❌ Projects error:', projectError.message);
    } else {
      console.log('✅ Found', projects?.length || 0, 'deadly hearts trek projects');
      if (projects?.length > 0) {
        console.log('🎯 Project:', projects[0]);
      }
    }

    // Check Snow Foundation organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', '4a1c31e8-89b7-476d-a74b-0c8b37efc850');
    
    if (orgError) {
      console.log('❌ Organization error:', orgError.message);
    } else {
      console.log('✅ Snow Foundation org:', org?.[0]?.name || 'Not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPhotoTables();
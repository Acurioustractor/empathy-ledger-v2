const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function findCherylAvatar() {
  // Check media assets for Cheryl
  const { data: media } = await supabase
    .from('media_assets')
    .select('*')
    .or('file_path.ilike.%cheryl%,display_name.ilike.%cheryl%,description.ilike.%cheryl%');

  console.log('MEDIA ASSETS WITH "CHERYL":');
  if (media && media.length > 0) {
    media.forEach(m => {
      console.log(`  ID: ${m.id}`);
      console.log(`  Display Name: ${m.display_name}`);
      console.log(`  File Path: ${m.file_path}`);
      console.log(`  Created By: ${m.created_by}`);
      console.log('  ---');
    });
  } else {
    console.log('  None found');
  }

  // Check if Kristy's profile has avatar_media_id set
  const { data: kristy } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_media_id')
    .eq('id', '197c6c02-da4f-43df-a376-f9242249c297')
    .single();

  console.log('\nKRISTY PROFILE AVATAR:');
  console.log(`  avatar_media_id: ${kristy.avatar_media_id || 'NULL'}`);

  // Check if there's a "storytellers" table with avatar info
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('*')
    .eq('id', '197c6c02-da4f-43df-a376-f9242249c297')
    .single();

  console.log('\nSTORYTELLERS TABLE CHECK:');
  if (error) {
    console.log(`  Error: ${error.message}`);
  } else if (storytellers) {
    console.log(`  Found entry - avatar_url: ${storytellers.avatar_url || 'NULL'}`);
  }
}

findCherylAvatar();

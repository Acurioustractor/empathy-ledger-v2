const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkStorytellerTable() {
  // Check if storytellers table exists
  const { data, error } = await supabase
    .from('storytellers')
    .select('*')
    .eq('id', '197c6c02-da4f-43df-a376-f9242249c297')
    .single();

  console.log('STORYTELLERS TABLE - Kristy Entry:');
  if (error) {
    console.log(`  Error: ${error.message}`);
    console.log(`  Code: ${error.code}`);
  } else {
    console.log('  FOUND DATA:');
    console.log(JSON.stringify(data, null, 2));
  }

  // Also check profile_id match
  const { data: byProfile } = await supabase
    .from('storytellers')
    .select('*')
    .eq('profile_id', '197c6c02-da4f-43df-a376-f9242249c297')
    .single();

  console.log('\n\nSTORYTELLERS TABLE - By profile_id:');
  if (byProfile) {
    console.log(JSON.stringify(byProfile, null, 2));
  } else {
    console.log('  Not found by profile_id');
  }
}

checkStorytellerTable();

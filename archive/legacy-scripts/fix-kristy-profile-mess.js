const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function analyzeMess() {
  console.log('=== KRISTY PROFILE MESS ANALYSIS ===\n');

  // The two Kristy profiles
  const kristyId1 = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'; // Older one with real transcript
  const kristyId2 = '197c6c02-da4f-43df-a376-f9242249c297'; // Newer one with fake data

  // Check both profiles
  const { data: profile1 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', kristyId1)
    .single();

  const { data: profile2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', kristyId2)
    .single();

  console.log('PROFILE 1 (OLDER - has real transcript):');
  console.log('  ID:', kristyId1);
  console.log('  Name:', profile1?.display_name);
  console.log('  Bio:', profile1?.bio?.substring(0, 80) + '...');
  console.log('  Created:', profile1?.created_at);

  console.log('\nPROFILE 2 (NEWER - has fake data):');
  console.log('  ID:', kristyId2);
  console.log('  Name:', profile2?.display_name);
  console.log('  Bio:', profile2?.bio?.substring(0, 80) + '...');
  console.log('  Created:', profile2?.created_at);

  // Check transcripts for each
  const { data: trans1 } = await supabase
    .from('transcripts')
    .select('id, title, created_at')
    .eq('storyteller_id', kristyId1);

  const { data: trans2 } = await supabase
    .from('transcripts')
    .select('id, title, created_at')
    .eq('storyteller_id', kristyId2);

  console.log('\n\nTRANSCRIPTS FOR PROFILE 1:');
  trans1?.forEach(t => console.log(`  - ${t.title} (${t.created_at})`));

  console.log('\nTRANSCRIPTS FOR PROFILE 2:');
  trans2?.forEach(t => console.log(`  - ${t.title} (${t.created_at})`));

  // Check stories
  const { data: stories1 } = await supabase
    .from('stories')
    .select('id, title')
    .eq('author_id', kristyId1);

  const { data: stories2 } = await supabase
    .from('stories')
    .select('id, title')
    .eq('author_id', kristyId2);

  console.log('\n\nSTORIES FOR PROFILE 1:');
  if (stories1?.length > 0) {
    stories1.forEach(s => console.log(`  - ${s.title}`));
  } else {
    console.log('  None');
  }

  console.log('\nSTORIES FOR PROFILE 2 (CONTAMINATED):');
  if (stories2?.length > 0) {
    stories2.forEach(s => console.log(`  - ${s.title}`));
  } else {
    console.log('  None');
  }

  console.log('\n\n=== RECOMMENDATION ===');
  console.log('1. Keep PROFILE 1 (b59a1f4c) - it has the real Kristy transcript');
  console.log('2. DELETE or merge PROFILE 2 (197c6c02) - it has contaminated data');
  console.log('3. Delete the 6 Cheryl stories from Profile 2');
  console.log('4. Delete the 3 fake transcripts from Profile 2');
  console.log('5. Update all references to use Profile 1 as the canonical Kristy profile');
}

analyzeMess();

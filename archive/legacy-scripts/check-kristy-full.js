const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkKristyFull() {
  // Check profile with avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '197c6c02-da4f-43df-a376-f9242249c297')
    .single();

  console.log('=== PROFILE ===');
  console.log('Display Name:', profile.display_name);
  console.log('Bio:', profile.bio);
  console.log('Avatar Media ID:', profile.avatar_media_id);

  // Check stories
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, LEFT(story_transcript, 100) as preview')
    .eq('author_id', '197c6c02-da4f-43df-a376-f9242249c297')
    .order('created_at', { ascending: false });

  console.log('\n=== STORIES ===');
  console.log('Story count:', stories?.length || 0);
  if (stories) {
    stories.forEach((s, i) => {
      console.log(`${i + 1}. ${s.title}`);
      console.log(`   Preview: ${s.preview}...`);
    });
  }
}

checkKristyFull();

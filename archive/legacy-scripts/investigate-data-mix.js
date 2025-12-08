const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function investigate() {
  const kristyId = '197c6c02-da4f-43df-a376-f9242249c297';

  console.log('=== DATA CONTAMINATION INVESTIGATION ===\n');

  // 1. Check ALL profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false });

  console.log('1. ALL PROFILES IN DATABASE:');
  allProfiles?.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.display_name || 'NO NAME'} (${p.id})`);
    console.log(`      Created: ${p.created_at}`);
  });

  // 2. Check stories - find who Cheryl stories belong to
  const { data: cherylStories } = await supabase
    .from('stories')
    .select('id, title, author_id, created_at')
    .ilike('title', '%Cheryl%')
    .order('created_at', { ascending: false });

  console.log('\n2. CHERYL STORIES - WHO DO THEY BELONG TO?:');
  cherylStories?.forEach((s, i) => {
    console.log(`   ${i + 1}. "${s.title}"`);
    console.log(`      Author ID: ${s.author_id || 'NULL'}`);
    console.log(`      Created: ${s.created_at}`);
    console.log(`      Matches Kristy? ${s.author_id === kristyId ? 'YES ❌' : 'NO'}`);
  });

  // 3. Check ALL stories for Kristy's profile ID
  const { data: kristyStories } = await supabase
    .from('stories')
    .select('id, title, author_id, created_at')
    .eq('author_id', kristyId)
    .order('created_at', { ascending: false });

  console.log('\n3. ALL STORIES WITH KRISTY AS AUTHOR:');
  kristyStories?.forEach((s, i) => {
    console.log(`   ${i + 1}. "${s.title}"`);
    console.log(`      Created: ${s.created_at}`);
  });

  // 4. Check transcripts
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, created_at')
    .order('created_at', { ascending: false });

  console.log('\n4. ALL TRANSCRIPTS:');
  allTranscripts?.forEach((t, i) => {
    console.log(`   ${i + 1}. "${t.title}"`);
    console.log(`      Storyteller ID: ${t.storyteller_id}`);
    console.log(`      Matches Kristy? ${t.storyteller_id === kristyId ? 'YES' : 'NO'}`);
    console.log(`      Created: ${t.created_at}`);
  });

  // 5. Check if there's a Cheryl profile
  const { data: cherylProfile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', '%Cheryl%')
    .single();

  console.log('\n5. IS THERE A CHERYL PROFILE?:');
  if (cherylProfile) {
    console.log(`   YES - Found profile for "${cherylProfile.display_name}"`);
    console.log(`   ID: ${cherylProfile.id}`);
    console.log(`   Created: ${cherylProfile.created_at}`);
  } else {
    console.log('   NO - No Cheryl profile found');
  }

  // 6. Check for any stories without author_id
  const { data: orphanStories } = await supabase
    .from('stories')
    .select('id, title, author_id, created_at')
    .is('author_id', null)
    .order('created_at', { ascending: false });

  console.log('\n6. ORPHAN STORIES (NO AUTHOR):');
  if (orphanStories && orphanStories.length > 0) {
    orphanStories?.forEach((s, i) => {
      console.log(`   ${i + 1}. "${s.title}"`);
      console.log(`      Created: ${s.created_at}`);
    });
  } else {
    console.log('   None found');
  }

  // 7. Check avatar media
  const { data: avatarMedia } = await supabase
    .from('media_assets')
    .select('*')
    .ilike('file_path', '%cheryl%');

  console.log('\n7. CHERYL AVATAR MEDIA:');
  if (avatarMedia && avatarMedia.length > 0) {
    avatarMedia?.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.display_name || m.file_path}`);
      console.log(`      ID: ${m.id}`);
      console.log(`      Created by: ${m.created_by || 'NULL'}`);
    });
  } else {
    console.log('   None found');
  }

  // 8. Check Kristy's profile avatar reference
  const { data: kristyProfile } = await supabase
    .from('profiles')
    .select('avatar_media_id')
    .eq('id', kristyId)
    .single();

  console.log('\n8. KRISTY\'S AVATAR MEDIA ID:');
  console.log(`   ${kristyProfile?.avatar_media_id || 'NULL'}`);

  console.log('\n=== END INVESTIGATION ===');
}

investigate();

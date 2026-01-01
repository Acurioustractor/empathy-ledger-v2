const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function fullReview() {
  const profileId = '197c6c02-da4f-43df-a376-f9242249c297';

  console.log('=== FULL KRISTY PROFILE REVIEW ===\n');

  // 1. Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  console.log('1. PROFILE:');
  console.log('   ID:', profile?.id);
  console.log('   Display Name:', profile?.display_name);
  console.log('   Bio:', profile?.bio);
  console.log('   Avatar Media ID:', profile?.avatar_media_id);
  console.log('   Community Roles:', profile?.community_roles);

  // 2. Stories
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('author_id', profileId)
    .order('created_at', { ascending: false });

  console.log('\n2. STORIES:');
  console.log('   Count:', stories?.length || 0);
  if (stories?.length > 0) {
    stories.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} (${s.status})`);
    });
  }

  // 3. Check if transcripts table exists and has data
  const { data: transcripts, error: transcriptError } = await supabase
    .from('transcripts')
    .select('*')
    .eq('storyteller_id', profileId)
    .order('created_at', { ascending: false });

  console.log('\n3. TRANSCRIPTS:');
  if (transcriptError) {
    console.log('   Error:', transcriptError.message);
    console.log('   (Table may not exist)');
  } else {
    console.log('   Count:', transcripts?.length || 0);
    if (transcripts?.length > 0) {
      transcripts.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.title} - Status: ${t.processing_status || t.status}`);
      });
    }
  }

  // 4. Check AI analysis results
  const { data: analysis, error: analysisError } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  console.log('\n4. AI ANALYSIS RESULTS:');
  if (analysisError) {
    console.log('   Error:', analysisError.message);
  } else {
    console.log('   Count:', analysis?.length || 0);
    if (analysis?.length > 0) {
      analysis.forEach((a, i) => {
        console.log(`   ${i + 1}. Type: ${a.analysis_type}, Status: ${a.status}`);
      });
    }
  }

  // 5. Check for organization memberships
  const { data: orgs, error: orgError } = await supabase
    .from('profile_organizations')
    .select('*, organisations(*)')
    .eq('profile_id', profileId);

  console.log('\n5. ORGANIZATIONS:');
  if (orgError) {
    console.log('   Error:', orgError.message);
  } else {
    console.log('   Count:', orgs?.length || 0);
    if (orgs?.length > 0) {
      orgs.forEach((o, i) => {
        console.log(`   ${i + 1}. ${o.organisations?.name || 'Unknown'}`);
      });
    }
  }

  // 6. Check what the API returns
  console.log('\n6. CHECKING API RESPONSE:');
  try {
    const response = await fetch(`http://localhost:3030/api/storytellers/${profileId}`);
    const apiData = await response.json();

    console.log('   API Status:', response.status);
    console.log('   Display Name:', apiData.display_name);
    console.log('   Bio:', apiData.bio?.substring(0, 80) + '...');
    console.log('   Stories Count:', apiData.stories?.length || 0);
    console.log('   Transcripts Count:', apiData.transcripts?.length || 0);

    if (apiData.stories?.length > 0) {
      console.log('\n   First story from API:');
      console.log('     Title:', apiData.stories[0].title);
      console.log('     Preview:', apiData.stories[0].content?.substring(0, 80) + '...');
    }

    if (apiData.profile?.avatar_url) {
      console.log('\n   Avatar URL:', apiData.profile.avatar_url);
    }
  } catch (err) {
    console.log('   Error fetching from API:', err.message);
  }

  console.log('\n=== END REVIEW ===');
}

fullReview();

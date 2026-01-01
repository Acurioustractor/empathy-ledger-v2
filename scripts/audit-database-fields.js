const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function auditDatabaseFields() {
  console.log('🔍 DATABASE AUDIT FOR STORYTELLER WIZARD\n');
  console.log('='.repeat(60));

  // Check profiles table
  console.log('\n📊 PROFILES TABLE');
  console.log('-'.repeat(60));
  const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
  const profileFields = profile ? Object.keys(profile).sort() : [];

  const requiredProfileFields = [
    'id', 'full_name', 'display_name', 'bio', 'email', 'phone_number',
    'profile_image_url', 'location_id', 'tenant_id', 'tenant_roles',
    'created_by', 'created_at', 'updated_at', 'is_storyteller'
  ];

  console.log('\nRequired fields:');
  requiredProfileFields.forEach(field => {
    const exists = profileFields.includes(field);
    console.log(`  ${exists ? '✅' : '❌'} ${field}`);
  });

  // Check transcripts table
  console.log('\n📊 TRANSCRIPTS TABLE');
  console.log('-'.repeat(60));
  const { data: transcript } = await supabase.from('transcripts').select('*').limit(1).single();
  const transcriptFields = transcript ? Object.keys(transcript).sort() : [];

  const requiredTranscriptFields = [
    'id', 'storyteller_id', 'title', 'content', 'transcript_text',
    'tenant_id', 'created_by', 'created_at', 'status', 'metadata'
  ];

  console.log('\nRequired fields:');
  requiredTranscriptFields.forEach(field => {
    const exists = transcriptFields.includes(field);
    console.log(`  ${exists ? '✅' : '❌'} ${field}`);
  });

  // Check for project_storytellers table
  console.log('\n📊 PROJECT_STORYTELLERS TABLE');
  console.log('-'.repeat(60));
  const { data: projectStorytellers, error: psError } = await supabase
    .from('project_storytellers')
    .select('*')
    .limit(1);

  if (psError) {
    console.log('  ❌ Table does not exist');
    console.log('  Error:', psError.message);
  } else {
    console.log('  ✅ Table exists');
    if (projectStorytellers && projectStorytellers.length > 0) {
      const fields = Object.keys(projectStorytellers[0]).sort();
      console.log('  Fields:', fields.join(', '));
    }
  }

  // Check projects table for organization linkage
  console.log('\n📊 PROJECTS TABLE');
  console.log('-'.repeat(60));
  const { data: project } = await supabase.from('projects').select('*').limit(1).single();
  if (project) {
    const hasOrgId = 'organization_id' in project || 'organisation_id' in project;
    const hasTenantId = 'tenant_id' in project;
    console.log(`  ${hasOrgId ? '✅' : '❌'} organization_id`);
    console.log(`  ${hasTenantId ? '✅' : '❌'} tenant_id`);
  }

  // Check galleries table
  console.log('\n📊 GALLERIES TABLE');
  console.log('-'.repeat(60));
  const { data: gallery } = await supabase.from('galleries').select('*').limit(1).single();
  if (gallery) {
    const hasOrgId = 'organization_id' in gallery || 'organisation_id' in gallery;
    const hasTenantId = 'tenant_id' in gallery;
    console.log(`  ${hasOrgId ? '✅' : '❌'} organization_id`);
    console.log(`  ${hasTenantId ? '✅' : '❌'} tenant_id`);
  }

  // Check media_assets table
  console.log('\n📊 MEDIA_ASSETS TABLE');
  console.log('-'.repeat(60));
  const { data: media, error: mediaError } = await supabase
    .from('media_assets')
    .select('*')
    .limit(1)
    .single();

  if (mediaError) {
    console.log('  ❌ Table does not exist or no data');
    console.log('  Error:', mediaError.message);
  } else if (media) {
    console.log('  ✅ Table exists');
    const requiredMediaFields = ['id', 'url', 'thumbnail_url', 'uploaded_by', 'created_at'];
    requiredMediaFields.forEach(field => {
      const exists = field in media;
      console.log(`    ${exists ? '✅' : '❌'} ${field}`);
    });
  }

  // Check locations table
  console.log('\n📊 LOCATIONS TABLE');
  console.log('-'.repeat(60));
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .limit(1)
    .single();

  if (locationError) {
    console.log('  ❌ Table does not exist or no data');
    console.log('  Error:', locationError.message);
  } else if (location) {
    console.log('  ✅ Table exists');
    const fields = Object.keys(location).sort();
    console.log('  Fields:', fields.join(', '));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Audit complete!\n');
}

auditDatabaseFields().catch(console.error);

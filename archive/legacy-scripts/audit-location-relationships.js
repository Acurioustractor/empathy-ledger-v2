const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function auditLocationStructure() {
  console.log('='.repeat(80));
  console.log('LOCATION & RELATIONSHIPS AUDIT');
  console.log('='.repeat(80));

  // Check for location-related tables
  const tables = ['locations', 'location_data', 'places', 'geographic_locations'];

  console.log('\n📍 Checking for location tables...\n');
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error && data) {
      console.log(`✅ ${table} exists - Sample:`, Object.keys(data[0] || {}));
    }
  }

  console.log('\n\n📊 Location Fields in Core Tables:\n');

  // Check Stories
  const { data: story } = await supabase.from('stories').select('*').limit(1).single();
  if (story) {
    const locationFields = Object.keys(story).filter(k =>
      k.includes('location') || k.includes('place') || k.includes('geographic')
    );
    console.log('STORIES table location fields:', locationFields);

    // Show sample values
    console.log('  Sample values:');
    locationFields.forEach(f => {
      console.log(`    ${f}:`, story[f]);
    });
  }

  // Check Transcripts
  const { data: transcript } = await supabase.from('transcripts').select('*').limit(1).single();
  if (transcript) {
    const locationFields = Object.keys(transcript).filter(k =>
      k.includes('location') || k.includes('place') || k.includes('geographic')
    );
    console.log('\nTRANSCRIPTS table location fields:', locationFields);
    if (locationFields.length > 0) {
      console.log('  Sample values:');
      locationFields.forEach(f => {
        console.log(`    ${f}:`, transcript[f]);
      });
    }
  }

  // Check Organizations
  const { data: org } = await supabase.from('organizations').select('*').limit(1).single();
  if (org) {
    const locationFields = Object.keys(org).filter(k =>
      k.includes('location') || k.includes('place') || k.includes('geographic')
    );
    console.log('\nORGANIZATIONS table location fields:', locationFields);
    if (locationFields.length > 0) {
      console.log('  Sample values:');
      locationFields.forEach(f => {
        console.log(`    ${f}:`, org[f]);
      });
    }
  }

  // Check Projects
  const { data: project } = await supabase.from('projects').select('*').limit(1).single();
  if (project) {
    const locationFields = Object.keys(project).filter(k =>
      k.includes('location') || k.includes('place') || k.includes('geographic')
    );
    console.log('\nPROJECTS table location fields:', locationFields);
    if (locationFields.length > 0) {
      console.log('  Sample values:');
      locationFields.forEach(f => {
        console.log(`    ${f}:`, project[f]);
      });
    }
  }

  // Check Profiles
  const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
  if (profile) {
    const locationFields = Object.keys(profile).filter(k =>
      k.includes('location') || k.includes('place') || k.includes('geographic')
    );
    console.log('\nPROFILES table location fields:', locationFields);
    if (locationFields.length > 0) {
      console.log('  Sample values (first 3):');
      locationFields.slice(0, 3).forEach(f => {
        console.log(`    ${f}:`, profile[f]);
      });
    }
  }

  console.log('\n\n🔗 Relationship Foreign Keys:\n');

  // Check Stories relationships
  const storyFields = Object.keys(story).filter(k => k.endsWith('_id'));
  console.log('Stories relationships:', storyFields);
  console.log('  Key relationships:');
  console.log(`    organization_id: ${story.organization_id}`);
  console.log(`    author_id: ${story.author_id}`);
  console.log(`    project_id: ${story.project_id}`);
  console.log(`    storyteller_id: ${story.storyteller_id}`);

  // Check Transcripts relationships
  const transcriptFields = Object.keys(transcript).filter(k => k.endsWith('_id'));
  console.log('\nTranscripts relationships:', transcriptFields);
  console.log('  Key relationships:');
  console.log(`    story_id: ${transcript.story_id}`);
  console.log(`    organization_id: ${transcript.organization_id || 'N/A'}`);
  console.log(`    location_id: ${transcript.location_id || 'N/A'}`);

  // Check Organizations relationships
  const orgFields = Object.keys(org).filter(k => k.endsWith('_id'));
  console.log('\nOrganizations relationships:', orgFields);

  // Check Projects relationships
  const projectFields = Object.keys(project).filter(k => k.endsWith('_id'));
  console.log('\nProjects relationships:', projectFields);
  console.log('  Key relationships:');
  console.log(`    organization_id: ${project.organization_id}`);
  console.log(`    tenant_id: ${project.tenant_id}`);

  console.log('\n\n📈 Data Completeness Analysis:\n');

  // Count how many records have location data
  const { count: storiesTotal } = await supabase.from('stories').select('*', { count: 'exact', head: true });
  const { count: storiesWithLocation } = await supabase.from('stories').select('*', { count: 'exact', head: true }).not('location', 'is', null);

  const { count: projectsTotal } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  const { count: projectsWithLocation } = await supabase.from('projects').select('*', { count: 'exact', head: true }).not('location', 'is', null);

  const { count: orgsTotal } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
  const { count: orgsWithLocation } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).not('location', 'is', null);

  console.log(`Stories: ${storiesWithLocation || 0}/${storiesTotal || 0} have location (${Math.round((storiesWithLocation/storiesTotal)*100)}%)`);
  console.log(`Projects: ${projectsWithLocation || 0}/${projectsTotal || 0} have location (${Math.round((projectsWithLocation/projectsTotal)*100)}%)`);
  console.log(`Organizations: ${orgsWithLocation || 0}/${orgsTotal || 0} have location (${Math.round((orgsWithLocation/orgsTotal)*100)}%)`);

  console.log('\n' + '='.repeat(80));
}

auditLocationStructure();
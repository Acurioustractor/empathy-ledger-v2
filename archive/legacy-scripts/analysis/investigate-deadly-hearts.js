#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateDeadlyHearts() {
  console.log('🔍 Investigating Deadly Hearts Trek project...\n');

  // Find the Deadly Hearts project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .ilike('name', '%deadly hearts%')
    .single();

  if (!project) {
    console.log('❌ No Deadly Hearts project found');
    return;
  }

  console.log('📋 Project details:');
  console.log('- ID:', project.id);
  console.log('- Name:', project.name);
  console.log('- Tenant ID:', project.tenant_id);
  console.log('- Org ID:', project.organization_id);
  console.log('');

  // Check project_storytellers junction table
  const { data: projectStorytellers } = await supabase
    .from('project_storytellers')
    .select('storyteller_id')
    .eq('project_id', project.id);

  console.log('📊 Project Storytellers junction table:');
  console.log('- Count:', projectStorytellers?.length || 0);
  if (projectStorytellers?.length) {
    console.log('- IDs:', projectStorytellers.map(ps => ps.storyteller_id));
  }
  console.log('');

  // Check project_participants table
  const { data: participants } = await supabase
    .from('project_participants')
    .select('storyteller_id')
    .eq('project_id', project.id);

  console.log('📊 Project Participants table:');
  console.log('- Count:', participants?.length || 0);
  if (participants?.length) {
    console.log('- IDs:', participants.map(p => p.storyteller_id));
  }
  console.log('');

  // Check stories linked to this project
  const { data: stories } = await supabase
    .from('stories')
    .select('id, author_id, title')
    .eq('project_id', project.id);

  console.log('📚 Stories linked to project:');
  console.log('- Count:', stories?.length || 0);
  if (stories?.length) {
    const uniqueAuthors = new Set(stories.map(s => s.author_id));
    console.log('- Unique authors:', uniqueAuthors.size);
    console.log('- Author IDs:', Array.from(uniqueAuthors));
    stories.slice(0, 3).forEach(s => {
      console.log('  -', s.title, '(author:', s.author_id + ')');
    });
  }
  console.log('');

  // Check profiles in same tenant with Deadly Hearts in bio
  const { data: deadlyHeartsProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, bio, tenant_id')
    .eq('tenant_id', project.tenant_id)
    .ilike('bio', '%deadly hearts%');

  console.log('📝 Profiles mentioning Deadly Hearts:');
  console.log('- Count:', deadlyHeartsProfiles?.length || 0);
  deadlyHeartsProfiles?.forEach(p => {
    console.log('  -', p.display_name, '(ID:', p.id + ')');
  });
  console.log('');

  // Check if these profiles have project linkages
  if (deadlyHeartsProfiles?.length) {
    console.log('🔗 Checking linkages for Deadly Hearts profiles...');
    for (const profile of deadlyHeartsProfiles) {
      const { data: linkage } = await supabase
        .from('project_storytellers')
        .select('*')
        .eq('project_id', project.id)
        .eq('storyteller_id', profile.id);

      console.log('  -', profile.display_name, ':', linkage?.length ? 'LINKED' : 'NOT LINKED');
    }
  }
}

investigateDeadlyHearts();
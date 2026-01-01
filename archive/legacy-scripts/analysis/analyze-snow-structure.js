#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeCurrentStructure() {
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';
  const snowOrgId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';

  console.log('🏢 SNOW FOUNDATION ANALYSIS\n');

  // Check current profiles in Snow Foundation tenant
  const { data: currentMembers } = await supabase
    .from('profiles')
    .select('id, display_name, email, full_name')
    .eq('tenant_id', snowTenantId);

  console.log(`👥 Current Snow Foundation tenant members (${currentMembers?.length || 0}):`);
  currentMembers?.forEach(member => {
    console.log(`   - ${member.display_name || member.full_name || 'No name'} (${member.email})`);
  });

  // Check organization roles (if exists)
  try {
    const { data: orgRoles } = await supabase
      .from('organization_roles')
      .select('*, profiles(display_name, email)')
      .eq('organization_id', snowOrgId);

    console.log(`\n🎭 Organization roles (${orgRoles?.length || 0}):`);
    orgRoles?.forEach(role => {
      console.log(`   - ${role.profiles?.display_name} (${role.role}) - ${role.status}`);
    });
  } catch (error) {
    console.log('\n🎭 Organization roles table does not exist or has different structure');
  }

  // Check project storytellers
  const deadlyProjectId = '96ded48f-db6e-4962-abab-33c88a123fa9';
  const { data: projectTranscripts } = await supabase
    .from('transcripts')
    .select('storyteller_id, title, profiles(display_name, tenant_id)')
    .eq('project_id', deadlyProjectId)
    .not('storyteller_id', 'is', null);

  console.log(`\n📖 Deadly Hearts Trek storytellers (${projectTranscripts?.length || 0}):`);
  const storytellers = new Map();
  projectTranscripts?.forEach(transcript => {
    if (transcript.profiles) {
      const key = transcript.storyteller_id;
      if (!storytellers.has(key)) {
        storytellers.set(key, {
          name: transcript.profiles.display_name,
          tenant_id: transcript.profiles.tenant_id,
          transcripts: []
        });
      }
      storytellers.get(key).transcripts.push(transcript.title);
    }
  });

  storytellers.forEach((storyteller, id) => {
    const inSnow = storyteller.tenant_id === snowTenantId;
    console.log(`   - ${storyteller.name} (${storyteller.transcripts.length} transcripts) ${inSnow ? '✅ In Snow' : '❌ Not in Snow'}`);
  });

  // Check specific people mentioned
  console.log('\n🔍 CHECKING SPECIFIC PEOPLE:');
  const peopleToCheck = [
    'Georgina Byron',
    'Benjamin Knight',
    'Nicholas Marchesi'
  ];

  for (const name of peopleToCheck) {
    const { data: person } = await supabase
      .from('profiles')
      .select('id, display_name, email, tenant_id')
      .or(`display_name.ilike.%${name}%,full_name.ilike.%${name}%`)
      .limit(1);

    if (person && person.length > 0) {
      const inSnow = person[0].tenant_id === snowTenantId;
      console.log(`   - ${name}: Found as "${person[0].display_name}" ${inSnow ? '✅ In Snow' : '❌ Not in Snow'}`);
    } else {
      console.log(`   - ${name}: ❌ Not found in system`);
    }
  }
}

analyzeCurrentStructure();
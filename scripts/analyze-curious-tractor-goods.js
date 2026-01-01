const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeCuriousTractor() {
  console.log('\n🔍 Analyzing A Curious Tractor & Goods...\n');

  // Find A Curious Tractor organization
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', '%curious%tractor%');

  if (orgError) {
    console.error('❌ Error finding organization:', orgError);
    return;
  }

  console.log(`📊 Found ${orgs?.length || 0} matching organizations\n`);

  if (!orgs || orgs.length === 0) {
    console.log('⚠️  A Curious Tractor organization not found. Available organizations:');

    const { data: allOrgs } = await supabase
      .from('organizations')
      .select('id, name, description')
      .order('name');

    allOrgs?.forEach((org, idx) => {
      console.log(`${idx + 1}. ${org.name} (${org.id})`);
    });
    return;
  }

  const org = orgs[0];
  console.log('🏢 Organization Found:');
  console.log(`   Name: ${org.name}`);
  console.log(`   ID: ${org.id}`);
  console.log(`   Tenant ID: ${org.tenant_id}`);
  console.log(`   Description: ${org.description || 'None'}\n`);

  // Get all members/storytellers
  const { data: members, error: memberError } = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      profiles!inner(
        id,
        display_name,
        full_name,
        bio,
        cultural_background,
        tenant_roles
      )
    `)
    .eq('organization_id', org.id)
    .eq('is_active', true);

  if (memberError) {
    console.error('❌ Error fetching members:', memberError);
    return;
  }

  const storytellers = members
    ?.filter(m => m.profiles?.tenant_roles?.includes('storyteller'))
    .map(m => m.profiles) || [];

  console.log(`👥 Total Members: ${members?.length || 0}`);
  console.log(`📖 Storytellers: ${storytellers.length}\n`);

  if (storytellers.length > 0) {
    console.log('━'.repeat(80));
    console.log('STORYTELLERS:\n');

    for (const storyteller of storytellers) {
      console.log(`👤 ${storyteller.display_name || storyteller.full_name}`);
      console.log(`   ID: ${storyteller.id}`);
      console.log(`   Bio: ${storyteller.bio ? `✅ ${storyteller.bio.length} chars` : '❌ Missing'}`);
      console.log(`   Cultural Background: ${storyteller.cultural_background || '❌ Missing'}`);

      // Get transcripts
      const { data: transcripts } = await supabase
        .from('transcripts')
        .select('id, title, status, ai_summary, themes')
        .eq('storyteller_id', storyteller.id);

      console.log(`   📄 Transcripts: ${transcripts?.length || 0}`);

      if (transcripts && transcripts.length > 0) {
        transcripts.forEach((t, idx) => {
          const hasAnalysis = t.ai_summary && t.themes?.length > 0;
          console.log(`      ${idx + 1}. "${t.title || 'Untitled'}" ${hasAnalysis ? '✅' : '❌'}`);
        });
      }
      console.log('');
    }
    console.log('━'.repeat(80));
  }

  // Check for Goods project
  console.log('\n🎯 Checking for Goods Project...\n');

  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', org.id);

  if (projectError) {
    console.error('❌ Error fetching projects:', projectError);
    return;
  }

  console.log(`📊 Total Projects: ${projects?.length || 0}\n`);

  const goodsProject = projects?.find(p =>
    p.name?.toLowerCase().includes('goods') ||
    p.description?.toLowerCase().includes('goods')
  );

  if (goodsProject) {
    console.log('✅ Goods Project Found:');
    console.log(`   Name: ${goodsProject.name}`);
    console.log(`   ID: ${goodsProject.id}`);
    console.log(`   Status: ${goodsProject.status}`);
    console.log(`   Description: ${goodsProject.description || 'None'}\n`);

    // Get assigned storytellers
    const { data: assignments } = await supabase
      .from('project_storytellers')
      .select(`
        storyteller_id,
        profiles!inner(display_name)
      `)
      .eq('project_id', goodsProject.id);

    console.log(`   👥 Assigned Storytellers: ${assignments?.length || 0}`);
    assignments?.forEach((a, idx) => {
      console.log(`      ${idx + 1}. ${a.profiles.display_name}`);
    });

    // Get project transcripts
    const { data: projectTranscripts } = await supabase
      .from('transcripts')
      .select('id, title, storyteller_id')
      .eq('project_id', goodsProject.id);

    console.log(`   📄 Project Transcripts: ${projectTranscripts?.length || 0}\n`);
  } else {
    console.log('❌ Goods Project Not Found\n');
    console.log('Available Projects:');
    projects?.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} (${p.status})`);
    });
  }

  // Summary
  console.log('\n━'.repeat(80));
  console.log('\n📊 SUMMARY:\n');
  console.log(`Organization: ${org.name}`);
  console.log(`Storytellers: ${storytellers.length}`);
  console.log(`Projects: ${projects?.length || 0}`);
  console.log(`Goods Project: ${goodsProject ? '✅ Found' : '❌ Not Found'}`);
  console.log('');
}

analyzeCuriousTractor().catch(console.error);

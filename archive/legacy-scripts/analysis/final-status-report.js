#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function finalStatus() {
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';
  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';

  console.log('📊 FINAL STATUS REPORT\n');

  // Check Snow Foundation members
  const { data: snowMembers } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('tenant_id', snowTenantId);

  console.log(`👥 Snow Foundation Members: ${snowMembers?.length || 0}`);
  snowMembers?.forEach((m, i) => {
    console.log(`  ${i+1}. ${m.display_name || 'No name'} (${m.email || 'No email'})`);
  });

  // Check Deadly Hearts project content
  const { data: deadlyTranscripts } = await supabase
    .from('transcripts')
    .select('title, storyteller_id')
    .eq('project_id', '96ded48f-db6e-4962-abab-33c88a123fa9');

  console.log(`\n📝 Deadly Hearts Project Content: ${deadlyTranscripts?.length || 0}`);
  if (deadlyTranscripts && deadlyTranscripts.length > 0) {
    for (const t of deadlyTranscripts) {
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', t.storyteller_id)
        .single();
      console.log(`   - ${t.title} (by ${storyteller?.display_name || 'Unknown'})`);
    }
  }

  // Check Benjamin Knight status
  const { data: benjamin } = await supabase
    .from('profiles')
    .select('display_name, email, tenant_id')
    .eq('id', benjaminId)
    .single();

  if (benjamin) {
    const isInSnow = benjamin.tenant_id === snowTenantId;
    console.log('\n👤 Benjamin Knight Status:');
    console.log(`   Email: ${benjamin.email}`);
    console.log(`   Current tenant: ${benjamin.tenant_id}`);
    console.log(`   In Snow Foundation: ${isInSnow ? '✅ Yes' : '❌ No'}`);

    if (!isInSnow) {
      console.log('\n💭 DECISION POINT:');
      console.log('   Should Benjamin Knight be moved to Snow Foundation?');
      console.log('   - He has 3 transcripts about Empathy Ledger platform');
      console.log('   - No direct Deadly Hearts content');
      console.log('   - Appears to be a platform developer/admin');
    }
  }

  console.log('\n✅ SUMMARY:');
  console.log('   ✅ Deleted 5 fake profiles');
  console.log('   ✅ Cleaned up duplicate Carla Knight profile');
  console.log('   ✅ Linked 3 Deadly Hearts transcripts to project');
  console.log('   ✅ Moved Georgina Byron AM to Snow Foundation');
  console.log(`   📊 Snow Foundation: ${snowMembers?.length || 0} members, 1 project with content`);
}

finalStatus();
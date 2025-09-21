#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupSnowFoundationMembers() {
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';
  const snowOrgId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';

  console.log('🏢 SETTING UP SNOW FOUNDATION ORGANIZATION MEMBERS\n');

  // 1. Georgina Byron - Already in Snow Foundation
  console.log('✅ Georgina Byron AM - Already in Snow Foundation as CEO');

  // 2. Benjamin Knight - Move to Snow Foundation and add as member
  console.log('\n👤 Setting up Benjamin Knight...');
  const { data: benjamin } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'benjamin@act.place')
    .single();

  if (benjamin) {
    // Move Benjamin to Snow Foundation tenant
    console.log('🔄 Moving Benjamin Knight to Snow Foundation tenant...');
    const { error: moveError } = await supabase
      .from('profiles')
      .update({ tenant_id: snowTenantId })
      .eq('id', benjamin.id);

    if (moveError) {
      console.log('❌ Error moving Benjamin:', moveError.message);
    } else {
      console.log('✅ Benjamin Knight moved to Snow Foundation');
    }

    // Check if organization_roles table exists and add role
    try {
      const { error: roleError } = await supabase
        .from('organization_roles')
        .upsert({
          organization_id: snowOrgId,
          profile_id: benjamin.id,
          role: 'member',
          status: 'active',
          assigned_at: new Date().toISOString(),
          assigned_by: benjamin.id // Self-assigned for now
        });

      if (roleError) {
        console.log('⚠️ Could not add organization role:', roleError.message);
      } else {
        console.log('✅ Added Benjamin as organization member');
      }
    } catch (error) {
      console.log('ℹ️ Organization roles table may not exist - using tenant membership only');
    }
  } else {
    console.log('❌ Benjamin Knight not found');
  }

  // 3. Nicholas Marchesi - Check if exists, create if needed
  console.log('\n👤 Setting up Nicholas Marchesi...');

  // Search for Nicholas with variations
  const { data: existingNick } = await supabase
    .from('profiles')
    .select('*')
    .or('display_name.ilike.%nicholas%,display_name.ilike.%marchesi%,full_name.ilike.%nicholas%,full_name.ilike.%marchesi%')
    .limit(1);

  if (existingNick && existingNick.length > 0) {
    console.log(`Found existing profile: ${existingNick[0].display_name}`);

    // Move to Snow Foundation if not already there
    if (existingNick[0].tenant_id !== snowTenantId) {
      const { error: moveError } = await supabase
        .from('profiles')
        .update({ tenant_id: snowTenantId })
        .eq('id', existingNick[0].id);

      if (moveError) {
        console.log('❌ Error moving Nicholas:', moveError.message);
      } else {
        console.log('✅ Nicholas Marchesi moved to Snow Foundation');
      }
    } else {
      console.log('✅ Nicholas Marchesi already in Snow Foundation');
    }
  } else {
    console.log('❌ Nicholas Marchesi not found in system');
    console.log('💡 Will need to be added when he joins or creates content');
  }

  // 4. Check current Snow Foundation members
  console.log('\n👥 FINAL SNOW FOUNDATION MEMBERS:');
  const { data: finalMembers } = await supabase
    .from('profiles')
    .select('display_name, email, tenant_id')
    .eq('tenant_id', snowTenantId);

  finalMembers?.forEach(member => {
    console.log(`   - ${member.display_name} (${member.email})`);
  });

  console.log(`\n📊 Total Snow Foundation members: ${finalMembers?.length || 0}`);

  // 5. Prepare for storyteller identification
  console.log('\n📖 NEXT STEPS FOR STORYTELLERS:');
  console.log('   - Storytellers are people whose stories contribute to Snow Foundation impact');
  console.log('   - They may or may not be organization members');
  console.log('   - Deadly Hearts Trek project storytellers should be identified and linked');
  console.log('   - Their transcripts and stories will aggregate into Snow Foundation metrics');
}

setupSnowFoundationMembers();
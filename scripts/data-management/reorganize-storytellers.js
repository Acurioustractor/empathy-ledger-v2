#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function moveStorytellerProfiles() {
  console.log('🔄 Moving storyteller profiles...\n');

  const moves = [
    {
      name: 'Carla Knight',
      id: 'f1c25403-67be-401b-aec4-0c8a2940c9b9',
      targetTenant: '109f5ad5-8806-4944-838b-b7e1a910aea2', // Independent
      targetOrg: null,
      description: 'Independent storyteller'
    },
    {
      name: 'Elders Group',
      id: '5a6a4087-9d53-495e-bccf-8432f329c697',
      targetTenant: '9eb91d66-2286-4810-a04a-311d4cdb4631', // Palm Island
      targetOrg: null, // Will find Palm Island org ID
      description: 'Palm Island Community'
    },
    {
      name: 'Wayne Glenn',
      id: '65f60425-840b-4f5b-935a-f1698664b19a',
      targetTenant: '10674822-defa-48ec-92d6-5c76caadb750', // Goods
      targetOrg: null, // Will find Goods org ID
      description: 'Goods organization'
    }
  ];

  // First, get the correct org IDs
  const { data: palmIslandOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('name', 'Palm Island Community Company')
    .single();

  const { data: goodsOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('name', 'Goods.')
    .single();

  if (palmIslandOrg) moves[1].targetOrg = palmIslandOrg.id;
  if (goodsOrg) moves[2].targetOrg = goodsOrg.id;

  for (const move of moves) {
    console.log(`📋 Moving ${move.name} to ${move.description}...`);

    // Update the profile tenant
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ tenant_id: move.targetTenant })
      .eq('id', move.id);

    if (profileError) {
      console.log(`   ❌ Error updating profile: ${profileError.message}`);
      continue;
    }

    // Remove from Snow Foundation organization roles
    const { error: removeError } = await supabase
      .from('organization_roles')
      .delete()
      .eq('profile_id', move.id)
      .eq('organization_id', '4a1c31e8-89b7-476d-a74b-0c8b37efc850'); // Snow Foundation

    if (removeError && !removeError.message.includes('No rows')) {
      console.log(`   ⚠️  Could not remove org role: ${removeError.message}`);
    }

    // Add to new organization if specified
    if (move.targetOrg) {
      const { error: addError } = await supabase
        .from('organization_roles')
        .insert({
          organization_id: move.targetOrg,
          profile_id: move.id,
          role: 'member',
          tenant_id: move.targetTenant
        });

      if (addError && !addError.message.includes('duplicate')) {
        console.log(`   ⚠️  Could not add to new org: ${addError.message}`);
      } else {
        console.log(`   ✅ Added to ${move.description}`);
      }
    } else {
      console.log(`   ✅ Moved to ${move.description} (independent)`);
    }
  }

  // Verify Snow Foundation now only has Georgina
  const { data: remainingMembers } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('tenant_id', '96197009-c7bb-4408-89de-cd04085cdf44');

  console.log(`\n👥 Snow Foundation now has ${remainingMembers?.length || 0} members:`);
  remainingMembers?.forEach(m => console.log(`   - ${m.display_name}`));
}

moveStorytellerProfiles();
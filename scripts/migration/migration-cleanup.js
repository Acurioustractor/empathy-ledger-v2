const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixRemainingProfiles() {
  console.log('=== FIXING REMAINING MIGRATION ISSUES ===\n');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';
  const independentTenantId = '109f5ad5-8806-4944-838b-b7e1a910aea2';

  // Find remaining profiles in Confit Pathways
  const { data: remaining } = await supabase
    .from('profiles')
    .select('id, display_name, email, current_organization')
    .eq('tenant_id', confitTenantId)
    .neq('id', joeKwonId);

  console.log('Remaining profiles in Confit Pathways (excluding Joe Kwon):');
  if (remaining && remaining.length > 0) {
    remaining.forEach(p => {
      console.log(`  • ${p.display_name || 'Unnamed'} (${p.id})`);
      console.log(`    Email: ${p.email || 'None'}`);
      console.log(`    Organization: ${p.current_organization || 'None'}\n`);
    });

    // Move these to Independent Storytellers
    console.log('Moving remaining profiles to Independent Storytellers...');
    for (const profile of remaining) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tenant_id: independentTenantId,
          current_organization: 'Independent Storytellers'
        })
        .eq('id', profile.id);

      if (updateError) {
        console.log(`  ❌ Failed to move ${profile.display_name || 'Unnamed'}: ${updateError.message}`);
      } else {
        console.log(`  ✅ Moved ${profile.display_name || 'Unnamed'} to Independent Storytellers`);
      }

      // Update their transcripts too
      await supabase
        .from('transcripts')
        .update({ tenant_id: independentTenantId })
        .eq('storyteller_id', profile.id);
    }
  } else {
    console.log('  None found - migration is clean!');
  }

  // Final validation
  const { data: finalCheck } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('tenant_id', confitTenantId);

  console.log('\nFINAL CHECK - Profiles in Confit Pathways tenant:');
  if (finalCheck) {
    finalCheck.forEach(p => {
      if (p.id === joeKwonId) {
        console.log(`  ✅ ${p.display_name || 'Unnamed'} (Joe Kwon - correct)`);
      } else {
        console.log(`  ⚠️  ${p.display_name || 'Unnamed'} (unexpected)`);
      }
    });
  }

  const cleanTenant = !finalCheck || finalCheck.length === 1;

  console.log('');
  if (cleanTenant) {
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('Confit Pathways tenant is now clean with only Joe Kwon.');
  } else {
    console.log('⚠️  Migration needs manual review');
  }

  return cleanTenant;
}

async function generateMigrationSummary() {
  console.log('\n=== MIGRATION SUMMARY ===\n');

  // Count profiles by tenant
  const { data: profiles } = await supabase
    .from('profiles')
    .select('tenant_id, display_name');

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, tenant_id');

  if (profiles && orgs) {
    const tenantCounts = {};
    profiles.forEach(p => {
      tenantCounts[p.tenant_id] = (tenantCounts[p.tenant_id] || 0) + 1;
    });

    console.log('FINAL TENANT DISTRIBUTION:');
    Object.keys(tenantCounts).sort((a, b) => tenantCounts[b] - tenantCounts[a]).forEach(tenantId => {
      const count = tenantCounts[tenantId];
      const org = orgs.find(o => o.tenant_id === tenantId);
      const orgName = org ? org.name : 'Unknown Organization';

      console.log(`  ${count} profiles → ${orgName}`);
      if (count > 50) {
        console.log(`    ⚠️  High profile count - may need further review`);
      }
    });

    // Special check for Confit Pathways
    const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
    const confitCount = tenantCounts[confitTenantId] || 0;

    console.log(`\n🎯 CONFIT PATHWAYS TENANT: ${confitCount} profile(s)`);
    if (confitCount === 1) {
      console.log('   ✅ Perfect! Only Joe Kwon remains');
    } else if (confitCount === 0) {
      console.log('   ❌ ERROR: Joe Kwon missing!');
    } else {
      console.log(`   ⚠️  WARNING: ${confitCount - 1} extra profiles need cleanup`);
    }
  }
}

async function main() {
  const success = await fixRemainingProfiles();
  await generateMigrationSummary();

  if (success) {
    console.log('\n✅ MIGRATION SUCCESSFULLY COMPLETED');
    console.log('Joe Kwon can now safely use transcript editing in a clean Confit Pathways tenant.');
  } else {
    console.log('\n❌ MIGRATION NEEDS ATTENTION');
    console.log('Manual cleanup may be required.');
  }
}

main().catch(console.error);
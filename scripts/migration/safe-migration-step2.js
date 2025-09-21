const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Load migration state from step 1
let migrationState;
try {
  migrationState = JSON.parse(fs.readFileSync('migration-state.json', 'utf8'));
} catch (e) {
  console.error('❌ Migration state not found. Run step 1 first.');
  process.exit(1);
}

async function createTenantOrganizationMapping() {
  console.log('=== CREATING TENANT-ORGANIZATION MAPPING ===\n');

  // Get all organizations with their tenants
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, tenant_id');

  const mapping = {};
  orgs.forEach(org => {
    mapping[org.name] = {
      orgId: org.id,
      tenantId: org.tenant_id
    };
  });

  console.log('Available destination organizations:');
  Object.keys(mapping).forEach(name => {
    console.log(`  • ${name}: ${mapping[name].tenantId}`);
  });

  return mapping;
}

async function migrateProfilesBatch(profiles, destinationTenant, orgName, batchSize = 10) {
  console.log(`\n🔄 Migrating ${profiles.length} profiles to ${orgName}...`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process in batches
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(profiles.length/batchSize)} (${batch.length} profiles)`);

    for (const profile of batch) {
      try {
        // Update profile tenant_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ tenant_id: destinationTenant })
          .eq('id', profile.id);

        if (profileError) {
          throw new Error(`Profile update failed: ${profileError.message}`);
        }

        // Update any transcripts owned by this profile
        const { error: transcriptError } = await supabase
          .from('transcripts')
          .update({ tenant_id: destinationTenant })
          .eq('storyteller_id', profile.id);

        if (transcriptError) {
          console.warn(`    ⚠️  Transcript update warning for ${profile.display_name}: ${transcriptError.message}`);
        }

        successCount++;
        console.log(`    ✅ ${profile.display_name || 'Unnamed'} -> ${orgName}`);

      } catch (error) {
        errorCount++;
        errors.push({ profile: profile.display_name || profile.id, error: error.message });
        console.log(`    ❌ ${profile.display_name || 'Unnamed'}: ${error.message}`);
      }
    }

    // Small delay between batches to avoid overwhelming the database
    if (i + batchSize < profiles.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`  ✅ Batch complete: ${successCount} successful, ${errorCount} errors`);
  return { successCount, errorCount, errors };
}

async function validateMigrationIntegrity() {
  console.log('\n=== VALIDATING MIGRATION INTEGRITY ===\n');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  // Check remaining profiles in Confit Pathways tenant
  const { data: remainingProfiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('tenant_id', confitTenantId);

  console.log(`Profiles remaining in Confit Pathways tenant: ${remainingProfiles?.length || 0}`);

  if (remainingProfiles) {
    remainingProfiles.forEach(p => {
      if (p.id === joeKwonId) {
        console.log(`  ✅ ${p.display_name} (Joe Kwon - should remain)`);
      } else {
        console.log(`  ⚠️  ${p.display_name || 'Unnamed'} (unexpected)`);
      }
    });
  }

  // Check transcript tenant alignment
  const { data: misalignedTranscripts } = await supabase
    .from('transcripts')
    .select('id, storyteller_id, tenant_id, profiles!inner(tenant_id)')
    .neq('tenant_id', supabase.raw('profiles.tenant_id'));

  console.log(`\nMisaligned transcripts (transcript.tenant_id ≠ profile.tenant_id): ${misalignedTranscripts?.length || 0}`);

  return {
    remainingInConfit: remainingProfiles?.length || 0,
    misalignedTranscripts: misalignedTranscripts?.length || 0
  };
}

async function runMigrationStep2() {
  console.log('🚀 MIGRATION STEP 2: PROFILE RELOCATION\n');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  // Get tenant-organization mapping
  const mapping = await createTenantOrganizationMapping();

  // Get profiles to migrate (exclude Joe Kwon)
  const { data: profilesToMigrate } = await supabase
    .from('profiles')
    .select('id, display_name, current_organization, tenant_id')
    .eq('tenant_id', confitTenantId)
    .neq('id', joeKwonId);

  if (!profilesToMigrate || profilesToMigrate.length === 0) {
    console.log('✅ No profiles to migrate. Confit Pathways tenant is already clean!');
    return;
  }

  console.log(`\nStarting migration of ${profilesToMigrate.length} profiles...\n`);

  // Group profiles by destination organization
  const migrationGroups = {};
  profilesToMigrate.forEach(profile => {
    const orgName = profile.current_organization || 'None';
    const destination = orgName === 'None' ? 'Independent Storytellers' : orgName;

    if (!migrationGroups[destination]) {
      migrationGroups[destination] = [];
    }
    migrationGroups[destination].push(profile);
  });

  let totalSuccess = 0;
  let totalErrors = 0;
  const allErrors = [];

  // Migrate each group
  for (const [orgName, profiles] of Object.entries(migrationGroups)) {
    if (!mapping[orgName]) {
      console.log(`❌ No destination found for organization: ${orgName}`);
      totalErrors += profiles.length;
      continue;
    }

    const result = await migrateProfilesBatch(
      profiles,
      mapping[orgName].tenantId,
      orgName
    );

    totalSuccess += result.successCount;
    totalErrors += result.errorCount;
    allErrors.push(...result.errors);
  }

  // Validate migration results
  const validation = await validateMigrationIntegrity();

  // Save migration results
  const migrationResults = {
    step: 2,
    timestamp: new Date().toISOString(),
    totalProfiles: profilesToMigrate.length,
    successfulMigrations: totalSuccess,
    failedMigrations: totalErrors,
    errors: allErrors,
    validation
  };

  fs.writeFileSync('migration-results.json', JSON.stringify(migrationResults, null, 2));

  console.log('\n🎯 MIGRATION STEP 2 RESULTS:');
  console.log(`  Total profiles processed: ${profilesToMigrate.length}`);
  console.log(`  Successful migrations: ${totalSuccess}`);
  console.log(`  Failed migrations: ${totalErrors}`);
  console.log(`  Success rate: ${Math.round((totalSuccess / profilesToMigrate.length) * 100)}%`);

  if (validation.remainingInConfit <= 1) { // Only Joe Kwon should remain
    console.log('\n✅ MIGRATION SUCCESSFUL!');
    console.log('Confit Pathways tenant is now clean with only Joe Kwon remaining.');
  } else {
    console.log('\n⚠️  MIGRATION INCOMPLETE');
    console.log(`${validation.remainingInConfit} profiles still in Confit Pathways tenant.`);
  }

  console.log('\n📝 Results saved to migration-results.json');
}

runMigrationStep2().catch(console.error);
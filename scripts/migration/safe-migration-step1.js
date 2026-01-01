const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createIndependentOrganization() {
  console.log('=== CREATING INDEPENDENT STORYTELLERS ORGANIZATION ===\n');

  // Create unique tenant and org IDs
  const independentTenantId = uuidv4();
  const independentOrgId = uuidv4();

  console.log('Creating Independent Storytellers organization...');
  console.log(`Tenant ID: ${independentTenantId}`);
  console.log(`Org ID: ${independentOrgId}\n`);

  try {
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: independentOrgId,
        tenant_id: independentTenantId,
        name: 'Independent Storytellers',
        description: 'Individual storytellers without organizational affiliation',
        type: 'community',
        location: 'Various Locations',
        website_url: null,
        contact_email: null,
        cultural_protocols: {
          guidelines: [
            'Respect individual storyteller autonomy',
            'Honor personal consent preferences',
            'Maintain story ownership rights'
          ]
        },
        cultural_significance: 'A space for independent storytellers to share their narratives while maintaining full control over their content and cultural protocols.',
        slug: 'independent-storytellers'
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating Independent Storytellers org:', orgError);
      return null;
    }

    console.log('✅ Successfully created Independent Storytellers organization');
    console.log('Organization details:');
    console.log(JSON.stringify(newOrg, null, 2));

    return {
      independentOrgId,
      independentTenantId,
      organization: newOrg
    };

  } catch (e) {
    console.error('❌ Failed to create organization:', e.message);
    return null;
  }
}

async function validateExistingOrganizations() {
  console.log('=== VALIDATING EXISTING ORGANIZATIONS ===\n');

  const organizationsNeeded = [
    'Orange Sky',
    'Community Elder',
    'Goods.',
    'PICC',
    'Diagrama',
    'MingaMinga Rangers',
    'MMEIC',
    'Oonchiumpa',
    'TOMNET',
    'Global Laundry Alliance',
    'Young Guns',
    'Beyond Shadows'
  ];

  const { data: existingOrgs } = await supabase
    .from('organizations')
    .select('name, id, tenant_id');

  const missing = [];
  const found = [];

  organizationsNeeded.forEach(orgName => {
    const existing = existingOrgs?.find(o => o.name === orgName);
    if (existing) {
      found.push({ name: orgName, ...existing });
    } else {
      missing.push(orgName);
    }
  });

  console.log(`✅ Found ${found.length} existing organizations:`);
  found.forEach(org => {
    console.log(`  • ${org.name} (${org.tenant_id})`);
  });

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing ${missing.length} organizations:`);
    missing.forEach(name => {
      console.log(`  • ${name}`);
    });
  }

  return { found, missing };
}

async function runMigrationStep1() {
  console.log('🚀 MIGRATION STEP 1: ORGANIZATION SETUP\n');

  // Validate existing organizations
  const validation = await validateExistingOrganizations();

  // Create Independent Storytellers organization
  const result = await createIndependentOrganization();

  if (result && validation.missing.length === 0) {
    console.log('\n✅ STEP 1 COMPLETE');
    console.log('All required organizations are ready for migration');
    console.log('\nNext step: Run migration step 2 to move profiles to correct tenants');

    // Save results for next step
    const migrationState = {
      step: 1,
      timestamp: new Date().toISOString(),
      independentOrg: result,
      existingOrganizations: validation.found
    };

    require('fs').writeFileSync('migration-state.json', JSON.stringify(migrationState, null, 2));
    console.log('Migration state saved to migration-state.json');

  } else {
    console.log('\n❌ STEP 1 FAILED');
    if (validation.missing.length > 0) {
      console.log('Missing organizations need to be created manually');
    }
    if (!result) {
      console.log('Could not create Independent Storytellers organization');
    }
  }
}

runMigrationStep1().catch(console.error);
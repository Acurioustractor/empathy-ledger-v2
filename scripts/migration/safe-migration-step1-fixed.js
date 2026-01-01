const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createIndependentTenantAndOrganization() {
  console.log('=== CREATING INDEPENDENT STORYTELLERS TENANT & ORGANIZATION ===\n');

  const independentTenantId = uuidv4();
  const independentOrgId = uuidv4();

  console.log(`Creating tenant: ${independentTenantId}`);
  console.log(`Creating organization: ${independentOrgId}\n`);

  try {
    // Step 1: Create the tenant
    console.log('Step 1: Creating tenant...');
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: independentTenantId,
        name: 'Independent Storytellers',
        slug: 'independent-storytellers',
        domain: null,
        description: 'Tenant for individual storytellers without organizational affiliation',
        contact_email: null,
        website_url: null,
        settings: {
          enable_ai_processing: true,
          cultural_protocol_level: 'flexible',
          enable_cross_tenant_sharing: true
        },
        cultural_protocols: {
          consent_required: true,
          ai_processing_opt_in: true,
          elder_approval_stories: false,
          community_review_period_days: 0
        },
        subscription_tier: 'community',
        status: 'active',
        onboarded_at: new Date().toISOString(),
        location: 'Various Locations'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('❌ Error creating tenant:', tenantError);
      return null;
    }

    console.log('✅ Tenant created successfully');

    // Step 2: Create the organization
    console.log('Step 2: Creating organization...');
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
            'Maintain story ownership rights',
            'Enable flexible cultural protocols'
          ]
        },
        cultural_significance: 'A space for independent storytellers to share their narratives while maintaining full control over their content and cultural protocols.',
        slug: 'independent-storytellers'
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      // Try to cleanup the tenant if org creation failed
      await supabase.from('tenants').delete().eq('id', independentTenantId);
      return null;
    }

    console.log('✅ Organization created successfully\n');

    return {
      tenant: newTenant,
      organization: newOrg,
      independentTenantId,
      independentOrgId
    };

  } catch (e) {
    console.error('❌ Failed to create tenant/organization:', e.message);
    return null;
  }
}

async function countProfilesNeedingMigration() {
  console.log('=== MIGRATION SCOPE ANALYSIS ===\n');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, current_organization, tenant_id')
    .eq('tenant_id', confitTenantId)
    .neq('id', joeKwonId);

  console.log(`Profiles to migrate from Confit Pathways: ${profiles?.length || 0}`);

  if (profiles) {
    const orgGroups = {};
    profiles.forEach(p => {
      const org = p.current_organization || 'None';
      orgGroups[org] = (orgGroups[org] || 0) + 1;
    });

    console.log('\nBreakdown by destination:');
    Object.keys(orgGroups).sort((a, b) => orgGroups[b] - orgGroups[a]).forEach(org => {
      console.log(`  ${org}: ${orgGroups[org]} profiles`);
    });
  }

  return profiles?.length || 0;
}

async function runMigrationStep1() {
  console.log('🚀 MIGRATION STEP 1: SETUP ORGANIZATIONS\n');

  const migrationCount = await countProfilesNeedingMigration();

  if (migrationCount === 0) {
    console.log('✅ No profiles need migration. Confit Pathways tenant is already clean.');
    return;
  }

  const result = await createIndependentTenantAndOrganization();

  if (result) {
    console.log('✅ STEP 1 COMPLETE');
    console.log(`Ready to migrate ${migrationCount} profiles out of Confit Pathways tenant`);
    console.log('\nCreated:');
    console.log(`  • Tenant: ${result.tenant.name} (${result.independentTenantId})`);
    console.log(`  • Organization: ${result.organization.name} (${result.independentOrgId})`);

    // Save state for next step
    const migrationState = {
      step: 1,
      timestamp: new Date().toISOString(),
      independentTenant: result.independentTenantId,
      independentOrg: result.independentOrgId,
      migrationCount
    };

    require('fs').writeFileSync('migration-state.json', JSON.stringify(migrationState, null, 2));
    console.log('\n📝 Migration state saved to migration-state.json');
    console.log('🚀 Ready for Step 2: Profile migration');

  } else {
    console.log('❌ STEP 1 FAILED');
    console.log('Cannot proceed with migration without Independent Storytellers organization');
  }
}

runMigrationStep1().catch(console.error);
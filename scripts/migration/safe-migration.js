const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createMissingOrganizations() {
  console.log('=== CREATING MISSING ORGANIZATIONS ===\n');

  // Create Independent Storytellers organization for profiles with no organization
  const independentTenantId = uuidv4();
  const independentOrgId = uuidv4();

  console.log('Creating Independent Storytellers organization...');

  try {
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: independentOrgId,
        tenant_id: independentTenantId,
        name: 'Independent Storytellers',
        description: 'Individual storytellers without organizational affiliation',
        type: 'community',
        location: null,
        website_url: null,
        contact_email: null,
        cultural_protocols: {
          guidelines: [
            'Respect individual storyteller autonomy',
            'Honor personal consent preferences',
            'Maintain story ownership rights'
          ]
        },
        cultural_significance: 'A space for independent storytellers to share their narratives while maintaining full control over their content and cultural protocols.'
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating Independent Storytellers org:', orgError);
      return null;
    }

    console.log('✓ Created Independent Storytellers organization');
    console.log(`  ID: ${independentOrgId}`);
    console.log(`  Tenant: ${independentTenantId}\n`);

    return {
      independentOrgId,
      independentTenantId
    };

  } catch (e) {
    console.error('Failed to create organization:', e.message);
    return null;
  }
}

async function validateMigrationSafety() {
  console.log('=== VALIDATING MIGRATION SAFETY ===\n');

  // Check we have backups
  const fs = require('fs');
  const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('migration-backup-'));

  if (backupFiles.length === 0) {
    console.error('❌ No backup files found! Cannot proceed safely.');
    return false;
  }

  console.log(`✓ Found ${backupFiles.length} backup file(s)`);

  // Verify current data integrity
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('id').limit(1);
  const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1);

  if (profileError || orgError) {
    console.error('❌ Database connection issues detected');
    return false;
  }

  console.log('✓ Database connectivity verified');
  console.log('✓ Migration safety checks passed\n');

  return true;
}

async function runStep1() {
  const isSafe = await validateMigrationSafety();
  if (!isSafe) {
    console.log('❌ Safety checks failed. Aborting migration.');
    return;
  }

  const result = await createMissingOrganizations();
  if (result) {
    console.log('✅ Step 1 Complete: Missing organizations created');
    console.log('Next: Run step 2 to begin profile migration');
  } else {
    console.log('❌ Step 1 Failed: Could not create organizations');
  }
}

runStep1().catch(console.error);
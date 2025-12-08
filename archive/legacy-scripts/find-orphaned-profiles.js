const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 Finding orphaned profiles...\n');

  // Get all profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, tenant_id, primary_organization_id')
    .order('display_name');

  // Get all profile-org relationships
  const { data: profileOrgs } = await supabase
    .from('profile_organizations')
    .select('profile_id, organization_id');

  const profileIdsInOrgs = new Set(profileOrgs?.map(p => p.profile_id));

  // Find orphaned profiles
  const orphaned = allProfiles?.filter(p => !profileIdsInOrgs.has(p.id));

  console.log(`Total profiles: ${allProfiles?.length}`);
  console.log(`Profiles in organizations: ${profileIdsInOrgs.size}`);
  console.log(`Orphaned profiles: ${orphaned?.length}\n`);

  if (orphaned && orphaned.length > 0) {
    console.log('='.repeat(80));
    console.log('ORPHANED PROFILES:\n');

    for (const profile of orphaned) {
      console.log(`Profile: ${profile.display_name || 'No name'}`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  Email: ${profile.email || 'No email'}`);
      console.log(`  tenant_id: ${profile.tenant_id || 'null'}`);
      console.log(`  primary_organization_id: ${profile.primary_organization_id || 'null'}`);

      // Try to find a suitable organization
      let suggestedOrg = null;

      // Option 1: Use primary_organization_id if it exists
      if (profile.primary_organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', profile.primary_organization_id)
          .single();

        if (org) {
          suggestedOrg = org;
          console.log(`  ✅ Suggested org (from primary_organization_id): ${org.name}`);
        }
      }

      // Option 2: Use tenant_id to find organization
      if (!suggestedOrg && profile.tenant_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('tenant_id', profile.tenant_id)
          .single();

        if (org) {
          suggestedOrg = org;
          console.log(`  ✅ Suggested org (from tenant_id): ${org.name}`);
        }
      }

      // Option 3: Check if they have stories with organization_id
      if (!suggestedOrg) {
        const { data: stories } = await supabase
          .from('stories')
          .select('organization_id')
          .eq('author_id', profile.id)
          .not('organization_id', 'is', null)
          .limit(1);

        if (stories && stories.length > 0) {
          const { data: org } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('id', stories[0].organization_id)
            .single();

          if (org) {
            suggestedOrg = org;
            console.log(`  ✅ Suggested org (from stories): ${org.name}`);
          }
        }
      }

      if (!suggestedOrg) {
        console.log('  ⚠️  No suggested organization found - manual review needed');
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n💡 TO FIX:\n');

    const fixable = orphaned.filter(p => p.primary_organization_id || p.tenant_id);
    console.log(`Profiles that can be auto-fixed: ${fixable.length}`);
    console.log('Run with APPLY_FIXES=true to automatically link these profiles\n');

    // Apply fixes if requested
    const APPLY_FIXES = process.env.APPLY_FIXES === 'true';

    if (APPLY_FIXES) {
      console.log('🚀 Applying fixes...\n');

      for (const profile of fixable) {
        let orgId = profile.primary_organization_id;

        if (!orgId && profile.tenant_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('id')
            .eq('tenant_id', profile.tenant_id)
            .single();

          orgId = org?.id;
        }

        if (orgId) {
          const { error } = await supabase
            .from('profile_organizations')
            .insert({
              profile_id: profile.id,
              organization_id: orgId,
              role: 'storyteller',
              is_active: true
            });

          if (error) {
            console.log(`  ❌ Failed to link ${profile.display_name}: ${error.message}`);
          } else {
            console.log(`  ✅ Linked ${profile.display_name} to organization`);
          }
        }
      }

      console.log('\n✅ Fixes applied!');
    }
  } else {
    console.log('✅ No orphaned profiles found!');
  }
})();
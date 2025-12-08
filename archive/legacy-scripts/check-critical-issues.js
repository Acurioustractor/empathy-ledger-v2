const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 CRITICAL ISSUES CHECK\n');
  console.log('='.repeat(60));

  // Issue 1: Image field duplication
  console.log('\n📸 IMAGE FIELDS\n');

  const { count: withAvatarUrl } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('avatar_url', 'is', null);

  const { count: withProfileImageUrl } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('profile_image_url', 'is', null);

  const { count: withBoth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('avatar_url', 'is', null)
    .not('profile_image_url', 'is', null);

  const { count: withNeither } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .is('avatar_url', null)
    .is('profile_image_url', null);

  console.log(`  • Profiles with avatar_url: ${withAvatarUrl}`);
  console.log(`  • Profiles with profile_image_url: ${withProfileImageUrl}`);
  console.log(`  • Profiles with BOTH: ${withBoth}`);
  console.log(`  • Profiles with NEITHER: ${withNeither}`);

  if (withBoth > 0) {
    console.log(`\n  ⚠️  ${withBoth} profiles have both fields - need to consolidate!`);
  }

  // Issue 2: Organization references
  console.log('\n\n🏢 ORGANIZATION REFERENCES\n');

  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: withTenantId } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('tenant_id', 'is', null);

  const { count: withPrimaryOrg } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('primary_organization_id', 'is', null);

  const { count: withLegacyOrg } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('legacy_organization_id', 'is', null);

  const { count: withBothTenantAndPrimary } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('tenant_id', 'is', null)
    .not('primary_organization_id', 'is', null);

  console.log(`  • Total profiles: ${totalProfiles}`);
  console.log(`  • With tenant_id: ${withTenantId} (${Math.round((withTenantId / totalProfiles) * 100)}%)`);
  console.log(`  • With primary_organization_id: ${withPrimaryOrg} (${Math.round((withPrimaryOrg / totalProfiles) * 100)}%)`);
  console.log(`  • With legacy_organization_id: ${withLegacyOrg}`);
  console.log(`  • With BOTH tenant_id & primary_org: ${withBothTenantAndPrimary}`);

  if (withTenantId > 0 && withPrimaryOrg > 0) {
    console.log('\n  ⚠️  Both tenant_id and primary_organization_id in use!');
    console.log('      Recommendation: Migrate to primary_organization_id only');
  }

  // Issue 3: Location fields
  console.log('\n\n📍 LOCATION FIELDS\n');

  const { count: withLocationId } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('location_id', 'is', null);

  const { count: withLegacyLocationId } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('legacy_location_id', 'is', null);

  const { data: locationDataSample } = await supabase
    .from('profiles')
    .select('location_data')
    .not('location_data', 'is', null)
    .limit(5);

  console.log(`  • With location_id: ${withLocationId}`);
  console.log(`  • With legacy_location_id: ${withLegacyLocationId}`);
  console.log(`  • With location_data: ${locationDataSample?.length || 0} (sample of 5)`);

  if (withLegacyLocationId > 0) {
    console.log(`\n  ⚠️  ${withLegacyLocationId} profiles still using legacy_location_id`);
  }

  // Issue 4: Orphaned profiles
  console.log('\n\n👤 ORPHANED PROFILES (no organization link)\n');

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, email');

  const { data: profilesInOrgs } = await supabase
    .from('profile_organizations')
    .select('profile_id');

  const profileIdsInOrgs = new Set(profilesInOrgs?.map(p => p.profile_id));
  const orphanedProfiles = allProfiles?.filter(p => !profileIdsInOrgs.has(p.id));

  console.log(`  • Profiles without organization link: ${orphanedProfiles?.length || 0}`);

  if (orphanedProfiles && orphanedProfiles.length > 0) {
    console.log('\n  Orphaned profiles:');
    orphanedProfiles.slice(0, 10).forEach(p => {
      console.log(`    - ${p.display_name || 'No name'} (${p.email || 'No email'})`);
    });
    if (orphanedProfiles.length > 10) {
      console.log(`    ... and ${orphanedProfiles.length - 10} more`);
    }
  }

  // Issue 5: project_participants issue
  console.log('\n\n📋 PROJECT PARTICIPANTS\n');

  const { data: sampleParticipants } = await supabase
    .from('project_participants')
    .select('*')
    .limit(5);

  console.log(`  • Sample records: ${sampleParticipants?.length || 0}`);

  if (sampleParticipants && sampleParticipants.length > 0) {
    console.log('\n  First record structure:');
    console.log('   ', JSON.stringify(sampleParticipants[0], null, 2));

    // Check if profile_id exists
    const hasProfileId = 'profile_id' in sampleParticipants[0];
    const hasStorytellerI = 'storyteller_id' in sampleParticipants[0];

    console.log(`\n  • Has profile_id field: ${hasProfileId}`);
    console.log(`  • Has storyteller_id field: ${hasStorytellerI}`);

    if (!hasProfileId && hasStorytellerId) {
      console.log('\n  ⚠️  Table uses storyteller_id instead of profile_id');
      console.log('      May need column rename for consistency');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Check complete!\n');
})();
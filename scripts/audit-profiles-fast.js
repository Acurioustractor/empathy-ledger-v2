const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 PROFILES & LINKED TABLES AUDIT\n');
  console.log('='.repeat(80));

  // Get sample profile to analyze structure
  const { data: sampleProfiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (sampleProfiles && sampleProfiles.length > 0) {
    const allFields = Object.keys(sampleProfiles[0]);

    // Categorize fields
    const bioFields = ['bio', 'short_bio', 'tagline', 'about_me', 'personal_statement'];
    const locationFields = allFields.filter(f => f.includes('location'));
    const imageFields = allFields.filter(f => f.includes('image') || f.includes('avatar'));
    const aiFields = allFields.filter(f => f.includes('ai_') || f.includes('generated') || f.includes('themes') || f.includes('sentiment') || f.includes('insights'));
    const orgFields = allFields.filter(f => f.includes('organization') || f.includes('tenant'));
    const visibilityFields = allFields.filter(f => f.includes('visibility'));

    console.log('\n📊 PROFILES TABLE STRUCTURE\n');
    console.log(`Total fields: ${allFields.length}`);
    console.log(`Total profiles: ${totalProfiles}\n`);

    console.log('Field Categories:');
    console.log(`  • Bio/Description fields: ${bioFields.length}`);
    console.log(`  • Location fields: ${locationFields.length} - ${locationFields.join(', ')}`);
    console.log(`  • Image fields: ${imageFields.length} - ${imageFields.join(', ')}`);
    console.log(`  • AI/Analytics fields: ${aiFields.length}`);
    console.log(`  • Organization/Tenant fields: ${orgFields.length} - ${orgFields.join(', ')}`);
    console.log(`  • Visibility fields: ${visibilityFields.length}`);
  }

  // ========================================
  // DATA QUALITY
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('⚠️  DATA QUALITY ISSUES\n');

  const { count: missingDisplayName } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .or('display_name.is.null,display_name.eq.');

  const { count: missingEmail } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .or('email.is.null,email.eq.');

  const { count: profilesWithTenantId } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('tenant_id', 'is', null);

  const { count: profilesWithPrimaryOrg } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('primary_organization_id', 'is', null);

  console.log('Missing Core Data:');
  console.log(`  • Missing display_name: ${missingDisplayName} (${Math.round((missingDisplayName / totalProfiles) * 100)}%)`);
  console.log(`  • Missing email: ${missingEmail} (${Math.round((missingEmail / totalProfiles) * 100)}%)`);

  console.log('\nOrganization References:');
  console.log(`  • Profiles with tenant_id: ${profilesWithTenantId} (${Math.round((profilesWithTenantId / totalProfiles) * 100)}%)`);
  console.log(`  • Profiles with primary_organization_id: ${profilesWithPrimaryOrg} (${Math.round((profilesWithPrimaryOrg / totalProfiles) * 100)}%)`);

  // ========================================
  // LINKED TABLES
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('🔗 LINKED TABLES\n');

  // Profile Organizations
  const { count: profileOrgsCount } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true });

  const { data: uniqueProfilesInOrgs } = await supabase
    .from('profile_organizations')
    .select('profile_id');

  const uniqueProfsWithOrgs = new Set(uniqueProfilesInOrgs?.map(p => p.profile_id)).size;

  console.log('profile_organizations:');
  console.log(`  • Total relationships: ${profileOrgsCount}`);
  console.log(`  • Unique profiles with orgs: ${uniqueProfsWithOrgs} (${Math.round((uniqueProfsWithOrgs / totalProfiles) * 100)}%)`);
  console.log(`  • Profiles without orgs: ${totalProfiles - uniqueProfsWithOrgs}`);

  // Profile Locations
  const { count: profileLocsCount } = await supabase
    .from('profile_locations')
    .select('*', { count: 'exact', head: true });

  console.log('\nprofile_locations:');
  console.log(`  • Total relationships: ${profileLocsCount}`);
  console.log(`  • Profiles with locations: ${profileLocsCount} (${Math.round((profileLocsCount / totalProfiles) * 100)}%)`);
  console.log(`  • Profiles WITHOUT locations: ${totalProfiles - profileLocsCount} (${Math.round(((totalProfiles - profileLocsCount) / totalProfiles) * 100)}%)`);

  // Project Participants
  const { count: projectParticipantsCount } = await supabase
    .from('project_participants')
    .select('*', { count: 'exact', head: true });

  const { data: profilesInProjects } = await supabase
    .from('project_participants')
    .select('profile_id');

  const uniqueProfilesInProjects = new Set(profilesInProjects?.map(p => p.profile_id)).size;

  console.log('\nproject_participants:');
  console.log(`  • Total relationships: ${projectParticipantsCount}`);
  console.log(`  • Unique profiles in projects: ${uniqueProfilesInProjects} (${Math.round((uniqueProfilesInProjects / totalProfiles) * 100)}%)`);
  console.log(`  • Profiles not in any project: ${totalProfiles - uniqueProfilesInProjects}`);

  // Stories
  const { count: storiesCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });

  const { data: profilesWithStories } = await supabase
    .from('stories')
    .select('author_id');

  const uniqueAuthors = new Set(profilesWithStories?.map(s => s.author_id)).size;

  console.log('\nstories (author_id → profiles):');
  console.log(`  • Total stories: ${storiesCount}`);
  console.log(`  • Profiles with stories: ${uniqueAuthors} (${Math.round((uniqueAuthors / totalProfiles) * 100)}%)`);
  console.log(`  • Profiles WITHOUT stories: ${totalProfiles - uniqueAuthors} (${Math.round(((totalProfiles - uniqueAuthors) / totalProfiles) * 100)}%)`);

  // Transcripts
  const { count: transcriptsCount } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true });

  const { data: profilesWithTranscripts } = await supabase
    .from('transcripts')
    .select('storyteller_id');

  const uniqueStorytellers = new Set(profilesWithTranscripts?.map(t => t.storyteller_id).filter(Boolean)).size;

  console.log('\ntranscripts (storyteller_id → profiles):');
  console.log(`  • Total transcripts: ${transcriptsCount}`);
  console.log(`  • Profiles with transcripts: ${uniqueStorytellers} (${Math.round((uniqueStorytellers / totalProfiles) * 100)}%)`);
  console.log(`  • Profiles WITHOUT transcripts: ${totalProfiles - uniqueStorytellers}`);

  // ========================================
  // KEY FINDINGS
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 KEY FINDINGS & RECOMMENDATIONS\n');

  const issues = [];
  const recommendations = [];

  // Issue: Image field confusion
  if (sampleProfiles) {
    const hasAvatarUrl = 'avatar_url' in sampleProfiles[0];
    const hasProfileImageUrl = 'profile_image_url' in sampleProfiles[0];
    if (hasAvatarUrl && hasProfileImageUrl) {
      issues.push('ISSUE: Two image fields (avatar_url & profile_image_url) - causes confusion');
      recommendations.push('Standardize on ONE image field (recommend profile_image_url)');
    }
  }

  // Issue: tenant_id vs primary_organization_id
  if (profilesWithTenantId > 0 && profilesWithPrimaryOrg > 0) {
    issues.push(`ISSUE: Both tenant_id (${profilesWithTenantId}) and primary_organization_id (${profilesWithPrimaryOrg}) in use`);
    recommendations.push('Migrate all tenant_id references to primary_organization_id');
  } else if (profilesWithTenantId > 0 && profilesWithPrimaryOrg === 0) {
    issues.push('ISSUE: Using legacy tenant_id without primary_organization_id');
    recommendations.push('Run migration to populate primary_organization_id from tenant_id');
  }

  // Issue: Missing emails
  if (missingEmail > totalProfiles * 0.5) {
    issues.push(`ISSUE: ${missingEmail} profiles (${Math.round((missingEmail / totalProfiles) * 100)}%) missing email`);
    recommendations.push('Review if email is truly optional or if data migration needed');
  }

  // Issue: Missing locations
  if ((totalProfiles - profileLocsCount) > totalProfiles * 0.5) {
    issues.push(`ISSUE: ${totalProfiles - profileLocsCount} profiles (${Math.round(((totalProfiles - profileLocsCount) / totalProfiles) * 100)}%) missing locations`);
    recommendations.push('Use /admin/locations tool to backfill missing locations');
  }

  // Issue: Profiles without content
  const profilesWithoutContent = totalProfiles - Math.max(uniqueAuthors, uniqueStorytellers);
  if (profilesWithoutContent > totalProfiles * 0.5) {
    issues.push(`ISSUE: ${profilesWithoutContent} profiles have no stories or transcripts`);
    recommendations.push('May indicate test data or inactive users - consider cleanup');
  }

  // Issue: Profiles not in organizations
  if ((totalProfiles - uniqueProfsWithOrgs) > 10) {
    issues.push(`ISSUE: ${totalProfiles - uniqueProfsWithOrgs} profiles not linked to any organization`);
    recommendations.push('Ensure all active profiles are linked via profile_organizations table');
  }

  if (issues.length > 0) {
    console.log('❗ ISSUES FOUND:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });

    console.log('\n\n💡 RECOMMENDED ACTIONS:\n');
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  } else {
    console.log('✅ No critical issues found!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Audit complete!\n');
})();
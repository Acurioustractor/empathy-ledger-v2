const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 COMPREHENSIVE PROFILES AUDIT\n');
  console.log('=' .repeat(80));

  // ========================================
  // 1. PROFILES TABLE STRUCTURE
  // ========================================
  console.log('\n📊 PROFILES TABLE STRUCTURE\n');

  // Get sample profile to see all fields
  const { data: sampleProfiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (sampleProfiles && sampleProfiles.length > 0) {
    const allFields = Object.keys(sampleProfiles[0]);
    console.log(`Total fields in profiles table: ${allFields.length}\n`);

    // Categorize fields
    const coreFields = ['id', 'created_at', 'updated_at', 'email', 'display_name', 'full_name'];
    const bioFields = ['bio', 'short_bio', 'tagline', 'about_me', 'personal_statement'];
    const locationFields = allFields.filter(f => f.includes('location') || f.includes('address') || f.includes('city') || f.includes('state') || f.includes('country'));
    const imageFields = allFields.filter(f => f.includes('image') || f.includes('avatar') || f.includes('photo'));
    const statusFields = allFields.filter(f => f.includes('status') || f.includes('active') || f.includes('verified') || f.includes('visibility'));
    const aiFields = allFields.filter(f => f.includes('ai_') || f.includes('sentiment') || f.includes('themes') || f.includes('keywords'));
    const orgFields = allFields.filter(f => f.includes('organization') || f.includes('tenant'));

    console.log('Core Identity Fields:', coreFields.length);
    coreFields.forEach(f => console.log(`  - ${f}`));

    console.log('\nBio/Description Fields:', bioFields.length);
    bioFields.forEach(f => console.log(`  - ${f}`));

    console.log('\nLocation Fields:', locationFields.length);
    locationFields.forEach(f => console.log(`  - ${f}`));

    console.log('\nImage/Avatar Fields:', imageFields.length);
    imageFields.forEach(f => console.log(`  - ${f}`));

    console.log('\nStatus/Visibility Fields:', statusFields.length);
    statusFields.forEach(f => console.log(`  - ${f}`));

    console.log('\nAI/Analytics Fields:', aiFields.length);
    aiFields.forEach(f => console.log(`  - ${f}`));

    console.log('\nOrganization/Tenant Fields:', orgFields.length);
    orgFields.forEach(f => console.log(`  - ${f}`));
  }

  // ========================================
  // 2. DATA QUALITY ISSUES
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('⚠️  DATA QUALITY ISSUES\n');

  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log(`Total profiles: ${totalProfiles}\n`);

  // Missing core data
  const { count: missingDisplayName } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .or('display_name.is.null,display_name.eq.');

  const { count: missingEmail } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .or('email.is.null,email.eq.');

  console.log('Missing Core Data:');
  console.log(`  - Missing display_name: ${missingDisplayName} (${Math.round((missingDisplayName / totalProfiles) * 100)}%)`);
  console.log(`  - Missing email: ${missingEmail} (${Math.round((missingEmail / totalProfiles) * 100)}%)`);

  // Duplicate detection
  const { data: duplicateEmails } = await supabase
    .from('profiles')
    .select('email')
    .not('email', 'is', null);

  const emailCounts = {};
  duplicateEmails?.forEach(p => {
    if (p.email) {
      emailCounts[p.email] = (emailCounts[p.email] || 0) + 1;
    }
  });
  const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
  console.log(`  - Duplicate emails: ${duplicates.length}`);
  if (duplicates.length > 0 && duplicates.length < 5) {
    duplicates.forEach(([email, count]) => console.log(`    • ${email}: ${count} profiles`));
  }

  // ========================================
  // 3. LINKED TABLES AUDIT
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('🔗 LINKED TABLES AUDIT\n');

  // Profile Organizations
  const { count: profileOrgsCount } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true });

  const { count: profilesWithOrgs } = await supabase
    .from('profile_organizations')
    .select('profile_id', { count: 'exact', head: true });

  console.log('profile_organizations:');
  console.log(`  - Total relationships: ${profileOrgsCount}`);
  console.log(`  - Profiles with orgs: ${profilesWithOrgs} (${Math.round((profilesWithOrgs / totalProfiles) * 100)}%)`);
  console.log(`  - Profiles without orgs: ${totalProfiles - profilesWithOrgs}`);

  // Check for orphaned records
  const { data: orphanedProfileOrgs } = await supabase
    .from('profile_organizations')
    .select('id, profile_id, organization_id')
    .limit(1000);

  let orphanedCount = 0;
  if (orphanedProfileOrgs) {
    for (const rel of orphanedProfileOrgs) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', rel.profile_id)
        .maybeSingle();

      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', rel.organization_id)
        .maybeSingle();

      if (!profile || !org) orphanedCount++;
      if (orphanedCount >= 10) break; // Sample only
    }
  }
  console.log(`  - Orphaned relationships (sample): ~${orphanedCount}`);

  // Profile Locations
  const { count: profileLocsCount } = await supabase
    .from('profile_locations')
    .select('*', { count: 'exact', head: true });

  console.log('\nprofile_locations:');
  console.log(`  - Total relationships: ${profileLocsCount}`);
  console.log(`  - Profiles with locations: ${profileLocsCount} (${Math.round((profileLocsCount / totalProfiles) * 100)}%)`);
  console.log(`  - Profiles without locations: ${totalProfiles - profileLocsCount}`);

  // Project Participants
  const { count: projectParticipantsCount } = await supabase
    .from('project_participants')
    .select('*', { count: 'exact', head: true });

  const { data: profilesInProjects } = await supabase
    .from('project_participants')
    .select('profile_id');

  const uniqueProfilesInProjects = new Set(profilesInProjects?.map(p => p.profile_id)).size;

  console.log('\nproject_participants:');
  console.log(`  - Total relationships: ${projectParticipantsCount}`);
  console.log(`  - Unique profiles in projects: ${uniqueProfilesInProjects} (${Math.round((uniqueProfilesInProjects / totalProfiles) * 100)}%)`);

  // Stories by profiles
  const { count: storiesCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });

  const { data: profilesWithStories } = await supabase
    .from('stories')
    .select('author_id');

  const uniqueAuthors = new Set(profilesWithStories?.map(s => s.author_id)).size;

  console.log('\nstories (author_id → profiles):');
  console.log(`  - Total stories: ${storiesCount}`);
  console.log(`  - Profiles with stories: ${uniqueAuthors} (${Math.round((uniqueAuthors / totalProfiles) * 100)}%)`);
  console.log(`  - Profiles without stories: ${totalProfiles - uniqueAuthors}`);

  // Transcripts
  const { count: transcriptsCount } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true });

  const { data: profilesWithTranscripts } = await supabase
    .from('transcripts')
    .select('storyteller_id');

  const uniqueStorytellers = new Set(profilesWithTranscripts?.map(t => t.storyteller_id).filter(Boolean)).size;

  console.log('\ntranscripts (storyteller_id → profiles):');
  console.log(`  - Total transcripts: ${transcriptsCount}`);
  console.log(`  - Profiles with transcripts: ${uniqueStorytellers} (${Math.round((uniqueStorytellers / totalProfiles) * 100)}%)`);

  // ========================================
  // 4. LEGACY/UNUSED FIELDS
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('🗑️  POTENTIAL LEGACY/UNUSED FIELDS\n');

  // Check if tenant_id is still in use
  const { count: profilesWithTenantId } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('tenant_id', 'is', null);

  console.log('tenant_id usage:');
  console.log(`  - Profiles with tenant_id: ${profilesWithTenantId} (${Math.round((profilesWithTenantId / totalProfiles) * 100)}%)`);
  console.log(`  - Status: ${profilesWithTenantId > 0 ? '⚠️  Still in use - may need migration to primary_organization_id' : '✅ Likely unused'}`);

  // Check primary_organization_id
  const { count: profilesWithPrimaryOrg } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('primary_organization_id', 'is', null);

  console.log('\nprimary_organization_id usage:');
  console.log(`  - Profiles with primary_organization_id: ${profilesWithPrimaryOrg} (${Math.round((profilesWithPrimaryOrg / totalProfiles) * 100)}%)`);

  // ========================================
  // 5. RECOMMENDATIONS
  // ========================================
  console.log('\n\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS\n');

  const recommendations = [];

  if (missingDisplayName > 0) {
    recommendations.push(`Fix ${missingDisplayName} profiles missing display_name (use email or full_name as fallback)`);
  }

  if (duplicates.length > 0) {
    recommendations.push(`Investigate and merge ${duplicates.length} duplicate email addresses`);
  }

  if (orphanedCount > 0) {
    recommendations.push(`Clean up orphaned profile_organizations records (found ${orphanedCount} in sample)`);
  }

  if (totalProfiles - profileLocsCount > 100) {
    recommendations.push(`Backfill locations for ${totalProfiles - profileLocsCount} profiles using admin tool`);
  }

  if (profilesWithTenantId > 0 && profilesWithPrimaryOrg > 0) {
    recommendations.push(`Consider migrating remaining tenant_id references to primary_organization_id`);
  }

  if (totalProfiles - uniqueAuthors > 150) {
    recommendations.push(`${totalProfiles - uniqueAuthors} profiles have no stories - may need content creation campaigns`);
  }

  if (recommendations.length > 0) {
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  } else {
    console.log('✅ No major issues found!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Audit complete!\n');
})();
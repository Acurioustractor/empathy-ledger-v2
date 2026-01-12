/**
 * Align ACT Projects and Storytellers
 *
 * This script ensures proper data linkages for ALMA-aligned impact measurement:
 * 1. Links ACT's projects (Goods, Harvest, JusticeHub, ACT Farm, Placemat) to ACT org
 * 2. Links transcripts to storytellers via the transcripts.storyteller_id field
 * 3. Links storytellers to organizations based on their project membership
 *
 * Philosophy: ALMA tracks impact through storytellers → projects → organizations
 * This script ensures the data hierarchy is properly connected.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

// ACT's actual projects that should be linked
const ACT_PROJECT_KEYWORDS = [
  'goods',
  'harvest',
  'justicehub',
  'justice hub',
  'act farm',
  'placemat',
  'empathy ledger',
  'snow foundation',
  'oonchiumpa'
];

interface AlignmentStats {
  projectsLinked: number;
  transcriptsUpdated: number;
  storytellersLinked: number;
  errors: string[];
}

async function alignACTProjects(): Promise<number> {
  console.log('\n📁 Step 1: Aligning ACT Projects');
  console.log('─'.repeat(50));

  // Find projects that should belong to ACT but aren't linked
  const { data: allProjects, error } = await supabase
    .from('projects')
    .select('id, name, organization_id');

  if (error) {
    console.error('Error fetching projects:', error.message);
    return 0;
  }

  console.log(`   Found ${allProjects?.length || 0} projects`);

  let linkedCount = 0;

  for (const project of allProjects || []) {
    const projectNameLower = project.name.toLowerCase();
    const shouldBeACT = ACT_PROJECT_KEYWORDS.some(keyword =>
      projectNameLower.includes(keyword)
    );

    if (shouldBeACT && project.organization_id !== ACT_ORG_ID) {
      console.log(`   Linking "${project.name}" to ACT...`);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ organization_id: ACT_ORG_ID })
        .eq('id', project.id);

      if (updateError) {
        console.error(`   ❌ Failed: ${updateError.message}`);
      } else {
        console.log(`   ✅ Linked`);
        linkedCount++;
      }
    } else if (shouldBeACT) {
      console.log(`   ℹ️  "${project.name}" already linked to ACT`);
    }
  }

  // Also check if there are unlinked projects that should have an org
  const { data: orphanProjects } = await supabase
    .from('projects')
    .select('id, name')
    .is('organization_id', null);

  if (orphanProjects && orphanProjects.length > 0) {
    console.log(`\n   ⚠️  Found ${orphanProjects.length} orphan projects (no organization):`);
    orphanProjects.forEach(p => console.log(`      - ${p.name}`));
  }

  return linkedCount;
}

async function linkTranscriptsToStorytellers(): Promise<number> {
  console.log('\n📊 Step 2: Linking transcripts to storytellers');
  console.log('─'.repeat(50));

  // Get transcripts missing storyteller_id
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, storyteller_id_legacy, story_id')
    .is('storyteller_id', null);

  if (error) {
    console.error('Error fetching transcripts:', error.message);
    return 0;
  }

  if (!transcripts || transcripts.length === 0) {
    console.log('   All transcripts already have storyteller_id');
    return 0;
  }

  console.log(`   Found ${transcripts.length} transcripts missing storyteller_id`);

  let updatedCount = 0;

  // Try to link via story → storyteller relationship
  const storyIds = transcripts.filter(t => t.story_id).map(t => t.story_id);

  if (storyIds.length > 0) {
    const { data: stories } = await supabase
      .from('stories')
      .select('id, storyteller_id')
      .in('id', storyIds);

    const storyMap = new Map(
      (stories || []).map(s => [s.id, s.storyteller_id])
    );

    for (const transcript of transcripts) {
      if (transcript.story_id && storyMap.has(transcript.story_id)) {
        const storytellerId = storyMap.get(transcript.story_id);
        if (storytellerId) {
          const { error: updateError } = await supabase
            .from('transcripts')
            .update({ storyteller_id: storytellerId })
            .eq('id', transcript.id);

          if (!updateError) {
            updatedCount++;
          }
        }
      }
    }
  }

  console.log(`   ✅ Updated ${updatedCount} transcripts via story linkage`);

  // Count remaining unlinked
  const { count: remaining } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true })
    .is('storyteller_id', null);

  if (remaining && remaining > 0) {
    console.log(`   ⚠️  ${remaining} transcripts still missing storyteller_id`);
  }

  return updatedCount;
}

async function linkStorytellersToOrganizations(): Promise<number> {
  console.log('\n👥 Step 3: Linking storytellers to organizations');
  console.log('─'.repeat(50));

  // Get organizations with their tenant_ids
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, tenant_id');

  const orgTenantMap = new Map<string, string>();
  for (const org of organizations || []) {
    if (org.tenant_id) {
      orgTenantMap.set(org.id, org.tenant_id);
    }
  }

  // Get the ACT tenant_id
  const actTenantId = orgTenantMap.get(ACT_ORG_ID);
  console.log(`   ACT tenant_id: ${actTenantId || 'Not found'}`);

  // Get storytellers - no tenant_id column, just core fields
  const { data: allStorytellers, error } = await supabase
    .from('storytellers')
    .select('id, display_name');

  if (error) {
    console.error('Error fetching storytellers:', error.message);
    return 0;
  }

  // Get existing storyteller-org links
  const { data: existingLinks } = await supabase
    .from('storyteller_organizations')
    .select('storyteller_id');

  const linkedIds = new Set((existingLinks || []).map(l => l.storyteller_id));
  const unlinked = (allStorytellers || []).filter(s => !linkedIds.has(s.id));

  console.log(`   Total storytellers: ${allStorytellers?.length || 0}`);
  console.log(`   Already linked: ${linkedIds.size}`);
  console.log(`   Need linking: ${unlinked.length}`);

  if (unlinked.length === 0) {
    return 0;
  }

  // Get project memberships to determine organization
  const { data: projectMemberships } = await supabase
    .from('project_storytellers')
    .select('storyteller_id, project_id, projects!inner(organization_id)');

  const storytellerOrgMap = new Map<string, string>();
  for (const pm of projectMemberships || []) {
    const orgId = (pm.projects as any)?.organization_id;
    if (orgId && !storytellerOrgMap.has(pm.storyteller_id)) {
      storytellerOrgMap.set(pm.storyteller_id, orgId);
    }
  }

  // Also check transcripts → organization linkage
  const { data: transcriptOrgs } = await supabase
    .from('transcripts')
    .select('storyteller_id, organization_id')
    .not('storyteller_id', 'is', null)
    .not('organization_id', 'is', null);

  for (const to of transcriptOrgs || []) {
    if (to.storyteller_id && to.organization_id && !storytellerOrgMap.has(to.storyteller_id)) {
      storytellerOrgMap.set(to.storyteller_id, to.organization_id);
    }
  }

  let linkedCount = 0;
  let skippedNoTenant = 0;

  for (const storyteller of unlinked) {
    // Try to find org from project membership or transcript, otherwise use ACT as default
    const orgId = storytellerOrgMap.get(storyteller.id) || ACT_ORG_ID;

    // Get the tenant_id for this organization
    const tenantId = orgTenantMap.get(orgId);

    if (!tenantId) {
      skippedNoTenant++;
      continue; // Skip if no tenant_id found
    }

    const { error: insertError } = await supabase
      .from('storyteller_organizations')
      .insert({
        storyteller_id: storyteller.id,
        organization_id: orgId,
        tenant_id: tenantId,
        relationship_type: 'member',
        is_active: true,
        created_at: new Date().toISOString()
      });

    if (!insertError) {
      linkedCount++;
    } else {
      console.log(`   ⚠️  Failed to link ${storyteller.display_name}: ${insertError.message}`);
    }
  }

  if (skippedNoTenant > 0) {
    console.log(`   ⚠️  Skipped ${skippedNoTenant} storytellers (no tenant_id for target org)`);
  }
  console.log(`   ✅ Linked ${linkedCount} storytellers to organizations`);
  return linkedCount;
}

async function verifyDataIntegrity(): Promise<void> {
  console.log('\n✅ Step 4: Verifying Data Integrity');
  console.log('─'.repeat(50));

  // Check ACT organization
  const { data: actOrg } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', ACT_ORG_ID)
    .single();

  console.log(`   ACT Organization: ${actOrg ? '✅ ' + actOrg.name : '❌ Not found'}`);

  // Count ACT projects
  const { count: actProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ACT_ORG_ID);

  console.log(`   ACT Projects: ${actProjects}`);

  // Count storytellers with org links
  const { count: linkedStorytellers } = await supabase
    .from('storyteller_organizations')
    .select('*', { count: 'exact', head: true });

  const { count: totalStorytellers } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true });

  console.log(`   Storytellers linked: ${linkedStorytellers}/${totalStorytellers}`);

  // Count analyses with storyteller_id
  const { count: analysesWithStoryteller } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true })
    .not('storyteller_id', 'is', null);

  const { count: totalAnalyses } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true });

  console.log(`   Analyses with storyteller_id: ${analysesWithStoryteller}/${totalAnalyses}`);
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🎯 ACT DATA ALIGNMENT');
  console.log('   Connecting storytellers → projects → organizations');
  console.log('═'.repeat(60));

  const stats: AlignmentStats = {
    projectsLinked: 0,
    transcriptsUpdated: 0,
    storytellersLinked: 0,
    errors: []
  };

  try {
    stats.projectsLinked = await alignACTProjects();
    stats.transcriptsUpdated = await linkTranscriptsToStorytellers();
    stats.storytellersLinked = await linkStorytellersToOrganizations();
    await verifyDataIntegrity();

    console.log('\n' + '═'.repeat(60));
    console.log('📊 ALIGNMENT COMPLETE');
    console.log('═'.repeat(60));
    console.log(`   Projects linked to ACT: ${stats.projectsLinked}`);
    console.log(`   Analyses updated: ${stats.transcriptsUpdated}`);
    console.log(`   Storytellers linked: ${stats.storytellersLinked}`);

    if (stats.errors.length > 0) {
      console.log(`\n   ⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(e => console.log(`      - ${e}`));
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

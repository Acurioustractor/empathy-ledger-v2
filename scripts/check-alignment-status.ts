import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function checkAlignmentStatus() {
  console.log('═'.repeat(60));
  console.log('🔍 ALIGNMENT STATUS CHECK');
  console.log('═'.repeat(60));

  // 1. Organizations
  const { data: orgs, count: orgCount } = await supabase
    .from('organizations')
    .select('id, name, tenant_id', { count: 'exact' });
  console.log(`\n📋 Organizations: ${orgCount}`);
  orgs?.slice(0, 5).forEach(o => console.log(`   - ${o.name}`));

  // 2. Projects and their organization links
  const { data: projects, count: projectCount } = await supabase
    .from('projects')
    .select('id, name, organization_id, organizations(name)', { count: 'exact' });
  console.log(`\n📁 Projects: ${projectCount}`);
  const linkedProjects = projects?.filter(p => p.organization_id) || [];
  const unlinkedProjects = projects?.filter(p => !p.organization_id) || [];
  console.log(`   Linked to orgs: ${linkedProjects.length}`);
  console.log(`   Orphan (no org): ${unlinkedProjects.length}`);
  if (unlinkedProjects.length > 0) {
    console.log('   Orphan projects:');
    unlinkedProjects.forEach(p => console.log(`      - ${p.name}`));
  }

  // 3. Storytellers and org links
  const { count: storytellerCount } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true });

  const { count: storytellerOrgCount } = await supabase
    .from('storyteller_organizations')
    .select('*', { count: 'exact', head: true });

  console.log(`\n👥 Storytellers: ${storytellerCount}`);
  console.log(`   Linked to orgs: ${storytellerOrgCount}`);

  // 4. Transcripts and storyteller links
  const { count: transcriptCount } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true });

  const { count: transcriptsWithStoryteller } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true })
    .not('storyteller_id', 'is', null);

  console.log(`\n📝 Transcripts: ${transcriptCount}`);
  console.log(`   With storyteller_id: ${transcriptsWithStoryteller}`);

  // 5. Analyses
  const { count: analysisCount } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true });

  // Get the count of analyses whose transcripts have storyteller_id
  const { data: analysesWithStoryteller } = await supabase
    .from('transcript_analysis_results')
    .select('transcript_id, transcripts!inner(storyteller_id)')
    .not('transcripts.storyteller_id', 'is', null);

  console.log(`\n📊 Analyses: ${analysisCount}`);
  console.log(`   With linked storyteller (via transcript): ${analysesWithStoryteller?.length || 0}`);

  // 6. ACT-specific check
  const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

  const { count: actProjectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ACT_ORG_ID);

  const { count: actStorytellerCount } = await supabase
    .from('storyteller_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ACT_ORG_ID);

  console.log(`\n🎯 ACT Organization`);
  console.log(`   Projects: ${actProjectCount}`);
  console.log(`   Storytellers: ${actStorytellerCount}`);

  // 7. Stories
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });

  const { count: storiesWithStoryteller } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .not('storyteller_id', 'is', null);

  console.log(`\n📖 Stories: ${storyCount}`);
  console.log(`   With storyteller_id: ${storiesWithStoryteller}`);

  console.log('\n' + '═'.repeat(60));
}

checkAlignmentStatus().catch(console.error);

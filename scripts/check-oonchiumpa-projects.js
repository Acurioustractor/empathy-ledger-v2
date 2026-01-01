const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OONCHIUMPA_ORG_ID = 'c53077e1-98de-4216-9149-6268891ff62e';

async function checkProjects() {
  console.log('\n🎯 Analyzing Oonchiumpa Projects & Storyteller Assignments...\n');

  // Get all projects for this organization
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', OONCHIUMPA_ORG_ID)
    .order('created_at', { ascending: false });

  if (projectError) {
    console.error('❌ Error fetching projects:', projectError);
    return;
  }

  console.log(`📊 Found ${projects.length} projects\n`);

  for (const project of projects) {
    console.log('━'.repeat(80));
    console.log(`🎯 ${project.name}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Status: ${project.status || 'unknown'}`);
    console.log(`   Description: ${project.description?.substring(0, 100)}...` || 'None');

    // Get storytellers assigned to this project
    const { data: assignments, error: assignError } = await supabase
      .from('project_storytellers')
      .select(`
        storyteller_id,
        profiles!inner(
          display_name,
          full_name
        )
      `)
      .eq('project_id', project.id);

    if (assignError) {
      console.log(`   ⚠️  Error fetching assignments: ${assignError.message}`);
    } else {
      console.log(`\n   👥 Assigned Storytellers: ${assignments.length}`);
      assignments.forEach((a, idx) => {
        console.log(`      ${idx + 1}. ${a.profiles.display_name || a.profiles.full_name}`);
      });
    }

    // Get transcripts linked to this project
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcripts')
      .select('id, title, storyteller_id, ai_summary, themes')
      .eq('project_id', project.id);

    if (!transcriptError && transcripts.length > 0) {
      console.log(`\n   📄 Project Transcripts: ${transcripts.length}`);
      for (const t of transcripts) {
        const { data: storyteller } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', t.storyteller_id)
          .single();

        const hasAnalysis = t.ai_summary && t.themes?.length > 0;
        console.log(`      "${t.title || 'Untitled'}" by ${storyteller?.display_name || 'Unknown'} ${hasAnalysis ? '✅' : '❌'}`);
      }
    }

    console.log('');
  }

  console.log('━'.repeat(80));
}

checkProjects().catch(console.error);

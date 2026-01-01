const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function linkAllProjectTranscripts() {
  console.log('🔗 Linking ALL storyteller transcripts across ALL projects...\n');

  // Get all project-storyteller assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('project_storytellers')
    .select(`
      project_id,
      storyteller_id,
      projects(name),
      profiles(display_name)
    `);

  if (assignmentsError) {
    console.error('❌ Error fetching assignments:', assignmentsError);
    return;
  }

  console.log(`Found ${assignments.length} project-storyteller assignments\n`);

  // Group by project
  const projectMap = new Map();
  assignments.forEach(a => {
    if (!projectMap.has(a.project_id)) {
      projectMap.set(a.project_id, {
        name: a.projects?.name || 'Unknown Project',
        storytellers: []
      });
    }
    projectMap.get(a.project_id).storytellers.push({
      id: a.storyteller_id,
      name: a.profiles?.display_name || 'Unknown'
    });
  });

  let totalProjects = 0;
  let totalStorytellers = 0;
  let totalTranscripts = 0;
  let totalLinked = 0;

  for (const [projectId, projectData] of projectMap.entries()) {
    totalProjects++;
    console.log(`📁 ${projectData.name} (${projectData.storytellers.length} storytellers)`);

    let projectLinked = 0;

    for (const storyteller of projectData.storytellers) {
      totalStorytellers++;

      // Get all transcripts for this storyteller
      const { data: transcripts, error: transcriptsError } = await supabase
        .from('transcripts')
        .select('id, title, project_id')
        .eq('storyteller_id', storyteller.id);

      if (transcriptsError) {
        console.error(`   ❌ Error fetching transcripts for ${storyteller.name}:`, transcriptsError);
        continue;
      }

      if (!transcripts || transcripts.length === 0) {
        continue;
      }

      totalTranscripts += transcripts.length;

      const needsUpdate = transcripts.filter(t => t.project_id !== projectId);

      if (needsUpdate.length > 0) {
        // Update transcripts to link them to this project
        const { error: updateError } = await supabase
          .from('transcripts')
          .update({ project_id: projectId })
          .eq('storyteller_id', storyteller.id);

        if (updateError) {
          console.error(`   ❌ Error linking transcripts:`, updateError);
        } else {
          console.log(`   ✅ ${storyteller.name}: linked ${transcripts.length} transcript(s) (${needsUpdate.length} updated)`);
          projectLinked += transcripts.length;
          totalLinked += needsUpdate.length;
        }
      } else {
        console.log(`   ℹ️  ${storyteller.name}: ${transcripts.length} transcript(s) already linked`);
        projectLinked += transcripts.length;
      }
    }

    console.log(`   📊 Project total: ${projectLinked} transcripts\n`);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Summary:`);
  console.log(`   Projects processed: ${totalProjects}`);
  console.log(`   Storytellers processed: ${totalStorytellers}`);
  console.log(`   Total transcripts found: ${totalTranscripts}`);
  console.log(`   Transcripts updated: ${totalLinked}`);
  console.log(`\n🎉 All project transcripts are now linked!`);
}

linkAllProjectTranscripts();

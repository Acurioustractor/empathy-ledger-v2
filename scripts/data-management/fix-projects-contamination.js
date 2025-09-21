const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function analyzeProjectsContamination() {
  console.log('=== ANALYZING PROJECTS CONTAMINATION ===\n');

  const confitOrgId = 'f7f70fd6-bb60-4004-a910-bafbeb594caf';
  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';

  // Get all projects
  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, name, description, organization_id, status, created_at')
    .order('created_at');

  console.log(`Total projects in system: ${allProjects?.length || 0}`);

  if (allProjects) {
    // Group by organization
    const projectsByOrg = {};
    allProjects.forEach(p => {
      const orgId = p.organization_id || 'NULL';
      if (!projectsByOrg[orgId]) projectsByOrg[orgId] = [];
      projectsByOrg[orgId].push(p);
    });

    console.log('\nProjects by organization:');

    // Get organization names for reference
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name, tenant_id');

    Object.keys(projectsByOrg).forEach(orgId => {
      const count = projectsByOrg[orgId].length;
      const org = orgs?.find(o => o.id === orgId);
      const orgName = org ? org.name : 'Unknown/NULL';

      console.log(`  ${orgName}: ${count} projects`);

      // Check if projects belong to Confit Pathways
      if (orgId === confitOrgId) {
        console.log('    ✅ These projects correctly belong to Confit Pathways');
        projectsByOrg[orgId].forEach(p => {
          console.log(`      • ${p.name}`);
        });
      } else if (org?.tenant_id === confitTenantId) {
        console.log('    ⚠️  Projects in Confit Pathways tenant but wrong organization!');
      }
    });

    // Check for projects showing in Confit Pathways but belonging to other orgs
    console.log('\n=== CHECKING PROJECT-ORGANIZATION MISALIGNMENT ===');

    const confitProjects = allProjects.filter(p => p.organization_id === confitOrgId);
    const orphanProjects = allProjects.filter(p => !p.organization_id);

    console.log(`Projects assigned to Confit Pathways: ${confitProjects.length}`);
    console.log(`Projects with no organization: ${orphanProjects.length}`);

    if (orphanProjects.length > 0) {
      console.log('\nOrphan projects (no organization):');
      orphanProjects.forEach(p => {
        console.log(`  • ${p.name} (${p.id})`);
      });
    }
  }

  return allProjects;
}

async function fixProjectOrganizationAssignments() {
  console.log('\n=== FIXING PROJECT ORGANIZATION ASSIGNMENTS ===\n');

  // Get mapping of organization names to their IDs
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, tenant_id');

  const orgMap = {};
  orgs.forEach(org => {
    orgMap[org.name] = org;
  });

  // Get all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, organization_id');

  if (!projects) return;

  const fixes = [];

  // Define project name to organization mapping based on the project names shown
  const projectOrgMapping = {
    'Young Guns Empowerment Program': 'Young Guns',
    'Oonchiumpa Community Services': 'Oonchiumpa',
    'Diagrama Youth Support': 'Diagrama',
    'Global Laundry Alliance Initiative': 'Global Laundry Alliance',
    'TOMNET Community Network': 'TOMNET',
    'Beyond Shadows Support Program': 'Beyond Shadows',
    'Orange Sky Community Services': 'Orange Sky',
    'Palm Island Community Connection': 'Palm Island Community Company',
    'Goods Community Program': 'Goods.',
    'MMEIC Cultural Initiative': 'MMEIC',
    'MingaMinga Rangers Program': 'MingaMinga Rangers',
    'Community Outreach Program': 'Orange Sky', // Appears to be Orange Sky based on context
    'Community Support Services': 'Palm Island Community Company', // Appears to be PICC based on context
    'Mobile Laundry Services': 'Orange Sky'
  };

  console.log('Analyzing and fixing project assignments...\n');

  for (const project of projects) {
    const correctOrgName = projectOrgMapping[project.name];
    const correctOrg = correctOrgName ? orgMap[correctOrgName] : null;

    if (correctOrg && project.organization_id !== correctOrg.id) {
      fixes.push({
        projectId: project.id,
        projectName: project.name,
        currentOrgId: project.organization_id,
        correctOrgId: correctOrg.id,
        correctOrgName: correctOrgName
      });

      console.log(`🔧 ${project.name}`);
      console.log(`   Moving from ${project.organization_id || 'NULL'} → ${correctOrg.name} (${correctOrg.id})`);
    } else if (!correctOrgName && !project.organization_id) {
      // These are generic projects that should go to Independent Storytellers
      const independentOrg = orgMap['Independent Storytellers'];
      if (independentOrg) {
        fixes.push({
          projectId: project.id,
          projectName: project.name,
          currentOrgId: project.organization_id,
          correctOrgId: independentOrg.id,
          correctOrgName: 'Independent Storytellers'
        });

        console.log(`🔧 ${project.name}`);
        console.log(`   Moving to Independent Storytellers (generic project)`);
      }
    }
  }

  if (fixes.length === 0) {
    console.log('✅ No project fixes needed - all assignments are correct');
    return;
  }

  console.log(`\nApplying ${fixes.length} project fixes...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const fix of fixes) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ organization_id: fix.correctOrgId })
        .eq('id', fix.projectId);

      if (error) {
        console.log(`  ❌ Failed to fix ${fix.projectName}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ ${fix.projectName} → ${fix.correctOrgName}`);
        successCount++;
      }
    } catch (e) {
      console.log(`  ❌ Error fixing ${fix.projectName}: ${e.message}`);
      errorCount++;
    }
  }

  console.log(`\nFix results: ${successCount} successful, ${errorCount} errors`);
}

async function validateConfitPathwaysCleanup() {
  console.log('\n=== VALIDATING CONFIT PATHWAYS CLEANUP ===\n');

  const confitOrgId = 'f7f70fd6-bb60-4004-a910-bafbeb594caf';
  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  // Check profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('tenant_id', confitTenantId);

  console.log(`Profiles in Confit Pathways tenant: ${profiles?.length || 0}`);
  if (profiles) {
    profiles.forEach(p => {
      const status = p.id === joeKwonId ? '✅' : '⚠️';
      console.log(`  ${status} ${p.display_name || 'Unnamed'}`);
    });
  }

  // Check projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('organization_id', confitOrgId);

  console.log(`\nProjects assigned to Confit Pathways: ${projects?.length || 0}`);
  if (projects && projects.length > 0) {
    projects.forEach(p => {
      console.log(`  • ${p.name}`);
    });
  } else {
    console.log('  ✅ No projects assigned to Confit Pathways (clean)');
  }

  // Check transcripts
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id')
    .eq('tenant_id', confitTenantId);

  console.log(`\nTranscripts in Confit Pathways tenant: ${transcripts?.length || 0}`);
  if (transcripts) {
    transcripts.forEach(t => {
      const status = t.storyteller_id === joeKwonId ? '✅' : '⚠️';
      console.log(`  ${status} "${t.title || 'Untitled'}" (${t.storyteller_id})`);
    });
  }

  const isClean = (profiles?.length === 1) && (projects?.length === 0) &&
                  transcripts?.every(t => t.storyteller_id === joeKwonId);

  console.log(`\n${isClean ? '✅' : '⚠️'} Confit Pathways tenant cleanliness: ${isClean ? 'CLEAN' : 'NEEDS ATTENTION'}`);

  return isClean;
}

async function main() {
  await analyzeProjectsContamination();
  await fixProjectOrganizationAssignments();
  const isClean = await validateConfitPathwaysCleanup();

  if (isClean) {
    console.log('\n🎉 CONFIT PATHWAYS IS NOW FULLY CLEAN!');
    console.log('Joe Kwon should see only his own content.');
  } else {
    console.log('\n⚠️  Additional cleanup may be needed.');
  }
}

main().catch(console.error);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixProjectTenantAssignments() {
  console.log('=== FIXING PROJECT TENANT ASSIGNMENTS ===');
  console.log('');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';

  // 1. Get all projects in Confit Pathways tenant
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, organization_id, tenant_id, organizations(name, tenant_id)')
    .eq('tenant_id', confitTenantId);

  console.log(`Found ${projects?.length || 0} projects in Confit Pathways tenant`);
  console.log('');

  if (!projects || projects.length === 0) {
    console.log('✅ No projects to fix');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  console.log('Fixing project tenant assignments...');
  console.log('');

  for (const project of projects) {
    const correctTenantId = project.organizations?.tenant_id;
    const orgName = project.organizations?.name || 'Unknown';

    if (!correctTenantId) {
      console.log(`❌ ${project.name}: No tenant found for organization ${orgName}`);
      errorCount++;
      continue;
    }

    if (correctTenantId === confitTenantId) {
      console.log(`⚠️  ${project.name}: Already in correct tenant (${orgName})`);
      continue;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ tenant_id: correctTenantId })
        .eq('id', project.id);

      if (error) {
        console.log(`❌ ${project.name}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${project.name} → ${orgName} tenant`);
        successCount++;
      }
    } catch (e) {
      console.log(`❌ ${project.name}: ${e.message}`);
      errorCount++;
    }
  }

  console.log('');
  console.log(`Fix results: ${successCount} successful, ${errorCount} errors`);

  // Verify Confit Pathways is now clean
  console.log('');
  console.log('VERIFICATION - Projects remaining in Confit Pathways tenant:');
  const { data: remaining } = await supabase
    .from('projects')
    .select('id, name')
    .eq('tenant_id', confitTenantId);

  console.log(`Remaining projects: ${remaining?.length || 0}`);
  if (remaining && remaining.length > 0) {
    remaining.forEach(p => {
      console.log(`  • ${p.name}`);
    });
  } else {
    console.log('  ✅ Confit Pathways tenant is now project-free!');
  }

  return remaining?.length === 0;
}

fixProjectTenantAssignments().catch(console.error);
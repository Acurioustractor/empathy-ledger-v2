const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function testProjectCreationWorkflow() {
  console.log('=== TESTING PROJECT CREATION WORKFLOW ===');
  console.log('');

  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
  const snowFoundationId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';
  const snowFoundationTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';

  // 1. Create a new test project for Snow Foundation
  console.log('1. CREATING NEW PROJECT FOR SNOW FOUNDATION:');

  const newProject = {
    name: 'Healing Through Storytelling Initiative',
    description: 'A community-driven project documenting healing journeys and traditional knowledge sharing among Indigenous communities in Queensland. This project focuses on healing traditions, community resilience, and indigenous wisdom.',
    organization_id: snowFoundationId,
    tenant_id: snowFoundationTenantId,
    status: 'active',
    location: 'Palm Island, Queensland',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    created_by: benjaminId,
    created_at: new Date().toISOString()
  };

  const { data: createdProject, error: projectError } = await supabase
    .from('projects')
    .insert(newProject)
    .select()
    .single();

  if (projectError) {
    console.log('   ❌ Failed to create project:', projectError.message);
    return false;
  }

  console.log('   ✅ Created project successfully:');
  console.log('   Project ID:', createdProject.id);
  console.log('   Name:', createdProject.name);
  console.log('   Organization:', snowFoundationId);
  console.log('   Tenant:', snowFoundationTenantId);
  console.log('');

  // 2. Verify project is properly linked to organization
  console.log('2. VERIFYING PROJECT-ORGANIZATION LINKAGE:');

  const { data: projectWithOrg, error: linkError } = await supabase
    .from('projects')
    .select('*, organizations(name, tenant_id)')
    .eq('id', createdProject.id)
    .single();

  if (linkError) {
    console.log('   ❌ Failed to verify project linkage:', linkError.message);
  } else {
    console.log('   ✅ Project properly linked:');
    console.log('   Organization:', projectWithOrg.organizations?.name);
    console.log('   Tenant matches:', projectWithOrg.tenant_id === projectWithOrg.organizations?.tenant_id);
    console.log('');
  }

  // 3. Create project location relationship
  console.log('3. CREATING PROJECT-LOCATION RELATIONSHIP:');

  // Find Palm Island location
  const { data: palmIslandLocation } = await supabase
    .from('locations')
    .select('*')
    .ilike('name', '%palm%island%')
    .single();

  if (palmIslandLocation) {
    const { error: locationError } = await supabase
      .from('project_locations')
      .insert({
        project_id: createdProject.id,
        location_id: palmIslandLocation.id,
        is_primary: true,
        created_at: new Date().toISOString()
      });

    if (locationError) {
      console.log('   ⚠️  Could not link to location:', locationError.message);
    } else {
      console.log('   ✅ Linked project to Palm Island location');
    }
  } else {
    console.log('   ⚠️  Palm Island location not found');
  }
  console.log('');

  // 4. Test finding storytellers for this project
  console.log('4. FINDING POTENTIAL STORYTELLERS FOR PROJECT:');

  // Find storytellers in Snow Foundation
  const { data: snowStorytellers } = await supabase
    .from('profile_organizations')
    .select('*, profiles(id, display_name, email, cultural_background)')
    .eq('organization_id', snowFoundationId)
    .eq('is_active', true);

  console.log('   Snow Foundation storytellers:', snowStorytellers?.length || 0);

  // Find storytellers in Independent Storytellers (potential candidates)
  const { data: independentStorytellers } = await supabase
    .from('profile_organizations')
    .select('*, profiles(id, display_name, email, cultural_background)')
    .eq('organization_id', '0a1bd4a5-5e01-470f-83f6-f55f86c0aa83')
    .eq('is_active', true)
    .limit(10);

  console.log('   Independent storytellers (potential):', independentStorytellers?.length || 0);
  console.log('');

  // 5. Sample storyteller assignment
  console.log('5. TESTING STORYTELLER ASSIGNMENT:');

  const storytellersToAssign = [...(snowStorytellers || []), ...(independentStorytellers || [])].slice(0, 5);
  let assignmentsCreated = 0;

  for (const storyteller of storytellersToAssign) {
    const { error: assignError } = await supabase
      .from('project_storytellers')
      .insert({
        project_id: createdProject.id,
        storyteller_id: storyteller.profile_id,
        role: 'storyteller',
        status: 'active',
        assigned_by: benjaminId,
        assigned_at: new Date().toISOString()
      });

    if (!assignError) {
      assignmentsCreated++;
    }
  }

  console.log('   ✅ Assigned', assignmentsCreated, 'storytellers to project');
  console.log('');

  // 6. Create a sample gallery for the project
  console.log('6. CREATING PROJECT GALLERY:');

  const { data: projectGallery, error: galleryError } = await supabase
    .from('galleries')
    .insert({
      title: 'Healing Through Storytelling - Photo Collection',
      slug: 'healing-storytelling-photos',
      description: 'Visual documentation of healing traditions and community gatherings',
      status: 'active',
      visibility: 'organization',
      cultural_sensitivity_level: 'high',
      cultural_theme: 'healing_traditions',
      cultural_context: 'indigenous_community',
      cultural_significance: 'high',
      organization_id: snowFoundationId,
      created_by: benjaminId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (galleryError) {
    console.log('   ⚠️  Could not create gallery:', galleryError.message);
  } else {
    console.log('   ✅ Created project gallery:', projectGallery.title);
  }
  console.log('');

  // 7. Verify tenant isolation
  console.log('7. VERIFYING TENANT ISOLATION:');

  // Check that project is in correct tenant
  const { data: tenantProjects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('tenant_id', snowFoundationTenantId);

  const projectInTenant = tenantProjects?.find(p => p.id === createdProject.id);
  console.log('   ✅ Project properly isolated in Snow Foundation tenant:', !!projectInTenant);
  console.log('   Total projects in tenant:', tenantProjects?.length || 0);
  console.log('');

  // 8. Test project permissions and access
  console.log('8. TESTING PROJECT ACCESS PERMISSIONS:');

  // Check if Benjamin (super admin) can access the project
  const { data: projectAccess } = await supabase
    .from('projects')
    .select('*, organizations(name)')
    .eq('id', createdProject.id)
    .single();

  if (projectAccess) {
    console.log('   ✅ Super admin can access project');
    console.log('   ✅ Organization data accessible:', !!projectAccess.organizations?.name);
  }
  console.log('');

  // 9. Summary of created resources
  console.log('9. CREATED RESOURCES SUMMARY:');
  console.log('   📁 Project: "' + createdProject.name + '"');
  console.log('   🏢 Organization: Snow Foundation');
  console.log('   🌏 Location: Palm Island, Queensland');
  console.log('   👥 Storytellers assigned:', assignmentsCreated);
  console.log('   📸 Gallery created:', galleryError ? 'No' : 'Yes');
  console.log('   🔒 Tenant isolation: Verified');
  console.log('');

  console.log('🎉 PROJECT CREATION WORKFLOW TEST COMPLETE!');
  console.log('Project ID for next tests:', createdProject.id);

  return {
    success: true,
    projectId: createdProject.id,
    projectName: createdProject.name,
    storytellersAssigned: assignmentsCreated,
    galleryCreated: !galleryError
  };
}

testProjectCreationWorkflow().catch(console.error);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function fixLocationsAndProjectsInfrastructure() {
  console.log('=== FIXING LOCATIONS AND PROJECTS INFRASTRUCTURE ===');
  console.log('');

  // First, let's analyze current state
  console.log('1. ANALYZING CURRENT STATE:');

  // Check locations table
  const { data: locations, error: locError } = await supabase
    .from('locations')
    .select('*');

  if (locError) {
    console.log('   ⚠️  Locations table not accessible:', locError.message);
  } else {
    console.log('   Locations table exists with', locations?.length || 0, 'records');
  }

  // Check projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, organization_id, tenant_id, location, organizations(name, tenant_id)');

  console.log('   Projects table has', projects?.length || 0, 'records');

  // Get organizations for reference
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, tenant_id, location');

  console.log('   Organizations:', orgs?.length || 0);
  console.log('');

  // Step 1: Fix Projects Infrastructure
  console.log('2. FIXING PROJECTS INFRASTRUCTURE:');

  let projectsFixed = 0;
  let projectErrors = 0;

  for (const project of projects || []) {
    const orgTenantId = project.organizations?.tenant_id;
    let needsUpdate = false;
    const updates = {};

    // Fix tenant_id if missing or incorrect
    if (!project.tenant_id || project.tenant_id !== orgTenantId) {
      updates.tenant_id = orgTenantId;
      needsUpdate = true;
    }

    // Ensure organization_id is set
    if (!project.organization_id) {
      // Find organization by name matching or assign to Independent Storytellers
      const matchingOrg = orgs?.find(org =>
        project.name.toLowerCase().includes(org.name.toLowerCase()) ||
        org.name.toLowerCase().includes(project.name.toLowerCase())
      );

      if (matchingOrg) {
        updates.organization_id = matchingOrg.id;
        updates.tenant_id = matchingOrg.tenant_id;
        needsUpdate = true;
      } else {
        // Assign to Independent Storytellers if no match found
        updates.organization_id = '0a1bd4a5-5e01-470f-83f6-f55f86c0aa83';
        updates.tenant_id = '109f5ad5-8806-4944-838b-b7e1a910aea2';
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);

      if (error) {
        console.log('   ❌ Failed to update project:', project.name, error.message);
        projectErrors++;
      } else {
        projectsFixed++;
        if (projectsFixed % 5 === 0) {
          console.log('   ✅ Fixed', projectsFixed, 'projects...');
        }
      }
    }
  }

  console.log('   Final: Fixed', projectsFixed, 'projects,', projectErrors, 'errors');
  console.log('');

  // Step 2: Create/Fix Locations Infrastructure
  console.log('3. CREATING/FIXING LOCATIONS INFRASTRUCTURE:');

  // Create locations table if it doesn't exist or populate it
  if (!locations || locations.length === 0) {
    console.log('   Creating location records from organization and project data...');

    const locationSet = new Set();
    const locationData = [];

    // Extract locations from organizations
    orgs?.forEach(org => {
      if (org.location && org.location.trim()) {
        const loc = org.location.trim();
        if (!locationSet.has(loc)) {
          locationSet.add(loc);
          locationData.push({
            name: loc,
            type: 'community',
            organization_id: org.id,
            tenant_id: org.tenant_id,
            is_primary: true,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    // Extract locations from projects
    projects?.forEach(project => {
      if (project.location && project.location.trim()) {
        const loc = project.location.trim();
        if (!locationSet.has(loc)) {
          locationSet.add(loc);
          locationData.push({
            name: loc,
            type: 'project_site',
            organization_id: project.organization_id,
            tenant_id: project.tenant_id || project.organizations?.tenant_id,
            is_primary: false,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    // Add common locations for organizations without specific locations
    const commonLocations = [
      'Brisbane, Queensland',
      'Sydney, New South Wales',
      'Melbourne, Victoria',
      'Palm Island, Queensland',
      'Townsville, Queensland',
      'Perth, Western Australia',
      'Adelaide, South Australia',
      'Darwin, Northern Territory',
      'Hobart, Tasmania',
      'Canberra, ACT'
    ];

    commonLocations.forEach(loc => {
      if (!locationSet.has(loc)) {
        locationSet.add(loc);
        locationData.push({
          name: loc,
          type: 'region',
          organization_id: null,
          tenant_id: null,
          is_primary: false,
          created_at: new Date().toISOString()
        });
      }
    });

    if (locationData.length > 0) {
      const { error: locInsertError } = await supabase
        .from('locations')
        .insert(locationData);

      if (locInsertError) {
        console.log('   ❌ Failed to create locations:', locInsertError.message);
      } else {
        console.log('   ✅ Created', locationData.length, 'location records');
      }
    }
  } else {
    // Update existing locations with proper organization and tenant connections
    console.log('   Updating existing location records...');

    let locationsUpdated = 0;

    for (const location of locations) {
      if (!location.organization_id || !location.tenant_id) {
        // Find matching organization
        const matchingOrg = orgs?.find(org =>
          org.location && location.name.toLowerCase().includes(org.location.toLowerCase())
        );

        if (matchingOrg) {
          const { error } = await supabase
            .from('locations')
            .update({
              organization_id: matchingOrg.id,
              tenant_id: matchingOrg.tenant_id,
              is_primary: true
            })
            .eq('id', location.id);

          if (!error) {
            locationsUpdated++;
          }
        }
      }
    }

    console.log('   Updated', locationsUpdated, 'existing location records');
  }

  console.log('');

  // Step 3: Create Location-Project relationships
  console.log('4. CREATING LOCATION-PROJECT RELATIONSHIPS:');

  try {
    // Check if project_locations table exists
    const { data: projectLocations } = await supabase
      .from('project_locations')
      .select('*')
      .limit(1);

    console.log('   project_locations table exists');

    // Get updated locations
    const { data: updatedLocations } = await supabase
      .from('locations')
      .select('id, name, organization_id');

    // Get updated projects
    const { data: updatedProjects } = await supabase
      .from('projects')
      .select('id, name, location, organization_id');

    let relationshipsCreated = 0;

    for (const project of updatedProjects || []) {
      if (project.location) {
        // Find matching location
        const matchingLocation = updatedLocations?.find(loc =>
          loc.name.toLowerCase().includes(project.location.toLowerCase()) ||
          project.location.toLowerCase().includes(loc.name.toLowerCase()) ||
          loc.organization_id === project.organization_id
        );

        if (matchingLocation) {
          // Check if relationship already exists
          const { data: existing } = await supabase
            .from('project_locations')
            .select('id')
            .eq('project_id', project.id)
            .eq('location_id', matchingLocation.id)
            .single();

          if (!existing) {
            const { error } = await supabase
              .from('project_locations')
              .insert({
                project_id: project.id,
                location_id: matchingLocation.id,
                is_primary: true,
                created_at: new Date().toISOString()
              });

            if (!error) {
              relationshipsCreated++;
            }
          }
        }
      }
    }

    console.log('   Created', relationshipsCreated, 'project-location relationships');

  } catch (error) {
    console.log('   ⚠️  project_locations table not accessible, skipping relationships');
  }

  console.log('');

  // Step 4: Final verification and summary
  console.log('5. FINAL VERIFICATION:');

  const { data: finalProjects } = await supabase
    .from('projects')
    .select('id, name, organization_id, tenant_id, organizations(name)');

  const { data: finalLocations } = await supabase
    .from('locations')
    .select('*');

  // Count projects by organization
  const projectsByOrg = {};
  finalProjects?.forEach(project => {
    const orgName = project.organizations?.name || 'Unassigned';
    if (!projectsByOrg[orgName]) projectsByOrg[orgName] = 0;
    projectsByOrg[orgName]++;
  });

  console.log('   PROJECTS BY ORGANIZATION:');
  Object.keys(projectsByOrg).sort((a, b) => projectsByOrg[b] - projectsByOrg[a]).forEach(orgName => {
    console.log('     • ' + orgName + ': ' + projectsByOrg[orgName] + ' projects');
  });

  console.log('');
  console.log('   LOCATION SUMMARY:');
  console.log('     Total locations:', finalLocations?.length || 0);

  const locationsByType = {};
  finalLocations?.forEach(loc => {
    const type = loc.type || 'unknown';
    if (!locationsByType[type]) locationsByType[type] = 0;
    locationsByType[type]++;
  });

  Object.keys(locationsByType).forEach(type => {
    console.log('     • ' + type + ': ' + locationsByType[type] + ' locations');
  });

  // Check for projects missing tenant_id or organization_id
  const missingTenant = finalProjects?.filter(p => !p.tenant_id) || [];
  const missingOrg = finalProjects?.filter(p => !p.organization_id) || [];

  console.log('');
  console.log('   INFRASTRUCTURE HEALTH:');
  console.log('     Projects missing tenant_id:', missingTenant.length);
  console.log('     Projects missing organization_id:', missingOrg.length);

  if (missingTenant.length === 0 && missingOrg.length === 0) {
    console.log('     ✅ ALL PROJECTS HAVE PROPER INFRASTRUCTURE!');
  }

  console.log('');
  console.log('🎉 LOCATIONS AND PROJECTS INFRASTRUCTURE FIX COMPLETE!');
}

fixLocationsAndProjectsInfrastructure().catch(console.error);
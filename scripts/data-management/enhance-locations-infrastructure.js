const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function enhanceLocationsInfrastructure() {
  console.log('=== ENHANCING LOCATIONS INFRASTRUCTURE ===');
  console.log('');

  // Get all current locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*');

  console.log('1. CURRENT LOCATIONS:', locations?.length || 0);

  // Get organizations and their locations
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, location, tenant_id, type');

  // Get projects and their locations
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, location, organization_id, tenant_id');

  console.log('');

  // Step 1: Enhance existing locations with proper metadata
  console.log('2. ENHANCING LOCATION METADATA:');

  const australianStates = {
    'queensland': 'QLD',
    'new south wales': 'NSW',
    'victoria': 'VIC',
    'western australia': 'WA',
    'south australia': 'SA',
    'northern territory': 'NT',
    'tasmania': 'TAS',
    'australian capital territory': 'ACT'
  };

  const indigenousCommunities = [
    'palm island', 'yarrabah', 'cherbourg', 'woorabinda', 'hopevale',
    'lockhart river', 'napranum', 'pormpuraaw', 'kowanyama', 'mapoon'
  ];

  let enhanced = 0;

  for (const location of locations || []) {
    const updates = {};
    let needsUpdate = false;

    // Determine location type based on name
    const locName = location.name.toLowerCase();

    if (location.type === 'unknown' || !location.type) {
      if (indigenousCommunities.some(community => locName.includes(community))) {
        updates.type = 'indigenous_community';
        updates.cultural_significance = 'high';
        needsUpdate = true;
      } else if (locName.includes('island')) {
        updates.type = 'island_community';
        updates.cultural_significance = 'medium';
        needsUpdate = true;
      } else if (Object.keys(australianStates).some(state => locName.includes(state))) {
        updates.type = 'state_region';
        updates.cultural_significance = 'low';
        needsUpdate = true;
      } else if (locName.includes('brisbane') || locName.includes('sydney') ||
                 locName.includes('melbourne') || locName.includes('perth') ||
                 locName.includes('adelaide') || locName.includes('darwin') ||
                 locName.includes('hobart') || locName.includes('canberra')) {
        updates.type = 'major_city';
        updates.cultural_significance = 'low';
        needsUpdate = true;
      } else {
        updates.type = 'community';
        updates.cultural_significance = 'medium';
        needsUpdate = true;
      }
    }

    // Add state/territory information
    if (!location.state_territory) {
      for (const [state, code] of Object.entries(australianStates)) {
        if (locName.includes(state)) {
          updates.state_territory = code;
          needsUpdate = true;
          break;
        }
      }
    }

    // Add country if missing
    if (!location.country) {
      updates.country = 'Australia';
      needsUpdate = true;
    }

    // Set coordinates for major locations (simplified)
    if (!location.latitude && !location.longitude) {
      const coordinates = {
        'palm island': { lat: -18.7553, lng: 146.5811 },
        'brisbane': { lat: -27.4698, lng: 153.0251 },
        'sydney': { lat: -33.8688, lng: 151.2093 },
        'melbourne': { lat: -37.8136, lng: 144.9631 },
        'townsville': { lat: -19.2590, lng: 146.8169 }
      };

      for (const [city, coords] of Object.entries(coordinates)) {
        if (locName.includes(city)) {
          updates.latitude = coords.lat;
          updates.longitude = coords.lng;
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', location.id);

      if (!error) {
        enhanced++;
      }
    }
  }

  console.log('   Enhanced', enhanced, 'location records');
  console.log('');

  // Step 2: Connect locations to organizations
  console.log('3. CONNECTING LOCATIONS TO ORGANIZATIONS:');

  let orgLocationConnections = 0;

  for (const org of orgs || []) {
    if (org.location) {
      // Find matching location
      const matchingLocation = locations?.find(loc =>
        loc.name.toLowerCase().includes(org.location.toLowerCase()) ||
        org.location.toLowerCase().includes(loc.name.toLowerCase())
      );

      if (matchingLocation && !matchingLocation.organization_id) {
        const { error } = await supabase
          .from('locations')
          .update({
            organization_id: org.id,
            tenant_id: org.tenant_id,
            is_primary: true
          })
          .eq('id', matchingLocation.id);

        if (!error) {
          orgLocationConnections++;
        }
      }
    }
  }

  console.log('   Connected', orgLocationConnections, 'locations to organizations');
  console.log('');

  // Step 3: Create missing Indigenous community locations
  console.log('4. CREATING MISSING INDIGENOUS COMMUNITY LOCATIONS:');

  const importantIndigenousCommunities = [
    {
      name: 'Palm Island Community',
      state_territory: 'QLD',
      type: 'indigenous_community',
      latitude: -18.7553,
      longitude: 146.5811,
      cultural_significance: 'high'
    },
    {
      name: 'Yarrabah Community',
      state_territory: 'QLD',
      type: 'indigenous_community',
      latitude: -16.9167,
      longitude: 145.8667,
      cultural_significance: 'high'
    },
    {
      name: 'Cherbourg Community',
      state_territory: 'QLD',
      type: 'indigenous_community',
      latitude: -26.3453,
      longitude: 151.8559,
      cultural_significance: 'high'
    }
  ];

  let newLocationsCreated = 0;

  for (const newLoc of importantIndigenousCommunities) {
    // Check if location already exists
    const existing = locations?.find(loc =>
      loc.name.toLowerCase().includes(newLoc.name.toLowerCase().split(' ')[0])
    );

    if (!existing) {
      const { error } = await supabase
        .from('locations')
        .insert({
          ...newLoc,
          country: 'Australia',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        newLocationsCreated++;
      }
    }
  }

  console.log('   Created', newLocationsCreated, 'new Indigenous community locations');
  console.log('');

  // Step 4: Create project-location relationships where missing
  console.log('5. CREATING PROJECT-LOCATION RELATIONSHIPS:');

  try {
    const { data: updatedLocations } = await supabase
      .from('locations')
      .select('id, name, organization_id');

    let projectLocationRelationships = 0;

    for (const project of projects || []) {
      // Find location by project location field or organization
      let matchingLocation = null;

      if (project.location) {
        matchingLocation = updatedLocations?.find(loc =>
          loc.name.toLowerCase().includes(project.location.toLowerCase()) ||
          project.location.toLowerCase().includes(loc.name.toLowerCase())
        );
      }

      if (!matchingLocation) {
        // Try to match by organization
        matchingLocation = updatedLocations?.find(loc =>
          loc.organization_id === project.organization_id
        );
      }

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
            projectLocationRelationships++;
          }
        }
      }
    }

    console.log('   Created', projectLocationRelationships, 'project-location relationships');

  } catch (error) {
    console.log('   ⚠️  Could not create project-location relationships:', error.message);
  }

  console.log('');

  // Step 5: Final summary
  console.log('6. FINAL LOCATION INFRASTRUCTURE SUMMARY:');

  const { data: finalLocations } = await supabase
    .from('locations')
    .select('*');

  const typeBreakdown = {};
  const stateBreakdown = {};
  const culturalBreakdown = {};

  finalLocations?.forEach(loc => {
    // Type breakdown
    const type = loc.type || 'unknown';
    typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;

    // State breakdown
    const state = loc.state_territory || 'unknown';
    stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;

    // Cultural significance breakdown
    const cultural = loc.cultural_significance || 'unknown';
    culturalBreakdown[cultural] = (culturalBreakdown[cultural] || 0) + 1;
  });

  console.log('   LOCATIONS BY TYPE:');
  Object.keys(typeBreakdown).forEach(type => {
    console.log('     • ' + type + ': ' + typeBreakdown[type]);
  });

  console.log('');
  console.log('   LOCATIONS BY STATE/TERRITORY:');
  Object.keys(stateBreakdown).forEach(state => {
    console.log('     • ' + state + ': ' + stateBreakdown[state]);
  });

  console.log('');
  console.log('   LOCATIONS BY CULTURAL SIGNIFICANCE:');
  Object.keys(culturalBreakdown).forEach(cultural => {
    console.log('     • ' + cultural + ': ' + culturalBreakdown[cultural]);
  });

  const connectedToOrgs = finalLocations?.filter(loc => loc.organization_id) || [];
  console.log('');
  console.log('   INFRASTRUCTURE HEALTH:');
  console.log('     Total locations:', finalLocations?.length || 0);
  console.log('     Connected to organizations:', connectedToOrgs.length);
  console.log('     Indigenous communities:', typeBreakdown['indigenous_community'] || 0);

  console.log('');
  console.log('🎉 LOCATIONS INFRASTRUCTURE ENHANCEMENT COMPLETE!');
}

enhanceLocationsInfrastructure().catch(console.error);
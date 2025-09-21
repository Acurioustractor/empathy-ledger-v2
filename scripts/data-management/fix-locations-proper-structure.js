const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function fixLocationsProperStructure() {
  console.log('=== FIXING LOCATIONS WITH PROPER STRUCTURE ===');
  console.log('');

  // Get all current locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*');

  console.log('1. CURRENT LOCATIONS:', locations?.length || 0);

  // Get organizations for reference
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, location, tenant_id');

  console.log('   Organizations with locations to map:', orgs?.filter(o => o.location).length || 0);
  console.log('');

  // Step 1: Add coordinates to major locations
  console.log('2. ADDING COORDINATES TO MAJOR LOCATIONS:');

  const coordinates = {
    'sydney': { lat: -33.8688, lng: 151.2093 },
    'melbourne': { lat: -37.8136, lng: 144.9631 },
    'brisbane': { lat: -27.4698, lng: 153.0251 },
    'perth': { lat: -31.9505, lng: 115.8605 },
    'adelaide': { lat: -34.9285, lng: 138.6007 },
    'darwin': { lat: -12.4634, lng: 130.8456 },
    'hobart': { lat: -42.8821, lng: 147.3272 },
    'canberra': { lat: -35.2809, lng: 149.1300 },
    'townsville': { lat: -19.2590, lng: 146.8169 },
    'palm island': { lat: -18.7553, lng: 146.5811 },
    'cairns': { lat: -16.9186, lng: 145.7781 },
    'gold coast': { lat: -28.0167, lng: 153.4000 }
  };

  let coordinatesAdded = 0;

  for (const location of locations || []) {
    if (!location.latitude || !location.longitude) {
      const locName = location.name.toLowerCase();

      for (const [city, coords] of Object.entries(coordinates)) {
        if (locName.includes(city)) {
          const { error } = await supabase
            .from('locations')
            .update({
              latitude: coords.lat,
              longitude: coords.lng,
              updated_at: new Date().toISOString()
            })
            .eq('id', location.id);

          if (!error) {
            coordinatesAdded++;
            console.log('   ✅ Added coordinates to', location.name);
          }
          break;
        }
      }
    }
  }

  console.log('   Added coordinates to', coordinatesAdded, 'locations');
  console.log('');

  // Step 2: Create missing Indigenous community locations
  console.log('3. CREATING MISSING INDIGENOUS COMMUNITY LOCATIONS:');

  const indigenousLocations = [
    {
      name: 'Palm Island',
      city: 'Palm Island',
      state: 'QLD',
      country: 'Australia',
      latitude: -18.7553,
      longitude: 146.5811
    },
    {
      name: 'Yarrabah',
      city: 'Yarrabah',
      state: 'QLD',
      country: 'Australia',
      latitude: -16.9167,
      longitude: 145.8667
    },
    {
      name: 'Cherbourg',
      city: 'Cherbourg',
      state: 'QLD',
      country: 'Australia',
      latitude: -26.3453,
      longitude: 151.8559
    },
    {
      name: 'Woorabinda',
      city: 'Woorabinda',
      state: 'QLD',
      country: 'Australia',
      latitude: -24.1167,
      longitude: 149.4500
    }
  ];

  let newLocationsCreated = 0;

  for (const newLoc of indigenousLocations) {
    // Check if location already exists
    const existing = locations?.find(loc =>
      loc.name.toLowerCase().includes(newLoc.name.toLowerCase()) ||
      loc.city?.toLowerCase().includes(newLoc.name.toLowerCase())
    );

    if (!existing) {
      const { error } = await supabase
        .from('locations')
        .insert({
          ...newLoc,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        newLocationsCreated++;
        console.log('   ✅ Created', newLoc.name);
      }
    }
  }

  console.log('   Created', newLocationsCreated, 'new Indigenous community locations');
  console.log('');

  // Step 3: Add missing major Australian cities
  console.log('4. ADDING MISSING MAJOR CITIES:');

  const majorCities = [
    { name: 'Newcastle', city: 'Newcastle', state: 'NSW', country: 'Australia', latitude: -32.9283, longitude: 151.7817 },
    { name: 'Wollongong', city: 'Wollongong', state: 'NSW', country: 'Australia', latitude: -34.4278, longitude: 150.8931 },
    { name: 'Geelong', city: 'Geelong', state: 'VIC', country: 'Australia', latitude: -38.1499, longitude: 144.3617 },
    { name: 'Ballarat', city: 'Ballarat', state: 'VIC', country: 'Australia', latitude: -37.5622, longitude: 143.8503 }
  ];

  let citiesAdded = 0;

  for (const city of majorCities) {
    const existing = locations?.find(loc =>
      loc.name.toLowerCase() === city.name.toLowerCase()
    );

    if (!existing) {
      const { error } = await supabase
        .from('locations')
        .insert({
          ...city,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        citiesAdded++;
      }
    }
  }

  console.log('   Added', citiesAdded, 'major cities');
  console.log('');

  // Step 4: Try to link projects to locations
  console.log('5. LINKING PROJECTS TO LOCATIONS:');

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, location, organization_id');

  const { data: updatedLocations } = await supabase
    .from('locations')
    .select('*');

  let projectsLinked = 0;

  // Check if location_projects table exists
  try {
    const { data: testLocationProjects } = await supabase
      .from('location_projects')
      .select('*')
      .limit(1);

    console.log('   Using location_projects table...');

    for (const project of projects || []) {
      if (project.location) {
        // Find matching location
        const matchingLocation = updatedLocations?.find(loc =>
          loc.name.toLowerCase().includes(project.location.toLowerCase()) ||
          project.location.toLowerCase().includes(loc.name.toLowerCase()) ||
          loc.city?.toLowerCase().includes(project.location.toLowerCase())
        );

        if (matchingLocation) {
          // Check if link already exists
          const { data: existing } = await supabase
            .from('location_projects')
            .select('id')
            .eq('project_id', project.id)
            .eq('location_id', matchingLocation.id)
            .single();

          if (!existing) {
            const { error } = await supabase
              .from('location_projects')
              .insert({
                project_id: project.id,
                location_id: matchingLocation.id,
                created_at: new Date().toISOString()
              });

            if (!error) {
              projectsLinked++;
            }
          }
        }
      }
    }

    console.log('   Linked', projectsLinked, 'projects to locations');

  } catch (error) {
    console.log('   ⚠️  location_projects table not accessible, skipping project linking');
  }

  console.log('');

  // Step 5: Final summary
  console.log('6. FINAL LOCATIONS SUMMARY:');

  const { data: finalLocations } = await supabase
    .from('locations')
    .select('*');

  const stateBreakdown = {};
  const withCoordinates = finalLocations?.filter(loc => loc.latitude && loc.longitude) || [];

  finalLocations?.forEach(loc => {
    const state = loc.state || 'Unknown';
    stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
  });

  console.log('   TOTAL LOCATIONS:', finalLocations?.length || 0);
  console.log('   With coordinates:', withCoordinates.length);
  console.log('');

  console.log('   BY STATE/TERRITORY:');
  Object.keys(stateBreakdown).sort().forEach(state => {
    console.log('     • ' + state + ': ' + stateBreakdown[state]);
  });

  console.log('');

  // Show Indigenous communities specifically
  const indigenousCommunities = finalLocations?.filter(loc =>
    ['palm island', 'yarrabah', 'cherbourg', 'woorabinda', 'hopevale', 'lockhart river']
      .some(community => loc.name.toLowerCase().includes(community))
  ) || [];

  console.log('   INDIGENOUS COMMUNITIES:', indigenousCommunities.length);
  indigenousCommunities.forEach(loc => {
    console.log('     • ' + loc.name + ' (' + loc.state + ')');
  });

  console.log('');
  console.log('🎉 LOCATIONS INFRASTRUCTURE PROPERLY STRUCTURED!');
}

fixLocationsProperStructure().catch(console.error);
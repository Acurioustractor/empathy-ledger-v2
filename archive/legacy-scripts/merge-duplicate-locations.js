const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parser for common Australian location formats
function parseAustralianLocation(nameString) {
  if (nameString === 'Traditional Territory') {
    return {
      name: 'Traditional Territory',
      city: null,
      state: null,
      country: 'Indigenous Territory'
    };
  }

  const parts = nameString.split(',').map(p => p.trim());

  if (parts.length === 3) {
    const [city, state, country] = parts;
    return {
      name: city,
      city: city,
      state: normalizeStateAbbreviation(state),
      country: country
    };
  } else if (parts.length === 2) {
    const [city, state] = parts;
    return {
      name: city,
      city: city,
      state: normalizeStateAbbreviation(state),
      country: 'Australia'
    };
  }

  return null;
}

function normalizeStateAbbreviation(state) {
  const stateMap = {
    'Qld': 'QLD',
    'Queensland': 'QLD',
    'NSW': 'NSW',
    'New South Wales': 'NSW',
    'Vic': 'VIC',
    'Victoria': 'VIC',
    'Tas': 'TAS',
    'Tasmania': 'TAS',
    'SA': 'SA',
    'South Australia': 'SA',
    'WA': 'WA',
    'Western Australia': 'WA',
    'NT': 'NT',
    'Northern Territory': 'NT',
    'ACT': 'ACT',
    'Australian Capital Territory': 'ACT'
  };
  return stateMap[state] || state;
}

(async () => {
  console.log('🔍 Finding duplicate locations to merge...\n');

  const { data: locations } = await supabase
    .from('locations')
    .select('*');

  // Find name-only locations (where city and state are null)
  const nameOnlyLocations = locations.filter(loc =>
    loc.name && !loc.city && !loc.state
  );

  console.log(`Found ${nameOnlyLocations.length} name-only locations\n`);

  const merges = [];

  for (const nameOnlyLoc of nameOnlyLocations) {
    const parsed = parseAustralianLocation(nameOnlyLoc.name);

    if (!parsed) {
      console.log(`⚠️  Could not parse: "${nameOnlyLoc.name}"`);
      continue;
    }

    // Find matching location with structured data
    const { data: matches } = await supabase
      .from('locations')
      .select('*')
      .eq('city', parsed.city)
      .eq('state', parsed.state)
      .eq('country', parsed.country)
      .neq('id', nameOnlyLoc.id);

    if (matches && matches.length > 0) {
      const targetLocation = matches[0];

      console.log(`📍 DUPLICATE FOUND:`);
      console.log(`   Old: "${nameOnlyLoc.name}" (id: ${nameOnlyLoc.id.substring(0, 8)}...)`);
      console.log(`   New: "${targetLocation.name}" (id: ${targetLocation.id.substring(0, 8)}...)`);
      console.log(`   Action: Migrate references → Delete old\n`);

      merges.push({
        oldId: nameOnlyLoc.id,
        oldName: nameOnlyLoc.name,
        newId: targetLocation.id,
        newName: targetLocation.name
      });
    }
  }

  if (merges.length === 0) {
    console.log('✅ No duplicate locations found!');
    return;
  }

  console.log(`\n📊 Ready to merge ${merges.length} duplicate locations\n`);
  console.log('⚠️  DRY RUN - No changes will be made yet');
  console.log('To apply these changes, set APPLY_CHANGES=true\n');

  const APPLY_CHANGES = process.env.APPLY_CHANGES === 'true';

  if (APPLY_CHANGES) {
    console.log('🚀 Applying merges...\n');

    for (const merge of merges) {
      console.log(`Merging "${merge.oldName}" → "${merge.newName}"...`);

      // Update profile_locations to point to new location
      const { data: profileLocs, error: plError } = await supabase
        .from('profile_locations')
        .update({ location_id: merge.newId })
        .eq('location_id', merge.oldId);

      if (plError) {
        console.error(`  ❌ Error updating profile_locations:`, plError.message);
        continue;
      }

      // Update stories
      const { error: storiesError } = await supabase
        .from('stories')
        .update({ location_id: merge.newId })
        .eq('location_id', merge.oldId);

      if (storiesError) {
        console.error(`  ❌ Error updating stories:`, storiesError.message);
      }

      // Update transcripts
      const { error: transcriptsError } = await supabase
        .from('transcripts')
        .update({ location_id: merge.newId })
        .eq('location_id', merge.oldId);

      if (transcriptsError) {
        console.error(`  ❌ Error updating transcripts:`, transcriptsError.message);
      }

      // Update profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({ location_id: merge.newId })
        .eq('location_id', merge.oldId);

      if (profilesError) {
        console.error(`  ❌ Error updating profiles:`, profilesError.message);
      }

      // Update organizations
      const { error: orgsError } = await supabase
        .from('organizations')
        .update({ location_id: merge.newId })
        .eq('location_id', merge.oldId);

      if (orgsError) {
        console.error(`  ❌ Error updating organizations:`, orgsError.message);
      }

      // Update projects
      const { error: projectsError } = await supabase
        .from('projects')
        .update({ location_id: merge.newId })
        .eq('location_id', merge.oldId);

      if (projectsError) {
        console.error(`  ❌ Error updating projects:`, projectsError.message);
      }

      // Delete old location
      const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .eq('id', merge.oldId);

      if (deleteError) {
        console.error(`  ❌ Error deleting old location:`, deleteError.message);
      } else {
        console.log(`  ✅ Merged successfully\n`);
      }
    }

    console.log('✅ All duplicates merged!');
  } else {
    console.log('📋 Preview of changes:\n');
    for (const merge of merges) {
      console.log(`-- Merge: "${merge.oldName}" → "${merge.newName}"`);
      console.log(`UPDATE profile_locations SET location_id = '${merge.newId}' WHERE location_id = '${merge.oldId}';`);
      console.log(`UPDATE stories SET location_id = '${merge.newId}' WHERE location_id = '${merge.oldId}';`);
      console.log(`UPDATE transcripts SET location_id = '${merge.newId}' WHERE location_id = '${merge.oldId}';`);
      console.log(`UPDATE profiles SET location_id = '${merge.newId}' WHERE location_id = '${merge.oldId}';`);
      console.log(`UPDATE organizations SET location_id = '${merge.newId}' WHERE location_id = '${merge.oldId}';`);
      console.log(`UPDATE projects SET location_id = '${merge.newId}' WHERE location_id = '${merge.oldId}';`);
      console.log(`DELETE FROM locations WHERE id = '${merge.oldId}';`);
      console.log('');
    }
  }
})();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parser for common Australian location formats
function parseAustralianLocation(nameString) {
  // Handle "Traditional Territory" special case
  if (nameString === 'Traditional Territory') {
    return {
      name: 'Traditional Territory',
      city: null,
      state: null,
      country: 'Indigenous Territory'
    };
  }

  // Parse formats like "City, STATE, Australia" or "City, State"
  const parts = nameString.split(',').map(p => p.trim());

  if (parts.length === 3) {
    // Format: "Hobart, TAS, Australia"
    const [city, state, country] = parts;
    return {
      name: city,
      city: city,
      state: normalizeStateAbbreviation(state),
      country: country
    };
  } else if (parts.length === 2) {
    // Format: "Mount Isa, Qld" or "Gladstone, Qld"
    const [city, state] = parts;
    return {
      name: city,
      city: city,
      state: normalizeStateAbbreviation(state),
      country: 'Australia'
    };
  }

  // Can't parse - return as-is
  return null;
}

// Normalize state abbreviations
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
  console.log('🔍 Finding locations that need normalization...\n');

  // Get all locations
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*');

  if (error) {
    console.error('Error fetching locations:', error);
    return;
  }

  // Find name-only locations (where city and state are null)
  const nameOnlyLocations = locations.filter(loc =>
    loc.name && !loc.city && !loc.state
  );

  console.log(`Found ${nameOnlyLocations.length} locations to normalize:\n`);

  const updates = [];

  for (const location of nameOnlyLocations) {
    const parsed = parseAustralianLocation(location.name);

    if (parsed) {
      console.log(`📍 ${location.name}`);
      console.log(`   → name: "${parsed.name}"`);
      console.log(`   → city: "${parsed.city}"`);
      console.log(`   → state: "${parsed.state}"`);
      console.log(`   → country: "${parsed.country}"`);
      console.log('');

      updates.push({
        id: location.id,
        ...parsed,
        updated_at: new Date().toISOString()
      });
    } else {
      console.log(`⚠️  Could not parse: "${location.name}"`);
      console.log('');
    }
  }

  if (updates.length === 0) {
    console.log('✅ No locations need normalization!');
    return;
  }

  console.log(`\n📊 Ready to update ${updates.length} locations`);
  console.log('\n⚠️  DRY RUN - No changes will be made yet');
  console.log('\nTo apply these changes, set APPLY_CHANGES=true in the script\n');

  // Safety check - require explicit confirmation
  const APPLY_CHANGES = process.env.APPLY_CHANGES === 'true';

  if (APPLY_CHANGES) {
    console.log('🚀 Applying changes...\n');

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('locations')
        .update({
          name: update.name,
          city: update.city,
          state: update.state,
          country: update.country,
          updated_at: update.updated_at
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Error updating ${update.name}:`, updateError);
      } else {
        console.log(`✅ Updated: ${update.name}`);
      }
    }

    console.log('\n✅ All locations normalized!');
  } else {
    console.log('📋 SQL Preview (for manual execution):');
    console.log('');
    updates.forEach(u => {
      console.log(`UPDATE locations SET`);
      console.log(`  name = '${u.name}',`);
      console.log(`  city = ${u.city ? `'${u.city}'` : 'NULL'},`);
      console.log(`  state = ${u.state ? `'${u.state}'` : 'NULL'},`);
      console.log(`  country = '${u.country}',`);
      console.log(`  updated_at = NOW()`);
      console.log(`WHERE id = '${u.id}';`);
      console.log('');
    });
  }
})();
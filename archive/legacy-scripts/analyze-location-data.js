const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  // Check current location data quality
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, city, state, country');

  console.log('Total locations:', locations.length);

  // Categorize by data completeness
  const complete = locations.filter(l => l.name && l.city && l.state && l.country);
  const nameOnly = locations.filter(l => l.name && !l.city && !l.state);
  const partial = locations.filter(l => l.name && (l.city || l.state) && !(l.city && l.state && l.country));

  console.log('\nData Quality:');
  console.log('- Complete (name, city, state, country):', complete.length);
  console.log('- Name only (no structured data):', nameOnly.length);
  console.log('- Partial (some structured data):', partial.length);

  console.log('\nSample complete locations:');
  complete.slice(0, 5).forEach(l => {
    console.log(`  - ${l.name} | ${l.city}, ${l.state}, ${l.country}`);
  });

  console.log('\nSample name-only locations:');
  nameOnly.slice(0, 10).forEach(l => {
    console.log(`  - "${l.name}" (country: ${l.country})`);
  });

  // Check profiles without locations
  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: profilesWithLocations } = await supabase
    .from('profile_locations')
    .select('profile_id', { count: 'exact', head: true });

  console.log('\nProfile Coverage:');
  console.log('- Total profiles:', totalProfiles);
  console.log('- Profiles with locations:', profilesWithLocations);
  console.log('- Profiles without locations:', totalProfiles - profilesWithLocations);
  console.log('- Coverage:', Math.round((profilesWithLocations / totalProfiles) * 100) + '%');
})();
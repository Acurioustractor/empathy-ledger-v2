const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 Extracting location data from profile bios...\n');

  // Get profiles WITHOUT locations
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .order('display_name');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }

  // Get profiles that already have locations
  const { data: existingLocs } = await supabase
    .from('profile_locations')
    .select('profile_id');

  const profilesWithLocs = new Set(existingLocs?.map(l => l.profile_id));

  const profilesWithoutLocs = allProfiles?.filter(p => !profilesWithLocs.has(p.id));

  console.log(`Total profiles: ${allProfiles?.length}`);
  console.log(`Profiles with locations: ${profilesWithLocs.size}`);
  console.log(`Profiles without locations: ${profilesWithoutLocs?.length}\n`);

  // Common Australian locations to search for
  const locationPatterns = [
    { name: 'Sydney', state: 'NSW' },
    { name: 'Melbourne', state: 'VIC' },
    { name: 'Brisbane', state: 'QLD' },
    { name: 'Perth', state: 'WA' },
    { name: 'Adelaide', state: 'SA' },
    { name: 'Hobart', state: 'TAS' },
    { name: 'Darwin', state: 'NT' },
    { name: 'Canberra', state: 'ACT' },
    { name: 'Katherine', state: 'NT' },
    { name: 'Alice Springs', state: 'NT' },
    { name: 'Palm Island', state: 'QLD' },
    { name: 'Tennant Creek', state: 'NT' },
    { name: 'Mount Isa', state: 'QLD' },
    { name: 'Newcastle', state: 'NSW' },
    { name: 'Wollongong', state: 'NSW' },
    { name: 'Geelong', state: 'VIC' },
    { name: 'Cairns', state: 'QLD' },
    { name: 'Townsville', state: 'QLD' },
    { name: 'Gladstone', state: 'QLD' }
  ];

  const matches = [];

  for (const profile of profilesWithoutLocs || []) {
    const bioText = profile.bio || '';

    if (!bioText) continue;

    for (const loc of locationPatterns) {
      // Case-insensitive search
      const regex = new RegExp(`\\b${loc.name}\\b`, 'i');
      if (regex.test(bioText)) {
        matches.push({
          profile_id: profile.id,
          profile_name: profile.display_name,
          location_name: loc.name,
          state: loc.state,
          matched_in: bioText.includes(loc.name) ? 'exact' : 'case_insensitive'
        });
        break; // Only count first match per profile
      }
    }
  }

  console.log(`✨ Found ${matches.length} profiles with extractable locations!\n`);

  if (matches.length > 0) {
    console.log('Matches by location:');
    const byLocation = {};
    matches.forEach(m => {
      if (!byLocation[m.location_name]) byLocation[m.location_name] = 0;
      byLocation[m.location_name]++;
    });

    Object.entries(byLocation)
      .sort((a, b) => b[1] - a[1])
      .forEach(([loc, count]) => {
        console.log(`  • ${loc}: ${count} profiles`);
      });

    console.log('\nSample matches:');
    matches.slice(0, 15).forEach(m => {
      console.log(`  - ${m.profile_name || 'No name'}: ${m.location_name}, ${m.state}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('💡 NEXT STEPS:\n');
    console.log('Run with APPLY_MIGRATION=true to automatically create profile_locations');
    console.log('entries for these profiles.\n');

    const APPLY_MIGRATION = process.env.APPLY_MIGRATION === 'true';

    if (APPLY_MIGRATION) {
      console.log('🚀 Applying migration...\n');

      let created = 0;
      let failed = 0;

      for (const match of matches) {
        // Find the location in the locations table
        const { data: location } = await supabase
          .from('locations')
          .select('id, name, state')
          .ilike('name', match.location_name)
          .eq('state', match.state)
          .maybeSingle();

        if (!location) {
          console.log(`  ⚠️  Location not found: ${match.location_name}, ${match.state}`);
          failed++;
          continue;
        }

        // Create profile_locations entry
        const { error } = await supabase
          .from('profile_locations')
          .insert({
            profile_id: match.profile_id,
            location_id: location.id,
            is_primary: true,
            location_type: 'mentioned_in_bio'
          });

        if (error) {
          console.log(`  ❌ Failed to link ${match.profile_name}: ${error.message}`);
          failed++;
        } else {
          console.log(`  ✅ ${match.profile_name} → ${location.name}, ${location.state}`);
          created++;
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log(`✅ Migration complete!`);
      console.log(`   Created: ${created}`);
      console.log(`   Failed: ${failed}`);
      console.log(`   Total: ${matches.length}`);
    }
  } else {
    console.log('No additional locations found in bio text.');
  }
})();
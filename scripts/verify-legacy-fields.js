const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 Verifying legacy fields usage...\n');

  const { count: total } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log(`Total profiles: ${total}\n`);

  // Check avatar_url
  const { count: withAvatarUrl } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('avatar_url', 'is', null);

  console.log(`avatar_url:`);
  console.log(`  Profiles using: ${withAvatarUrl} (${Math.round((withAvatarUrl / total) * 100)}%)`);
  console.log(`  Safe to drop: ${withAvatarUrl === 0 ? '✅ YES' : '⚠️  NO - data needs migration'}`);

  // Check legacy_location_id
  const { count: withLegacyLoc } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('legacy_location_id', 'is', null);

  console.log(`\nlegacy_location_id:`);
  console.log(`  Profiles using: ${withLegacyLoc} (${Math.round((withLegacyLoc / total) * 100)}%)`);
  console.log(`  Safe to drop: ${withLegacyLoc === 0 ? '✅ YES' : '⚠️  NO - data needs migration'}`);

  // Check legacy_organization_id
  const { count: withLegacyOrg } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('legacy_organization_id', 'is', null);

  console.log(`\nlegacy_organization_id:`);
  console.log(`  Profiles using: ${withLegacyOrg} (${Math.round((withLegacyOrg / total) * 100)}%)`);
  console.log(`  Safe to drop: ${withLegacyOrg === 0 ? '✅ YES' : '⚠️  NO - data needs migration'}`);

  // Check location_data (JSONB field)
  const { data: locDataSample } = await supabase
    .from('profiles')
    .select('location_data')
    .not('location_data', 'is', null)
    .limit(5);

  const locDataCount = locDataSample?.length || 0;

  console.log(`\nlocation_data (JSONB):`);
  console.log(`  Profiles using: ${locDataCount} (sample check)`);
  console.log(`  Safe to drop: ${locDataCount === 0 ? '✅ YES' : '⚠️  NO - review data first'}`);

  console.log(`\n${'='.repeat(60)}`);

  const canDrop = withAvatarUrl === 0 && withLegacyLoc === 0 && withLegacyOrg === 0 && locDataCount === 0;

  if (canDrop) {
    console.log('✅ ALL LEGACY FIELDS ARE SAFE TO DROP!\n');
    console.log('Fields to drop:');
    console.log('  • avatar_url');
    console.log('  • legacy_location_id');
    console.log('  • legacy_organization_id');
    console.log('  • location_data');
    console.log('\nReady to execute migration in Supabase SQL Editor.');
  } else {
    console.log('⚠️  Some fields still have data - review before dropping');
  }
})();
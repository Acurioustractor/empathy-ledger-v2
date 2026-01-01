#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupTargetedBios() {
  console.log('🧹 Starting targeted bio cleanup...\n');

  // Get profiles with problematic patterns
  const patterns = ['chars)', 'Klan', 'Erman', 'storyteller from Katherine'];
  let allProblematicProfiles = [];

  for (const pattern of patterns) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, bio')
      .ilike('bio', `%${pattern}%`);

    if (profiles?.length) {
      allProblematicProfiles.push(...profiles);
      console.log(`Found ${profiles.length} profiles with pattern "${pattern}"`);
    }
  }

  // Remove duplicates
  const uniqueProfiles = allProblematicProfiles.filter((profile, index, self) =>
    index === self.findIndex(p => p.id === profile.id)
  );

  console.log(`\nProcessing ${uniqueProfiles.length} unique profiles...\n`);

  for (const profile of uniqueProfiles) {
    console.log(`📝 Cleaning: ${profile.display_name}`);
    let updatedBio = profile.bio;

    // Track what changes we make
    const changes = [];

    // Remove character count patterns like '(54 chars)' or '(61 chars)'
    const charCountPattern = /\s*\(\d+\s*chars?\)\s*/g;
    if (charCountPattern.test(updatedBio)) {
      updatedBio = updatedBio.replace(charCountPattern, '');
      changes.push('Removed character counts');
    }

    // Fix specific problematic content
    if (updatedBio.includes('"Klan community elder')) {
      updatedBio = updatedBio.replace(/\"Klan community elder/g, '"Community elder');
      changes.push('Fixed "Klan" reference');
    }

    if (updatedBio.includes('Eldest Erman woman')) {
      updatedBio = updatedBio.replace(/Eldest Erman woman/g, 'Elder woman');
      changes.push('Fixed "Erman" reference');
    }

    // Replace generic "storyteller from Katherine" with more specific content
    if (updatedBio.includes('Storyteller from Katherine, sharing experiences through the Deadly Hearts project.')) {
      // Extract the SHORT_BIO content if it exists
      const shortBioMatch = updatedBio.match(/\[SHORT_BIO\]([^[]+)\[\/SHORT_BIO\]/);
      if (shortBioMatch) {
        // Replace the generic intro with the SHORT_BIO content
        const shortBioContent = shortBioMatch[1].replace(/^"|"$/g, '').trim();
        updatedBio = updatedBio.replace(
          'Storyteller from Katherine, sharing experiences through the Deadly Hearts project.',
          shortBioContent
        );
        changes.push('Replaced generic Katherine intro with unique content');
      }
    }

    // Clean up extra quotes and spaces
    updatedBio = updatedBio.replace(/\"\"/g, '"');
    updatedBio = updatedBio.replace(/\s+/g, ' ').trim();

    if (updatedBio !== profile.bio && changes.length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBio })
        .eq('id', profile.id);

      if (!error) {
        console.log(`   ✅ Updated: ${changes.join(', ')}`);
      } else {
        console.log(`   ❌ Error updating: ${error.message}`);
      }
    } else {
      console.log(`   ⏭️ No changes needed`);
    }
  }

  console.log('\n🎉 Bio cleanup complete!');
}

cleanupTargetedBios();
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeShortBioMarkers() {
  console.log('🧹 Removing [SHORT_BIO] markers and cleaning generic content...\n');

  // Get all profiles with SHORT_BIO markers
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .ilike('bio', '%[SHORT_BIO]%');

  console.log(`Found ${profiles?.length || 0} profiles with [SHORT_BIO] markers\n`);

  for (const profile of profiles || []) {
    console.log(`📝 Cleaning: ${profile.display_name}`);
    let updatedBio = profile.bio;
    const changes = [];

    // Extract SHORT_BIO content and use it as the main bio
    const shortBioMatch = updatedBio.match(/\[SHORT_BIO\]([^[]+)\[\/SHORT_BIO\]/);
    if (shortBioMatch) {
      const shortBioContent = shortBioMatch[1].replace(/^"|"$/g, '').trim();

      // Remove the entire bio and replace with just the SHORT_BIO content
      updatedBio = shortBioContent;
      changes.push('Replaced entire bio with SHORT_BIO content');
    }

    // Remove any remaining markers
    updatedBio = updatedBio.replace(/\[SHORT_BIO\].*?\[\/SHORT_BIO\]/g, '');
    updatedBio = updatedBio.replace(/\[\/SHORT_BIO\]/g, '');

    // Remove generic patterns
    const genericPatterns = [
      /is a respected Elder and storyteller from Katherine, Northern Territory\./g,
      /Through the Deadly Hearts project, she shares/g,
      /Through the Deadly Hearts project, he shares/g,
      /Her stories carry the strength of her ancestors and the hope for future generations, always honoring her cultural roots and connection to the land\./g,
      /His stories carry the strength of his ancestors and the hope for future generations, always honoring his cultural roots and connection to the land\./g,
      /storyteller from Katherine, Northern Territory/g,
      /shares experiences through the Deadly Hearts project/g,
      /Storyteller from Katherine, sharing experiences/g,
      /\s*Through the Deadly Hearts project[^.]*\./g,
      /\s*Her stories carry[^.]*\./g,
      /\s*His stories carry[^.]*\./g
    ];

    for (const pattern of genericPatterns) {
      if (pattern.test(updatedBio)) {
        updatedBio = updatedBio.replace(pattern, '');
        if (!changes.includes('Removed generic content')) {
          changes.push('Removed generic content');
        }
      }
    }

    // Clean up extra spaces, newlines, and punctuation
    updatedBio = updatedBio
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .replace(/^\s*\.\s*/, '')
      .replace(/\s*\.\s*$/, '.')
      .trim();

    // Ensure it ends with a period if it doesn't already
    if (updatedBio && !updatedBio.endsWith('.') && !updatedBio.endsWith('!') && !updatedBio.endsWith('?')) {
      updatedBio += '.';
    }

    if (updatedBio !== profile.bio && changes.length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBio })
        .eq('id', profile.id);

      if (!error) {
        console.log(`   ✅ ${changes.join(', ')}`);
        console.log(`   📄 New bio: "${updatedBio}"`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    } else {
      console.log(`   ⏭️ No changes needed`);
    }
    console.log('');
  }

  console.log('🎉 Cleanup complete!');
}

removeShortBioMarkers();

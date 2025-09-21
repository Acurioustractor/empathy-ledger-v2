#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupBios() {
  // Get profiles with character counts or problematic content
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .or('bio.like.*chars)*,bio.like.*Klan*,bio.like.*Erman*');

  console.log('Found', profiles?.length || 0, 'profiles to clean up');

  for (const profile of profiles || []) {
    let updatedBio = profile.bio;

    // Remove character count patterns like '(54 chars)' or '(61 chars)'
    updatedBio = updatedBio.replace(/\s*\(\d+\s*chars?\)\s*/g, '');

    // Fix specific problematic content
    updatedBio = updatedBio.replace(/"Klan community elder/g, '"Community elder');
    updatedBio = updatedBio.replace(/Eldest Erman woman/g, 'Elder woman');

    // Clean up extra quotes and spaces
    updatedBio = updatedBio.replace(/""/g, '"');
    updatedBio = updatedBio.replace(/\s+/g, ' ').trim();

    if (updatedBio !== profile.bio) {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updatedBio })
        .eq('id', profile.id);

      if (!error) {
        console.log('Cleaned up:', profile.display_name);
      } else {
        console.log('Error updating:', profile.display_name, error.message);
      }
    }
  }

  console.log('Bio cleanup complete');
}

cleanupBios();
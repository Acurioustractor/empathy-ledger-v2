const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

async function populateOrganizationSlugs() {
  console.log('=== POPULATING ORGANIZATION SLUGS ===');
  console.log('');

  // Get organizations without slugs
  const { data: orgsWithoutSlugs } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .is('slug', null);

  console.log('Organizations without slugs: ' + (orgsWithoutSlugs?.length || 0));

  if (orgsWithoutSlugs && orgsWithoutSlugs.length > 0) {
    for (const org of orgsWithoutSlugs) {
      const suggestedSlug = createSlug(org.name);
      console.log('  • ' + org.name + ' → ' + suggestedSlug);

      // Check if slug already exists
      const { data: existingSlug } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', suggestedSlug)
        .single();

      let finalSlug = suggestedSlug;
      if (existingSlug) {
        // Add number to make unique
        let counter = 2;
        while (true) {
          const testSlug = suggestedSlug + '-' + counter;
          const { data: testExisting } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', testSlug)
            .single();
          if (!testExisting) {
            finalSlug = testSlug;
            break;
          }
          counter++;
        }
        console.log('    Slug exists, using: ' + finalSlug);
      }

      // Update organization with slug
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ slug: finalSlug })
        .eq('id', org.id);

      if (updateError) {
        console.log('    ❌ Error updating ' + org.name + ': ' + updateError.message);
      } else {
        console.log('    ✅ Updated ' + org.name + ' with slug: ' + finalSlug);
      }
    }
  }

  console.log('');
  console.log('✅ Slug population complete');
}

populateOrganizationSlugs().catch(console.error);
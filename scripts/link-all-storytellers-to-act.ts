/**
 * Link All Storytellers to ACT
 *
 * Links all unlinked storytellers to ACT organization
 * and fixes orphan stories.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';
const ACT_TENANT_ID = '5f1314c1-ffe9-4d8f-944b-6cdf02d4b943';

async function linkAllToACT() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔗 LINKING ALL STORYTELLERS TO ACT');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get all storytellers
  const { data: allStorytellers } = await supabase
    .from('storytellers')
    .select('id, display_name');

  // Get existing links to ACT
  const { data: existingLinks } = await supabase
    .from('storyteller_organizations')
    .select('storyteller_id')
    .eq('organization_id', ACT_ORG_ID);

  const linkedIds = new Set(existingLinks?.map(l => l.storyteller_id) || []);
  const unlinked = allStorytellers?.filter(s => !linkedIds.has(s.id)) || [];

  console.log('Total storytellers:', allStorytellers?.length || 0);
  console.log('Already linked to ACT:', linkedIds.size);
  console.log('Need to link:', unlinked.length);

  if (unlinked.length > 0) {
    // Create links for unlinked storytellers
    const newLinks = unlinked.map(s => ({
      storyteller_id: s.id,
      organization_id: ACT_ORG_ID,
      tenant_id: ACT_TENANT_ID,
      relationship_type: 'member',
      is_active: true
    }));

    const { error } = await supabase
      .from('storyteller_organizations')
      .insert(newLinks);

    if (error) {
      console.log('\nError linking storytellers:', error.message);
    } else {
      console.log('\n✓ Linked', unlinked.length, 'storytellers to ACT');
    }
  }

  // Fix orphan stories (have storyteller but no org)
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('📝 FIXING ORPHAN STORIES');
  console.log('───────────────────────────────────────────────────────────\n');

  const { data: orphanStories } = await supabase
    .from('stories')
    .select('id, title')
    .not('storyteller_id', 'is', null)
    .is('organization_id', null);

  if (orphanStories && orphanStories.length > 0) {
    const { error: storyError } = await supabase
      .from('stories')
      .update({ organization_id: ACT_ORG_ID })
      .not('storyteller_id', 'is', null)
      .is('organization_id', null);

    if (storyError) {
      console.log('Error fixing stories:', storyError.message);
    } else {
      console.log('✓ Updated', orphanStories.length, 'stories to ACT org:');
      orphanStories.forEach(s => console.log('  -', s.title));
    }
  } else {
    console.log('No orphan stories to fix');
  }

  // Final count
  const { count: finalCount } = await supabase
    .from('storyteller_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ACT_ORG_ID);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✓ ACT now has', finalCount, 'storytellers linked');
  console.log('═══════════════════════════════════════════════════════════');
}

linkAllToACT().catch(console.error);

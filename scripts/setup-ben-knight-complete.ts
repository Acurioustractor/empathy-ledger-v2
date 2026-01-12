import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'sb_secret_3UiSfzbq-ZMQNshQ27x-Ow_Mk27_642'
);

async function setupBenKnight() {
  console.log('='.repeat(70));
  console.log('  SETTING UP BEN KNIGHT - COMPLETE STORYTELLER PROFILE');
  console.log('='.repeat(70));

  // 1. Find existing Ben Knight profile
  console.log('\n1. Finding existing Ben Knight profile...');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'benjamin@act.place');

  if (!profiles || profiles.length === 0) {
    console.log('   No profile found with benjamin@act.place - checking other variations...');
    const { data: altProfiles } = await supabase
      .from('profiles')
      .select('*')
      .or('email.ilike.%benjamin%,full_name.ilike.%Ben Knight%');

    console.log('   Found alternatives:', altProfiles?.map((p) => `${p.full_name} (${p.email})`));
    return;
  }

  const profile = profiles[0];
  console.log(`   Found profile: ${profile.full_name} (${profile.id})`);

  // 2. Check if storyteller record exists for this profile
  console.log('\n2. Checking for existing storyteller record...');
  const { data: existingStoryteller } = await supabase
    .from('storytellers')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  let storytellerId: string;

  if (existingStoryteller) {
    console.log(`   Found existing storyteller: ${existingStoryteller.display_name} (${existingStoryteller.id})`);
    storytellerId = existingStoryteller.id;

    // Update it with complete info
    console.log('   Updating with complete information...');
    const { error: updateError } = await supabase
      .from('storytellers')
      .update({
        display_name: 'Ben Knight',
        email: 'benjamin@act.place',
        bio: `Founder and lead developer of Empathy Ledger - a platform for amplifying human connection and preserving stories that matter.

Creator of A Curious Tractor and co-architect of the Centre of Excellence for Indigenous Storytelling. Working at the intersection of technology, storytelling, and social impact.

Building tools for communities to maintain data sovereignty while sharing their wisdom with the world. Passionate about making storytelling accessible to everyone - from elders preserving traditional knowledge to everyday people documenting their memories.

Vision: A universal story app where anyone can hold their memories, tell stories, pass things on, truth tell, and share photos and moments with others.`,
        location: 'Brisbane, QLD',
        is_active: true,
        is_featured: true,
        is_elder: false,
        cultural_background: ['Non-Indigenous Ally', 'Technology & Social Impact', 'Community Builder'],
        avatar_url: profile.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storytellerId);

    if (updateError) {
      console.log('   Update error:', updateError.message);
    } else {
      console.log('   Successfully updated storyteller profile!');
    }
  } else {
    // Create new storyteller linked to profile
    console.log('   Creating new storyteller record linked to profile...');
    const { data: newStoryteller, error: createError } = await supabase
      .from('storytellers')
      .insert({
        profile_id: profile.id,
        display_name: 'Ben Knight',
        email: 'benjamin@act.place',
        bio: `Founder and lead developer of Empathy Ledger - a platform for amplifying human connection and preserving stories that matter.

Creator of A Curious Tractor and co-architect of the Centre of Excellence for Indigenous Storytelling. Working at the intersection of technology, storytelling, and social impact.

Building tools for communities to maintain data sovereignty while sharing their wisdom with the world. Passionate about making storytelling accessible to everyone - from elders preserving traditional knowledge to everyday people documenting their memories.

Vision: A universal story app where anyone can hold their memories, tell stories, pass things on, truth tell, and share photos and moments with others.`,
        location: 'Brisbane, QLD',
        is_active: true,
        is_featured: true,
        is_elder: false,
        cultural_background: ['Non-Indigenous Ally', 'Technology & Social Impact', 'Community Builder'],
        avatar_url: profile.avatar_url || null,
      })
      .select()
      .single();

    if (createError) {
      console.log('   Create error:', createError.message);
      return;
    }

    storytellerId = newStoryteller.id;
    console.log(`   Created storyteller: ${newStoryteller.id}`);
  }

  // 3. Update profile to mark as storyteller
  console.log('\n3. Updating profile to mark as storyteller...');
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      is_storyteller: true,
      is_featured: true,
      bio: `Founder and lead developer of Empathy Ledger. Working at the intersection of technology, storytelling, and social impact.`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (profileError) {
    console.log('   Profile update error:', profileError.message);
  } else {
    console.log('   Profile marked as storyteller!');
  }

  // 4. Get Ben's story count
  console.log('\n4. Getting story count...');
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('storyteller_id', storytellerId);

  console.log(`   Current stories: ${storyCount || 0}`);

  // 5. Show final state
  console.log('\n5. Final storyteller state:');
  const { data: finalStoryteller } = await supabase
    .from('storytellers')
    .select('*')
    .eq('id', storytellerId)
    .single();

  if (finalStoryteller) {
    console.log(`   ID: ${finalStoryteller.id}`);
    console.log(`   Display Name: ${finalStoryteller.display_name}`);
    console.log(`   Email: ${finalStoryteller.email}`);
    console.log(`   Location: ${finalStoryteller.location}`);
    console.log(`   Featured: ${finalStoryteller.is_featured}`);
    console.log(`   Active: ${finalStoryteller.is_active}`);
    console.log(`   Bio: ${finalStoryteller.bio?.substring(0, 100)}...`);
  }

  // 6. Clean up duplicate Ben Knight entries (keeping only the one with profile_id)
  console.log('\n6. Cleaning up duplicate entries...');
  const { data: duplicates } = await supabase
    .from('storytellers')
    .select('id, display_name, profile_id')
    .or('display_name.ilike.%Ben Knight%,display_name.ilike.%Benjamin Knight%');

  const toDelete = duplicates?.filter((d) => d.id !== storytellerId && !d.profile_id);
  if (toDelete && toDelete.length > 0) {
    console.log(`   Found ${toDelete.length} orphan duplicates to clean up`);
    for (const dup of toDelete) {
      // Check if they have any stories first
      const { count: dupStoryCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('storyteller_id', dup.id);

      if (dupStoryCount && dupStoryCount > 0) {
        console.log(`   Skipping ${dup.display_name} - has ${dupStoryCount} stories`);
      } else {
        console.log(`   Removing orphan: ${dup.display_name} (${dup.id})`);
        await supabase.from('storytellers').delete().eq('id', dup.id);
      }
    }
  } else {
    console.log('   No orphan duplicates found');
  }

  console.log('\n' + '='.repeat(70));
  console.log('  BEN KNIGHT SETUP COMPLETE!');
  console.log(`  Storyteller ID: ${storytellerId}`);
  console.log('='.repeat(70));
}

setupBenKnight().catch(console.error);

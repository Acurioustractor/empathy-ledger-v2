import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'sb_secret_3UiSfzbq-ZMQNshQ27x-Ow_Mk27_642'
);

async function addBenKnight() {
  console.log('='.repeat(70));
  console.log('  ADDING BEN KNIGHT AS STORYTELLER - EMPATHY LEDGER');
  console.log('='.repeat(70));

  // First check if Ben already exists
  console.log('\n1. Checking existing storytellers...');
  const { data: existingStorytellers, error: checkError } = await supabase
    .from('storytellers')
    .select('*')
    .or('email.ilike.%benjamin%,email.ilike.%ben%,display_name.ilike.%Ben Knight%');

  if (checkError) {
    console.log('Error checking:', checkError.message);
  } else {
    console.log(`   Found ${existingStorytellers?.length || 0} potential matches`);
    existingStorytellers?.forEach((s) => {
      console.log(`   - ${s.display_name} (${s.email}) [${s.id}]`);
    });
  }

  // Check if profile already exists
  console.log('\n2. Checking profiles...');
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_storyteller')
    .or('email.ilike.%benjamin%,email.ilike.%ben%,full_name.ilike.%Ben Knight%');

  console.log(`   Found ${existingProfiles?.length || 0} profile matches`);
  existingProfiles?.forEach((p) => {
    console.log(`   - ${p.full_name} (${p.email}) [is_storyteller: ${p.is_storyteller}]`);
  });

  // Create Ben Knight storyteller
  console.log('\n3. Creating Ben Knight as storyteller...');

  const benKnightData = {
    display_name: 'Ben Knight',
    email: 'benjamin@act.place',
    bio: `Founder and lead developer of Empathy Ledger. Passionate about using technology to amplify human connection and preserve stories that matter. Building tools for Indigenous communities to maintain data sovereignty while sharing their wisdom with the world.

Creator of A Curious Tractor and co-architect of the Centre of Excellence for Indigenous Storytelling. Believes that every person has stories worth preserving and sharing.

Working at the intersection of technology, storytelling, and social impact - helping communities tell their stories their way.`,
    cultural_background: ['Non-Indigenous Ally', 'Technology & Social Impact'],
    location: 'Brisbane, QLD',
    is_active: true,
    is_featured: true,
    is_elder: false,
  };

  // Check if already exists
  const { data: existingBen } = await supabase
    .from('storytellers')
    .select('id')
    .eq('email', 'benjamin@act.place')
    .single();

  if (existingBen) {
    console.log('   Ben Knight already exists as storyteller!');
    console.log(`   ID: ${existingBen.id}`);

    // Update the existing record
    console.log('   Updating existing record...');
    const { data: updated, error: updateError } = await supabase
      .from('storytellers')
      .update(benKnightData)
      .eq('id', existingBen.id)
      .select()
      .single();

    if (updateError) {
      console.log('   Update error:', updateError.message);
    } else {
      console.log('   Successfully updated Ben Knight!');
      console.log('   Data:', JSON.stringify(updated, null, 2));
    }
  } else {
    // Create new
    const { data: newStoryteller, error: createError } = await supabase
      .from('storytellers')
      .insert(benKnightData)
      .select()
      .single();

    if (createError) {
      console.log('   Create error:', createError.message);
    } else {
      console.log('   Successfully created Ben Knight as storyteller!');
      console.log('   ID:', newStoryteller.id);
      console.log('   Data:', JSON.stringify(newStoryteller, null, 2));
    }
  }

  // Get final count
  console.log('\n4. Final storyteller count...');
  const { count } = await supabase.from('storytellers').select('*', { count: 'exact', head: true });
  console.log(`   Total storytellers in database: ${count}`);

  // Show all storytellers
  console.log('\n5. All storytellers:');
  const { data: allStorytellers } = await supabase
    .from('storytellers')
    .select('id, display_name, email, is_featured, is_active')
    .order('display_name');

  allStorytellers?.forEach((s, i) => {
    const featured = s.is_featured ? ' (Featured)' : '';
    const active = s.is_active ? 'Active' : 'Inactive';
    console.log(`   ${i + 1}. ${s.display_name} - ${s.email} [${active}]${featured}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('  DONE!');
  console.log('='.repeat(70));
}

addBenKnight().catch(console.error);

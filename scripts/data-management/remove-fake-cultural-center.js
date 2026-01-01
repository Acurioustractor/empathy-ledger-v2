const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function removeFakeCulturalHealingCenter() {
  console.log('=== REMOVING FAKE CULTURAL HEALING CENTER ===');
  console.log('');

  // Find the Cultural Healing Center organization
  const { data: culturalCenter } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', '%cultural%healing%center%')
    .single();

  if (!culturalCenter) {
    console.log('Cultural Healing Center organization not found');
    return;
  }

  console.log('Found fake organization:', culturalCenter.name);
  console.log('ID:', culturalCenter.id);
  console.log('');

  // Check for any related data that needs cleanup
  console.log('CHECKING FOR RELATED DATA:');

  const { count: memberCount } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', culturalCenter.id);

  console.log('Members:', memberCount || 0);

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', culturalCenter.id);

  console.log('Projects:', projectCount || 0);

  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', culturalCenter.id);

  console.log('Stories:', storyCount || 0);

  console.log('');

  // Remove related data first
  if (memberCount > 0) {
    console.log('Removing member associations...');
    const { error: memberError } = await supabase
      .from('profile_organizations')
      .delete()
      .eq('organization_id', culturalCenter.id);

    if (memberError) {
      console.log('❌ Error removing members:', memberError.message);
    } else {
      console.log('✅ Removed', memberCount, 'member associations');
    }
  }

  if (projectCount > 0) {
    console.log('Removing projects...');
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('organization_id', culturalCenter.id);

    if (projectError) {
      console.log('❌ Error removing projects:', projectError.message);
    } else {
      console.log('✅ Removed', projectCount, 'projects');
    }
  }

  if (storyCount > 0) {
    console.log('Removing stories...');
    const { error: storyError } = await supabase
      .from('stories')
      .delete()
      .eq('organization_id', culturalCenter.id);

    if (storyError) {
      console.log('❌ Error removing stories:', storyError.message);
    } else {
      console.log('✅ Removed', storyCount, 'stories');
    }
  }

  // Remove the organization itself
  console.log('Removing organization...');
  const { error: orgError } = await supabase
    .from('organizations')
    .delete()
    .eq('id', culturalCenter.id);

  if (orgError) {
    console.log('❌ Error removing organization:', orgError.message);
  } else {
    console.log('✅ Successfully removed Cultural Healing Center organization');
  }

  console.log('');
  console.log('🎉 CLEANUP COMPLETE!');
}

removeFakeCulturalHealingCenter().catch(console.error);
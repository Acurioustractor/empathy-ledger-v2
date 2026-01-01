require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupSampleOrganisation() {
  console.log('Setting up sample organisation...');

  // Create an organisation
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: 'Empathy Ledger Foundation',
      description: 'Supporting Indigenous storytellers globally through digital preservation and impact measurement',
      type: 'nonprofit',
      email: 'contact@empathyledger.org',
      website: 'https://empathyledger.org',
      location: 'Australia',
      status: 'active',
      is_verified: true,
      verification_date: new Date().toISOString(),
      settings: {
        features: {
          storytelling: true,
          analytics: true,
          media_library: true,
          impact_tracking: true
        }
      }
    })
    .select()
    .single();

  if (orgError) {
    console.error('Error creating organisation:', orgError);
    return;
  }

  console.log('✅ Created organisation:', org.name);

  // Link existing projects to the organisation
  const projectsToLink = [
    'Deadly Hearts Trek',
    'Orange Sky Community Services'
  ];

  for (const projectName of projectsToLink) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('name', projectName)
      .single();

    if (project) {
      await supabase
        .from('projects')
        .update({ organization_id: org.id })
        .eq('id', project.id);

      console.log(`✅ Linked project: ${projectName}`);
    }
  }

  // Create another sample organisation
  const { data: org2 } = await supabase
    .from('organizations')
    .insert({
      name: 'Indigenous Digital Stories',
      description: 'Preserving and sharing Indigenous narratives through technology',
      type: 'community',
      email: 'info@indigenousdigital.org',
      location: 'Global',
      status: 'active',
      is_verified: false
    })
    .select()
    .single();

  if (org2) {
    console.log('✅ Created organisation:', org2.name);
  }

  console.log('\n🎯 Sample organisations created successfully!');
  console.log('You can now:');
  console.log('1. View organisations at /admin/organisations');
  console.log('2. Manage projects at /admin/projects');
  console.log('3. Assign storytellers to projects');
  console.log('4. Track impact and analytics');
}

setupSampleOrganisation();
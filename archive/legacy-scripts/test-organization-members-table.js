const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function testOrganizationMembers() {
  const orgId = 'c53077e1-98de-4216-9149-6268891ff62e'; // Oonchiumpa

  // Check if organization_members table exists
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId);

  if (membersError) {
    console.log('❌ organization_members table error:', membersError.message);
    console.log('This table might not exist in the database.\n');
  } else {
    console.log('✅ organization_members table exists');
    console.log(`Found ${members.length} members for Oonchiumpa:`);
    members.forEach(m => {
      console.log(`  - Profile: ${m.profile_id}, Role: ${m.role}, Active: ${m.is_active}`);
    });
    console.log('');
  }

  // Check profile_organizations table
  const { data: profileOrgs, error: profileOrgsError } = await supabase
    .from('profile_organizations')
    .select('*')
    .eq('organization_id', orgId);

  if (profileOrgsError) {
    console.log('❌ profile_organizations table error:', profileOrgsError.message);
    console.log('This table might not exist in the database.\n');
  } else {
    console.log('✅ profile_organizations table exists');
    console.log(`Found ${profileOrgs.length} profile_organization entries for Oonchiumpa:`);
    profileOrgs.forEach(po => {
      console.log(`  - Profile: ${po.profile_id}, Role: ${po.role}, Active: ${po.is_active}`);
    });
  }
}

testOrganizationMembers();

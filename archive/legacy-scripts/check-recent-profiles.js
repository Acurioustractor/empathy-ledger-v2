const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('🔍 Checking recently created profiles for Oonchiumpa...\n');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, created_at, tenant_id, is_storyteller, tenant_roles')
    .eq('tenant_id', '8891e1a9-92ae-423f-928b-cec602660011') // Oonchiumpa tenant
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`Found ${profiles.length} profiles:\n`);

  profiles.forEach((p, i) => {
    console.log(`${i + 1}. ${p.display_name || p.full_name}`);
    console.log(`   Created: ${new Date(p.created_at).toLocaleString()}`);
    console.log(`   Is Storyteller: ${p.is_storyteller}`);
    console.log(`   Roles: ${p.tenant_roles?.join(', ') || 'none'}`);
    console.log('');
  });
}

check();

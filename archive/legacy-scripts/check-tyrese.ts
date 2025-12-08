import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkTyrese() {
  const supabase = createServiceRoleClient()

  // 1. Check for Mounty Yarns organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .ilike('name', '%mounty%')
    .single()

  console.log('📍 Mounty Yarns:', org)

  // 2. Check for Tyrese in profiles (most recent)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, tenant_id, created_at')
    .ilike('full_name', '%tyrese%')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('\n👤 Tyrese profiles:', profiles)

  // 3. Check most recent transcript
  if (org) {
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('id, title, storyteller_id, created_at, organization_id')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(3)

    console.log('\n📝 Recent transcripts for Mounty Yarns:', transcripts)
  }

  // 4. Check most recent story
  if (org) {
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, created_at, organization_id')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(3)

    console.log('\n📖 Recent stories for Mounty Yarns:', stories)
  }

  // 5. Check server logs for the Quick Add POST request
  console.log('\n💡 Check the server logs for POST /api/admin/quick-add to see the error')
}

checkTyrese().catch(console.error)

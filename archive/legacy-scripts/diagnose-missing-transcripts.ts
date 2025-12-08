import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function diagnoseMissingTranscripts() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'
  const organizationId = 'c53077e1-98de-4216-9149-6268891ff62e'

  console.log('🔍 Diagnosing Missing Transcripts\n')
  console.log('='.repeat(60))

  // 1. Get the organization and its tenant_id
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .eq('id', organizationId)
    .single()

  console.log('\n📊 Organization Info:')
  console.log(`  Name: ${org?.name}`)
  console.log(`  Tenant ID: ${org?.tenant_id}`)

  // 2. Get ALL transcripts for this project
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, organization_id, tenant_id, word_count, character_count')
    .eq('project_id', projectId)
    .order('word_count', { ascending: false, nullsFirst: false })

  console.log('\n\n📋 ALL Project Transcripts:')
  console.log('='.repeat(60))
  console.log(`Total: ${allTranscripts?.length || 0}\n`)

  const withContent = allTranscripts?.filter(t => t.word_count && t.word_count > 0) || []
  const withoutContent = allTranscripts?.filter(t => !t.word_count || t.word_count === 0) || []

  console.log(`✅ With content: ${withContent.length}`)
  console.log(`❌ Without content: ${withoutContent.length}\n`)

  // 3. Check extracted transcripts specifically
  console.log('\n📄 Extracted Document Transcripts:')
  console.log('='.repeat(60))
  withContent.forEach(t => {
    console.log(`\n- ${t.title}`)
    console.log(`  Words: ${t.word_count?.toLocaleString()}`)
    console.log(`  Storyteller ID: ${t.storyteller_id || 'NULL ❌'}`)
    console.log(`  Organization ID: ${t.organization_id || 'NULL ❌'}`)
    console.log(`  Tenant ID: ${t.tenant_id || 'NULL ❌'}`)
  })

  // 4. Get storytellers in the organization
  const { data: storytellers } = await supabase
    .from('profiles')
    .select('id, full_name, email, tenant_id, tenant_roles')
    .eq('tenant_id', org?.tenant_id)

  console.log('\n\n👥 Storytellers in Organization:')
  console.log('='.repeat(60))
  console.log(`Total profiles in tenant: ${storytellers?.length || 0}\n`)

  const withStorytellerRole = storytellers?.filter(s =>
    s.tenant_roles && Array.isArray(s.tenant_roles) && s.tenant_roles.includes('storyteller')
  ) || []

  console.log(`With 'storyteller' role: ${withStorytellerRole.length}`)

  withStorytellerRole.forEach(s => {
    console.log(`\n- ${s.full_name || s.email}`)
    console.log(`  ID: ${s.id}`)
    console.log(`  Roles: ${JSON.stringify(s.tenant_roles)}`)
  })

  // 5. Check which transcripts would be returned by current API logic
  const storytellerIds = withStorytellerRole.map(s => s.id)

  const { data: linkedTranscripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, word_count')
    .eq('project_id', projectId)
    .in('storyteller_id', storytellerIds.length > 0 ? storytellerIds : ['00000000-0000-0000-0000-000000000000'])

  console.log('\n\n🔗 Transcripts Linked via storyteller_id:')
  console.log('='.repeat(60))
  console.log(`Total: ${linkedTranscripts?.length || 0}\n`)
  linkedTranscripts?.forEach(t => {
    console.log(`- ${t.title} (${t.word_count || 0} words)`)
  })

  // 6. Identify the gap
  console.log('\n\n⚠️  MISSING TRANSCRIPTS:')
  console.log('='.repeat(60))
  const linkedIds = new Set(linkedTranscripts?.map(t => t.id) || [])
  const missing = withContent.filter(t => !linkedIds.has(t.id))

  console.log(`${missing.length} transcripts with content NOT shown in organization view:\n`)
  missing.forEach(t => {
    console.log(`- ${t.title}`)
    console.log(`  ${t.word_count?.toLocaleString()} words`)
    console.log(`  Missing: ${!t.storyteller_id ? 'storyteller_id' : 'storyteller lacks role'}`)
    console.log()
  })

  // 7. Recommend fix
  console.log('\n\n💡 RECOMMENDED FIX:')
  console.log('='.repeat(60))
  if (missing.length > 0) {
    console.log('\nOption 1: Set storyteller_id for these transcripts')
    console.log('Option 2: Add organization_id filtering to API')
    console.log('Option 3: Set tenant_id for these transcripts\n')
  }
}

diagnoseMissingTranscripts().catch(console.error)

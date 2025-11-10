import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function debugStorytellerLinks() {
  console.log('🔍 Debugging Oonchiumpa Storyteller Links\n')

  const supabase = createServiceRoleClient()

  // Get Oonchiumpa organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .ilike('name', '%oonchiumpa%')
    .single()

  if (!org) {
    console.error('❌ Organization not found')
    return
  }

  // Get a sample of transcripts with their storyteller_id
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, organization_id')
    .eq('organization_id', org.id)
    .limit(5)

  console.log('📝 Sample Transcripts:')
  for (const transcript of transcripts || []) {
    console.log(`\n   Transcript: ${transcript.title}`)
    console.log(`   ID: ${transcript.id}`)
    console.log(`   Storyteller ID: ${transcript.storyteller_id || 'NULL'}`)

    if (transcript.storyteller_id) {
      // Try to find this storyteller
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('id, full_name, email, tenant_id, is_storyteller')
        .eq('id', transcript.storyteller_id)
        .single()

      if (storyteller) {
        console.log(`   ✅ Storyteller FOUND: ${storyteller.full_name}`)
        console.log(`      Tenant ID: ${storyteller.tenant_id}`)
        console.log(`      Is Storyteller: ${storyteller.is_storyteller}`)
      } else {
        console.log(`   ❌ Storyteller NOT FOUND for ID: ${transcript.storyteller_id}`)
      }
    } else {
      console.log(`   ⚠️  No storyteller_id assigned`)
    }
  }

  // Check stories
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, storyteller_id, author_id, organization_id, project_id')
    .eq('organization_id', org.id)
    .limit(5)

  console.log('\n\n📖 Sample Stories:')
  for (const story of stories || []) {
    console.log(`\n   Story: ${story.title}`)
    console.log(`   ID: ${story.id}`)
    console.log(`   Storyteller ID: ${story.storyteller_id || 'NULL'}`)
    console.log(`   Author ID: ${story.author_id || 'NULL'}`)
    console.log(`   Project ID: ${story.project_id || 'NULL'}`)

    if (story.storyteller_id) {
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('id, full_name, email, tenant_id')
        .eq('id', story.storyteller_id)
        .single()

      if (storyteller) {
        console.log(`   ✅ Storyteller FOUND: ${storyteller.full_name}`)
      } else {
        console.log(`   ❌ Storyteller NOT FOUND for ID: ${story.storyteller_id}`)
      }
    }
  }

  // Check the storytellers table to see what IDs exist
  console.log('\n\n👥 All Storytellers in Organization:')
  const { data: allStorytellers } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_storyteller')
    .eq('tenant_id', org.tenant_id)

  allStorytellers?.forEach(s => {
    console.log(`   - ${s.full_name || 'No Name'}`)
    console.log(`     ID: ${s.id}`)
    console.log(`     Is Storyteller: ${s.is_storyteller}`)
  })
}

debugStorytellerLinks().catch(console.error)

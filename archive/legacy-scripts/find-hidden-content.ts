import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function findHiddenContent() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('🔍 Searching for hidden content in ALL fields...\n')

  // Get ONE empty transcript with ALL fields
  const { data: sample } = await supabase
    .from('transcripts')
    .select('*')
    .eq('project_id', projectId)
    .eq('title', 'NIAA Strat')
    .single()

  if (!sample) {
    console.log('No transcript found')
    return
  }

  console.log('Checking EVERY field for content:\n')

  // Check every field
  Object.entries(sample).forEach(([key, value]) => {
    // Skip known empty fields
    if (value === null || value === undefined || value === '') {
      return
    }

    // Check if it's a string with content
    if (typeof value === 'string' && value.trim().length > 0) {
      console.log(`✓ ${key}: ${value.length} chars`)
      if (value.length > 50) {
        console.log(`  Preview: "${value.substring(0, 100)}..."`)
      } else {
        console.log(`  Content: "${value}"`)
      }
      console.log()
    }

    // Check if it's an object/JSON
    if (typeof value === 'object' && value !== null) {
      const jsonStr = JSON.stringify(value)
      if (jsonStr.length > 2) { // More than just {}
        console.log(`✓ ${key}: JSON object`)
        console.log(`  ${jsonStr.substring(0, 200)}...`)
        console.log()
      }
    }
  })

  // Now check a few more transcripts
  console.log('\n\n📊 Checking multiple transcripts for patterns...\n')

  const { data: multiple } = await supabase
    .from('transcripts')
    .select('id, title, text, transcript_content, formatted_text, segments, metadata, media_metadata')
    .eq('project_id', projectId)
    .is('word_count', null)
    .limit(5)

  multiple?.forEach(t => {
    console.log(`\n- ${t.title}`)
    const fields = []
    if (t.text) fields.push(`text: ${t.text.length} chars`)
    if (t.transcript_content) fields.push(`transcript_content: ${t.transcript_content.length} chars`)
    if (t.formatted_text) fields.push(`formatted_text: ${typeof t.formatted_text === 'string' ? t.formatted_text.length : 'JSON'} `)
    if (t.segments) fields.push(`segments: ${Array.isArray(t.segments) ? t.segments.length : 'data'} items`)
    if (t.metadata && Object.keys(t.metadata).length > 0) fields.push(`metadata: ${Object.keys(t.metadata).length} keys`)
    if (t.media_metadata && Object.keys(t.media_metadata).length > 0) fields.push(`media_metadata: ${Object.keys(t.media_metadata).length} keys`)

    if (fields.length > 0) {
      console.log(`  Has: ${fields.join(', ')}`)
    } else {
      console.log(`  ❌ Completely empty`)
    }
  })
}

findHiddenContent().catch(console.error)

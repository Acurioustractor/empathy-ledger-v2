import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkProjectTranscripts() {
  const supabase = createServiceRoleClient()

  // Check the specific project ID from the URL
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('id', projectId)
    .single()

  console.log('Project:', project?.name)
  console.log('Description:', project?.description || 'None')
  console.log()

  // Get transcripts
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, word_count, character_count, text, transcript_content')
    .eq('project_id', projectId)
    .order('title')

  console.log(`Total transcripts: ${transcripts?.length || 0}`)
  console.log()

  // Show ones with 0 or null counts
  const withZero = transcripts?.filter(t =>
    (t.word_count === 0 || t.word_count === null) &&
    (t.character_count === 0 || t.character_count === null)
  ) || []

  console.log(`Transcripts with 0/null counts: ${withZero.length}`)

  if (withZero.length > 0) {
    console.log('\nDetails:')
    withZero.forEach(t => {
      const content = t.transcript_content || t.text || ''
      console.log(`\n- ${t.title}`)
      console.log(`  ID: ${t.id}`)
      console.log(`  word_count: ${t.word_count}`)
      console.log(`  character_count: ${t.character_count}`)
      console.log(`  Has content: ${content.length > 0 ? 'YES (' + content.length + ' chars)' : 'NO'}`)
      if (content.length > 0) {
        console.log(`  Preview: "${content.substring(0, 100)}..."`)
      }
    })
  }

  // Show summary by count status
  const withCounts = transcripts?.filter(t => t.word_count && t.word_count > 0) || []
  console.log(`\n✅ Transcripts with proper counts: ${withCounts.length}`)
}

checkProjectTranscripts().catch(console.error)

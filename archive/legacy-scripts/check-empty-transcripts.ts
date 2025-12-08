import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkEmptyTranscripts() {
  const supabase = createServiceRoleClient()

  // Get the GOODS project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .ilike('name', '%goods%')
    .single()

  if (!project) {
    console.log('Project not found')
    return
  }

  console.log(`📋 Checking transcripts for project: ${project.name}\n`)

  // Get all transcripts for this project
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, text, transcript_content, word_count, character_count')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  const emptyTranscripts = transcripts?.filter(t =>
    (!t.text || t.text.trim() === '') &&
    (!t.transcript_content || t.transcript_content.trim() === '')
  ) || []

  console.log(`📊 Total transcripts: ${transcripts?.length || 0}`)
  console.log(`❌ Empty transcripts: ${emptyTranscripts.length}\n`)

  if (emptyTranscripts.length > 0) {
    console.log('Empty transcripts:')
    emptyTranscripts.forEach(t => {
      console.log(`   - ${t.title}`)
      console.log(`     ID: ${t.id}`)
      console.log(`     word_count: ${t.word_count}, character_count: ${t.character_count}`)
      console.log(`     text: ${t.text ? `"${t.text.substring(0, 50)}..."` : 'null/empty'}`)
      console.log(`     transcript_content: ${t.transcript_content ? `"${t.transcript_content.substring(0, 50)}..."` : 'null/empty'}`)
      console.log()
    })
  }

  // Show some with content for comparison
  const withContent = transcripts?.filter(t =>
    (t.text && t.text.trim() !== '') ||
    (t.transcript_content && t.transcript_content.trim() !== '')
  ) || []

  if (withContent.length > 0) {
    console.log(`✅ Transcripts with content: ${withContent.length}`)
    console.log('\nSample (first 3):')
    withContent.slice(0, 3).forEach(t => {
      console.log(`   - ${t.title}`)
      console.log(`     word_count: ${t.word_count}, character_count: ${t.character_count}`)
      console.log()
    })
  }
}

checkEmptyTranscripts().catch(console.error)

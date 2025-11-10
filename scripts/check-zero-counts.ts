import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkZeroCounts() {
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

  console.log(`📋 Checking word/character counts for project: ${project.name}\n`)

  // Get all transcripts for this project
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, text, transcript_content, word_count, character_count')
    .eq('project_id', project.id)
    .order('title', { ascending: true })

  // Find ones with 0 or null counts but have content
  const zeroCountsWithContent = transcripts?.filter(t => {
    const hasContent = (t.text && t.text.trim() !== '') || (t.transcript_content && t.transcript_content.trim() !== '')
    const hasZeroCounts = (t.word_count === 0 || t.word_count === null) && (t.character_count === 0 || t.character_count === null)
    return hasContent && hasZeroCounts
  }) || []

  // Find ones with 0 or null counts and no content
  const zeroCountsNoContent = transcripts?.filter(t => {
    const hasContent = (t.text && t.text.trim() !== '') || (t.transcript_content && t.transcript_content.trim() !== '')
    const hasZeroCounts = (t.word_count === 0 || t.word_count === null) && (t.character_count === 0 || t.character_count === null)
    return !hasContent && hasZeroCounts
  }) || []

  console.log(`📊 Transcripts with 0/null counts but HAVE content: ${zeroCountsWithContent.length}`)
  console.log(`📊 Transcripts with 0/null counts and NO content: ${zeroCountsNoContent.length}\n`)

  if (zeroCountsWithContent.length > 0) {
    console.log('❌ Need to recalculate counts for:')
    zeroCountsWithContent.forEach(t => {
      const content = t.transcript_content || t.text || ''
      const actualWordCount = content.trim().split(/\s+/).filter(Boolean).length
      const actualCharCount = content.length

      console.log(`   - ${t.title}`)
      console.log(`     Stored: word_count=${t.word_count}, character_count=${t.character_count}`)
      console.log(`     Actual: word_count=${actualWordCount}, character_count=${actualCharCount}`)
      console.log(`     Preview: "${content.substring(0, 80)}..."`)
      console.log()
    })
  }

  if (zeroCountsNoContent.length > 0) {
    console.log('🗑️  Empty transcripts (should be unlinked or deleted):')
    zeroCountsNoContent.forEach(t => {
      console.log(`   - ${t.title} (ID: ${t.id})`)
    })
  }
}

checkZeroCounts().catch(console.error)

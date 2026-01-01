import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function findTranscriptContent() {
  const supabase = createServiceRoleClient()

  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  // Get ALL fields from a sample transcript
  const { data: sample } = await supabase
    .from('transcripts')
    .select('*')
    .eq('project_id', projectId)
    .eq('title', 'NIAA Strat')
    .single()

  console.log('📋 Sample Transcript: NIAA Strat')
  console.log('All fields:', Object.keys(sample || {}))
  console.log()

  // Check important fields
  console.log('Content fields:')
  console.log('  text:', sample?.text ? `${sample.text.length} chars` : 'null/empty')
  console.log('  transcript_content:', sample?.transcript_content ? `${sample.transcript_content.length} chars` : 'null/empty')
  console.log()

  // Check if there's a file URL
  console.log('File/URL fields:')
  console.log('  video_url:', sample?.video_url || 'null')
  console.log('  source_video_url:', sample?.source_video_url || 'null')
  console.log('  audio_url:', sample?.audio_url || 'null')
  console.log('  file_url:', sample?.file_url || 'null')
  console.log()

  // Check metadata
  console.log('Metadata:', JSON.stringify(sample?.metadata, null, 2))
  console.log()

  // Check if there are related media assets
  const { data: media } = await supabase
    .from('media_assets')
    .select('*')
    .or(`transcript_id.eq.${sample?.id},related_transcript_id.eq.${sample?.id}`)

  console.log('Related media assets:', media?.length || 0)
  if (media && media.length > 0) {
    media.forEach(m => {
      console.log(`  - ${m.asset_type}: ${m.cdn_url || m.file_path}`)
    })
  }
  console.log()

  // Get a few more examples
  console.log('Checking other empty transcripts...')
  const { data: others } = await supabase
    .from('transcripts')
    .select('id, title, text, transcript_content, video_url, file_url, metadata')
    .eq('project_id', projectId)
    .is('word_count', null)
    .limit(3)

  others?.forEach(t => {
    console.log(`\n- ${t.title}`)
    console.log(`  text: ${t.text ? `${t.text.length} chars` : 'null/empty'}`)
    console.log(`  transcript_content: ${t.transcript_content ? `${t.transcript_content.length} chars` : 'null/empty'}`)
    console.log(`  video_url: ${t.video_url || 'null'}`)
    console.log(`  file_url: ${t.file_url || 'null'}`)
    console.log(`  metadata: ${JSON.stringify(t.metadata)}`)
  })
}

findTranscriptContent().catch(console.error)

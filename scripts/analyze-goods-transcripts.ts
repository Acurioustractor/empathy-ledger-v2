/**
 * Analyze GOODS transcripts to see what content actually exists
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
)

async function analyzeTranscripts() {
  console.log('🔍 Analyzing GOODS project transcripts...\n')

  // Get all transcripts for GOODS project
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      text,
      storyteller_id,
      profiles:storyteller_id (
        display_name
      )
    `)
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .not('text', 'is', null)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Total transcripts: ${transcripts.length}\n`)

  // Analyze each transcript for GOODS keywords
  const goodsKeywords = ['bed', 'beds', 'sleep', 'sleeping', 'hygiene', 'washing', 'wash', 'dignity', 'morale', 'household', 'fridge', 'whitegoods']

  let transcriptsWithGoods = 0
  const detailedResults: any[] = []

  transcripts.forEach((t: any) => {
    const text = t.text.toLowerCase()
    const matches = goodsKeywords.filter(kw => text.includes(kw))

    if (matches.length > 0) {
      transcriptsWithGoods++
      detailedResults.push({
        storyteller: t.profiles?.display_name || 'Unknown',
        title: t.title,
        length: t.text.length,
        matches: matches,
        preview: t.text.substring(0, 300)
      })
    }
  })

  console.log(`✅ Transcripts with GOODS keywords: ${transcriptsWithGoods}/${transcripts.length}\n`)

  if (detailedResults.length > 0) {
    console.log('📋 TRANSCRIPTS WITH GOODS CONTENT:\n')
    detailedResults.forEach((result, i) => {
      console.log(`${i + 1}. ${result.storyteller} - "${result.title}"`)
      console.log(`   Keywords found: ${result.matches.join(', ')}`)
      console.log(`   Preview: "${result.preview.substring(0, 150)}..."\n`)
    })
  } else {
    console.log('⚠️  NO TRANSCRIPTS FOUND WITH GOODS KEYWORDS!')
    console.log('   This means transcripts are about something else, not beds/hygiene/sleep')
    console.log('\n   Sample transcript titles:')
    transcripts.slice(0, 5).forEach((t: any) => {
      console.log(`   - ${t.profiles?.display_name}: "${t.title}"`)
    })
  }

  // Now check what the OLD cached analysis extracted
  console.log('\n📦 Checking OLD cached analysis...\n')

  const { data: analysis } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .single()

  if (analysis) {
    const quotes = JSON.parse(analysis.analysis_data || '{}').quotes || []
    console.log(`   Old analysis had ${quotes.length} quotes`)

    if (quotes.length > 0) {
      console.log('\n   Sample quotes from OLD analysis:')
      quotes.slice(0, 3).forEach((q: any, i: number) => {
        console.log(`   ${i + 1}. "${q.text.substring(0, 100)}..."`)
        console.log(`      Speaker: ${q.speaker_name || 'Unknown'}`)

        const hasGoods = goodsKeywords.some(kw => q.text.toLowerCase().includes(kw))
        console.log(`      ${hasGoods ? '✅ HAS GOODS CONTENT' : '❌ Generic cultural content'}`)
        console.log()
      })
    }
  }
}

analyzeTranscripts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })

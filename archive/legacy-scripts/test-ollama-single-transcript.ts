import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'
import { extractIntelligentQuotes } from '../src/lib/ai/intelligent-quote-extractor'

async function testOllamaSingleTranscript() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('🔍 Fetching a sample transcript...\n')

  // Get just ONE transcript to test
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select(`
      id,
      transcript_content,
      formatted_text,
      storyteller_id,
      profiles:storyteller_id (
        display_name,
        full_name
      )
    `)
    .eq('project_id', projectId)
    .limit(1)

  if (!transcripts || transcripts.length === 0) {
    console.error('❌ No transcripts found')
    return
  }

  const transcript = transcripts[0]
  const text = transcript.formatted_text || transcript.transcript_content
  const storytellerName = transcript.profiles?.display_name || 'Unknown'

  console.log(`📝 Testing with: ${storytellerName}`)
  console.log(`📊 Transcript length: ${text.length} characters\n`)

  const startTime = Date.now()

  try {
    console.log('🦙 Calling Ollama with truncated transcript (8000 chars)...\n')

    const result = await extractIntelligentQuotes(text, storytellerName, 5)

    const duration = Date.now() - startTime

    console.log(`✅ Success! Completed in ${duration}ms (${(duration/1000).toFixed(1)}s)\n`)
    console.log('📊 Results:')
    console.log(`- Quotes extracted: ${result.powerful_quotes.length}`)
    console.log(`- Transformation stories: ${result.transformation_stories.length}`)
    console.log(`- Cultural insights: ${result.cultural_insights.length}`)
    console.log(`- Community impacts: ${result.community_impact_statements.length}`)

    if (result.powerful_quotes.length > 0) {
      console.log('\n🎯 Top Quote:')
      console.log(`  "${result.powerful_quotes[0].text}"`)
      console.log(`  - Category: ${result.powerful_quotes[0].category}`)
      console.log(`  - Confidence: ${result.powerful_quotes[0].confidence_score}`)
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ Failed after ${duration}ms (${(duration/1000).toFixed(1)}s)`)
    console.error('Error:', error.message)
  }
}

testOllamaSingleTranscript().catch(console.error)

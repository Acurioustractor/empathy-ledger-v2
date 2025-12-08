/**
 * Test Claude V2 extraction on a single GOODS transcript
 */

import { createClient } from '@supabase/supabase-js'
import { extractQuotesWithClaude } from '../src/lib/ai/claude-quote-extractor'

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
)

async function testSingleTranscript() {
  console.log('🔍 Finding transcript with GOODS content (Melissa Jackson)...\n')

  // Get Melissa Jackson's transcript
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, text, storyteller_id')
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .ilike('text', '%bed%')
    .limit(1)
    .single()

  if (!transcripts) {
    console.error('❌ No transcripts found with "bed" content')
    return
  }

  console.log(`📄 Testing transcript: ${transcripts.title}`)
  console.log(`   Length: ${transcripts.text.length} characters\n`)

  // Get storyteller name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', transcripts.storyteller_id)
    .single()

  // Get project context
  const { data: context } = await supabase
    .from('project_contexts')
    .select('*')
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .single()

  if (!context) {
    console.error('❌ No project context found')
    return
  }

  console.log('📋 Project Context:')
  console.log(`   Outcomes: ${context.expected_outcomes.map((o: any) => o.category).join(', ')}`)
  console.log(`   Success Criteria: ${context.success_criteria.length} items\n`)

  const projectContext = {
    project_name: 'GOODS',
    project_purpose: context.purpose,
    primary_outcomes: context.expected_outcomes.map((o: any) => o.category),
    extract_quotes_that_demonstrate: context.success_criteria,
    cultural_approaches: context.cultural_approaches || []
  }

  console.log('🧠 Extracting quotes with Claude V2...\n')

  try {
    const quotes = await extractQuotesWithClaude(
      transcripts.text,
      profile?.display_name || 'Unknown',
      transcripts.id,
      projectContext
    )

    console.log(`✅ Extracted ${quotes.length} quotes\n`)

    if (quotes.length === 0) {
      console.log('⚠️  NO QUOTES EXTRACTED')
      console.log('   This means either:')
      console.log('   - No GOODS-specific content found')
      console.log('   - Quality threshold too high')
      console.log('   - Success criteria still not matching transcript content')
      return
    }

    console.log('💬 EXTRACTED QUOTES:\n')
    quotes.forEach((quote, i) => {
      console.log(`${i + 1}. "${quote.text}"`)
      console.log(`   Confidence: ${quote.confidence_score}/100`)
      console.log(`   Category: ${quote.category}`)
      console.log(`   Significance: ${quote.significance}`)

      // Check if GOODS-specific
      const goodsKeywords = ['bed', 'sleep', 'hygiene', 'washing', 'dignity', 'morale', 'household']
      const isGoodsSpecific = goodsKeywords.some(kw => quote.text.toLowerCase().includes(kw))

      if (isGoodsSpecific) {
        console.log(`   ✅ GOODS-SPECIFIC CONTENT`)
      } else {
        console.log(`   ⚠️  Generic cultural content`)
      }
      console.log()
    })

    const goodsQuotes = quotes.filter(q =>
      ['bed', 'sleep', 'hygiene', 'washing', 'dignity', 'morale', 'household']
        .some(kw => q.text.toLowerCase().includes(kw))
    )

    console.log(`\n📊 RESULTS:`)
    console.log(`   Total quotes: ${quotes.length}`)
    console.log(`   GOODS-specific: ${goodsQuotes.length}`)
    console.log(`   Ratio: ${goodsQuotes.length}/${quotes.length}`)

    if (goodsQuotes.length > 0) {
      console.log('\n✅ SUCCESS: Claude V2 is extracting GOODS-specific quotes!')
    } else {
      console.log('\n❌ FAILURE: Only generic cultural quotes extracted')
      console.log('   The success criteria may need further refinement')
    }

  } catch (error: any) {
    console.error('\n❌ Extraction failed:', error.message)
    if (error.message.includes('rate_limit')) {
      console.log('\n⏰ RATE LIMIT: Wait 60 seconds and try again')
    }
    throw error
  }
}

testSingleTranscript()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  })

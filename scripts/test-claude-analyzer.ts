/**
 * Test Claude 3.5 Sonnet Analyzer Directly (No Inngest)
 *
 * Tests the upgraded analyzer on a sample transcript
 * to verify quality improvement over GPT-4o-mini
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { claudeTranscriptAnalyzer } from '../src/lib/ai/transcript-analyzer-v3-claude'

config({ path: '.env.local' })

async function main() {
  console.log('🧪 Testing Claude 3.5 Sonnet Analyzer\n')

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch a sample transcript
  console.log('📖 Fetching sample transcript...')
  const { data: transcript, error } = await supabase
    .from('transcripts')
    .select(`
      *,
      profile:profiles!storyteller_id(display_name, cultural_background)
    `)
    .eq('ai_processing_consent', true)
    .not('transcript_content', 'is', null)
    .limit(1)
    .single()

  if (error || !transcript) {
    console.error('❌ Failed to fetch transcript:', error)
    process.exit(1)
  }

  console.log(`✅ Fetched: "${transcript.title}"`)
  console.log(`   Storyteller: ${transcript.profile?.display_name || 'Unknown'}`)
  console.log(`   Length: ${transcript.transcript_content?.length || 0} characters`)
  console.log('')

  // Run analysis
  console.log('🤖 Running Claude 3.5 Sonnet analysis...')
  console.log('')

  const content = transcript.content || transcript.transcript_content || ''

  if (!content || content.length < 100) {
    console.error('❌ Transcript too short for analysis')
    process.exit(1)
  }

  try {
    const startTime = Date.now()

    const analysis = await claudeTranscriptAnalyzer.analyzeTranscript(content, {
      title: transcript.title,
      storyteller_name: transcript.profile?.display_name,
      cultural_context: transcript.profile?.cultural_background
    })

    const processingTime = Date.now() - startTime

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ANALYSIS COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')

    // Themes
    console.log(`📊 Themes (${analysis.themes.length}):`)
    analysis.themes.forEach((theme, i) => {
      console.log(`   ${i + 1}. ${theme}`)
    })
    console.log('')

    // Cultural Themes
    if (analysis.cultural_themes.length > 0) {
      console.log(`🌍 Cultural Themes (${analysis.cultural_themes.length}):`)
      analysis.cultural_themes.forEach((theme, i) => {
        console.log(`   ${i + 1}. ${theme}`)
      })
      console.log('')
    }

    // Quotes (FULL text, not truncated)
    console.log(`💬 Key Quotes (${analysis.key_quotes.length}):`)
    analysis.key_quotes.forEach((quote, i) => {
      console.log(`   ${i + 1}. "${quote.text}"`)
      console.log(`      Theme: ${quote.theme}`)
      console.log(`      Category: ${quote.category || 'N/A'}`)
      console.log(`      Confidence: ${quote.confidence_score}%`)
      console.log(`      Verified: ${quote.verified_exists ? '✅' : '❌'}`)
      console.log(`      Words: ${quote.text.split(' ').length}`)
      console.log('')
    })

    // Summary
    console.log('📝 Summary:')
    console.log(`   ${analysis.summary}`)
    console.log('')

    // Metadata
    console.log('📋 Metadata:')
    console.log(`   Emotional Tone: ${analysis.emotional_tone}`)
    console.log(`   Cultural Sensitivity: ${analysis.cultural_sensitivity_level}`)
    console.log(`   Requires Elder Review: ${analysis.requires_elder_review ? 'YES' : 'NO'}`)
    console.log('')

    // Verification Stats
    console.log('🔍 Verification Stats:')
    console.log(`   Quotes Extracted: ${analysis.verification_stats.quotes_extracted}`)
    console.log(`   Quotes Verified: ${analysis.verification_stats.quotes_verified}`)
    console.log(`   Quotes Rejected: ${analysis.verification_stats.quotes_rejected}`)
    console.log(`   Verification Rate: ${analysis.verification_stats.verification_rate}%`)
    console.log('')

    // Key Insights
    if (analysis.key_insights.length > 0) {
      console.log(`💡 Key Insights (${analysis.key_insights.length}):`)
      analysis.key_insights.forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight}`)
      })
      console.log('')
    }

    // Performance
    console.log('⚡ Performance:')
    console.log(`   Processing Time: ${processingTime}ms`)
    console.log(`   Pattern Insights: ${analysis.pattern_insights.length}`)
    console.log('')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ TEST SUCCESSFUL')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('Next Steps:')
    console.log('  1. Review quality of themes and quotes above')
    console.log('  2. Verify quotes exist in source transcript')
    console.log('  3. If quality looks good, run batch processing:')
    console.log('     npx tsx scripts/batch-process-transcripts.ts --limit=10')
    console.log('')

  } catch (error: any) {
    console.error('❌ Analysis failed:', error)
    if (error.message) {
      console.error('   Message:', error.message)
    }
    if (error.stack) {
      console.error('   Stack:', error.stack)
    }
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

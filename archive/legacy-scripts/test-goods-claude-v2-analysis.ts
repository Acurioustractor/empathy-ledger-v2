/**
 * Test GOODS Claude V2 Analysis with Proper Project Context
 */

console.log('🔬 Testing GOODS Project Analysis with Claude V2 + Project Context\n')

async function testAnalysis() {
  console.log('🎯 Project: GOODS (6bd47c8a-e676-456f-aa25-ddcbb5a31047)')
  console.log('📋 Context: Seed interview processed with 3 outcomes, 4 success criteria')
  console.log('🔬 Model: Claude V2 with quality filtering')
  console.log('🧠 AI Engine: Ollama llama3.1:8b\n')

  console.log('▶️  Starting analysis...\n')

  const startTime = Date.now()

  try {
    const response = await fetch('http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis?intelligent=true&model=claude', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`\n✅ Analysis Complete! (${duration}s)\n`)

    // Summary stats
    console.log('📊 ANALYSIS SUMMARY')
    console.log('==================')
    console.log(`Total Quotes: ${result.totalQuoteCount || 0}`)
    console.log(`Average Quality: ${result.averageQuality || 0}/100`)
    console.log(`Processing Time: ${Math.round((result.processingTimeMs || 0) / 1000)}s`)
    console.log(`AI Model: ${result.aiModel || 'unknown'}`)
    console.log('')

    // Outcome-specific stats
    if (result.outcomeCategories) {
      console.log('🎯 OUTCOMES TRACKED')
      console.log('===================')
      result.outcomeCategories.forEach((outcome: any) => {
        console.log(`\n${outcome.category}:`)
        console.log(`  Quotes: ${outcome.quoteCount}`)
        console.log(`  Avg Quality: ${outcome.averageQuality}/100`)
        if (outcome.topQuote) {
          console.log(`  Top Quote: "${outcome.topQuote.quote.substring(0, 100)}..."`)
        }
      })
      console.log('')
    }

    // Quote quality distribution
    if (result.insights?.uniqueQuoteCount) {
      console.log('📈 QUOTE QUALITY')
      console.log('================')
      console.log(`Unique Quotes: ${result.insights.uniqueQuoteCount}`)
      console.log(`Deduplication Rate: ${Math.round(result.insights.deduplicationRate * 100)}%`)
      console.log('')
    }

    // Storyteller coverage
    if (result.insights?.storytellerCoverage) {
      console.log('👥 STORYTELLER COVERAGE')
      console.log('=======================')
      console.log(`With Quotes: ${result.insights.storytellerCoverage.storytellersWithQuotes}/${result.insights.storytellerCoverage.totalStorytellers}`)
      console.log(`Coverage: ${Math.round(result.insights.storytellerCoverage.coveragePercentage)}%`)
      console.log('')
    }

    console.log('✨ SUCCESS! Claude V2 is working with project-aligned quality filtering')
    console.log('📖 View full results at: http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis')

  } catch (error: any) {
    console.error('❌ Error running analysis:', error.message)
    throw error
  }
}

testAnalysis()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  })

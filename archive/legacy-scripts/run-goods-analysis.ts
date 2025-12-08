/**
 * Run Full GOODS Analysis with Claude V2
 */

async function runAnalysis() {
  console.log('🚀 Starting GOODS analysis with Claude V2...\n')

  const startTime = Date.now()

  try {
    const response = await fetch(
      'http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis?intelligent=true&model=claude&force=true',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`\n✅ Analysis completed in ${duration}s\n`)
    console.log('📊 RESULTS:')
    console.log(`   Total Quotes: ${result.quotes?.length || 0}`)
    console.log(`   Total Outcomes: ${result.outcomes?.length || 0}`)

    if (result.outcomes && result.outcomes.length > 0) {
      console.log('\n🎯 OUTCOMES WITH EVIDENCE:')
      result.outcomes.forEach((outcome: any) => {
        const count = outcome.evidence_count || 0
        const status = count > 0 ? '✅' : '❌'
        console.log(`   ${status} ${outcome.category}: ${count} quotes`)
      })
    }

    if (result.quotes && result.quotes.length > 0) {
      console.log('\n💬 SAMPLE QUOTES:')
      result.quotes.slice(0, 3).forEach((quote: any, i: number) => {
        console.log(`\n   ${i + 1}. "${quote.text.substring(0, 100)}..."`)
        console.log(`      Speaker: ${quote.speaker_name}`)
        console.log(`      Confidence: ${quote.confidence_score}/100`)
      })
    }

    // Check for GOODS-specific content
    const goodsKeywords = ['bed', 'sleep', 'hygiene', 'washing', 'dignity', 'morale']
    const goodsQuotes = result.quotes?.filter((q: any) =>
      goodsKeywords.some(keyword => q.text.toLowerCase().includes(keyword))
    ) || []

    console.log(`\n🛏️  GOODS-SPECIFIC QUOTES: ${goodsQuotes.length}/${result.quotes?.length || 0}`)

    if (goodsQuotes.length > 0) {
      console.log('\n✅ SUCCESS: Claude V2 is extracting GOODS-specific content!')
      goodsQuotes.slice(0, 2).forEach((q: any) => {
        console.log(`\n   "${q.text.substring(0, 150)}..."`)
      })
    } else if (result.quotes?.length > 0) {
      console.log('\n⚠️  WARNING: Quotes found but none are GOODS-specific')
      console.log('   This suggests the success criteria may still need adjustment')
    } else {
      console.log('\n❌ NO QUOTES EXTRACTED')
      console.log('   Check server logs for errors')
    }

  } catch (error: any) {
    console.error('\n❌ Analysis failed:', error.message)
    throw error
  }
}

runAnalysis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  })

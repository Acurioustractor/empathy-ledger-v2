/**
 * Test Claude V2 Integration
 *
 * Tests the new Claude quote extractor with quality filtering
 */

import { extractClaudeQuotesV2, ProjectContext } from '../src/lib/ai/claude-quote-extractor-v2'

// Sample transcript for testing
const sampleTranscript = `
I remember when we first got the new beds in our community. It completely changed how people were sleeping.
Before that, a lot of families were sleeping on old mattresses that were broken down, causing all sorts of back problems.

The new beds were designed with our community's input. We told them what we needed - beds that were sturdy,
comfortable, and could handle the climate here. And they listened. That's what made it different.

Now, when I visit families, I see people sleeping better, waking up with less pain. The kids are doing better
in school because they're getting proper rest. It's amazing what something as simple as a good bed can do.

But it's more than just the beds. It's about community ownership. We were part of the design process.
We decided what worked for us. That's real empowerment right there.
`

// GOODS project context
const goodsProjectContext: ProjectContext = {
  project_name: "Goods",
  project_purpose: "Creating better white goods and beds for Indigenous communities through community-led co-creation",
  primary_outcomes: [
    "Improved sleep quality (comfortable beds, better rest)",
    "Better hygiene (functional washing machines, clean clothes)",
    "Community ownership (people leading the design/creation)",
    "Culturally appropriate design (goods that fit community needs)"
  ],
  cultural_approaches: [
    "Community-led design",
    "Walking alongside (not telling what to do)",
    "Different cultural contexts respected"
  ],
  extract_quotes_that_demonstrate: [
    "Personal experience with beds, washing machines, fridges",
    "Impact on sleep, health, hygiene from having/not having goods",
    "Community involvement in designing or creating goods",
    "Cultural considerations in household goods design",
    "Stories of change after receiving new goods"
  ],
  avoid_topics: [
    "Other projects (Orange Sky, housing programs not related to goods)",
    "General community issues unrelated to household goods"
  ]
}

async function testClaudeV2() {
  console.log('🧪 Testing Claude V2 Quote Extraction with Quality Filtering\n')

  console.log('PROJECT:', goodsProjectContext.project_name)
  console.log('PURPOSE:', goodsProjectContext.project_purpose)
  console.log('OUTCOMES:', goodsProjectContext.primary_outcomes.length, 'defined')
  console.log('')

  try {
    const result = await extractClaudeQuotesV2(
      sampleTranscript,
      'Test Storyteller',
      goodsProjectContext,
      5
    )

    console.log('✅ Extraction Complete\n')

    console.log('📊 PROCESSING METADATA:')
    console.log(`   Total candidates: ${result.processing_metadata.total_candidates}`)
    console.log(`   Passed quality: ${result.processing_metadata.passed_quality}`)
    console.log(`   Passed verification: ${result.processing_metadata.passed_verification}`)
    console.log(`   Final count: ${result.processing_metadata.final_count}`)
    console.log(`   Average quality: ${result.processing_metadata.average_quality}/100`)
    console.log(`   Processing time: ${result.processing_metadata.processing_time_ms}ms`)
    console.log('')

    if (result.rejected_quotes.length > 0) {
      console.log('⚠️  REJECTED QUOTES:')
      result.rejected_quotes.forEach((rejected, i) => {
        console.log(`   ${i + 1}. "${rejected.text.substring(0, 60)}..."`)
        console.log(`      Reason: ${rejected.rejection_reason}`)
        console.log(`      Quality: ${rejected.quality_score}/100`)
      })
      console.log('')
    }

    if (result.powerful_quotes.length > 0) {
      console.log('✅ ACCEPTED QUOTES:')
      result.powerful_quotes.forEach((quote, i) => {
        console.log(`\n   ${i + 1}. "${quote.text}"`)
        console.log(`      Category: ${quote.category}`)
        console.log(`      Confidence: ${quote.confidence_score}/100`)
        console.log(`      Quality Metrics:`)
        console.log(`         Coherence: ${quote.quality_metrics.coherence}/100`)
        console.log(`         Completeness: ${quote.quality_metrics.completeness}/100`)
        console.log(`         Depth: ${quote.quality_metrics.depth}/100`)
        console.log(`         Relevance: ${quote.quality_metrics.relevance}/100`)
        console.log(`         Overall: ${quote.quality_metrics.overall_score}/100`)
        console.log(`      Significance: ${quote.significance}`)
      })
      console.log('')
    }

    // Verify success criteria
    console.log('🔍 VERIFICATION CHECKS:')

    const allVerified = result.powerful_quotes.every(q => q.verified_exists)
    console.log(`   ✓ All quotes verified to exist: ${allVerified ? '✅' : '❌'}`)

    const allHighQuality = result.powerful_quotes.every(q => q.quality_metrics.overall_score >= 60)
    console.log(`   ✓ All quotes meet quality threshold: ${allHighQuality ? '✅' : '❌'}`)

    const avgQuality = result.processing_metadata.average_quality
    console.log(`   ✓ Average quality above 70: ${avgQuality >= 70 ? '✅' : '❌'} (${avgQuality}/100)`)

    const allProjectAligned = result.powerful_quotes.every(q => q.quality_metrics.relevance >= 60)
    console.log(`   ✓ All quotes project-aligned: ${allProjectAligned ? '✅' : '❌'}`)

    console.log('\n✅ Test Complete!')

  } catch (error: any) {
    console.error('❌ Test Failed:', error.message)
    throw error
  }
}

// Run test
testClaudeV2()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })

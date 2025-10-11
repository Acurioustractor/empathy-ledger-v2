import { NextResponse } from 'next/server'
import { researchTopic, researchCulturalContext, factCheck } from '@/lib/ai/research-helper'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Test 1: Cultural context research
  try {
    console.log('🔬 Testing cultural context research...')
    const context = await researchCulturalContext(
      'storytelling and oral traditions',
      'Aboriginal Australian'
    )
    results.tests.push({
      name: 'Cultural Context Research',
      status: 'success',
      preview: context.substring(0, 200)
    })
  } catch (error) {
    results.tests.push({
      name: 'Cultural Context Research',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: Basic research
  try {
    console.log('🔬 Testing basic topic research...')
    const result = await researchTopic('Indigenous Australian art and culture', {
      maxResults: 3,
      includeAnswer: true
    })
    results.tests.push({
      name: 'Topic Research',
      status: 'success',
      sources: result.results.length,
      hasAnswer: !!result.answer
    })
  } catch (error) {
    results.tests.push({
      name: 'Topic Research',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: Fact checking
  try {
    console.log('🔬 Testing fact-checking...')
    const verification = await factCheck('Aboriginal Australians have the oldest continuous culture on Earth')
    results.tests.push({
      name: 'Fact Check',
      status: 'success',
      confidence: verification.confidence,
      sources: verification.sources.length
    })
  } catch (error) {
    results.tests.push({
      name: 'Fact Check',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  const successCount = results.tests.filter((t: any) => t.status === 'success').length
  results.summary = `${successCount}/${results.tests.length} tests passed`

  return NextResponse.json(results)
}

/**
 * Test Context-Aware Analysis
 *
 * Triggers analysis for Goods project with context seeding
 * Should show project-specific quotes aligned with outcomes
 */

const PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047' // Goods project
const API_URL = 'http://localhost:3030'

async function testContextAwareAnalysis() {
  console.log('🧪 Testing Context-Aware Analysis\n')
  console.log('📋 Project: Goods.')
  console.log('🎯 Expected: Quotes about organizational confidence, peer networks, sustainability\n')

  try {
    // Trigger analysis with intelligent AI
    console.log('⏳ Triggering analysis (this may take 2-5 minutes)...\n')

    const response = await fetch(
      `${API_URL}/api/projects/${PROJECT_ID}/analysis?intelligent=true`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const result = await response.json()

    // Debug: Show what we got
    console.log('📦 API Response keys:', Object.keys(result))
    console.log()

    // Check if cached or fresh
    if (result.cached) {
      console.log(`✅ CACHE HIT! Analysis returned from cache`)
      console.log(`   Cached at: ${new Date(result.cached_at).toLocaleString()}\n`)
    } else {
      console.log(`🆕 FRESH ANALYSIS generated\n`)
    }

    const analysis = result.intelligentAnalysis || result.analysis || result

    // Display results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📊 ANALYSIS RESULTS\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Overall themes
    console.log('🎯 Overall Themes:')
    if (analysis.aggregatedInsights?.overallThemes) {
      analysis.aggregatedInsights.overallThemes.forEach((theme: any, i: number) => {
        console.log(`   ${i + 1}. ${theme.theme} (frequency: ${theme.frequency})`)
        if (theme.storytellers?.length > 0) {
          console.log(`      Storytellers: ${theme.storytellers.join(', ')}`)
        }
      })
    }
    console.log()

    // Top quotes
    console.log('💬 Top Powerful Quotes:\n')
    if (analysis.storytellers) {
      let quoteCount = 0
      for (const storyteller of analysis.storytellers) {
        if (storyteller.powerfulQuotes && storyteller.powerfulQuotes.length > 0) {
          console.log(`   📖 ${storyteller.displayName}:`)
          storyteller.powerfulQuotes.slice(0, 2).forEach((quote: any) => {
            quoteCount++
            console.log(`      "${quote.text}"`)
            console.log(`      Category: ${quote.category} | Confidence: ${quote.confidence_score}/100`)
            if (quote.themes?.length > 0) {
              console.log(`      Themes: ${quote.themes.join(', ')}`)
            }
            console.log()
          })
        }
      }

      if (quoteCount === 0) {
        console.log('   ⚠️  No quotes extracted')
      }
    }

    // Impact Framework
    console.log('\n🎯 Impact Framework:')
    if (analysis.aggregatedInsights?.impactFramework) {
      Object.entries(analysis.aggregatedInsights.impactFramework).forEach(([key, value]: [string, any]) => {
        const label = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        console.log(`   ${label}: ${Math.round(value)}/100`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✅ Test completed!')
    console.log('\n📝 Check console logs for context loading messages:')
    console.log('   • Should see: "📋 Using quick project context for analysis"')
    console.log('   • Should see: "✅ Project context loaded - will extract project-aligned quotes"')

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

// Run test
testContextAwareAnalysis()

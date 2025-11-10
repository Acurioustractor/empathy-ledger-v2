#!/usr/bin/env tsx

/**
 * Submit Platform Development Context
 *
 * This script submits the platform context to the organization seed interview API,
 * creating comprehensive LLM-ready documentation of the Empathy Ledger platform.
 */

import PLATFORM_CONTEXT_INTERVIEW from './create-platform-development-context'

const ORGANIZATION_ID = 'c53077e1-98de-4216-9149-6268891ff62e' // Oonchiumpa - use as platform context holder
const API_URL = `http://localhost:3030/api/organizations/${ORGANIZATION_ID}/context/seed-interview`

async function submitPlatformContext() {
  console.log('📋 Submitting Platform Development Context...')
  console.log(`📍 Organization ID: ${ORGANIZATION_ID}`)
  console.log(`📊 Total Questions: ${PLATFORM_CONTEXT_INTERVIEW.responses.length}`)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(PLATFORM_CONTEXT_INTERVIEW)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    console.log('\n✅ Platform Context Submitted Successfully!')
    console.log('\n📊 Extraction Results:')
    console.log('─'.repeat(60))

    if (result.context) {
      console.log(`Context ID: ${result.context.id}`)
      console.log(`Quality Score: ${result.context.extraction_quality_score || 'N/A'}/100`)
      console.log(`AI Model Used: ${result.context.ai_model_used || 'N/A'}`)
      console.log(`AI Extracted: ${result.context.ai_extracted ? 'Yes' : 'No'}`)
    }

    if (result.extracted) {
      console.log('\n📝 Extracted Context:')
      console.log('─'.repeat(60))

      if (result.extracted.mission) {
        console.log(`\n**Mission:**\n${result.extracted.mission.substring(0, 200)}...`)
      }

      if (result.extracted.vision) {
        console.log(`\n**Vision:**\n${result.extracted.vision.substring(0, 200)}...`)
      }

      if (result.extracted.values && result.extracted.values.length > 0) {
        console.log(`\n**Values:** ${result.extracted.values.join(', ')}`)
      }

      if (result.extracted.cultural_frameworks && result.extracted.cultural_frameworks.length > 0) {
        console.log(`\n**Cultural Frameworks:** ${result.extracted.cultural_frameworks.join(', ')}`)
      }

      if (result.extracted.impact_domains) {
        console.log('\n**Impact Domains:**')
        Object.entries(result.extracted.impact_domains).forEach(([domain, areas]) => {
          if (Array.isArray(areas) && areas.length > 0) {
            console.log(`  ${domain}: ${areas.join(', ')}`)
          }
        })
      }
    }

    console.log('\n' + '─'.repeat(60))
    console.log('✅ Platform context is now available for LLM-assisted development!')
    console.log('🤖 Future development sessions will have full understanding of:')
    console.log('   - Multi-tenant architecture')
    console.log('   - Database schema and relationships')
    console.log('   - API patterns and organization')
    console.log('   - Frontend component structure')
    console.log('   - Context and analysis systems')
    console.log('   - Common challenges and best practices')
    console.log('   - Development workflow')

    return result

  } catch (error) {
    console.error('\n❌ Error submitting platform context:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  submitPlatformContext()
    .then(() => {
      console.log('\n✅ Complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error.message)
      process.exit(1)
    })
}

export default submitPlatformContext

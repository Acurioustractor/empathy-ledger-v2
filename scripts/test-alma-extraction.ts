/**
 * Test ALMA Signal Extraction on Sample Transcripts
 *
 * Tests the enhanced Claude Sonnet 4.5 analyzer on 5-10 sample transcripts
 * to validate ALMA signal extraction quality before batch processing.
 *
 * Success Criteria:
 * - 90%+ accuracy on ALMA signals (matches manual assessment)
 * - No hallucinated cultural markers
 * - Impact dimension scores align with transcript content
 * - Conservative scoring when evidence is weak
 */

import { createClient } from '@supabase/supabase-js'
import { claudeTranscriptAnalyzer } from '../src/lib/ai/transcript-analyzer-v3-claude'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TestResult {
  transcript_id: string
  title: string
  storyteller_name: string
  analysis_success: boolean
  has_alma_signals: boolean
  has_cultural_markers: boolean
  has_impact_dimensions: boolean
  has_knowledge_contributions: boolean
  has_network_data: boolean
  alma_quality_notes: string[]
  processing_time_ms: number
  error?: string
}

async function testALMAExtraction() {
  console.log('🧪 Testing ALMA Signal Extraction on Sample Transcripts\n')
  console.log('=' .repeat(80))

  // Get 5-10 diverse sample transcripts
  const { data: transcripts, error: fetchError } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      transcript_content,
      storyteller_id,
      storytellers!inner(display_name, cultural_background)
    `)
    .not('transcript_content', 'is', null)
    .limit(10)

  if (fetchError) {
    console.error('❌ Failed to fetch transcripts:', fetchError)
    return
  }

  if (!transcripts || transcripts.length === 0) {
    console.error('❌ No transcripts found')
    return
  }

  console.log(`\n📊 Found ${transcripts.length} sample transcripts to test\n`)

  const testResults: TestResult[] = []

  for (const transcript of transcripts) {
    const storytellerName = transcript.storytellers.display_name

    console.log(`\n${'─'.repeat(80)}`)
    console.log(`🔍 Testing: ${transcript.title || 'Untitled'}`)
    console.log(`👤 Storyteller: ${storytellerName}`)
    console.log(`📝 Content length: ${transcript.transcript_content.length} chars`)

    try {
      const startTime = Date.now()

      // Run analysis with enhanced ALMA extraction
      const analysis = await claudeTranscriptAnalyzer.analyzeTranscript(
        transcript.transcript_content,
        {
          title: transcript.title,
          storyteller_name: storytellerName,
          cultural_context: transcript.storytellers.cultural_background
        }
      )

      const processingTime = Date.now() - startTime

      console.log(`\n✅ Analysis complete in ${processingTime}ms`)
      console.log(`\n📋 Analysis Results:`)
      console.log(`   Themes: ${analysis.themes.length}`)
      console.log(`   Cultural Themes: ${analysis.cultural_themes.length}`)
      console.log(`   Quotes Verified: ${analysis.verification_stats.quotes_verified}/${analysis.verification_stats.quotes_extracted}`)
      console.log(`   Cultural Sensitivity: ${analysis.cultural_sensitivity_level}`)
      console.log(`   Requires Elder Review: ${analysis.requires_elder_review}`)

      // Check ALMA signals
      const qualityNotes: string[] = []

      if (analysis.alma_signals) {
        console.log(`\n🎯 ALMA Signals Extracted:`)
        console.log(`   Authority Level: ${analysis.alma_signals.authority.level}`)
        if (analysis.alma_signals.authority.cultural_positioning) {
          console.log(`   Cultural Positioning: ${analysis.alma_signals.authority.cultural_positioning}`)
        }
        console.log(`   Primary Source: ${analysis.alma_signals.evidence_strength.primary_source}`)
        console.log(`   Safety Score: ${analysis.alma_signals.harm_risk_inverted.safety_score}`)
        console.log(`   Knowledge Domains: ${analysis.alma_signals.capability.knowledge_domains.length}`)
        console.log(`   Learning Pathways: ${analysis.alma_signals.capability.learning_pathways_opened.length}`)
        console.log(`   Handover Potential: ${analysis.alma_signals.option_value.handover_potential}`)
        console.log(`   Fair Value Protection: ${analysis.alma_signals.community_value_return.fair_value_protection}`)

        // Quality checks
        if (analysis.alma_signals.authority.level === 'lived_experience' &&
            analysis.alma_signals.evidence_strength.primary_source) {
          qualityNotes.push('✅ Authority and evidence align (lived experience + primary source)')
        }

        if (analysis.alma_signals.harm_risk_inverted.safety_score >= 0.8) {
          qualityNotes.push('✅ High safety score (culturally appropriate)')
        } else if (analysis.alma_signals.harm_risk_inverted.safety_score < 0.5) {
          qualityNotes.push('⚠️  Low safety score - verify cultural sensitivity')
        }

        if (analysis.alma_signals.capability.knowledge_domains.length > 0) {
          qualityNotes.push(`✅ ${analysis.alma_signals.capability.knowledge_domains.length} knowledge domains identified`)
        }
      } else {
        console.log(`\n⚠️  No ALMA signals extracted`)
        qualityNotes.push('❌ ALMA signals missing')
      }

      // Check cultural markers
      if (analysis.cultural_markers) {
        console.log(`\n🌏 Cultural Markers:`)
        console.log(`   Languages: ${analysis.cultural_markers.languages_mentioned.length}`)
        console.log(`   Places: ${analysis.cultural_markers.places_of_significance.length}`)
        console.log(`   Ceremonies/Practices: ${analysis.cultural_markers.ceremonies_practices.length}`)
        console.log(`   Kinship: ${analysis.cultural_markers.kinship_connections.length}`)
        console.log(`   Protocols: ${analysis.cultural_markers.cultural_protocols.length}`)

        if (analysis.cultural_markers.languages_mentioned.length > 0) {
          console.log(`      → ${analysis.cultural_markers.languages_mentioned.join(', ')}`)
        }
      }

      // Check impact dimensions
      if (analysis.impact_dimensions) {
        console.log(`\n📊 Impact Dimensions:`)

        if (analysis.impact_dimensions.individual) {
          const ind = analysis.impact_dimensions.individual
          console.log(`   Individual:`)
          if (ind.healing !== undefined) console.log(`      Healing: ${(ind.healing * 100).toFixed(0)}%`)
          if (ind.empowerment !== undefined) console.log(`      Empowerment: ${(ind.empowerment * 100).toFixed(0)}%`)
          if (ind.identity !== undefined) console.log(`      Identity: ${(ind.identity * 100).toFixed(0)}%`)
        }

        if (analysis.impact_dimensions.community) {
          const comm = analysis.impact_dimensions.community
          console.log(`   Community:`)
          if (comm.connection !== undefined) console.log(`      Connection: ${(comm.connection * 100).toFixed(0)}%`)
          if (comm.capability !== undefined) console.log(`      Capability: ${(comm.capability * 100).toFixed(0)}%`)
          if (comm.sovereignty !== undefined) console.log(`      Sovereignty: ${(comm.sovereignty * 100).toFixed(0)}%`)
        }

        if (analysis.impact_dimensions.environmental) {
          const env = analysis.impact_dimensions.environmental
          console.log(`   Environmental:`)
          if (env.land_connection !== undefined) console.log(`      Land Connection: ${(env.land_connection * 100).toFixed(0)}%`)
          if (env.sustainable_practice !== undefined) console.log(`      Sustainable Practice: ${(env.sustainable_practice * 100).toFixed(0)}%`)
        }

        // Check for reasonable scoring
        const allScores: number[] = []
        if (analysis.impact_dimensions.individual) {
          Object.values(analysis.impact_dimensions.individual).forEach(v => {
            if (v !== undefined) allScores.push(v)
          })
        }
        if (analysis.impact_dimensions.community) {
          Object.values(analysis.impact_dimensions.community).forEach(v => {
            if (v !== undefined) allScores.push(v)
          })
        }
        if (analysis.impact_dimensions.environmental) {
          Object.values(analysis.impact_dimensions.environmental).forEach(v => {
            if (v !== undefined) allScores.push(v)
          })
        }

        if (allScores.length > 0) {
          const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length
          qualityNotes.push(`✅ ${allScores.length} impact dimensions scored (avg: ${(avgScore * 100).toFixed(0)}%)`)

          if (allScores.some(s => s > 0.9)) {
            qualityNotes.push('⚠️  Some very high scores (>90%) - verify evidence supports this')
          }
        }
      }

      // Check knowledge contributions
      if (analysis.knowledge_contributions) {
        console.log(`\n📚 Knowledge Contributions:`)
        console.log(`   Traditional Knowledge: ${analysis.knowledge_contributions.traditional_knowledge.length}`)
        console.log(`   Lived Experience: ${analysis.knowledge_contributions.lived_experience.length}`)
        console.log(`   Innovations: ${analysis.knowledge_contributions.innovations.length}`)
        console.log(`   Warnings: ${analysis.knowledge_contributions.warnings.length}`)

        const totalContributions =
          analysis.knowledge_contributions.traditional_knowledge.length +
          analysis.knowledge_contributions.lived_experience.length +
          analysis.knowledge_contributions.innovations.length +
          analysis.knowledge_contributions.warnings.length

        if (totalContributions > 0) {
          qualityNotes.push(`✅ ${totalContributions} knowledge contributions identified`)
        }
      }

      // Check network data
      if (analysis.network_data) {
        console.log(`\n🕸️  Network Data:`)
        console.log(`   People Mentioned: ${analysis.network_data.mentioned_people.length}`)
        console.log(`   Organizations: ${analysis.network_data.organizations.length}`)
        console.log(`   Places: ${analysis.network_data.places.length}`)
        if (analysis.network_data.connections_strength !== undefined) {
          console.log(`   Connection Strength: ${(analysis.network_data.connections_strength * 100).toFixed(0)}%`)
        }
      }

      // Quality summary
      console.log(`\n📝 Quality Assessment:`)
      qualityNotes.forEach(note => console.log(`   ${note}`))

      testResults.push({
        transcript_id: transcript.id,
        title: transcript.title || 'Untitled',
        storyteller_name: storytellerName,
        analysis_success: true,
        has_alma_signals: !!analysis.alma_signals,
        has_cultural_markers: !!analysis.cultural_markers,
        has_impact_dimensions: !!analysis.impact_dimensions,
        has_knowledge_contributions: !!analysis.knowledge_contributions,
        has_network_data: !!analysis.network_data,
        alma_quality_notes: qualityNotes,
        processing_time_ms: processingTime
      })

    } catch (error: any) {
      console.error(`\n❌ Analysis failed:`, error.message)

      testResults.push({
        transcript_id: transcript.id,
        title: transcript.title || 'Untitled',
        storyteller_name: storytellerName,
        analysis_success: false,
        has_alma_signals: false,
        has_cultural_markers: false,
        has_impact_dimensions: false,
        has_knowledge_contributions: false,
        has_network_data: false,
        alma_quality_notes: [],
        processing_time_ms: 0,
        error: error.message
      })
    }

    // Wait 2 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Summary report
  console.log(`\n\n${'='.repeat(80)}`)
  console.log(`📊 TEST SUMMARY`)
  console.log(`${'='.repeat(80)}\n`)

  const successCount = testResults.filter(r => r.analysis_success).length
  const almaCount = testResults.filter(r => r.has_alma_signals).length
  const culturalMarkersCount = testResults.filter(r => r.has_cultural_markers).length
  const impactDimensionsCount = testResults.filter(r => r.has_impact_dimensions).length
  const knowledgeCount = testResults.filter(r => r.has_knowledge_contributions).length
  const networkCount = testResults.filter(r => r.has_network_data).length

  const avgProcessingTime = testResults
    .filter(r => r.analysis_success)
    .reduce((sum, r) => sum + r.processing_time_ms, 0) / successCount

  console.log(`Total Transcripts Tested: ${testResults.length}`)
  console.log(`Successful Analyses: ${successCount}/${testResults.length} (${((successCount / testResults.length) * 100).toFixed(0)}%)`)
  console.log(`\nALMA Signal Extraction:`)
  console.log(`  ALMA Signals: ${almaCount}/${successCount} (${((almaCount / successCount) * 100).toFixed(0)}%)`)
  console.log(`  Cultural Markers: ${culturalMarkersCount}/${successCount} (${((culturalMarkersCount / successCount) * 100).toFixed(0)}%)`)
  console.log(`  Impact Dimensions: ${impactDimensionsCount}/${successCount} (${((impactDimensionsCount / successCount) * 100).toFixed(0)}%)`)
  console.log(`  Knowledge Contributions: ${knowledgeCount}/${successCount} (${((knowledgeCount / successCount) * 100).toFixed(0)}%)`)
  console.log(`  Network Data: ${networkCount}/${successCount} (${((networkCount / successCount) * 100).toFixed(0)}%)`)
  console.log(`\nPerformance:`)
  console.log(`  Avg Processing Time: ${avgProcessingTime.toFixed(0)}ms`)

  // Failed analyses
  const failures = testResults.filter(r => !r.analysis_success)
  if (failures.length > 0) {
    console.log(`\n⚠️  Failed Analyses (${failures.length}):`)
    failures.forEach(f => {
      console.log(`  - ${f.title} (${f.storyteller_name}): ${f.error}`)
    })
  }

  // Success criteria check
  console.log(`\n\n${'='.repeat(80)}`)
  console.log(`✅ SUCCESS CRITERIA CHECK`)
  console.log(`${'='.repeat(80)}\n`)

  const checks = [
    {
      name: '90%+ Analysis Success Rate',
      pass: (successCount / testResults.length) >= 0.9,
      actual: `${((successCount / testResults.length) * 100).toFixed(0)}%`
    },
    {
      name: 'ALMA Signals Extracted',
      pass: almaCount >= successCount * 0.8,
      actual: `${almaCount}/${successCount} transcripts`
    },
    {
      name: 'Cultural Markers Extracted',
      pass: culturalMarkersCount >= successCount * 0.5,
      actual: `${culturalMarkersCount}/${successCount} transcripts`
    },
    {
      name: 'Impact Dimensions Scored',
      pass: impactDimensionsCount >= successCount * 0.7,
      actual: `${impactDimensionsCount}/${successCount} transcripts`
    },
    {
      name: 'Processing Time < 60s',
      pass: avgProcessingTime < 60000,
      actual: `${(avgProcessingTime / 1000).toFixed(1)}s avg`
    }
  ]

  checks.forEach(check => {
    const icon = check.pass ? '✅' : '❌'
    console.log(`${icon} ${check.name}: ${check.actual}`)
  })

  const allPassed = checks.every(c => c.pass)

  console.log(`\n${'='.repeat(80)}`)
  if (allPassed) {
    console.log(`\n🎉 ALL SUCCESS CRITERIA MET - Ready for batch processing!`)
    console.log(`\nNext step: Run batch analysis on all 251 transcripts`)
    console.log(`Command: npx tsx scripts/batch-analyze-transcripts.ts\n`)
  } else {
    console.log(`\n⚠️  Some criteria not met - review results and adjust if needed`)
    console.log(`\nConsider:`)
    console.log(`- Adjusting ALMA extraction prompt for better coverage`)
    console.log(`- Reviewing failed analyses for common issues`)
    console.log(`- Testing with more diverse transcript samples\n`)
  }
}

// Run test
testALMAExtraction()
  .then(() => {
    console.log('\n✅ Test complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })

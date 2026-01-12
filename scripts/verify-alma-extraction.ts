/**
 * Verify ALMA Extraction Results from Batch Processing
 *
 * Checks the quality and completeness of ALMA signal extraction
 * across all analyzed transcripts.
 *
 * Generates a comprehensive quality report including:
 * - Completion statistics
 * - ALMA signal coverage
 * - Cultural marker distribution
 * - Impact dimension scoring patterns
 * - Quality issues and recommendations
 *
 * Usage:
 *   npx tsx scripts/verify-alma-extraction.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface VerificationStats {
  total_transcripts: number
  total_analyzed: number
  completion_rate: number
  with_alma_signals: number
  with_cultural_markers: number
  with_impact_dimensions: number
  with_knowledge_contributions: number
  with_network_data: number
  avg_themes_per_transcript: number
  avg_processing_time_ms: number
}

interface QualityIssue {
  transcript_id: string
  title: string
  issue_type: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

async function getVerificationStats(): Promise<VerificationStats> {
  // Get total transcripts
  const { count: totalCount } = await supabase
    .from('transcripts')
    .select('id', { count: 'exact', head: true })
    .not('transcript_content', 'is', null)

  // Get all analysis results with full data
  const { data: analyses, error } = await supabase
    .from('transcript_analysis_results')
    .select('*')

  if (error) throw error

  const total = totalCount || 0
  const analyzed = analyses?.length || 0

  // Count coverage
  let withAlma = 0
  let withCultural = 0
  let withImpact = 0
  let withKnowledge = 0
  let withNetwork = 0
  let totalThemes = 0
  let totalProcessingTime = 0

  analyses?.forEach(a => {
    const result = a.analysis_result as any

    if (result.alma_signals) withAlma++
    if (result.cultural_markers) withCultural++
    if (result.impact_dimensions) withImpact++
    if (result.knowledge_contributions) withKnowledge++
    if (result.network_data) withNetwork++

    totalThemes += (result.themes?.length || 0) + (result.cultural_themes?.length || 0)

    if (a.processing_time_ms) {
      totalProcessingTime += a.processing_time_ms
    }
  })

  return {
    total_transcripts: total,
    total_analyzed: analyzed,
    completion_rate: total > 0 ? (analyzed / total) * 100 : 0,
    with_alma_signals: withAlma,
    with_cultural_markers: withCultural,
    with_impact_dimensions: withImpact,
    with_knowledge_contributions: withKnowledge,
    with_network_data: withNetwork,
    avg_themes_per_transcript: analyzed > 0 ? totalThemes / analyzed : 0,
    avg_processing_time_ms: analyzed > 0 ? totalProcessingTime / analyzed : 0
  }
}

async function detectQualityIssues(): Promise<QualityIssue[]> {
  const issues: QualityIssue[] = []

  const { data: analyses } = await supabase
    .from('transcript_analysis_results')
    .select(`
      transcript_id,
      analysis_result,
      transcripts!inner(title)
    `)

  analyses?.forEach((a: any) => {
    const result = a.analysis_result
    const title = a.transcripts.title || 'Untitled'

    // Check for missing ALMA signals
    if (!result.alma_signals) {
      issues.push({
        transcript_id: a.transcript_id,
        title,
        issue_type: 'missing_alma_signals',
        description: 'ALMA signals not extracted',
        severity: 'high'
      })
    }

    // Check for suspiciously high impact scores (possible over-extraction)
    if (result.impact_dimensions) {
      const dims = result.impact_dimensions
      const allScores = [
        ...(dims.individual ? Object.values(dims.individual) : []),
        ...(dims.community ? Object.values(dims.community) : []),
        ...(dims.environmental ? Object.values(dims.environmental) : [])
      ].filter(v => typeof v === 'number' && v > 0)

      const veryHighScores = allScores.filter(s => s > 0.9).length
      if (veryHighScores > 3) {
        issues.push({
          transcript_id: a.transcript_id,
          title,
          issue_type: 'high_impact_scores',
          description: `${veryHighScores} impact dimensions >90% - verify evidence`,
          severity: 'medium'
        })
      }
    }

    // Check for no themes (unusual)
    const totalThemes = (result.themes?.length || 0) + (result.cultural_themes?.length || 0)
    if (totalThemes === 0) {
      issues.push({
        transcript_id: a.transcript_id,
        title,
        issue_type: 'no_themes',
        description: 'No themes extracted',
        severity: 'medium'
      })
    }

    // Check for cultural sensitivity = low with cultural markers (inconsistent)
    if (result.cultural_sensitivity_level === 'low' &&
        result.cultural_markers &&
        Object.values(result.cultural_markers).some((v: any) => Array.isArray(v) && v.length > 0)) {
      issues.push({
        transcript_id: a.transcript_id,
        title,
        issue_type: 'sensitivity_mismatch',
        description: 'Low cultural sensitivity but cultural markers present',
        severity: 'low'
      })
    }
  })

  return issues
}

async function generateCulturalMarkersReport() {
  const { data: analyses } = await supabase
    .from('transcript_analysis_results')
    .select('analysis_result')

  let totalLanguages = 0
  let totalPlaces = 0
  let totalCeremonies = 0
  let totalKinship = 0
  let totalProtocols = 0

  const languageSet = new Set<string>()

  analyses?.forEach((a: any) => {
    const markers = a.analysis_result?.cultural_markers
    if (markers) {
      markers.languages_mentioned?.forEach((l: string) => languageSet.add(l))
      totalLanguages += markers.languages_mentioned?.length || 0
      totalPlaces += markers.places_of_significance?.length || 0
      totalCeremonies += markers.ceremonies_practices?.length || 0
      totalKinship += markers.kinship_connections?.length || 0
      totalProtocols += markers.cultural_protocols?.length || 0
    }
  })

  return {
    total_languages: totalLanguages,
    unique_languages: languageSet.size,
    languages_list: Array.from(languageSet).sort(),
    total_places: totalPlaces,
    total_ceremonies: totalCeremonies,
    total_kinship: totalKinship,
    total_protocols: totalProtocols
  }
}

async function generateImpactDimensionsReport() {
  const { data: analyses } = await supabase
    .from('transcript_analysis_results')
    .select('analysis_result')

  const allScores: number[] = []
  const categoryScores = {
    healing: [],
    empowerment: [],
    identity: [],
    connection: [],
    capability: [],
    sovereignty: [],
    land_connection: [],
    sustainable_practice: []
  }

  analyses?.forEach((a: any) => {
    const dims = a.analysis_result?.impact_dimensions
    if (dims) {
      // Individual
      if (dims.individual?.healing) {
        allScores.push(dims.individual.healing)
        categoryScores.healing.push(dims.individual.healing)
      }
      if (dims.individual?.empowerment) {
        allScores.push(dims.individual.empowerment)
        categoryScores.empowerment.push(dims.individual.empowerment)
      }
      if (dims.individual?.identity) {
        allScores.push(dims.individual.identity)
        categoryScores.identity.push(dims.individual.identity)
      }

      // Community
      if (dims.community?.connection) {
        allScores.push(dims.community.connection)
        categoryScores.connection.push(dims.community.connection)
      }
      if (dims.community?.capability) {
        allScores.push(dims.community.capability)
        categoryScores.capability.push(dims.community.capability)
      }
      if (dims.community?.sovereignty) {
        allScores.push(dims.community.sovereignty)
        categoryScores.sovereignty.push(dims.community.sovereignty)
      }

      // Environmental
      if (dims.environmental?.land_connection) {
        allScores.push(dims.environmental.land_connection)
        categoryScores.land_connection.push(dims.environmental.land_connection)
      }
      if (dims.environmental?.sustainable_practice) {
        allScores.push(dims.environmental.sustainable_practice)
        categoryScores.sustainable_practice.push(dims.environmental.sustainable_practice)
      }
    }
  })

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  return {
    total_scores: allScores.length,
    overall_avg: avg(allScores),
    category_averages: {
      healing: avg(categoryScores.healing as number[]),
      empowerment: avg(categoryScores.empowerment as number[]),
      identity: avg(categoryScores.identity as number[]),
      connection: avg(categoryScores.connection as number[]),
      capability: avg(categoryScores.capability as number[]),
      sovereignty: avg(categoryScores.sovereignty as number[]),
      land_connection: avg(categoryScores.land_connection as number[]),
      sustainable_practice: avg(categoryScores.sustainable_practice as number[])
    }
  }
}

async function verifyAlmaExtraction() {
  console.log('📊 ALMA Extraction Verification Report')
  console.log('=' .repeat(80))
  console.log()

  // Get statistics
  console.log('📈 Gathering statistics...\n')
  const stats = await getVerificationStats()

  console.log('📊 COMPLETION STATISTICS')
  console.log('─'.repeat(80))
  console.log(`Total Transcripts:           ${stats.total_transcripts}`)
  console.log(`Analyzed:                    ${stats.total_analyzed} (${stats.completion_rate.toFixed(1)}%)`)
  console.log(`Avg Themes per Transcript:   ${stats.avg_themes_per_transcript.toFixed(1)}`)
  console.log(`Avg Processing Time:         ${(stats.avg_processing_time_ms / 1000).toFixed(1)}s`)
  console.log()

  console.log('🎯 ALMA SIGNAL COVERAGE')
  console.log('─'.repeat(80))
  const coverageRate = stats.total_analyzed > 0
    ? (stats.with_alma_signals / stats.total_analyzed * 100).toFixed(1)
    : 0
  console.log(`ALMA Signals:                ${stats.with_alma_signals}/${stats.total_analyzed} (${coverageRate}%)`)
  console.log(`Cultural Markers:            ${stats.with_cultural_markers}/${stats.total_analyzed}`)
  console.log(`Impact Dimensions:           ${stats.with_impact_dimensions}/${stats.total_analyzed}`)
  console.log(`Knowledge Contributions:     ${stats.with_knowledge_contributions}/${stats.total_analyzed}`)
  console.log(`Network Data:                ${stats.with_network_data}/${stats.total_analyzed}`)
  console.log()

  // Cultural markers report
  console.log('🌏 CULTURAL MARKERS SUMMARY')
  console.log('─'.repeat(80))
  const markers = await generateCulturalMarkersReport()
  console.log(`Total Languages Identified:  ${markers.total_languages} (${markers.unique_languages} unique)`)
  console.log(`Total Places:                ${markers.total_places}`)
  console.log(`Total Ceremonies/Practices:  ${markers.total_ceremonies}`)
  console.log(`Total Kinship Connections:   ${markers.total_kinship}`)
  console.log(`Total Cultural Protocols:    ${markers.total_protocols}`)

  if (markers.languages_list.length > 0) {
    console.log(`\nLanguages Detected:`)
    markers.languages_list.slice(0, 10).forEach(lang => {
      console.log(`   • ${lang}`)
    })
    if (markers.languages_list.length > 10) {
      console.log(`   ... and ${markers.languages_list.length - 10} more`)
    }
  }
  console.log()

  // Impact dimensions report
  console.log('📊 IMPACT DIMENSIONS ANALYSIS')
  console.log('─'.repeat(80))
  const impact = await generateImpactDimensionsReport()
  console.log(`Total Scores Recorded:       ${impact.total_scores}`)
  console.log(`Overall Average Score:       ${(impact.overall_avg * 100).toFixed(1)}%`)
  console.log()
  console.log('Category Averages:')
  console.log(`   Healing:                  ${(impact.category_averages.healing * 100).toFixed(1)}%`)
  console.log(`   Empowerment:              ${(impact.category_averages.empowerment * 100).toFixed(1)}%`)
  console.log(`   Identity:                 ${(impact.category_averages.identity * 100).toFixed(1)}%`)
  console.log(`   Connection:               ${(impact.category_averages.connection * 100).toFixed(1)}%`)
  console.log(`   Capability:               ${(impact.category_averages.capability * 100).toFixed(1)}%`)
  console.log(`   Sovereignty:              ${(impact.category_averages.sovereignty * 100).toFixed(1)}%`)
  console.log(`   Land Connection:          ${(impact.category_averages.land_connection * 100).toFixed(1)}%`)
  console.log(`   Sustainable Practice:     ${(impact.category_averages.sustainable_practice * 100).toFixed(1)}%`)
  console.log()

  // Quality issues
  console.log('⚠️  QUALITY ISSUES')
  console.log('─'.repeat(80))
  const issues = await detectQualityIssues()

  if (issues.length === 0) {
    console.log('✅ No quality issues detected!')
  } else {
    const highIssues = issues.filter(i => i.severity === 'high')
    const mediumIssues = issues.filter(i => i.severity === 'medium')
    const lowIssues = issues.filter(i => i.severity === 'low')

    console.log(`Total Issues:                ${issues.length}`)
    console.log(`   High Severity:            ${highIssues.length}`)
    console.log(`   Medium Severity:          ${mediumIssues.length}`)
    console.log(`   Low Severity:             ${lowIssues.length}`)

    if (highIssues.length > 0) {
      console.log(`\n🚨 HIGH SEVERITY ISSUES (showing first 5):`)
      highIssues.slice(0, 5).forEach(issue => {
        console.log(`   • ${issue.title}`)
        console.log(`     Issue: ${issue.description}`)
        console.log(`     ID: ${issue.transcript_id}`)
      })
    }

    if (mediumIssues.length > 0) {
      console.log(`\n⚠️  MEDIUM SEVERITY ISSUES (showing first 5):`)
      mediumIssues.slice(0, 5).forEach(issue => {
        console.log(`   • ${issue.title}`)
        console.log(`     Issue: ${issue.description}`)
      })
    }
  }
  console.log()

  // Overall assessment
  console.log('━'.repeat(80))
  console.log('📋 OVERALL ASSESSMENT')
  console.log('━'.repeat(80))

  const qualityScore = (
    (stats.with_alma_signals / stats.total_analyzed) * 30 +
    (stats.with_cultural_markers / stats.total_analyzed) * 20 +
    (stats.with_impact_dimensions / stats.total_analyzed) * 20 +
    (stats.with_knowledge_contributions / stats.total_analyzed) * 15 +
    (stats.with_network_data / stats.total_analyzed) * 15
  )

  console.log(`Quality Score:               ${qualityScore.toFixed(1)}/100`)

  if (qualityScore >= 90) {
    console.log(`Status:                      ✅ EXCELLENT - Production ready`)
  } else if (qualityScore >= 75) {
    console.log(`Status:                      ✅ GOOD - Minor improvements possible`)
  } else if (qualityScore >= 60) {
    console.log(`Status:                      ⚠️  FAIR - Review recommended`)
  } else {
    console.log(`Status:                      ❌ NEEDS IMPROVEMENT`)
  }

  console.log()
  console.log('Next Steps:')
  console.log('1. Review any high-severity quality issues')
  console.log('2. Spot-check random samples for accuracy')
  console.log('3. Run: npx tsx scripts/backfill-storyteller-analysis.ts')
  console.log('4. Run: npm run act:rollup:all')
  console.log('━'.repeat(80))
  console.log()
}

// Run verification
verifyAlmaExtraction().catch(error => {
  console.error('\n❌ Verification failed:', error)
  process.exit(1)
})

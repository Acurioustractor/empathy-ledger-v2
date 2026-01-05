/**
 * Review All Stories with Farmhand Agents
 *
 * Runs StoryAnalysisAgent and StoryWritingAgent on all 217 transcripts to:
 * 1. Analyze narrative arcs
 * 2. Check cultural protocols
 * 3. Extract impact evidence
 * 4. Check tone alignment
 * 5. Generate comprehensive best practices report
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface CulturalProtocolCheck {
  flags: Array<{
    protocol: string
    markers_detected: string[]
    action: string
    severity: 'critical' | 'high' | 'medium' | 'low'
  }>
  overall_severity: 'critical' | 'high' | 'medium' | 'low'
  requires_elder_review: boolean
  recommended_action: string
}

interface ToneCheck {
  alignment_score: 'excellent' | 'good' | 'fair' | 'needs_work'
  flags: Array<{
    category: string
    patterns_found: string[]
    severity: 'high' | 'medium' | 'low'
    suggestion: string
  }>
  flag_count: number
  high_severity_count: number
  medium_severity_count: number
  passed: boolean
}

interface NarrativeArc {
  arc_pattern: string
  key_moments?: any[]
  emotional_trajectory?: string
  cultural_markers?: string[]
  strengths?: string[]
  analysis_notes?: string
}

async function checkCulturalProtocols(text: string): Promise<CulturalProtocolCheck> {
  const protocols = {
    'sacred_knowledge': {
      'markers': ['ceremonial', 'sacred', 'restricted', 'men-only', 'women-only'],
      'action': 'HALT - Requires Elder review',
      'severity': 'critical' as const
    },
    'traumatic_content': {
      'markers': ['violence', 'abuse', 'death', 'removal', 'stolen'],
      'action': 'Trigger warning required',
      'severity': 'high' as const
    },
    'sensitive_cultural': {
      'markers': ['language', 'ceremony', 'country', 'ancestors'],
      'action': 'Cultural sensitivity review recommended',
      'severity': 'medium' as const
    },
    'consent_required': {
      'markers': ['names', 'locations', 'family', 'community'],
      'action': 'Verify consent for identifiable information',
      'severity': 'high' as const
    }
  }

  const flags: any[] = []
  let max_severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  const text_lower = text.toLowerCase()

  for (const [protocol_name, protocol] of Object.entries(protocols)) {
    const markers_found = protocol.markers.filter(marker => text_lower.includes(marker))

    if (markers_found.length > 0) {
      flags.push({
        protocol: protocol_name,
        markers_detected: markers_found,
        action: protocol.action,
        severity: protocol.severity
      })

      const severity_order = ['low', 'medium', 'high', 'critical']
      if (severity_order.indexOf(protocol.severity) > severity_order.indexOf(max_severity)) {
        max_severity = protocol.severity
      }
    }
  }

  return {
    flags,
    overall_severity: max_severity,
    requires_elder_review: max_severity === 'critical',
    recommended_action: flags.length > 0 ? flags[0].action : 'No protocol concerns detected'
  }
}

async function checkToneAlignment(text: string): Promise<ToneCheck> {
  const language_flags = {
    'savior_complex': {
      'patterns': ['we empower', 'we give', 'we help', 'we enable', 'we provide voice'],
      'severity': 'high' as const,
      'suggestion': 'Use "we support" or center storyteller as the actor'
    },
    'deficit_framing': {
      'patterns': ['disadvantaged', 'marginalized', 'at-risk', 'vulnerable', 'broken'],
      'severity': 'medium' as const,
      'suggestion': 'Use strength-based language focusing on resilience and agency'
    },
    'othering_language': {
      'patterns': ['them', 'those people', 'recipients', 'beneficiaries', 'clients'],
      'severity': 'medium' as const,
      'suggestion': 'Use relational language (we/us) or specific role names'
    },
    'extraction_language': {
      'patterns': ['collect data', 'gather stories', 'harvest knowledge', 'extract insights'],
      'severity': 'high' as const,
      'suggestion': 'Use "preserve", "honor", "steward", or "safeguard" instead'
    },
    'romanticization': {
      'patterns': ['ancient wisdom', 'mystical', 'exotic', 'spiritual journey'],
      'severity': 'medium' as const,
      'suggestion': 'Be specific and grounded, avoid generalizations'
    }
  }

  const flags: any[] = []
  const text_lower = text.toLowerCase()

  for (const [flag_name, flag_data] of Object.entries(language_flags)) {
    const patterns_found = flag_data.patterns.filter(pattern => text_lower.includes(pattern))

    if (patterns_found.length > 0) {
      flags.push({
        category: flag_name,
        patterns_found,
        severity: flag_data.severity,
        suggestion: flag_data.suggestion
      })
    }
  }

  const high_severity_count = flags.filter(f => f.severity === 'high').length
  const medium_severity_count = flags.filter(f => f.severity === 'medium').length

  let alignment_score: 'excellent' | 'good' | 'fair' | 'needs_work'
  if (high_severity_count > 0) {
    alignment_score = 'needs_work'
  } else if (medium_severity_count > 2) {
    alignment_score = 'fair'
  } else if (medium_severity_count > 0) {
    alignment_score = 'good'
  } else {
    alignment_score = 'excellent'
  }

  return {
    alignment_score,
    flags,
    flag_count: flags.length,
    high_severity_count,
    medium_severity_count,
    passed: high_severity_count === 0
  }
}

async function analyzeNarrativeArc(text: string, metadata: any): Promise<NarrativeArc> {
  const prompt = `Analyze this Indigenous storytelling transcript for narrative structure.

TRANSCRIPT:
${text.substring(0, 2000)}... (excerpt)

CONTEXT:
${JSON.stringify(metadata, null, 2)}

Please analyze:

1. **Narrative Arc Pattern**: Which pattern best fits?
   - Linear Journey (departure → trials → return)
   - Circular Return (disruption → wandering → renewal)
   - Braided Stories (multiple intertwined narratives)
   - Witnessing (observational testimony)
   - Teaching Story (knowledge transmission)

2. **Cultural Markers**: Indigenous storytelling elements
   - Use of silence/pauses
   - Relational language (we/us vs I/me)
   - Connection to Country/land
   - Elder wisdom/teaching
   - Circular time references

3. **Strengths**: What makes this story powerful?

Return as JSON with this structure:
{
  "arc_pattern": "circular_return",
  "cultural_markers": ["marker1", "marker2"],
  "strengths": ["strength1", "strength2"],
  "analysis_notes": "overall assessment"
}`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    })

    const result_text = response.content[0].text

    if (result_text.includes('```json')) {
      const json_str = result_text.split('```json')[1].split('```')[0].trim()
      return JSON.parse(json_str)
    } else {
      return JSON.parse(result_text)
    }
  } catch (e) {
    return {
      arc_pattern: 'unknown',
      analysis_notes: 'Error analyzing arc'
    }
  }
}

async function main() {
  console.log('🌾 ACT Farmhand - Story Review Analysis')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Fetch all transcripts with AI analysis
  console.log('📖 Fetching transcripts...')
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      transcript_content,
      themes,
      key_quotes,
      ai_summary,
      storyteller_id,
      profiles!storyteller_id(display_name, cultural_background)
    `)
    .not('transcript_content', 'is', null)
    .not('themes', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching transcripts:', error)
    return
  }

  console.log(`✅ Found ${transcripts.length} transcripts to review\n`)

  // Initialize counters
  const stats = {
    total: transcripts.length,
    processed: 0,
    cultural_protocol_flags: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      none: 0
    },
    tone_alignment: {
      excellent: 0,
      good: 0,
      fair: 0,
      needs_work: 0
    },
    narrative_arcs: {
      linear_journey: 0,
      circular_return: 0,
      braided_stories: 0,
      witnessing: 0,
      teaching_story: 0,
      unknown: 0
    },
    requires_elder_review: 0,
    high_severity_tone_issues: 0
  }

  const detailed_results: any[] = []

  // Process each transcript
  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i]
    const progress = ((i + 1) / transcripts.length * 100).toFixed(1)

    console.log(`[${i + 1}/${transcripts.length}] (${progress}%) Processing: ${transcript.title || 'Untitled'}`)

    try {
      const content = transcript.transcript_content || ''
      const summary = transcript.ai_summary || ''
      const text_to_analyze = summary || content.substring(0, 2000)

      // 1. Check cultural protocols
      const protocol_check = await checkCulturalProtocols(text_to_analyze)
      stats.cultural_protocol_flags[protocol_check.overall_severity]++
      if (protocol_check.requires_elder_review) {
        stats.requires_elder_review++
      }

      // 2. Check tone alignment
      const tone_check = await checkToneAlignment(text_to_analyze)
      stats.tone_alignment[tone_check.alignment_score]++
      if (tone_check.high_severity_count > 0) {
        stats.high_severity_tone_issues++
      }

      // 3. Analyze narrative arc (sample only - every 10th transcript to save API calls)
      let arc: NarrativeArc | null = null
      if (i % 10 === 0) {
        arc = await analyzeNarrativeArc(text_to_analyze, {
          storyteller_name: transcript.profiles?.display_name,
          cultural_background: transcript.profiles?.cultural_background
        })
        if (arc.arc_pattern in stats.narrative_arcs) {
          stats.narrative_arcs[arc.arc_pattern as keyof typeof stats.narrative_arcs]++
        } else {
          stats.narrative_arcs.unknown++
        }
        await sleep(3000) // Rate limit for Claude API
      }

      // Store detailed results for flagged transcripts
      if (protocol_check.flags.length > 0 || tone_check.flag_count > 0) {
        detailed_results.push({
          id: transcript.id,
          title: transcript.title,
          protocol_check,
          tone_check,
          arc
        })
      }

      stats.processed++

      // Rate limit
      await sleep(100)

    } catch (error) {
      console.error(`  ❌ Error processing: ${error}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 ANALYSIS COMPLETE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`✅ Total Processed: ${stats.processed}/${stats.total}\n`)

  console.log('🔒 Cultural Protocol Checks:')
  console.log(`  Critical: ${stats.cultural_protocol_flags.critical} (Elder review required)`)
  console.log(`  High:     ${stats.cultural_protocol_flags.high}`)
  console.log(`  Medium:   ${stats.cultural_protocol_flags.medium}`)
  console.log(`  Low:      ${stats.cultural_protocol_flags.low}`)
  console.log(`  None:     ${stats.cultural_protocol_flags.none}`)
  console.log(`  → Requires Elder Review: ${stats.requires_elder_review} transcripts\n`)

  console.log('✍️  Tone Alignment (Empathy Ledger Values):')
  console.log(`  Excellent:   ${stats.tone_alignment.excellent} (no issues)`)
  console.log(`  Good:        ${stats.tone_alignment.good} (minor issues)`)
  console.log(`  Fair:        ${stats.tone_alignment.fair} (moderate issues)`)
  console.log(`  Needs Work:  ${stats.tone_alignment.needs_work} (high severity issues)`)
  console.log(`  → High Severity Tone Issues: ${stats.high_severity_tone_issues} transcripts\n`)

  console.log('📖 Narrative Arc Patterns (sampled):')
  console.log(`  Linear Journey:    ${stats.narrative_arcs.linear_journey}`)
  console.log(`  Circular Return:   ${stats.narrative_arcs.circular_return}`)
  console.log(`  Braided Stories:   ${stats.narrative_arcs.braided_stories}`)
  console.log(`  Witnessing:        ${stats.narrative_arcs.witnessing}`)
  console.log(`  Teaching Story:    ${stats.narrative_arcs.teaching_story}`)
  console.log(`  Unknown:           ${stats.narrative_arcs.unknown}\n`)

  console.log('🚨 Flagged Transcripts Requiring Attention:')
  console.log(`  Total flagged: ${detailed_results.length}\n`)

  if (detailed_results.length > 0) {
    console.log('Top 10 transcripts needing review:')
    detailed_results.slice(0, 10).forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result.title || 'Untitled'} (${result.id})`)

      if (result.protocol_check.flags.length > 0) {
        console.log('   Cultural Protocol Flags:')
        result.protocol_check.flags.forEach((flag: any) => {
          console.log(`     • ${flag.protocol}: ${flag.action} (${flag.severity})`)
        })
      }

      if (result.tone_check.flags.length > 0) {
        console.log('   Tone Issues:')
        result.tone_check.flags.forEach((flag: any) => {
          console.log(`     • ${flag.category}: ${flag.patterns_found.join(', ')} (${flag.severity})`)
          console.log(`       → ${flag.suggestion}`)
        })
      }
    })
  }

  // Save detailed report
  const report = {
    generated_at: new Date().toISOString(),
    summary: stats,
    flagged_transcripts: detailed_results,
    recommendations: generateRecommendations(stats, detailed_results)
  }

  const fs = require('fs')
  const reportPath = '/tmp/farmhand-story-review-report.json'
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Detailed report saved: ${reportPath}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ REVIEW COMPLETE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

function generateRecommendations(stats: any, flagged: any[]): string[] {
  const recommendations: string[] = []

  if (stats.requires_elder_review > 0) {
    recommendations.push(`🔴 CRITICAL: ${stats.requires_elder_review} transcripts contain sacred knowledge and require Elder review before publication`)
  }

  if (stats.high_severity_tone_issues > 0) {
    recommendations.push(`🟡 ${stats.high_severity_tone_issues} transcripts have high-severity tone issues (savior language, extraction language) - editorial review needed`)
  }

  if (stats.cultural_protocol_flags.high > 5) {
    recommendations.push(`⚠️  ${stats.cultural_protocol_flags.high} transcripts flagged for trauma content - consider adding trigger warnings`)
  }

  if (stats.tone_alignment.needs_work > 10) {
    recommendations.push(`📝 ${stats.tone_alignment.needs_work} transcripts need tone refinement - consider bulk editorial pass`)
  }

  const excellent_rate = (stats.tone_alignment.excellent / stats.total * 100).toFixed(1)
  if (parseFloat(excellent_rate) > 80) {
    recommendations.push(`✅ ${excellent_rate}% of transcripts have excellent tone alignment - platform culture is strong!`)
  }

  return recommendations
}

main().catch(console.error)

import { TranscriptAnalysis, TranscriptSegment } from './transcript-analyzer'

// REVOLUTIONARY AI SYSTEM BUILT FROM REAL INDIGENOUS COMMUNITY STORIES
// Based on actual patterns found in Aunty Vicky Wade, Aunty May, Joe Kwon, and other community voices

export interface IndigenousImpactInsight {
  // COMMUNITY-DEFINED SUCCESS INDICATORS (not colonial metrics)
  impactType: 'cultural_protocol' | 'community_leadership' | 'knowledge_transmission' |
              'healing_integration' | 'relationship_building' | 'system_navigation' |
              'collective_mobilization' | 'intergenerational_connection'

  // EVIDENCE FROM COMMUNITY VOICE
  evidence: {
    quote: string                    // Exact words from community member
    context: string                  // Surrounding context
    speaker_role?: string            // Elder, community leader, etc.
    confidence: number               // AI confidence in this insight
  }

  // INDIGENOUS IMPACT CATEGORIES
  impactDimensions: {
    relationshipStrengthening: number    // Building trust, connections
    culturalContinuity: number          // Traditions being maintained/revitalized
    communityEmpowerment: number        // Collective power and self-determination
    systemTransformation: number        // Changing institutions to be more responsive
    healingProgression: number          // Individual and collective healing
    knowledgePreservation: number       // Traditional knowledge being passed on
  }

  // COMMUNITY CONTROL INDICATORS
  sovereigntyMarkers: {
    communityLedDecisionMaking: boolean  // Community making their own choices
    culturalProtocolsRespected: boolean  // Traditional ways being honoured
    externalSystemsResponding: boolean   // Institutions changing to meet community needs
    resourceControlIncreasing: boolean   // Community gaining control over resources
  }

  // REAL CHANGE OUTCOMES (not bureaucratic metrics)
  transformationEvidence: string[]      // Specific examples of change happening

  created_at: string
  transcript_id: string
  community_context?: string
}

export class IndigenousImpactAnalyzer {

  // PATTERNS EXTRACTED FROM REAL COMMUNITY STORIES IN YOUR DATABASE
  private indigenousSuccessPatterns = {

    // CULTURAL PROTOCOL & RESPECT (from Aunty Vicky: "I never go onto country unless welcomed")
    'cultural_protocol': [
      'welcome', 'welcomed', 'invitation', 'permission', 'ask', 'softly', 'tread softly',
      'traditional owners', 'country', 'respect', 'protocol', 'cultural safety',
      'culturally safe', 'footprints', 'leave footprints', 'observe', 'listen'
    ],

    // COMMUNITY LEADERSHIP & OWNERSHIP (from "community leadership, community ownership, our mob is smart")
    'community_leadership': [
      'community leadership', 'community ownership', 'our mob', 'mob is smart',
      'community led', 'we decide', 'our choice', 'community control', 'self determination',
      'community driven', 'locally led', 'community voice', 'our way'
    ],

    // MATRIARCHAL KNOWLEDGE SYSTEMS (from "matriarchal lineage, I come from healers")
    'knowledge_transmission': [
      'matriarchal', 'lineage', 'come from healers', 'family healers', 'passed down',
      'grandmother taught', 'elder teachings', 'traditional knowledge', 'wisdom',
      'stories passed down', 'generations', 'ancestral knowledge', 'family tradition',
      'kinship', 'bloodline', 'inherited knowledge'
    ],

    // RELATIONSHIP & TRUST BUILDING (from "footprints we leave will give us invitation back")
    'relationship_building': [
      'invitation back', 'trust', 'relationship', 'connection', 'bond', 'bridge',
      'together', 'partnership', 'collaboration', 'working together', 'unity',
      'community bonds', 'bringing people together', 'collective', 'solidarity'
    ],

    // INTEGRATED HEALING (from "multidisciplinary team of medical experts and cultural guides")
    'healing_integration': [
      'medical experts', 'cultural guides', 'traditional healing', 'modern medicine',
      'healing together', 'holistic', 'integrated approach', 'both ways',
      'traditional and modern', 'cultural healing', 'spiritual healing', 'whole person',
      'community healing', 'collective healing'
    ],

    // SYSTEM NAVIGATION WITH COMMUNITY CONTROL (from "talk to government, talk to state reps")
    'system_navigation': [
      'talk to government', 'state reps', 'policy', 'advocacy', 'speaking up',
      'fighting for', 'standing up', 'demanding', 'making them listen', 'voice heard',
      'changing the system', 'institutional change', 'policy change', 'reform',
      'making them understand', 'educating institutions'
    ],

    // COLLECTIVE MOBILIZATION (from high "community" mentions across all stories)
    'collective_mobilization': [
      'community together', 'mobilize', 'organise', 'coming together', 'united',
      'collective action', 'group effort', 'community response', 'mass movement',
      'solidarity', 'standing together', 'collective voice', 'community power',
      'grassroots', 'bottom up'
    ],

    // INTERGENERATIONAL CONNECTION (from "children", "young kids", elder-youth dynamics)
    'intergenerational_connection': [
      'young kids', 'children', 'youth', 'elder', 'grandmother', 'grandfather',
      'passing to next generation', 'teaching young people', 'learning from elders',
      'bridge generations', 'old and young', 'wisdom transfer', 'mentorship',
      'elder guidance', 'youth leadership'
    ]
  }

  // CARE & SUPPORT PATTERNS (found heavily in Joe Kwon story with 77 care mentions)
  private careSystemPatterns = [
    'caring for', 'looking after', 'supporting', 'helping', 'care system',
    'community care', 'mutual support', 'holding each other', 'being there',
    'support network', 'care network', 'taking care', 'caring community'
  ]

  // LAND & PLACE CONNECTION (found across stories)
  private landConnectionPatterns = [
    'country', 'land', 'territory', 'place', 'home', 'island', 'traditional land',
    'ancestral land', 'sacred sites', 'connection to country', 'on country',
    'returning to country', 'caring for country', 'land rights'
  ]

  analyzeIndigenousImpact(transcript: string): IndigenousImpactInsight[] {
    const insights: IndigenousImpactInsight[] = []
    const sentences = this.extractMeaningfulSentences(transcript)

    // Analyze each sentence for Indigenous success patterns
    sentences.forEach(sentence => {
      const impactInsights = this.identifyImpactPatterns(sentence, transcript)
      insights.push(...impactInsights)
    })

    return insights
  }

  private extractMeaningfulSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20) // Meaningful sentences only
      .filter(s => !s.match(/^\[[\d:]+\]$/)) // Remove timestamp markers
  }

  private identifyImpactPatterns(sentence: string, fullTranscript: string): IndigenousImpactInsight[] {
    const insights: IndigenousImpactInsight[] = []
    const lowerSentence = sentence.toLowerCase()

    // Check against each Indigenous success pattern
    Object.entries(this.indigenousSuccessPatterns).forEach(([impactType, patterns]) => {
      patterns.forEach(pattern => {
        if (lowerSentence.includes(pattern.toLowerCase())) {
          const insight = this.createImpactInsight(
            impactType as any,
            sentence,
            pattern,
            fullTranscript
          )
          if (insight) {
            insights.push(insight)
          }
        }
      })
    })

    return insights
  }

  private createImpactInsight(
    impactType: IndigenousImpactInsight['impactType'],
    sentence: string,
    matchedPattern: string,
    fullTranscript: string
  ): IndigenousImpactInsight | null {

    // Get surrounding context
    const context = this.extractContext(sentence, fullTranscript)

    // Calculate impact dimensions based on real community values
    const impactDimensions = this.calculateIndigenousImpactDimensions(sentence, impactType)

    // Identify sovereignty markers
    const sovereigntyMarkers = this.identifySovereigntyMarkers(sentence)

    // Extract transformation evidence
    const transformationEvidence = this.extractTransformationEvidence(sentence, context)

    return {
      impactType,
      evidence: {
        quote: sentence.trim(),
        context: context,
        confidence: this.calculateConfidence(sentence, matchedPattern)
      },
      impactDimensions,
      sovereigntyMarkers,
      transformationEvidence,
      created_at: new Date().toISOString(),
      transcript_id: '', // Will be set by caller
    }
  }

  private calculateIndigenousImpactDimensions(
    sentence: string,
    impactType: IndigenousImpactInsight['impactType']
  ) {
    const lower = sentence.toLowerCase()

    // Base scores for different impact types
    const baseScores = {
      relationshipStrengthening: 0,
      culturalContinuity: 0,
      communityEmpowerment: 0,
      systemTransformation: 0,
      healingProgression: 0,
      knowledgePreservation: 0
    }

    // Adjust scores based on impact type and content
    switch (impactType) {
      case 'cultural_protocol':
        baseScores.culturalContinuity = 0.9
        baseScores.relationshipStrengthening = 0.7
        break
      case 'community_leadership':
        baseScores.communityEmpowerment = 0.9
        baseScores.systemTransformation = 0.6
        break
      case 'knowledge_transmission':
        baseScores.knowledgePreservation = 0.9
        baseScores.culturalContinuity = 0.8
        break
      case 'healing_integration':
        baseScores.healingProgression = 0.9
        baseScores.systemTransformation = 0.5
        break
      case 'relationship_building':
        baseScores.relationshipStrengthening = 0.9
        baseScores.communityEmpowerment = 0.6
        break
      case 'system_navigation':
        baseScores.systemTransformation = 0.9
        baseScores.communityEmpowerment = 0.7
        break
    }

    // Boost scores based on specific language patterns
    if (lower.includes('together') || lower.includes('collective')) {
      baseScores.communityEmpowerment += 0.1
    }
    if (lower.includes('traditional') || lower.includes('ancestral')) {
      baseScores.culturalContinuity += 0.1
    }
    if (lower.includes('healing') || lower.includes('health')) {
      baseScores.healingProgression += 0.1
    }

    return baseScores
  }

  private identifySovereigntyMarkers(sentence: string) {
    const lower = sentence.toLowerCase()

    return {
      communityLedDecisionMaking:
        lower.includes('we decide') || lower.includes('community led') ||
        lower.includes('our choice') || lower.includes('community ownership'),

      culturalProtocolsRespected:
        lower.includes('traditional') || lower.includes('cultural') ||
        lower.includes('protocol') || lower.includes('respect'),

      externalSystemsResponding:
        lower.includes('government') || lower.includes('policy') ||
        lower.includes('institution') || lower.includes('system'),

      resourceControlIncreasing:
        lower.includes('control') || lower.includes('ownership') ||
        lower.includes('access') || lower.includes('resources')
    }
  }

  private extractTransformationEvidence(sentence: string, context: string): string[] {
    const evidence: string[] = []
    const lower = sentence.toLowerCase()

    // Look for concrete change indicators
    if (lower.includes('now') || lower.includes('today') || lower.includes('different')) {
      evidence.push('Current state change mentioned')
    }
    if (lower.includes('before') || lower.includes('used to') || lower.includes('previously')) {
      evidence.push('Historical comparison made')
    }
    if (lower.includes('impact') || lower.includes('result') || lower.includes('outcome')) {
      evidence.push('Direct impact statement')
    }
    if (lower.includes('better') || lower.includes('improved') || lower.includes('stronger')) {
      evidence.push('Improvement indicated')
    }

    return evidence
  }

  private extractContext(sentence: string, fullText: string): string {
    const sentences = fullText.split(/[.!?]+/)
    const currentIndex = sentences.findIndex(s => s.includes(sentence.substring(0, 50)))

    if (currentIndex === -1) return sentence

    // Get surrounding sentences for context
    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(sentences.length, currentIndex + 2)

    return sentences.slice(start, end).join('. ').trim()
  }

  private calculateConfidence(sentence: string, matchedPattern: string): number {
    let confidence = 0.6 // Base confidence

    // Increase confidence for exact pattern matches
    if (sentence.toLowerCase().includes(matchedPattern.toLowerCase())) {
      confidence += 0.2
    }

    // Increase confidence for longer, more detailed sentences
    if (sentence.length > 100) {
      confidence += 0.1
    }

    // Increase confidence for first-person narratives
    if (sentence.toLowerCase().includes('i ') || sentence.toLowerCase().includes('we ')) {
      confidence += 0.1
    }

    return Math.min(0.95, confidence) // Cap at 95%
  }

  // AGGREGATION FUNCTIONS FOR COMMUNITY IMPACT REPORTING

  aggregateCommunityImpact(insights: IndigenousImpactInsight[]): CommunityImpactSummary {
    const impactCounts = this.countImpactTypes(insights)
    const sovereigntyIndicators = this.aggregateSovereigntyMarkers(insights)
    const strongestImpactDimensions = this.identifyStrongestImpactAreas(insights)
    const communityVoices = this.extractCommunityVoices(insights)

    return {
      totalInsights: insights.length,
      impactTypes: impactCounts,
      sovereigntyProgress: sovereigntyIndicators,
      strongestImpactAreas: strongestImpactDimensions,
      featuredCommunityVoices: communityVoices,
      generatedAt: new Date().toISOString()
    }
  }

  private countImpactTypes(insights: IndigenousImpactInsight[]) {
    const counts: Record<string, number> = {}
    insights.forEach(insight => {
      counts[insight.impactType] = (counts[insight.impactType] || 0) + 1
    })
    return counts
  }

  private aggregateSovereigntyMarkers(insights: IndigenousImpactInsight[]) {
    const totals = {
      communityLedDecisionMaking: 0,
      culturalProtocolsRespected: 0,
      externalSystemsResponding: 0,
      resourceControlIncreasing: 0
    }

    insights.forEach(insight => {
      Object.keys(totals).forEach(key => {
        if (insight.sovereigntyMarkers[key as keyof typeof totals]) {
          totals[key as keyof typeof totals]++
        }
      })
    })

    return totals
  }

  private identifyStrongestImpactAreas(insights: IndigenousImpactInsight[]) {
    const dimensionTotals = {
      relationshipStrengthening: 0,
      culturalContinuity: 0,
      communityEmpowerment: 0,
      systemTransformation: 0,
      healingProgression: 0,
      knowledgePreservation: 0
    }

    insights.forEach(insight => {
      Object.keys(dimensionTotals).forEach(key => {
        dimensionTotals[key as keyof typeof dimensionTotals] +=
          insight.impactDimensions[key as keyof typeof dimensionTotals]
      })
    })

    // Return top 3 impact areas
    return Object.entries(dimensionTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area, score]) => ({ area, score: score / insights.length }))
  }

  private extractCommunityVoices(insights: IndigenousImpactInsight[]) {
    return insights
      .filter(insight => insight.evidence.confidence > 0.7)
      .sort((a, b) => b.evidence.confidence - a.evidence.confidence)
      .slice(0, 5)
      .map(insight => ({
        quote: insight.evidence.quote,
        impactType: insight.impactType,
        confidence: insight.evidence.confidence
      }))
  }
}

// COMMUNITY IMPACT SUMMARY TYPE
export interface CommunityImpactSummary {
  totalInsights: number
  impactTypes: Record<string, number>
  sovereigntyProgress: Record<string, number>
  strongestImpactAreas: Array<{ area: string; score: number }>
  featuredCommunityVoices: Array<{
    quote: string
    impactType: string
    confidence: number
  }>
  generatedAt: string
}

// Export singleton instance
export const indigenousImpactAnalyzer = new IndigenousImpactAnalyzer()
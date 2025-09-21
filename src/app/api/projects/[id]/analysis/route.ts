import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Server-side interface definitions
interface IndigenousImpactInsight {
  impactType: 'cultural_protocol' | 'community_leadership' | 'knowledge_transmission' |
              'healing_integration' | 'relationship_building' | 'system_navigation' |
              'collective_mobilization' | 'intergenerational_connection'
  evidence: {
    quote: string
    context: string
    speaker_role?: string
    confidence: number
  }
  impactDimensions: {
    relationshipStrengthening: number
    culturalContinuity: number
    communityEmpowerment: number
    systemTransformation: number
    healingProgression: number
    knowledgePreservation: number
  }
  sovereigntyMarkers: {
    communityLedDecisionMaking: boolean
    culturalProtocolsRespected: boolean
    externalSystemsResponding: boolean
    resourceControlIncreasing: boolean
  }
  transformationEvidence: string[]
  created_at: string
  transcript_id: string
  community_context?: string
}

interface ProjectAnalysisData {
  projectInfo: {
    id: string
    name: string
    description: string
    organizationName: string
    storytellerCount: number
    transcriptCount: number
  }
  storytellers: Array<{
    id: string
    displayName: string
    profileImageUrl?: string
    bio?: string
    culturalBackground?: string
    transcriptCount: number
    themes: string[]
    impactInsights: IndigenousImpactInsight[]
  }>
  aggregatedInsights: {
    overallThemes: Array<{ theme: string; frequency: number; storytellers: string[] }>
    impactFramework: {
      relationshipStrengthening: number
      culturalContinuity: number
      communityEmpowerment: number
      systemTransformation: number
      healingProgression: number
      knowledgePreservation: number
    }
    powerfulQuotes: Array<{
      quote: string
      speaker: string
      impactType: string
      confidence: number
    }>
    recommendations: {
      continuationSuggestions: string[]
      keyConnections: string[]
      systemChangeOpportunities: string[]
      communityEngagementStrategy: string[]
    }
  }
  humanStoryExtracts: {
    transformationMoments: string[]
    wisdomShared: string[]
    challengesOvercome: string[]
    communityImpact: string[]
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    console.log('🔍 Analyzing project:', projectId)

    // Get project details with organisation
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        created_at,
        organisations:organization_id(
          id,
          name,
          type
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all storytellers with transcripts for this project
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        text,
        transcript_content,
        formatted_text,
        metadata,
        storyteller_id,
        created_at,
        profiles:storyteller_id(
          id,
          display_name,
          full_name,
          profile_image_url,
          bio,
          cultural_background,
          is_elder,
          is_featured
        )
      `)
      .eq('project_id', projectId)
      .not('storyteller_id', 'is', null)
      .order('created_at', { ascending: false })

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError)
      return NextResponse.json({ error: 'Failed to fetch project transcripts' }, { status: 500 })
    }

    console.log(`📊 Found ${transcripts?.length || 0} transcripts for project analysis`)

    // Organize storytellers and their transcripts
    const storytellerMap = new Map()
    const allTranscriptTexts: string[] = []

    transcripts?.forEach(transcript => {
      if (transcript.profiles) {
        const storytellerId = transcript.storyteller_id
        const storyteller = transcript.profiles

        if (!storytellerMap.has(storytellerId)) {
          storytellerMap.set(storytellerId, {
            id: storytellerId,
            displayName: storyteller.display_name || storyteller.full_name,
            profileImageUrl: storyteller.profile_image_url,
            bio: storyteller.bio,
            culturalBackground: storyteller.cultural_background,
            isElder: storyteller.is_elder,
            isFeatured: storyteller.is_featured,
            transcripts: [],
            themes: [],
            impactInsights: []
          })
        }

        const transcriptText = transcript.text || transcript.transcript_content || transcript.formatted_text
        if (transcriptText) {
          storytellerMap.get(storytellerId).transcripts.push({
            id: transcript.id,
            title: transcript.title,
            text: transcriptText,
            metadata: transcript.metadata
          })
          allTranscriptTexts.push(transcriptText)
        }
      }
    })

    const storytellers = Array.from(storytellerMap.values())
    console.log(`👥 Analyzing ${storytellers.length} storytellers`)

    // Analyze each storyteller's contributions using server-side pattern matching
    for (const storyteller of storytellers) {
      const combinedText = storyteller.transcripts.map((t: any) => t.text).join('\n\n')

      // Analyze themes using server-side pattern matching
      storyteller.themes = extractKeyThemes(combinedText)

      // Analyze Indigenous impact insights using server-side analysis
      storyteller.impactInsights = analyzeIndigenousImpact(combinedText)
    }

    // Generate comprehensive project analysis
    const analysisResult = await generateProjectAnalysis({
      project,
      storytellers,
      allTranscriptTexts: allTranscriptTexts
    })

    console.log('✅ Project analysis completed successfully')

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      generatedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('💥 Project analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function generateProjectAnalysis({
  project,
  storytellers,
  allTranscriptTexts
}: {
  project: any
  storytellers: any[]
  allTranscriptTexts: string[]
}): Promise<ProjectAnalysisData> {

  // Aggregate all impact insights
  const allImpactInsights = storytellers.reduce((acc: IndigenousImpactInsight[], s) => {
    return acc.concat(s.impactInsights)
  }, [])

  // Calculate impact framework scores
  const impactFramework = calculateAggregatedImpact(allImpactInsights)

  // Extract themes and frequency
  const themeFrequency = new Map<string, { frequency: number; storytellers: string[] }>()
  storytellers.forEach(storyteller => {
    storyteller.themes.forEach((theme: string) => {
      if (!themeFrequency.has(theme)) {
        themeFrequency.set(theme, { frequency: 0, storytellers: [] })
      }
      const themeData = themeFrequency.get(theme)!
      themeData.frequency++
      themeData.storytellers.push(storyteller.displayName)
    })
  })

  const overallThemes = Array.from(themeFrequency.entries())
    .map(([theme, data]) => ({ theme, frequency: data.frequency, storytellers: data.storytellers }))
    .sort((a, b) => b.frequency - a.frequency)

  // Extract powerful quotes
  const powerfulQuotes = allImpactInsights
    .filter(insight => insight.evidence.confidence > 0.7)
    .sort((a, b) => b.evidence.confidence - a.evidence.confidence)
    .slice(0, 10)
    .map(insight => {
      // Find the storyteller who has this insight
      const storyteller = storytellers.find(s => {
        return s.impactInsights.some((si: any) =>
          si.evidence.quote === insight.evidence.quote &&
          si.impactType === insight.impactType
        )
      })

      return {
        quote: insight.evidence.quote,
        speaker: storyteller?.displayName || 'Unknown',
        impactType: insight.impactType,
        confidence: insight.evidence.confidence
      }
    })

  // Generate AI-powered recommendations
  const recommendations = await generateProjectRecommendations({
    projectName: project.name,
    organizationName: project.organisations?.name,
    themes: overallThemes,
    impactInsights: allImpactInsights,
    storytellers,
    transcriptTexts: allTranscriptTexts.slice(0, 5) // Sample of transcripts for context
  })

  // Extract human story elements
  const humanStoryExtracts = await extractHumanStoryElements(allTranscriptTexts)

  return {
    projectInfo: {
      id: project.id,
      name: project.name,
      description: project.description || '',
      organizationName: project.organisations?.name || 'Unknown Organization',
      storytellerCount: storytellers.length,
      transcriptCount: storytellers.reduce((total, s) => total + s.transcripts.length, 0)
    },
    storytellers: storytellers.map(s => ({
      id: s.id,
      displayName: s.displayName,
      profileImageUrl: s.profileImageUrl,
      bio: s.bio,
      culturalBackground: s.culturalBackground,
      transcriptCount: s.transcripts.length,
      themes: s.themes,
      impactInsights: s.impactInsights
    })),
    aggregatedInsights: {
      overallThemes,
      impactFramework,
      powerfulQuotes,
      recommendations
    },
    humanStoryExtracts
  }
}

function calculateAggregatedImpact(insights: IndigenousImpactInsight[]) {
  if (insights.length === 0) {
    return {
      relationshipStrengthening: 0,
      culturalContinuity: 0,
      communityEmpowerment: 0,
      systemTransformation: 0,
      healingProgression: 0,
      knowledgePreservation: 0
    }
  }

  const totals = insights.reduce((acc, insight) => {
    Object.keys(acc).forEach(key => {
      acc[key as keyof typeof acc] += insight.impactDimensions[key as keyof typeof insight.impactDimensions]
    })
    return acc
  }, {
    relationshipStrengthening: 0,
    culturalContinuity: 0,
    communityEmpowerment: 0,
    systemTransformation: 0,
    healingProgression: 0,
    knowledgePreservation: 0
  })

  // Normalize by number of insights
  Object.keys(totals).forEach(key => {
    totals[key as keyof typeof totals] = totals[key as keyof typeof totals] / insights.length
  })

  return totals
}

async function generateProjectRecommendations({
  projectName,
  organizationName,
  themes,
  impactInsights,
  storytellers,
  transcriptTexts
}: {
  projectName: string
  organizationName?: string
  themes: any[]
  impactInsights: IndigenousImpactInsight[]
  storytellers: any[]
  transcriptTexts: string[]
}) {

  const topThemes = themes.slice(0, 5).map(t => t.theme).join(', ')
  const impactTypes = [...new Set(impactInsights.map(i => i.impactType))]

  const systemPrompt = `You are an expert in Indigenous community development, systems change, and storytelling impact analysis.
Your role is to provide strategic recommendations for continuing and expanding community-led projects based on real stories and impacts.
Focus on community sovereignty, cultural protocols, relationship-building, and sustainable change.`

  const userPrompt = `Analyze this project and provide strategic recommendations for continuation and expansion:

PROJECT: ${projectName}
ORGANIZATION: ${organizationName}
STORYTELLERS: ${storytellers.length} community members
KEY THEMES: ${topThemes}
IMPACT AREAS: ${impactTypes.join(', ')}

SAMPLE COMMUNITY VOICES:
${transcriptTexts.slice(0, 2).map((text, i) => `Story ${i + 1}: ${text.substring(0, 500)}...`).join('\n\n')}

Provide recommendations in these areas:

1. CONTINUATION STRATEGIES - How to sustainably continue this project respecting community leadership
2. KEY CONNECTIONS - Who else should be involved (other communities, organisations, individuals)
3. SYSTEM CHANGE OPPORTUNITIES - Where this project could influence policy, institutions, or broader systems
4. COMMUNITY ENGAGEMENT - How to deepen community ownership and expand participation

Focus on:
- Community sovereignty and self-determination
- Cultural protocol and respect
- Relationship-based approaches
- Concrete, actionable steps
- Building on existing strengths
- Sustainable, long-term impact

Return your response as a JSON object with these keys: continuationSuggestions, keyConnections, systemChangeOpportunities, communityEngagementStrategy`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      continuationSuggestions: result.continuationSuggestions || [],
      keyConnections: result.keyConnections || [],
      systemChangeOpportunities: result.systemChangeOpportunities || [],
      communityEngagementStrategy: result.communityEngagementStrategy || []
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return {
      continuationSuggestions: ['Continue regular community gathering sessions'],
      keyConnections: ['Local elders and community leaders'],
      systemChangeOpportunities: ['Policy advocacy for community-led initiatives'],
      communityEngagementStrategy: ['Expand storytelling circles to include more voices']
    }
  }
}

async function extractHumanStoryElements(transcriptTexts: string[]) {
  const allText = transcriptTexts.join('\n\n')

  // Use pattern matching to find key story elements
  const transformationPatterns = /\b(changed|transformed|different|overcome|breakthrough|realised|learned|growth)\b.*?[.!?]/gi
  const wisdomPatterns = /\b(wisdom|teaching|learned|understand|realise|important|advice|knowledge)\b.*?[.!?]/gi
  const challengePatterns = /\b(difficult|challenge|struggle|hard|overcome|fight|tough|barrier)\b.*?[.!?]/gi
  const impactPatterns = /\b(community|together|help|support|change|impact|difference|better)\b.*?[.!?]/gi

  const transformationMoments = [...allText.matchAll(transformationPatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  const wisdomShared = [...allText.matchAll(wisdomPatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  const challengesOvercome = [...allText.matchAll(challengePatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  const communityImpact = [...allText.matchAll(impactPatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  return {
    transformationMoments,
    wisdomShared,
    challengesOvercome,
    communityImpact
  }
}

// Server-side analysis functions (replacing client-side imports)

function extractKeyThemes(text: string): string[] {
  const themes: string[] = []
  const lowerText = text.toLowerCase()

  // Theme patterns for server-side analysis
  const themePatterns = {
    'Personal Growth': /\b(learn|grow|change|develop|transform|overcome)\w*\b/gi,
    'Family & Relationships': /\b(family|parent|child|friend|relationship|love|support)\w*\b/gi,
    'Cultural Heritage': /\b(tradition|culture|heritage|ancestor|ritual|ceremony)\w*\b/gi,
    'Community': /\b(community|neighbour|together|collective|group|social)\w*\b/gi,
    'Challenges': /\b(difficult|hard|struggle|problem|challenge|obstacle)\w*\b/gi,
    'Success & Achievement': /\b(success|achieve|accomplish|proud|win|goal)\w*\b/gi,
    'Wisdom & Learning': /\b(wisdom|knowledge|learn|teach|understand|realise)\w*\b/gi,
    'Healing': /\b(healing|recovery|health|wellness|medicine|therapy)\w*\b/gi,
    'Land & Country': /\b(country|land|territory|place|home|island)\w*\b/gi,
    'Spirituality': /\b(spiritual|sacred|ceremony|prayer|belief|faith)\w*\b/gi
  }

  for (const [theme, pattern] of Object.entries(themePatterns)) {
    const matches = text.match(pattern)
    if (matches && matches.length >= 2) {
      themes.push(theme)
    }
  }

  return themes.slice(0, 8) // Limit to top 8 themes
}

function analyzeIndigenousImpact(text: string): IndigenousImpactInsight[] {
  const insights: IndigenousImpactInsight[] = []
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)

  // Indigenous success patterns for server-side analysis
  const impactPatterns = {
    'cultural_protocol': [
      'welcome', 'welcomed', 'invitation', 'permission', 'respect', 'protocol',
      'traditional owners', 'country', 'cultural safety', 'tread softly'
    ],
    'community_leadership': [
      'community leadership', 'community ownership', 'our mob', 'community led',
      'we decide', 'our choice', 'community control', 'self determination'
    ],
    'knowledge_transmission': [
      'matriarchal', 'lineage', 'healers', 'passed down', 'grandmother taught',
      'elder teachings', 'traditional knowledge', 'wisdom', 'generations'
    ],
    'healing_integration': [
      'medical experts', 'cultural guides', 'traditional healing', 'modern medicine',
      'holistic', 'integrated approach', 'both ways', 'community healing'
    ],
    'relationship_building': [
      'trust', 'relationship', 'connection', 'bridge', 'together', 'partnership',
      'collaboration', 'community bonds', 'bringing people together'
    ],
    'system_navigation': [
      'government', 'policy', 'advocacy', 'speaking up', 'fighting for',
      'voice heard', 'changing the system', 'institutional change'
    ],
    'collective_mobilization': [
      'community together', 'mobilize', 'organise', 'coming together', 'united',
      'collective action', 'community response', 'solidarity'
    ],
    'intergenerational_connection': [
      'young kids', 'children', 'youth', 'elder', 'grandmother', 'grandfather',
      'next generation', 'teaching young people', 'learning from elders'
    ]
  }

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    for (const [impactType, patterns] of Object.entries(impactPatterns)) {
      for (const pattern of patterns) {
        if (lowerSentence.includes(pattern.toLowerCase())) {
          const insight = createImpactInsight(
            impactType as any,
            sentence,
            pattern,
            text
          )
          if (insight) {
            insights.push(insight)
          }
          break // Only one insight per sentence per impact type
        }
      }
    }
  }

  return insights.slice(0, 10) // Limit to top 10 insights
}

function createImpactInsight(
  impactType: IndigenousImpactInsight['impactType'],
  sentence: string,
  matchedPattern: string,
  fullText: string
): IndigenousImpactInsight | null {

  // Get surrounding context
  const context = extractContext(sentence, fullText)

  // Calculate impact dimensions based on community values
  const impactDimensions = calculateImpactDimensions(sentence, impactType)

  // Identify sovereignty markers
  const sovereigntyMarkers = identifySovereigntyMarkers(sentence)

  // Extract transformation evidence
  const transformationEvidence = extractTransformationEvidence(sentence)

  return {
    impactType,
    evidence: {
      quote: sentence.trim(),
      context: context,
      confidence: calculateAnalysisConfidence(sentence, matchedPattern)
    },
    impactDimensions,
    sovereigntyMarkers,
    transformationEvidence,
    created_at: new Date().toISOString(),
    transcript_id: '', // Will be set by caller
  }
}

function calculateImpactDimensions(
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
    default:
      baseScores.communityEmpowerment = 0.5
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

function identifySovereigntyMarkers(sentence: string) {
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

function extractTransformationEvidence(sentence: string): string[] {
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

function extractContext(sentence: string, fullText: string): string {
  const sentences = fullText.split(/[.!?]+/)
  let currentIndex = -1

  // Find the sentence in the full text
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].includes(sentence.substring(0, 50))) {
      currentIndex = i
      break
    }
  }

  if (currentIndex === -1) return sentence

  // Get surrounding sentences for context
  const start = Math.max(0, currentIndex - 1)
  const end = Math.min(sentences.length, currentIndex + 2)

  return sentences.slice(start, end).join('. ').trim()
}

function calculateAnalysisConfidence(sentence: string, matchedPattern: string): number {
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
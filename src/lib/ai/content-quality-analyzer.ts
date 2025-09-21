/**
 * Comprehensive Content Quality Analyzer
 * Analyzes storyteller content for authenticity, quality, and improvement opportunities
 */

export interface ContentQualityScore {
  score: number // 1-10
  confidence: number // 0-100
  reasoning: string
  evidence: string[]
  recommendations: string[]
}

export interface AuthenticityAnalysis extends ContentQualityScore {
  aiGeneratedProbability: number // 0-100
  templateIndicators: string[]
  uniqueVoiceMarkers: string[]
  personalNarrativeElements: string[]
}

export interface CulturalSpecificityAnalysis extends ContentQualityScore {
  specificityLevel: 'generic' | 'some_detail' | 'culturally_rich' | 'deeply_specific'
  culturalElements: string[]
  geographicSpecificity: string[]
  traditionalKnowledgeDepth: number // 1-10
}

export interface PersonalNarrativeAnalysis extends ContentQualityScore {
  narrativeDepth: 'surface' | 'personal' | 'intimate' | 'profound'
  emotionalResonance: number // 1-10
  vulnerabilityLevel: number // 1-10
  storyArc: 'none' | 'simple' | 'complex' | 'masterful'
}

export interface FactualConsistencyAnalysis extends ContentQualityScore {
  consistencyIssues: Array<{
    type: 'timeline' | 'location' | 'relationship' | 'detail'
    description: string
    severity: 'minor' | 'moderate' | 'major'
  }>
  verifiableFacts: string[]
  potentialInaccuracies: string[]
}

export interface EmotionalResonanceAnalysis extends ContentQualityScore {
  emotionalTones: string[]
  impactPotential: number // 1-10
  communityRelevance: number // 1-10
  universalThemes: string[]
}

export interface ContentGapAnalysis {
  missingElements: Array<{
    element: string
    importance: 'low' | 'medium' | 'high' | 'critical'
    suggestion: string
  }>
  profileCompleteness: number // 0-100
  contentBalance: {
    personalStories: number
    culturalTeaching: number
    communityImpact: number
    historicalContext: number
  }
}

export interface ContentQualityAnalysis {
  storytellerId: string
  analyzedAt: string
  overallQuality: number // 1-10
  needsHumanReview: boolean

  // Core quality dimensions
  authenticity: AuthenticityAnalysis
  culturalSpecificity: CulturalSpecificityAnalysis
  personalNarrative: PersonalNarrativeAnalysis
  factualConsistency: FactualConsistencyAnalysis
  emotionalResonance: EmotionalResonanceAnalysis

  // Content analysis
  contentGaps: ContentGapAnalysis
  improvementPriorities: Array<{
    area: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    action: string
    expectedImpact: string
  }>

  // Source material quality
  sourceQuality: {
    transcriptCount: number
    storyCount: number
    averageLength: number
    qualityRating: number // 1-10
    authenticSourcePercentage: number
  }

  // Flags and recommendations
  flags: Array<{
    type: 'ai_generated' | 'template_content' | 'factual_issue' | 'cultural_concern' | 'incomplete_profile'
    severity: 'info' | 'warning' | 'error'
    message: string
    recommendation: string
  }>
}

export class ContentQualityAnalyzer {

  /**
   * Perform comprehensive content quality analysis
   */
  async analyzeComplete(data: {
    profile: any
    stories: any[]
    transcripts: any[]
  }): Promise<ContentQualityAnalysis> {
    const { profile, stories, transcripts } = data

    // Combine all content for analysis
    const allContent = this.extractTextContent(stories, transcripts, profile)

    // Perform individual analyses
    const authenticity = await this.analyzeAuthenticity(allContent, stories, transcripts)
    const culturalSpecificity = await this.analyzeCulturalSpecificity(allContent, profile)
    const personalNarrative = await this.analyzePersonalNarrative(allContent, stories)
    const factualConsistency = await this.analyzeFactualConsistency(allContent, profile)
    const emotionalResonance = await this.analyzeEmotionalResonance(allContent, stories)

    // Analyze content gaps
    const contentGaps = this.analyzeContentGaps(profile, stories, transcripts)

    // Calculate overall quality
    const overallQuality = this.calculateOverallQuality({
      authenticity,
      culturalSpecificity,
      personalNarrative,
      factualConsistency,
      emotionalResonance
    })

    // Generate improvement priorities
    const improvementPriorities = this.generateImprovementPriorities({
      authenticity,
      culturalSpecificity,
      personalNarrative,
      factualConsistency,
      emotionalResonance,
      contentGaps
    })

    // Analyze source quality
    const sourceQuality = this.analyzeSourceQuality(stories, transcripts)

    // Generate flags
    const flags = this.generateFlags({
      authenticity,
      culturalSpecificity,
      personalNarrative,
      factualConsistency,
      contentGaps,
      profile
    })

    return {
      storytellerId: profile.id,
      analyzedAt: new Date().toISOString(),
      overallQuality,
      needsHumanReview: overallQuality < 6 || flags.some(f => f.severity === 'error'),
      authenticity,
      culturalSpecificity,
      personalNarrative,
      factualConsistency,
      emotionalResonance,
      contentGaps,
      improvementPriorities,
      sourceQuality,
      flags
    }
  }

  /**
   * Extract and combine text content from all sources
   */
  private extractTextContent(stories: any[], transcripts: any[], profile: any): string {
    const content = []

    // Add profile bio
    if (profile.bio) content.push(profile.bio)

    // Add story content
    stories.forEach(story => {
      if (story.content) content.push(story.content)
      if (story.description) content.push(story.description)
    })

    // Add transcript content
    transcripts.forEach(transcript => {
      if (transcript.transcript_content) content.push(transcript.transcript_content)
    })

    return content.join('\n\n')
  }

  /**
   * Analyze content authenticity and AI generation probability
   */
  private async analyzeAuthenticity(
    content: string,
    stories: any[],
    transcripts: any[]
  ): Promise<AuthenticityAnalysis> {
    const aiIndicators = this.detectAIIndicators(content)
    const templateIndicators = this.detectTemplateContent(content)
    const uniqueVoiceMarkers = this.detectUniqueVoice(content)
    const personalElements = this.detectPersonalNarrative(content)

    // Calculate AI generation probability
    const aiGeneratedProbability = Math.min(
      (aiIndicators.length * 20) + (templateIndicators.length * 15),
      95
    )

    // Calculate authenticity score
    const authenticityScore = Math.max(
      1,
      10 - (aiGeneratedProbability / 10) + (uniqueVoiceMarkers.length * 0.5)
    )

    const recommendations = []
    if (aiGeneratedProbability > 60) {
      recommendations.push('Replace AI-generated content with authentic storyteller voice')
      recommendations.push('Conduct interview sessions to capture genuine stories')
    }
    if (templateIndicators.length > 3) {
      recommendations.push('Remove template language and generic phrases')
    }
    if (uniqueVoiceMarkers.length < 3) {
      recommendations.push('Capture more personal speaking patterns and unique expressions')
    }

    return {
      score: Math.round(authenticityScore),
      confidence: 85,
      reasoning: `Analysis based on ${aiIndicators.length} AI indicators, ${templateIndicators.length} template markers, and ${uniqueVoiceMarkers.length} unique voice elements`,
      evidence: [...aiIndicators, ...templateIndicators, ...uniqueVoiceMarkers].slice(0, 10),
      recommendations,
      aiGeneratedProbability,
      templateIndicators,
      uniqueVoiceMarkers,
      personalNarrativeElements: personalElements
    }
  }

  /**
   * Analyze cultural specificity and depth
   */
  private async analyzeCulturalSpecificity(
    content: string,
    profile: any
  ): Promise<CulturalSpecificityAnalysis> {
    const culturalElements = this.extractCulturalElements(content)
    const geographicSpecificity = this.extractGeographicDetails(content)
    const traditionalKnowledge = this.assessTraditionalKnowledge(content)

    // Determine specificity level
    let specificityLevel: CulturalSpecificityAnalysis['specificityLevel']
    if (culturalElements.length > 8 && geographicSpecificity.length > 3) {
      specificityLevel = 'deeply_specific'
    } else if (culturalElements.length > 4) {
      specificityLevel = 'culturally_rich'
    } else if (culturalElements.length > 1) {
      specificityLevel = 'some_detail'
    } else {
      specificityLevel = 'generic'
    }

    const score = Math.min(10, 2 + (culturalElements.length * 0.8) + (geographicSpecificity.length * 0.5) + traditionalKnowledge)

    const recommendations = []
    if (specificityLevel === 'generic') {
      recommendations.push('Add specific cultural traditions, ceremonies, or practices')
      recommendations.push('Include geographic and community-specific details')
    }
    if (geographicSpecificity.length < 2) {
      recommendations.push('Add specific place names, landmarks, or geographic features')
    }
    if (traditionalKnowledge < 3) {
      recommendations.push('Include traditional knowledge, teachings, or cultural practices')
    }

    return {
      score: Math.round(score),
      confidence: 80,
      reasoning: `Found ${culturalElements.length} cultural elements, ${geographicSpecificity.length} geographic details, traditional knowledge score ${traditionalKnowledge}`,
      evidence: [...culturalElements, ...geographicSpecificity].slice(0, 10),
      recommendations,
      specificityLevel,
      culturalElements,
      geographicSpecificity,
      traditionalKnowledgeDepth: traditionalKnowledge
    }
  }

  /**
   * Analyze personal narrative depth and emotional connection
   */
  private async analyzePersonalNarrative(
    content: string,
    stories: any[]
  ): Promise<PersonalNarrativeAnalysis> {
    const emotionalMarkers = this.detectEmotionalContent(content)
    const vulnerabilityIndicators = this.detectVulnerability(content)
    const narrativeStructure = this.analyzeNarrativeStructure(content)

    // Determine narrative depth
    let narrativeDepth: PersonalNarrativeAnalysis['narrativeDepth']
    if (vulnerabilityIndicators.length > 5 && emotionalMarkers.length > 8) {
      narrativeDepth = 'profound'
    } else if (vulnerabilityIndicators.length > 2 && emotionalMarkers.length > 4) {
      narrativeDepth = 'intimate'
    } else if (emotionalMarkers.length > 2) {
      narrativeDepth = 'personal'
    } else {
      narrativeDepth = 'surface'
    }

    const emotionalResonance = Math.min(10, 2 + (emotionalMarkers.length * 0.6))
    const vulnerabilityLevel = Math.min(10, vulnerabilityIndicators.length * 1.2)
    const score = (emotionalResonance + vulnerabilityLevel + narrativeStructure.score) / 3

    const recommendations = []
    if (narrativeDepth === 'surface') {
      recommendations.push('Encourage sharing of personal challenges and growth experiences')
      recommendations.push('Ask about emotional moments and turning points')
    }
    if (vulnerabilityLevel < 4) {
      recommendations.push('Create safe space for sharing vulnerable experiences')
    }

    return {
      score: Math.round(score),
      confidence: 75,
      reasoning: `Narrative depth: ${narrativeDepth}, emotional markers: ${emotionalMarkers.length}, vulnerability: ${vulnerabilityLevel}`,
      evidence: [...emotionalMarkers, ...vulnerabilityIndicators].slice(0, 8),
      recommendations,
      narrativeDepth,
      emotionalResonance: Math.round(emotionalResonance),
      vulnerabilityLevel: Math.round(vulnerabilityLevel),
      storyArc: narrativeStructure.type
    }
  }

  /**
   * Analyze factual consistency across content
   */
  private async analyzeFactualConsistency(
    content: string,
    profile: any
  ): Promise<FactualConsistencyAnalysis> {
    const consistencyIssues = this.detectInconsistencies(content, profile)
    const verifiableFacts = this.extractVerifiableFacts(content)
    const potentialInaccuracies = this.flagPotentialInaccuracies(content)

    const majorIssues = consistencyIssues.filter(i => i.severity === 'major').length
    const score = Math.max(1, 10 - (majorIssues * 2) - (consistencyIssues.length * 0.5))

    const recommendations = []
    if (consistencyIssues.length > 0) {
      recommendations.push('Review and resolve factual inconsistencies')
      recommendations.push('Verify timeline and relationship details')
    }
    if (verifiableFacts.length < 3) {
      recommendations.push('Add more specific, verifiable details')
    }

    return {
      score: Math.round(score),
      confidence: 70,
      reasoning: `Found ${consistencyIssues.length} consistency issues (${majorIssues} major), ${verifiableFacts.length} verifiable facts`,
      evidence: consistencyIssues.map(i => i.description).slice(0, 5),
      recommendations,
      consistencyIssues,
      verifiableFacts,
      potentialInaccuracies
    }
  }

  /**
   * Analyze emotional resonance and impact potential
   */
  private async analyzeEmotionalResonance(
    content: string,
    stories: any[]
  ): Promise<EmotionalResonanceAnalysis> {
    const emotionalTones = this.detectEmotionalTones(content)
    const universalThemes = this.extractUniversalThemes(content)
    const impactMarkers = this.detectImpactMarkers(content)

    const impactPotential = Math.min(10, 3 + (impactMarkers.length * 0.8) + (universalThemes.length * 0.5))
    const communityRelevance = Math.min(10, 4 + (emotionalTones.length * 0.6))
    const score = (impactPotential + communityRelevance) / 2

    const recommendations = []
    if (impactPotential < 6) {
      recommendations.push('Highlight community impact and social change elements')
      recommendations.push('Connect personal stories to broader themes')
    }
    if (emotionalTones.length < 3) {
      recommendations.push('Develop emotional depth and range in storytelling')
    }

    return {
      score: Math.round(score),
      confidence: 75,
      reasoning: `Impact potential: ${impactPotential}, community relevance: ${communityRelevance}, emotional range: ${emotionalTones.length}`,
      evidence: [...impactMarkers, ...universalThemes].slice(0, 8),
      recommendations,
      emotionalTones,
      impactPotential: Math.round(impactPotential),
      communityRelevance: Math.round(communityRelevance),
      universalThemes
    }
  }

  /**
   * Analyze content gaps and missing elements
   */
  private analyzeContentGaps(profile: any, stories: any[], transcripts: any[]): ContentGapAnalysis {
    const missingElements = []

    // Check profile completeness
    const profileFields = ['bio', 'cultural_background', 'languages_spoken', 'specialties']
    profileFields.forEach(field => {
      if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
        missingElements.push({
          element: `Profile ${field}`,
          importance: 'high' as const,
          suggestion: `Add detailed ${field.replace('_', ' ')} information`
        })
      }
    })

    // Check content balance
    const personalStories = stories.filter(s => this.isPersonalStory(s.content || '')).length
    const culturalContent = stories.filter(s => this.hasCulturalContent(s.content || '')).length
    const impactStories = stories.filter(s => this.hasImpactContent(s.content || '')).length

    if (personalStories === 0) {
      missingElements.push({
        element: 'Personal stories',
        importance: 'critical',
        suggestion: 'Add personal journey and life experience stories'
      })
    }

    if (culturalContent < 2) {
      missingElements.push({
        element: 'Cultural teaching content',
        importance: 'high',
        suggestion: 'Include traditional knowledge and cultural practices'
      })
    }

    if (impactStories === 0) {
      missingElements.push({
        element: 'Community impact stories',
        importance: 'high',
        suggestion: 'Share stories of community work and social change'
      })
    }

    const profileCompleteness = Math.max(0, 100 - (missingElements.length * 15))

    return {
      missingElements,
      profileCompleteness,
      contentBalance: {
        personalStories: Math.min(100, personalStories * 25),
        culturalTeaching: Math.min(100, culturalContent * 20),
        communityImpact: Math.min(100, impactStories * 25),
        historicalContext: Math.min(100, transcripts.length * 20)
      }
    }
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(scores: {
    authenticity: ContentQualityScore
    culturalSpecificity: ContentQualityScore
    personalNarrative: ContentQualityScore
    factualConsistency: ContentQualityScore
    emotionalResonance: ContentQualityScore
  }): number {
    const weights = {
      authenticity: 0.25,
      culturalSpecificity: 0.20,
      personalNarrative: 0.20,
      factualConsistency: 0.15,
      emotionalResonance: 0.20
    }

    const weightedScore = Object.entries(scores).reduce((sum, [key, analysis]) => {
      return sum + (analysis.score * weights[key as keyof typeof weights])
    }, 0)

    return Math.round(weightedScore * 10) / 10
  }

  /**
   * Generate improvement priorities
   */
  private generateImprovementPriorities(data: any): ContentQualityAnalysis['improvementPriorities'] {
    const priorities = []

    if (data.authenticity.score < 6) {
      priorities.push({
        area: 'Authenticity',
        priority: 'urgent' as const,
        action: 'Replace AI-generated content with authentic storyteller voice',
        expectedImpact: 'Dramatically improve profile credibility and connection'
      })
    }

    if (data.culturalSpecificity.score < 5) {
      priorities.push({
        area: 'Cultural Specificity',
        priority: 'high' as const,
        action: 'Add specific cultural traditions, places, and practices',
        expectedImpact: 'Increase cultural authenticity and educational value'
      })
    }

    if (data.personalNarrative.score < 6) {
      priorities.push({
        area: 'Personal Narrative',
        priority: 'high' as const,
        action: 'Develop deeper personal stories with emotional resonance',
        expectedImpact: 'Create stronger connections with readers'
      })
    }

    if (data.contentGaps.profileCompleteness < 70) {
      priorities.push({
        area: 'Profile Completeness',
        priority: 'medium' as const,
        action: 'Fill missing profile sections and content types',
        expectedImpact: 'Provide comprehensive storyteller representation'
      })
    }

    return priorities.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * Analyze source material quality
   */
  private analyzeSourceQuality(stories: any[], transcripts: any[]): ContentQualityAnalysis['sourceQuality'] {
    const totalWords = stories.reduce((sum, s) => sum + (s.word_count || 0), 0) +
                      transcripts.reduce((sum, t) => sum + (t.word_count || 0), 0)

    const averageLength = (stories.length + transcripts.length) > 0 ?
      totalWords / (stories.length + transcripts.length) : 0

    const authenticSources = transcripts.filter(t => t.status === 'completed').length +
                           stories.filter(s => !s.ai_processed).length

    const authenticSourcePercentage = (stories.length + transcripts.length) > 0 ?
      (authenticSources / (stories.length + transcripts.length)) * 100 : 0

    const qualityRating = Math.min(10,
      (averageLength / 200) + // Length factor
      (authenticSourcePercentage / 20) + // Authenticity factor
      Math.min(3, transcripts.length * 0.5) // Source diversity
    )

    return {
      transcriptCount: transcripts.length,
      storyCount: stories.length,
      averageLength: Math.round(averageLength),
      qualityRating: Math.round(qualityRating * 10) / 10,
      authenticSourcePercentage: Math.round(authenticSourcePercentage)
    }
  }

  /**
   * Generate flags for content issues
   */
  private generateFlags(data: any): ContentQualityAnalysis['flags'] {
    const flags = []

    if (data.authenticity.aiGeneratedProbability > 70) {
      flags.push({
        type: 'ai_generated' as const,
        severity: 'error' as const,
        message: 'High probability of AI-generated content detected',
        recommendation: 'Replace with authentic storyteller content through interviews'
      })
    }

    if (data.authenticity.templateIndicators.length > 5) {
      flags.push({
        type: 'template_content' as const,
        severity: 'warning' as const,
        message: 'Significant template language detected',
        recommendation: 'Rewrite in storyteller\'s authentic voice'
      })
    }

    if (data.factualConsistency.consistencyIssues.some(i => i.severity === 'major')) {
      flags.push({
        type: 'factual_issue' as const,
        severity: 'error' as const,
        message: 'Major factual inconsistencies found',
        recommendation: 'Review and correct factual discrepancies'
      })
    }

    if (data.culturalSpecificity.specificityLevel === 'generic') {
      flags.push({
        type: 'cultural_concern' as const,
        severity: 'warning' as const,
        message: 'Content lacks cultural specificity',
        recommendation: 'Add specific cultural elements and traditional knowledge'
      })
    }

    if (data.contentGaps.profileCompleteness < 50) {
      flags.push({
        type: 'incomplete_profile' as const,
        severity: 'warning' as const,
        message: 'Profile is significantly incomplete',
        recommendation: 'Fill missing sections and add diverse content types'
      })
    }

    return flags
  }

  // Helper methods for content analysis
  private detectAIIndicators(content: string): string[] {
    const indicators = [
      'as an AI', 'I am an AI', 'furthermore', 'moreover', 'in conclusion',
      'it is important to note', 'this highlights the importance',
      'it should be mentioned', 'one could argue', 'it is worth noting'
    ]

    return indicators.filter(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    )
  }

  private detectTemplateContent(content: string): string[] {
    const templates = [
      '[insert', '[your', '[name]', '[organisation]', '[location]',
      'lorem ipsum', 'placeholder', 'example text', 'sample content'
    ]

    return templates.filter(template =>
      content.toLowerCase().includes(template.toLowerCase())
    )
  }

  private detectUniqueVoice(content: string): string[] {
    const patterns = [
      /\b(you know|like|um|eh|hey|well)\b/gi, // Conversational markers
      /\b(my (grandma|grandmother|kokum|nooko))\b/gi, // Personal relationships
      /\b(back (home|then)|growing up)\b/gi, // Personal history markers
      /\b(I (remember|recall|think))\b/gi // Personal reflection
    ]

    const matches = []
    patterns.forEach(pattern => {
      const found = content.match(pattern)
      if (found) matches.push(...found)
    })

    return [...new Set(matches)].slice(0, 10)
  }

  private detectPersonalNarrative(content: string): string[] {
    const patterns = [
      /\b(my|our|I|we) (family|children|parents|community)\b/gi,
      /\b(when I was|growing up|as a child)\b/gi,
      /\b(my (journey|story|experience))\b/gi
    ]

    const matches = []
    patterns.forEach(pattern => {
      const found = content.match(pattern)
      if (found) matches.push(...found)
    })

    return [...new Set(matches)]
  }

  private extractCulturalElements(content: string): string[] {
    const elements = [
      'ceremony', 'traditional', 'elder', 'medicine wheel', 'powwow',
      'smudging', 'sacred', 'spirit', 'ancestor', 'tribal', 'nation',
      'reservation', 'treaty', 'band', 'clan', 'lodge', 'circle'
    ]

    return elements.filter(element =>
      content.toLowerCase().includes(element.toLowerCase())
    )
  }

  private extractGeographicDetails(content: string): string[] {
    const patterns = [
      /\b[A-Z][a-z]+ (River|Lake|Mountain|Creek|Valley|Reserve|Nation)\b/g,
      /\b(on the|near the|from the) [A-Z][a-z]+/g
    ]

    const matches = []
    patterns.forEach(pattern => {
      const found = content.match(pattern)
      if (found) matches.push(...found)
    })

    return [...new Set(matches)].slice(0, 5)
  }

  private assessTraditionalKnowledge(content: string): number {
    const knowledge = [
      'traditional knowledge', 'teachings', 'oral tradition', 'language',
      'healing', 'plants', 'seasons', 'stories', 'legends', 'customs'
    ]

    return knowledge.filter(k => content.toLowerCase().includes(k)).length
  }

  private detectEmotionalContent(content: string): string[] {
    const emotions = [
      'love', 'proud', 'grateful', 'sad', 'happy', 'angry', 'hurt',
      'healing', 'struggle', 'overcome', 'challenge', 'growth', 'hope'
    ]

    return emotions.filter(emotion =>
      content.toLowerCase().includes(emotion.toLowerCase())
    )
  }

  private detectVulnerability(content: string): string[] {
    const patterns = [
      /\b(difficult|hard|painful|challenging|lost|grief|trauma)\b/gi,
      /\b(I (struggled|failed|learned|grew))\b/gi
    ]

    const matches = []
    patterns.forEach(pattern => {
      const found = content.match(pattern)
      if (found) matches.push(...found)
    })

    return [...new Set(matches)]
  }

  private analyzeNarrativeStructure(content: string): { score: number, type: PersonalNarrativeAnalysis['storyArc'] } {
    const hasBeginning = /\b(started|began|first|initially)\b/i.test(content)
    const hasMiddle = /\b(then|during|while|after)\b/i.test(content)
    const hasEnd = /\b(finally|eventually|now|today)\b/i.test(content)
    const hasConflict = /\b(challenge|problem|difficult|struggle)\b/i.test(content)
    const hasResolution = /\b(learned|overcome|found|realised)\b/i.test(content)

    const elements = [hasBeginning, hasMiddle, hasEnd, hasConflict, hasResolution].filter(Boolean).length

    let type: PersonalNarrativeAnalysis['storyArc']
    if (elements >= 4) type = 'masterful'
    else if (elements >= 3) type = 'complex'
    else if (elements >= 2) type = 'simple'
    else type = 'none'

    return { score: elements * 2, type }
  }

  private detectInconsistencies(content: string, profile: any): FactualConsistencyAnalysis['consistencyIssues'] {
    // This would need more sophisticated NLP in production
    return []
  }

  private extractVerifiableFacts(content: string): string[] {
    const patterns = [
      /\b\d{4}\b/g, // Years
      /\b[A-Z][a-z]+ (University|College|School)\b/g, // Educational institutions
      /\b[A-Z][a-z]+ (Nation|Band|Tribe)\b/g // Indigenous nations
    ]

    const matches = []
    patterns.forEach(pattern => {
      const found = content.match(pattern)
      if (found) matches.push(...found)
    })

    return [...new Set(matches)].slice(0, 5)
  }

  private flagPotentialInaccuracies(content: string): string[] {
    // Placeholder for more sophisticated fact-checking
    return []
  }

  private detectEmotionalTones(content: string): string[] {
    const tones = [
      'hopeful', 'resilient', 'reflective', 'proud', 'concerned',
      'passionate', 'determined', 'nostalgic', 'empowering'
    ]

    return tones.filter(tone =>
      content.toLowerCase().includes(tone.toLowerCase())
    )
  }

  private extractUniversalThemes(content: string): string[] {
    const themes = [
      'family', 'community', 'identity', 'belonging', 'resilience',
      'growth', 'healing', 'justice', 'tradition', 'change'
    ]

    return themes.filter(theme =>
      content.toLowerCase().includes(theme.toLowerCase())
    )
  }

  private detectImpactMarkers(content: string): string[] {
    const markers = [
      'change', 'impact', 'difference', 'helped', 'community',
      'advocate', 'leader', 'mentor', 'teach', 'inspire'
    ]

    return markers.filter(marker =>
      content.toLowerCase().includes(marker.toLowerCase())
    )
  }

  private isPersonalStory(content: string): boolean {
    return /\b(my|I|our|we) (story|journey|experience|life)/i.test(content)
  }

  private hasCulturalContent(content: string): boolean {
    return /\b(traditional|cultural|ceremony|teaching|elder)/i.test(content)
  }

  private hasImpactContent(content: string): boolean {
    return /\b(community|change|impact|helped|advocate|leader)/i.test(content)
  }
}
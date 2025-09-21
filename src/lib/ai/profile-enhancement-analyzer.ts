/**
 * AI-Powered Profile Enhancement Analyzer
 * Analyzes storyteller content to suggest missing profile information
 */

export interface ProfileAnalysis {
  storytellerId: string
  confidence: number
  suggestions: {
    cultural_background?: string[]
    specialties?: string[]
    expertise_areas?: string[]
    preferred_topics?: string[]
    storytelling_style?: string[]
    community_roles?: string[]
    impact_focus_areas?: string[]
    languages?: string[]
  }
  evidence: {
    [key: string]: {
      source: 'transcript' | 'story' | 'existing_profile'
      content: string
      confidence: number
    }[]
  }
  missingFields: string[]
  completenessScore: number
}

export interface ProfileSuggestion {
  field: string
  value: string
  confidence: number
  reasoning: string
  evidence: string[]
  shouldApply: boolean
}

export class ProfileEnhancementAnalyzer {

  /**
   * Analyze storyteller profile and content to generate enhancement suggestions
   */
  static async analyzeProfile(
    profile: any,
    transcripts: any[],
    stories: any[]
  ): Promise<ProfileAnalysis> {
    const storytellerId = profile.id

    // Combine all content for analysis
    const allContent = [
      ...(transcripts || []).map(t => ({
        type: 'transcript',
        content: t.content || '',
        metadata: t.metadata,
        id: t.id
      })),
      ...(stories || []).map(s => ({
        type: 'story',
        content: s.content || '',
        themes: s.themes,
        id: s.id
      }))
    ]

    const contentText = allContent.map(item => item.content).join('\n')

    // Analyze missing fields
    const missingFields = this.identifyMissingFields(profile)

    // Generate suggestions for each missing field
    const suggestions = await this.generateSuggestions(profile, allContent, missingFields)

    // Calculate completeness score
    const completenessScore = this.calculateCompletenessScore(profile, suggestions)

    // Generate evidence mapping
    const evidence = this.generateEvidence(allContent, suggestions)

    return {
      storytellerId,
      confidence: this.calculateOverallConfidence(suggestions),
      suggestions,
      evidence,
      missingFields,
      completenessScore
    }
  }

  /**
   * Identify which profile fields are missing or incomplete
   */
  private static identifyMissingFields(profile: any): string[] {
    const fields = [
      'cultural_background',
      'specialties',
      'expertise_areas',
      'preferred_topics',
      'storytelling_style',
      'community_roles',
      'impact_focus_areas',
      'languages',
      'years_of_experience',
      'cultural_affiliations'
    ]

    return fields.filter(field => {
      const value = profile[field]
      return !value ||
             (Array.isArray(value) && value.length === 0) ||
             (typeof value === 'string' && value.trim().length === 0)
    })
  }

  /**
   * Generate AI suggestions for missing profile fields
   */
  private static async generateSuggestions(
    profile: any,
    content: any[],
    missingFields: string[]
  ): Promise<ProfileAnalysis['suggestions']> {
    const suggestions: ProfileAnalysis['suggestions'] = {}

    for (const field of missingFields) {
      const fieldSuggestions = await this.analyzeSingleField(field, content, profile)
      if (fieldSuggestions.length > 0) {
        suggestions[field as keyof ProfileAnalysis['suggestions']] = fieldSuggestions
      }
    }

    return suggestions
  }

  /**
   * Analyze content for a specific profile field
   */
  private static async analyzeSingleField(
    field: string,
    content: any[],
    profile: any
  ): Promise<string[]> {
    const contentText = content.map(item => item.content).join('\n').toLowerCase()

    switch (field) {
      case 'cultural_background':
        return this.extractCulturalBackground(contentText, content)

      case 'specialties':
        return this.extractSpecialties(contentText, content)

      case 'expertise_areas':
        return this.extractExpertiseAreas(contentText, content)

      case 'preferred_topics':
        return this.extractPreferredTopics(contentText, content)

      case 'storytelling_style':
        return this.extractStorytellingStyle(contentText, content)

      case 'community_roles':
        return this.extractCommunityRoles(contentText, content)

      case 'impact_focus_areas':
        return this.extractImpactFocusAreas(contentText, content)

      case 'languages':
        return this.extractLanguages(contentText, content)

      default:
        return []
    }
  }

  /**
   * Extract cultural background from content
   */
  private static extractCulturalBackground(contentText: string, content: any[]): string[] {
    const culturalKeywords = [
      // Indigenous groups
      'ojibwe', 'lakota', 'cherokee', 'navajo', 'cree', 'inuit', 'metis',
      'aboriginal', 'first nations', 'native american', 'indigenous',
      // Geographic/cultural regions
      'plains', 'woodland', 'coastal', 'arctic', 'southwest', 'northeast',
      // Cultural terms
      'tribal', 'nation', 'band', 'reservation', 'traditional territory'
    ]

    const found = []
    for (const keyword of culturalKeywords) {
      if (contentText.includes(keyword)) {
        found.push(this.capitalizeWords(keyword))
      }
    }

    // Check transcript metadata for additional cultural information
    for (const item of content) {
      if (item.metadata?.analysis?.cultural_context) {
        found.push(...item.metadata.analysis.cultural_context)
      }
    }

    return [...new Set(found)].slice(0, 3)
  }

  /**
   * Extract specialties from content
   */
  private static extractSpecialties(contentText: string, content: any[]): string[] {
    const specialtyPatterns = [
      // Traditional practices
      'traditional healing', 'ceremony', 'ritual', 'spiritual practices',
      'traditional medicine', 'herbalism', 'plant medicine',
      // Arts and crafts
      'beadwork', 'pottery', 'weaving', 'carving', 'drummaking',
      'traditional arts', 'craftwork', 'textile arts',
      // Knowledge areas
      'oral history', 'traditional knowledge', 'cultural teachings',
      'language preservation', 'storytelling', 'genealogy',
      // Community roles
      'elder teaching', 'youth mentorship', 'community organising',
      'cultural preservation', 'activism', 'advocacy'
    ]

    const found = []
    for (const pattern of specialtyPatterns) {
      if (contentText.includes(pattern.toLowerCase())) {
        found.push(this.capitalizeWords(pattern))
      }
    }

    return [...new Set(found)].slice(0, 5)
  }

  /**
   * Extract expertise areas from content
   */
  private static extractExpertiseAreas(contentText: string, content: any[]): string[] {
    const expertisePatterns = [
      'education', 'healthcare', 'social work', 'community development',
      'legal advocacy', 'environmental protection', 'cultural preservation',
      'language revitalization', 'traditional knowledge', 'youth development',
      'elder care', 'substance abuse counseling', 'trauma healing',
      'restorative justice', 'land rights', 'treaty rights'
    ]

    const found = []
    for (const pattern of expertisePatterns) {
      if (contentText.includes(pattern.toLowerCase())) {
        found.push(this.capitalizeWords(pattern))
      }
    }

    return [...new Set(found)].slice(0, 4)
  }

  /**
   * Extract preferred topics from content themes
   */
  private static extractPreferredTopics(contentText: string, content: any[]): string[] {
    const topics = new Set<string>()

    // Extract from transcript analysis
    for (const item of content) {
      if (item.metadata?.analysis?.themes) {
        topics.add(...item.metadata.analysis.themes)
      }
      if (item.themes) {
        topics.add(...item.themes)
      }
    }

    return Array.from(topics).slice(0, 6)
  }

  /**
   * Extract storytelling style from content
   */
  private static extractStorytellingStyle(contentText: string, content: any[]): string[] {
    const styleIndicators = [
      'personal narrative', 'oral tradition', 'ceremonial storytelling',
      'historical accounts', 'family stories', 'creation stories',
      'teaching stories', 'healing narratives', 'community stories'
    ]

    const found = []
    for (const style of styleIndicators) {
      if (contentText.includes(style.toLowerCase())) {
        found.push(this.capitalizeWords(style))
      }
    }

    // Analyze story structure and content type
    if (content.some(item => item.content && item.content.length > 1000)) {
      found.push('Detailed Narratives')
    }
    if (content.some(item => item.content && /\b(I|my|we|our)\b/i.test(item.content))) {
      found.push('Personal Stories')
    }

    return [...new Set(found)].slice(0, 3)
  }

  /**
   * Extract community roles from content
   */
  private static extractCommunityRoles(contentText: string, content: any[]): string[] {
    const rolePatterns = [
      'elder', 'teacher', 'mentor', 'advisor', 'leader', 'organizer',
      'activist', 'advocate', 'healer', 'keeper', 'guardian',
      'council member', 'board member', 'volunteer', 'coordinator'
    ]

    const found = []
    for (const role of rolePatterns) {
      if (contentText.includes(role.toLowerCase())) {
        found.push(this.capitalizeWords(role))
      }
    }

    return [...new Set(found)].slice(0, 4)
  }

  /**
   * Extract impact focus areas from content
   */
  private static extractImpactFocusAreas(contentText: string, content: any[]): string[] {
    const impactAreas = [
      'cultural preservation', 'language revitalization', 'youth development',
      'education', 'healthcare', 'environmental protection', 'land rights',
      'social justice', 'community development', 'economic development',
      'traditional knowledge', 'healing practices', 'family support'
    ]

    const found = []
    for (const area of impactAreas) {
      if (contentText.includes(area.toLowerCase())) {
        found.push(this.capitalizeWords(area))
      }
    }

    return [...new Set(found)].slice(0, 5)
  }

  /**
   * Extract languages from content
   */
  private static extractLanguages(contentText: string, content: any[]): string[] {
    const languagePatterns = [
      'english', 'spanish', 'french', 'ojibwe', 'cree', 'lakota',
      'cherokee', 'navajo', 'inuktitut', 'mi\'kmaq', 'mohawk'
    ]

    const found = ['English'] // Default assumption
    for (const lang of languagePatterns) {
      if (contentText.includes(lang.toLowerCase()) && lang !== 'english') {
        found.push(this.capitalizeWords(lang))
      }
    }

    return [...new Set(found)].slice(0, 3)
  }

  /**
   * Generate evidence mapping for suggestions
   */
  private static generateEvidence(
    content: any[],
    suggestions: ProfileAnalysis['suggestions']
  ): ProfileAnalysis['evidence'] {
    const evidence: ProfileAnalysis['evidence'] = {}

    for (const [field, values] of Object.entries(suggestions)) {
      evidence[field] = []

      for (const value of values || []) {
        const relatedContent = content.filter(item =>
          item.content?.toLowerCase().includes(value.toLowerCase())
        )

        evidence[field].push(...relatedContent.map(item => ({
          source: item.type as 'transcript' | 'story',
          content: item.content.substring(0, 200) + '...',
          confidence: 0.8
        })))
      }
    }

    return evidence
  }

  /**
   * Calculate overall confidence score
   */
  private static calculateOverallConfidence(suggestions: ProfileAnalysis['suggestions']): number {
    const suggestionCount = Object.values(suggestions).reduce(
      (total, values) => total + (values?.length || 0), 0
    )

    return Math.min(suggestionCount * 15, 95)
  }

  /**
   * Calculate profile completeness score
   */
  private static calculateCompletenessScore(
    profile: any,
    suggestions: ProfileAnalysis['suggestions']
  ): number {
    const totalFields = 10
    const completedFields = totalFields - Object.keys(suggestions).length
    return Math.round((completedFields / totalFields) * 100)
  }

  /**
   * Utility: Capitalize words
   */
  private static capitalizeWords(str: string): string {
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  /**
   * Generate bulk profile update suggestions for multiple storytellers
   */
  static async generateBulkSuggestions(storytellers: any[]): Promise<{
    storytellerId: string
    suggestions: ProfileSuggestion[]
  }[]> {
    const results = []

    for (const storyteller of storytellers) {
      // In production, would fetch actual transcripts and stories
      const mockTranscripts = []
      const mockStories = []

      const analysis = await this.analyzeProfile(storyteller, mockTranscripts, mockStories)

      const suggestions: ProfileSuggestion[] = []
      for (const [field, values] of Object.entries(analysis.suggestions)) {
        for (const value of values || []) {
          suggestions.push({
            field,
            value,
            confidence: 80,
            reasoning: `Found evidence of "${value}" in storyteller content`,
            evidence: [`Content analysis from ${analysis.evidence[field]?.length || 0} sources`],
            shouldApply: false
          })
        }
      }

      results.push({
        storytellerId: storyteller.id,
        suggestions
      })
    }

    return results
  }
}
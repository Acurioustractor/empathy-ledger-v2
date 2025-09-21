import { STORY_TEMPLATES, StoryTemplate } from '@/components/stories/StoryTemplates'

export interface TranscriptAnalysis {
  suggestedTemplate: StoryTemplate
  confidence: number
  reasoning: string
  keyThemes: string[]
  culturalSensitivity: 'standard' | 'medium' | 'high' | 'restricted'
  suggestedSections: {
    templateSection: string
    transcriptText: string
    startIndex: number
    endIndex: number
    confidence: number
  }[]
  metadata: {
    wordCount: number
    estimatedReadTime: number
    emotionalTone: 'positive' | 'neutral' | 'reflective' | 'challenging'
    timeReferences: string[]
    peopleReferences: string[]
    locationReferences: string[]
  }
}

export interface TranscriptSegment {
  text: string
  startTime?: number
  endTime?: number
  speaker?: string
  confidence?: number
}

export class TranscriptAnalyzer {
  private keywordMap = {
    'personal': [
      'i', 'me', 'my', 'myself', 'personal', 'experience', 'journey', 'life', 'grew up',
      'childhood', 'remember', 'learned', 'overcome', 'challenge', 'difficult', 'changed'
    ],
    'family': [
      'family', 'mother', 'father', 'grandmother', 'grandfather', 'parents', 'siblings',
      'children', 'tradition', 'heritage', 'passed down', 'generations', 'ancestors',
      'family story', 'relatives', 'bloodline', 'lineage'
    ],
    'cultural': [
      'culture', 'traditional', 'ceremony', 'ritual', 'sacred', 'spiritual', 'elder',
      'community', 'ancestors', 'teachings', 'wisdom', 'customs', 'beliefs',
      'indigenous', 'tribal', 'heritage', 'sacred knowledge', 'cultural practices'
    ],
    'community': [
      'community', 'neighborhood', 'together', 'collective', 'group', 'organisation',
      'volunteer', 'help', 'support', 'local', 'town', 'city', 'residents',
      'collaboration', 'teamwork', 'unity', 'social change'
    ],
    'professional': [
      'work', 'job', 'career', 'business', 'company', 'office', 'professional',
      'colleague', 'boss', 'employee', 'workplace', 'industry', 'skills',
      'leadership', 'management', 'project', 'team'
    ],
    'healing': [
      'healing', 'recovery', 'overcome', 'struggle', 'pain', 'loss', 'grief',
      'therapy', 'support', 'growth', 'resilience', 'strength', 'hope',
      'depression', 'anxiety', 'trauma', 'survivor', 'wellness'
    ]
  }

  private culturalSensitivityMarkers = {
    'high': [
      'sacred', 'ceremony', 'ritual', 'spiritual', 'traditional knowledge',
      'elder teachings', 'ancestral', 'indigenous practices', 'cultural protocols'
    ],
    'restricted': [
      'sacred ceremony', 'initiation', 'men\'s business', 'women\'s business',
      'secret knowledge', 'restricted information', 'elder only', 'ceremonial secrets'
    ],
    'medium': [
      'family tradition', 'cultural practice', 'community ceremony', 'heritage',
      'cultural background', 'traditional way', 'cultural identity'
    ]
  }

  analyzeTranscript(transcript: string | TranscriptSegment[]): TranscriptAnalysis {
    const text = this.extractText(transcript)
    const words = this.tokenize(text.toLowerCase())

    // Analyze themes and suggest template
    const themeScores = this.calculateThemeScores(words)
    const suggestedTemplate = this.selectBestTemplate(themeScores)

    // Determine cultural sensitivity
    const culturalSensitivity = this.assessCulturalSensitivity(text)

    // Extract key themes
    const keyThemes = this.extractKeyThemes(text, words)

    // Suggest story sections
    const suggestedSections = this.mapToTemplateSections(text, suggestedTemplate)

    // Generate metadata
    const metadata = this.generateMetadata(text)

    return {
      suggestedTemplate,
      confidence: Math.max(...Object.values(themeScores)) * 100,
      reasoning: this.generateReasoning(themeScores, suggestedTemplate),
      keyThemes,
      culturalSensitivity,
      suggestedSections,
      metadata
    }
  }

  private extractText(transcript: string | TranscriptSegment[]): string {
    if (typeof transcript === 'string') {
      return transcript
    }
    return transcript.map(segment => segment.text).join(' ')
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  private calculateThemeScores(words: string[]): Record<string, number> {
    const scores: Record<string, number> = {
      personal: 0,
      family: 0,
      cultural: 0,
      community: 0,
      professional: 0,
      healing: 0
    }

    const wordSet = new Set(words)
    const totalWords = words.length

    Object.entries(this.keywordMap).forEach(([theme, keywords]) => {
      let matchCount = 0
      keywords.forEach(keyword => {
        if (wordSet.has(keyword) || words.some(word => word.includes(keyword))) {
          matchCount++
        }
      })
      scores[theme] = matchCount / Math.max(totalWords * 0.01, keywords.length) // Normalized score
    })

    return scores
  }

  private selectBestTemplate(themeScores: Record<string, number>): StoryTemplate {
    const topTheme = Object.entries(themeScores).reduce((max, [theme, score]) =>
      score > max.score ? { theme, score } : max
    , { theme: 'personal', score: 0 }).theme

    // Map themes to templates
    const themeToTemplate: Record<string, string> = {
      'personal': 'personal-journey',
      'family': 'family-heritage',
      'cultural': 'cultural-tradition',
      'community': 'community-story',
      'professional': 'professional-journey',
      'healing': 'healing-recovery'
    }

    const templateId = themeToTemplate[topTheme] || 'personal-journey'
    return STORY_TEMPLATES.find(t => t.id === templateId) || STORY_TEMPLATES[0]
  }

  private assessCulturalSensitivity(text: string): 'standard' | 'medium' | 'high' | 'restricted' {
    const lowerText = text.toLowerCase()

    // Check for restricted content
    for (const marker of this.culturalSensitivityMarkers.restricted) {
      if (lowerText.includes(marker)) {
        return 'restricted'
      }
    }

    // Check for high sensitivity
    for (const marker of this.culturalSensitivityMarkers.high) {
      if (lowerText.includes(marker)) {
        return 'high'
      }
    }

    // Check for medium sensitivity
    for (const marker of this.culturalSensitivityMarkers.medium) {
      if (lowerText.includes(marker)) {
        return 'medium'
      }
    }

    return 'standard'
  }

  private extractKeyThemes(text: string, words: string[]): string[] {
    const themes: string[] = []

    // Extract common themes based on frequency and context
    const themePatterns = {
      'Personal Growth': /\b(learn|grow|change|develop|transform|overcome)\w*\b/gi,
      'Family & Relationships': /\b(family|parent|child|friend|relationship|love|support)\w*\b/gi,
      'Cultural Heritage': /\b(tradition|culture|heritage|ancestor|ritual|ceremony)\w*\b/gi,
      'Community': /\b(community|neighbour|together|collective|group|social)\w*\b/gi,
      'Challenges': /\b(difficult|hard|struggle|problem|challenge|obstacle)\w*\b/gi,
      'Success & Achievement': /\b(success|achieve|accomplish|proud|win|goal)\w*\b/gi,
      'Wisdom & Learning': /\b(wisdom|knowledge|learn|teach|understand|realise)\w*\b/gi
    }

    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      const matches = text.match(pattern)
      if (matches && matches.length >= 3) {
        themes.push(theme)
      }
    })

    return themes
  }

  private mapToTemplateSections(text: string, template: StoryTemplate): TranscriptAnalysis['suggestedSections'] {
    const sections: TranscriptAnalysis['suggestedSections'] = []
    const sentences = this.splitIntoSentences(text)

    // Simple section mapping based on template prompts
    template.prompts.forEach((prompt, index) => {
      const relevantSentences = this.findRelevantSentences(sentences, prompt.title, index)
      if (relevantSentences.length > 0) {
        const startIndex = text.indexOf(relevantSentences[0])
        const endIndex = startIndex + relevantSentences.join(' ').length

        sections.push({
          templateSection: prompt.title,
          transcriptText: relevantSentences.join(' '),
          startIndex,
          endIndex,
          confidence: 0.7 + (relevantSentences.length * 0.1) // Simple confidence scoring
        })
      }
    })

    return sections
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
  }

  private findRelevantSentences(sentences: string[], sectionTitle: string, sectionIndex: number): string[] {
    // Simple heuristic: divide text into sections based on template structure
    const sectionSize = Math.ceil(sentences.length / 4)
    const startIndex = sectionIndex * sectionSize
    const endIndex = Math.min(startIndex + sectionSize, sentences.length)

    return sentences.slice(startIndex, endIndex)
  }

  private generateMetadata(text: string): TranscriptAnalysis['metadata'] {
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const estimatedReadTime = Math.ceil(words.length / 200) // 200 WPM average

    // Extract time references
    const timeReferences = this.extractTimeReferences(text)

    // Extract people references
    const peopleReferences = this.extractPeopleReferences(text)

    // Extract location references
    const locationReferences = this.extractLocationReferences(text)

    // Assess emotional tone
    const emotionalTone = this.assessEmotionalTone(text)

    return {
      wordCount: words.length,
      estimatedReadTime,
      emotionalTone,
      timeReferences,
      peopleReferences,
      locationReferences
    }
  }

  private extractTimeReferences(text: string): string[] {
    const timePatterns = [
      /\b\d{4}\b/g, // Years
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
      /\b(childhood|youth|teenage|adult|elderly|young|old)\b/gi,
      /\b(years? ago|months? ago|decades? ago)\b/gi
    ]

    const references: string[] = []
    timePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        references.push(...matches)
      }
    })

    return [...new Set(references)].slice(0, 10) // Limit to 10 unique references
  }

  private extractPeopleReferences(text: string): string[] {
    const peoplePatterns = [
      /\b(mother|father|mom|dad|grandmother|grandfather|grandma|grandpa|sister|brother)\b/gi,
      /\b(teacher|doctor|friend|colleague|neighbour|boss|mentor|elder)\b/gi,
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g // Simple name pattern
    ]

    const references: string[] = []
    peoplePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        references.push(...matches)
      }
    })

    return [...new Set(references)].slice(0, 10)
  }

  private extractLocationReferences(text: string): string[] {
    const locationPatterns = [
      /\b(home|house|school|work|office|hospital|church|community centre)\b/gi,
      /\b(city|town|village|country|state|province|region|territory)\b/gi,
      /\b[A-Z][a-z]+ (City|Town|Village|County|State|Province)\b/g
    ]

    const references: string[] = []
    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        references.push(...matches)
      }
    })

    return [...new Set(references)].slice(0, 10)
  }

  private assessEmotionalTone(text: string): 'positive' | 'neutral' | 'reflective' | 'challenging' {
    const positiveWords = ['happy', 'joy', 'success', 'love', 'proud', 'wonderful', 'amazing', 'grateful']
    const challengingWords = ['difficult', 'hard', 'struggle', 'pain', 'loss', 'sad', 'angry', 'frustrated']
    const reflectiveWords = ['remember', 'think', 'reflect', 'consider', 'understand', 'realise', 'learned']

    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const challengingCount = challengingWords.filter(word => lowerText.includes(word)).length
    const reflectiveCount = reflectiveWords.filter(word => lowerText.includes(word)).length

    if (challengingCount > positiveCount && challengingCount > reflectiveCount) {
      return 'challenging'
    } else if (positiveCount > challengingCount && positiveCount > reflectiveCount) {
      return 'positive'
    } else if (reflectiveCount > 0) {
      return 'reflective'
    }

    return 'neutral'
  }

  private generateReasoning(themeScores: Record<string, number>, template: StoryTemplate): string {
    const topThemes = Object.entries(themeScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)

    const topTheme = topThemes[0]?.[0] || 'personal'
    const topScore = topThemes[0]?.[1] || 0

    const reasons = []

    if (topScore > 0.3) {
      reasons.push(`Strong ${topTheme} narrative elements detected`)
    }

    if (template.culturalSensitivity !== 'standard') {
      reasons.push(`Cultural sensitivity markers suggest ${template.culturalSensitivity} level content`)
    }

    reasons.push(`Template structure aligns well with narrative flow`)

    return reasons.join('. ') + '.'
  }
}

// Export singleton instance
export const transcriptAnalyzer = new TranscriptAnalyzer()
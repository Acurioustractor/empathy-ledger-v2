import { StoryTemplate } from '@/components/stories/StoryTemplates'
import { TranscriptAnalysis } from './transcript-analyzer'

export interface StoryGenerationOptions {
  preserveVoice: boolean
  enhanceNarrative: boolean
  addTransitions: boolean
  culturalSensitivity: 'standard' | 'medium' | 'high' | 'restricted'
  tone: 'original' | 'formal' | 'conversational' | 'reflective'
  length: 'concise' | 'detailed' | 'comprehensive'
}

export interface GeneratedStorySection {
  title: string
  content: string
  originalText: string
  confidence: number
  suggestions: string[]
  culturalNotes?: string[]
}

export interface GeneratedStory {
  title: string
  sections: GeneratedStorySection[]
  metadata: {
    originalWordCount: number
    generatedWordCount: number
    compressionRatio: number
    readingTime: number
  }
  culturalGuidance: string[]
  reviewNotes: string[]
}

export class StoryGenerator {
  private culturalGuidelines = {
    'high': [
      'Consider seeking community elder review before publication',
      'Ensure proper protocols are followed for sharing cultural knowledge',
      'Respect traditional knowledge sharing practices'
    ],
    'restricted': [
      'This content requires elder approval before sharing',
      'Some cultural information may need to be modified or removed',
      'Consider the appropriate audience for this sacred knowledge'
    ],
    'medium': [
      'Be mindful of cultural context and representation',
      'Consider community perspectives on this content',
      'Ensure respectful portrayal of cultural elements'
    ],
    'standard': [
      'Maintain respectful tone throughout the narrative',
      'Consider privacy of individuals mentioned in the story'
    ]
  }

  async generateStoryFromTranscript(
    transcript: string,
    analysis: TranscriptAnalysis,
    options: StoryGenerationOptions
  ): Promise<GeneratedStory> {
    // Generate title
    const title = this.generateTitle(transcript, analysis, options)

    // Generate sections based on template
    const sections = await this.generateSections(transcript, analysis, options)

    // Calculate metadata
    const metadata = this.calculateMetadata(transcript, sections)

    // Generate cultural guidance
    const culturalGuidance = this.generateCulturalGuidance(analysis, options)

    // Generate review notes
    const reviewNotes = this.generateReviewNotes(analysis, sections, options)

    return {
      title,
      sections,
      metadata,
      culturalGuidance,
      reviewNotes
    }
  }

  private generateTitle(
    transcript: string,
    analysis: TranscriptAnalysis,
    options: StoryGenerationOptions
  ): string {
    // Extract potential title phrases from transcript
    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
    const keyThemes = analysis.keyThemes

    // Simple title generation based on themes and content
    const titleTemplates = {
      'personal': [
        'My Journey of {theme}',
        'Finding My Way: A Story of {theme}',
        'Lessons from My {theme} Experience',
        'The Path I Walked: {theme} and Growth'
      ],
      'family': [
        'Family Wisdom: Stories of {theme}',
        'Generations of {theme}',
        'The {theme} Legacy',
        'Family Traditions: {theme} Through Time'
      ],
      'cultural': [
        'Sacred {theme}: A Cultural Story',
        'Traditional Wisdom of {theme}',
        'Cultural Heritage: {theme} Teachings',
        'Honoring {theme} Traditions'
      ],
      'community': [
        'Together We {theme}',
        'Community Spirit: A Story of {theme}',
        'Building {theme} Together',
        'Our Shared {theme} Journey'
      ],
      'healing': [
        'Healing Through {theme}',
        'From {theme} to Strength',
        'The {theme} Journey to Wholeness',
        'Finding Hope in {theme}'
      ],
      'professional': [
        'Career Lessons: {theme} in the Workplace',
        'Professional Growth Through {theme}',
        'Leading with {theme}',
        'Workplace Wisdom: {theme} Stories'
      ]
    }

    const templateType = analysis.suggestedTemplate.category
    const templates = titleTemplates[templateType] || titleTemplates['personal']

    // Use the first key theme or default
    const theme = keyThemes[0] || 'Experience'
    const template = templates[Math.floor(Math.random() * templates.length)]

    return template.replace('{theme}', theme)
  }

  private async generateSections(
    transcript: string,
    analysis: TranscriptAnalysis,
    options: StoryGenerationOptions
  ): Promise<GeneratedStorySection[]> {
    const sections: GeneratedStorySection[] = []
    const template = analysis.suggestedTemplate

    for (let i = 0; i < template.prompts.length; i++) {
      const prompt = template.prompts[i]
      const suggestedSection = analysis.suggestedSections.find(
        s => s.templateSection === prompt.title
      )

      if (suggestedSection) {
        const section = await this.generateSection(
          prompt,
          suggestedSection.transcriptText,
          options,
          analysis
        )
        sections.push(section)
      } else {
        // Create empty section with guidance
        sections.push({
          title: prompt.title,
          content: '',
          originalText: '',
          confidence: 0,
          suggestions: [
            `Consider adding content about: ${prompt.guidance}`,
            `Original prompt: ${prompt.placeholder}`
          ]
        })
      }
    }

    return sections
  }

  private async generateSection(
    prompt: any,
    originalText: string,
    options: StoryGenerationOptions,
    analysis: TranscriptAnalysis
  ): Promise<GeneratedStorySection> {
    // This would integrate with OpenAI or Anthropic API in a real implementation
    // For now, we'll use rule-based text transformation

    const transformedContent = this.transformText(originalText, options, prompt)
    const suggestions = this.generateSuggestions(originalText, prompt, analysis)
    const culturalNotes = this.generateCulturalNotes(originalText, analysis)

    return {
      title: prompt.title,
      content: transformedContent,
      originalText,
      confidence: 0.8, // Placeholder confidence
      suggestions,
      culturalNotes
    }
  }

  private transformText(
    originalText: string,
    options: StoryGenerationOptions,
    prompt: any
  ): string {
    let transformed = originalText

    // Basic transformations based on options
    if (options.tone === 'formal') {
      transformed = this.makeTextFormal(transformed)
    } else if (options.tone === 'conversational') {
      transformed = this.makeTextConversational(transformed)
    } else if (options.tone === 'reflective') {
      transformed = this.makeTextReflective(transformed)
    }

    if (options.addTransitions) {
      transformed = this.addTransitions(transformed)
    }

    if (options.enhanceNarrative) {
      transformed = this.enhanceNarrative(transformed)
    }

    // Adjust length
    if (options.length === 'concise') {
      transformed = this.makeTextConcise(transformed)
    } else if (options.length === 'comprehensive') {
      transformed = this.expandText(transformed)
    }

    return transformed.trim()
  }

  private makeTextFormal(text: string): string {
    return text
      .replace(/\bi'm\b/gi, 'I am')
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bcan't\b/gi, 'cannot')
      .replace(/\byou know\b/gi, '')
      .replace(/\blike\b(?!\s+(to|the|a|an))/gi, '') // Remove filler "like"
  }

  private makeTextConversational(text: string): string {
    return text
      .replace(/\bI am\b/g, "I'm")
      .replace(/\bdo not\b/g, "don't")
      .replace(/\bwill not\b/g, "won't")
      .replace(/\bcannot\b/g, "can't")
  }

  private makeTextReflective(text: string): string {
    // Add reflective phrases
    const reflectivePhrases = [
      'Looking back,',
      'I now understand that',
      'This experience taught me that',
      'In retrospect,',
      'I\'ve come to realise that'
    ]

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length > 0 && Math.random() > 0.5) {
      const randomPhrase = reflectivePhrases[Math.floor(Math.random() * reflectivePhrases.length)]
      sentences[0] = randomPhrase + ' ' + sentences[0].trim().toLowerCase()
    }

    return sentences.join('. ') + '.'
  }

  private addTransitions(text: string): string {
    const transitions = [
      'Furthermore,',
      'Additionally,',
      'As a result,',
      'Subsequently,',
      'However,',
      'Nevertheless,',
      'Meanwhile,',
      'Consequently,'
    ]

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length > 2) {
      const midIndex = Math.floor(sentences.length / 2)
      const randomTransition = transitions[Math.floor(Math.random() * transitions.length)]
      sentences[midIndex] = randomTransition + ' ' + sentences[midIndex].trim().toLowerCase()
    }

    return sentences.join('. ') + '.'
  }

  private enhanceNarrative(text: string): string {
    // Add narrative elements (this would be more sophisticated with AI)
    return text
      .replace(/\bI felt\b/g, 'I experienced')
      .replace(/\bIt was\b/g, 'The situation was')
      .replace(/\bThen\b/g, 'At that moment')
  }

  private makeTextConcise(text: string): string {
    return text
      .replace(/\b(very|really|quite|rather|pretty|somewhat)\s+/g, '') // Remove intensifiers
      .replace(/\b(you know|I mean|like|well|um|uh)\b/g, '') // Remove filler words
      .replace(/\s+/g, ' ') // Clean up extra spaces
  }

  private expandText(text: string): string {
    // This would be more sophisticated with AI
    // For now, just ensure proper paragraph structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

    // Group sentences into paragraphs
    const paragraphs = []
    for (let i = 0; i < sentences.length; i += 3) {
      paragraphs.push(sentences.slice(i, i + 3).join('. ') + '.')
    }

    return paragraphs.join('\n\n')
  }

  private generateSuggestions(
    originalText: string,
    prompt: any,
    analysis: TranscriptAnalysis
  ): string[] {
    const suggestions = []

    // Content suggestions based on prompt guidance
    if (originalText.length < 100) {
      suggestions.push(`Consider expanding on: ${prompt.guidance}`)
    }

    // Theme-based suggestions
    if (analysis.keyThemes.length > 0) {
      suggestions.push(`Explore themes: ${analysis.keyThemes.join(', ')}`)
    }

    // Structure suggestions
    if (!originalText.includes('?') && prompt.title.includes('Reflection')) {
      suggestions.push('Consider adding reflective questions')
    }

    return suggestions
  }

  private generateCulturalNotes(
    originalText: string,
    analysis: TranscriptAnalysis
  ): string[] | undefined {
    if (analysis.culturalSensitivity === 'standard') {
      return undefined
    }

    const notes = []

    if (analysis.culturalSensitivity === 'high' || analysis.culturalSensitivity === 'restricted') {
      notes.push('This content contains culturally sensitive material')
      notes.push('Consider community consultation before sharing')
    }

    if (originalText.toLowerCase().includes('sacred') || originalText.toLowerCase().includes('ceremony')) {
      notes.push('Sacred or ceremonial content may require elder review')
    }

    return notes.length > 0 ? notes : undefined
  }

  private calculateMetadata(transcript: string, sections: GeneratedStorySection[]): GeneratedStory['metadata'] {
    const originalWords = transcript.split(/\s+/).length
    const generatedWords = sections.reduce((total, section) =>
      total + section.content.split(/\s+/).length, 0
    )

    return {
      originalWordCount: originalWords,
      generatedWordCount: generatedWords,
      compressionRatio: generatedWords / originalWords,
      readingTime: Math.ceil(generatedWords / 200) // 200 WPM
    }
  }

  private generateCulturalGuidance(
    analysis: TranscriptAnalysis,
    options: StoryGenerationOptions
  ): string[] {
    return this.culturalGuidelines[analysis.culturalSensitivity] || []
  }

  private generateReviewNotes(
    analysis: TranscriptAnalysis,
    sections: GeneratedStorySection[],
    options: StoryGenerationOptions
  ): string[] {
    const notes = []

    // Confidence-based notes
    const lowConfidenceSections = sections.filter(s => s.confidence < 0.6)
    if (lowConfidenceSections.length > 0) {
      notes.push(`${lowConfidenceSections.length} sections may need manual review`)
    }

    // Cultural sensitivity notes
    if (analysis.culturalSensitivity !== 'standard') {
      notes.push('Cultural sensitivity review recommended')
    }

    // Completeness notes
    const emptySections = sections.filter(s => !s.content.trim())
    if (emptySections.length > 0) {
      notes.push(`${emptySections.length} sections need content`)
    }

    return notes
  }
}

// Export singleton instance
export const storyGenerator = new StoryGenerator()

// Mock AI API integration (would be replaced with real API calls)
export async function enhanceWithAI(
  text: string,
  prompt: string,
  options: Partial<StoryGenerationOptions> = {}
): Promise<string> {
  // This would call OpenAI GPT-4 or Anthropic Claude API
  // For now, return the original text with basic enhancements

  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

  const enhanced = text
    .replace(/\buh\b|\bum\b|\ber\b/gi, '') // Remove filler words
    .replace(/\s+/g, ' ') // Clean up spaces
    .trim()

  return enhanced || text
}
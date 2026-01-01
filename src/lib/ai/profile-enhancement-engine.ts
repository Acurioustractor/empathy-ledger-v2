/**
 * Profile Enhancement Engine
 * Generates and applies AI-powered profile enhancements
 */

import { ProfileEnhancementAnalyzer, type ProfileAnalysis } from './profile-enhancement-analyzer'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface EnhancementRequest {
  profile: any
  stories: any[]
  transcripts: any[]
  quotes?: any[]
  qualityAnalysis?: any
  enhancementType: 'comprehensive' | 'voice_only' | 'gaps_only' | 'content_only'
  preserveVoice: boolean
  focusAreas: string[]
}

export interface Enhancement {
  field: string
  currentValue: any
  suggestedValue: any
  reasoning: string
  confidence: number
  evidence: string[]
  shouldApply: boolean
  preservesVoice: boolean
}

export interface EnhancementResult {
  storytellerId: string
  enhancements: Enhancement[]
  estimatedQualityImprovement: number
  culturalSafetyScore: number
  voicePreservationScore: number
  recommendedActions: string[]
}

export interface ApplicationResult {
  field: string
  success: boolean
  error?: string
  oldValue: any
  newValue: any
}

export class ProfileEnhancementEngine {

  /**
   * Generate enhancement recommendations for a storyteller profile
   */
  async generateEnhancements(request: EnhancementRequest): Promise<EnhancementResult> {
    const { profile, stories, transcripts, qualityAnalysis, enhancementType, preserveVoice, focusAreas } = request

    // Run profile analysis to get suggestions
    const analysis = await ProfileEnhancementAnalyzer.analyzeProfile(profile, transcripts, stories)

    // Convert analysis suggestions to enhancements
    const enhancements = this.convertAnalysisToEnhancements(
      analysis,
      profile,
      enhancementType,
      preserveVoice,
      focusAreas
    )

    // Calculate quality improvement estimate
    const estimatedQualityImprovement = this.calculateQualityImprovement(
      enhancements,
      qualityAnalysis?.overallQuality || 0.5
    )

    // Calculate cultural safety and voice preservation scores
    const culturalSafetyScore = this.calculateCulturalSafetyScore(enhancements, profile)
    const voicePreservationScore = this.calculateVoicePreservationScore(enhancements, profile)

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(enhancements, analysis)

    return {
      storytellerId: profile.id,
      enhancements,
      estimatedQualityImprovement,
      culturalSafetyScore,
      voicePreservationScore,
      recommendedActions
    }
  }

  /**
   * Apply enhancements to a storyteller profile
   */
  async applyEnhancements(
    storytellerId: string,
    enhancements: EnhancementResult | Enhancement[],
    supabase: SupabaseClient
  ): Promise<ApplicationResult[]> {
    const enhancementList = Array.isArray(enhancements) ? enhancements : enhancements.enhancements
    const results: ApplicationResult[] = []

    // Group enhancements by table
    const profileUpdates: Record<string, any> = {}
    const storytellerUpdates: Record<string, any> = {}

    for (const enhancement of enhancementList) {
      if (!enhancement.shouldApply) continue

      try {
        // Determine which table this field belongs to
        if (this.isProfileField(enhancement.field)) {
          profileUpdates[enhancement.field] = enhancement.suggestedValue
        } else if (this.isStorytellerField(enhancement.field)) {
          storytellerUpdates[enhancement.field] = enhancement.suggestedValue
        }

        results.push({
          field: enhancement.field,
          success: true,
          oldValue: enhancement.currentValue,
          newValue: enhancement.suggestedValue
        })
      } catch (error) {
        results.push({
          field: enhancement.field,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          oldValue: enhancement.currentValue,
          newValue: enhancement.suggestedValue
        })
      }
    }

    // Apply profile updates
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', storytellerId)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    // Apply storyteller updates
    if (Object.keys(storytellerUpdates).length > 0) {
      const { error: storytellerError } = await supabase
        .from('storytellers')
        .update(storytellerUpdates)
        .eq('id', storytellerId)

      if (storytellerError) {
        console.error('Storyteller update error:', storytellerError)
      }
    }

    return results
  }

  /**
   * Convert analysis suggestions to enhancement objects
   */
  private convertAnalysisToEnhancements(
    analysis: ProfileAnalysis,
    profile: any,
    enhancementType: string,
    preserveVoice: boolean,
    focusAreas: string[]
  ): Enhancement[] {
    const enhancements: Enhancement[] = []

    // Process each suggestion type
    Object.entries(analysis.suggestions).forEach(([field, suggestions]) => {
      if (!suggestions || suggestions.length === 0) return

      // Filter by focus areas if specified
      if (focusAreas.length > 0 && !focusAreas.includes(field)) return

      // Skip if enhancement type doesn't include this field
      if (enhancementType === 'voice_only' && !this.isVoiceRelatedField(field)) return
      if (enhancementType === 'gaps_only' && this.hasValue(profile, field)) return

      const currentValue = this.getCurrentValue(profile, field)
      const suggestedValue = this.selectBestSuggestion(suggestions, currentValue)

      if (suggestedValue && this.shouldSuggestEnhancement(currentValue, suggestedValue, preserveVoice)) {
        enhancements.push({
          field,
          currentValue,
          suggestedValue,
          reasoning: `AI analysis of storyteller content suggests this ${field} based on narrative patterns`,
          confidence: 0.8,
          evidence: analysis.evidence[field]?.map(e => e.content) || [],
          shouldApply: this.shouldAutoApply(field, enhancementType),
          preservesVoice: this.preservesVoice(currentValue, suggestedValue, preserveVoice)
        })
      }
    })

    return enhancements
  }

  /**
   * Calculate estimated quality improvement
   */
  private calculateQualityImprovement(enhancements: Enhancement[], currentQuality: number): number {
    const impactfulEnhancements = enhancements.filter(e => e.shouldApply && e.confidence > 0.7)
    const improvementFactor = Math.min(impactfulEnhancements.length * 0.1, 0.3)
    return Math.min(currentQuality + improvementFactor, 1.0)
  }

  /**
   * Calculate cultural safety score
   */
  private calculateCulturalSafetyScore(enhancements: Enhancement[], profile: any): number {
    // Higher score for enhancements that respect cultural context
    let score = 0.8 // Base score

    const culturalEnhancements = enhancements.filter(e =>
      e.field.includes('cultural') || e.field.includes('background')
    )

    // Boost score if cultural enhancements are evidence-based
    culturalEnhancements.forEach(e => {
      if (e.evidence.length > 0 && e.confidence > 0.7) {
        score += 0.05
      }
    })

    return Math.min(score, 1.0)
  }

  /**
   * Calculate voice preservation score
   */
  private calculateVoicePreservationScore(enhancements: Enhancement[], profile: any): number {
    const voicePreservingEnhancements = enhancements.filter(e => e.preservesVoice)
    const totalEnhancements = enhancements.length

    if (totalEnhancements === 0) return 1.0

    return voicePreservingEnhancements.length / totalEnhancements
  }

  /**
   * Generate recommended actions
   */
  private generateRecommendedActions(enhancements: Enhancement[], analysis: ProfileAnalysis): string[] {
    const actions: string[] = []

    const highConfidenceEnhancements = enhancements.filter(e => e.confidence > 0.8)
    if (highConfidenceEnhancements.length > 0) {
      actions.push(`Apply ${highConfidenceEnhancements.length} high-confidence enhancements`)
    }

    const culturalEnhancements = enhancements.filter(e => e.field.includes('cultural'))
    if (culturalEnhancements.length > 0) {
      actions.push('Review cultural background suggestions with community elders')
    }

    if (analysis.completenessScore < 0.7) {
      actions.push('Consider gathering additional storyteller information')
    }

    return actions
  }

  /**
   * Helper methods
   */
  private isProfileField(field: string): boolean {
    const profileFields = ['bio', 'display_name', 'cultural_affiliations', 'languages_spoken', 'interests']
    return profileFields.includes(field)
  }

  private isStorytellerField(field: string): boolean {
    const storytellerFields = ['cultural_background', 'specialties', 'preferred_topics', 'storytelling_style']
    return storytellerFields.includes(field)
  }

  private isVoiceRelatedField(field: string): boolean {
    return ['bio', 'storytelling_style', 'preferred_topics'].includes(field)
  }

  private hasValue(profile: any, field: string): boolean {
    const value = this.getCurrentValue(profile, field)
    return value !== null && value !== undefined && value !== '' &&
           (Array.isArray(value) ? value.length > 0 : true)
  }

  private getCurrentValue(profile: any, field: string): any {
    // Try profile first, then storyteller-specific fields
    return profile[field] || profile.profile?.[field] || null
  }

  private selectBestSuggestion(suggestions: string[], currentValue: any): string | string[] | null {
    if (!suggestions || suggestions.length === 0) return null

    // If current value exists and is good, enhance rather than replace
    if (currentValue && typeof currentValue === 'string' && currentValue.length > 50) {
      return suggestions[0] // Just suggest the first enhancement
    }

    // For arrays, merge with existing
    if (Array.isArray(currentValue)) {
      return [...new Set([...currentValue, ...suggestions])]
    }

    return suggestions[0]
  }

  private shouldSuggestEnhancement(currentValue: any, suggestedValue: any, preserveVoice: boolean): boolean {
    if (!suggestedValue) return false

    // Don't suggest if values are essentially the same
    if (JSON.stringify(currentValue) === JSON.stringify(suggestedValue)) return false

    // If preserving voice and current value is substantial, be conservative
    if (preserveVoice && currentValue && typeof currentValue === 'string' && currentValue.length > 100) {
      return false
    }

    return true
  }

  private shouldAutoApply(field: string, enhancementType: string): boolean {
    // Only auto-apply for gaps-only type and non-sensitive fields
    if (enhancementType !== 'gaps_only') return false

    const safeFields = ['specialties', 'preferred_topics', 'languages_spoken']
    return safeFields.includes(field)
  }

  private preservesVoice(currentValue: any, suggestedValue: any, preserveVoice: boolean): boolean {
    if (!preserveVoice) return true

    // If no current value, adding doesn't affect voice
    if (!currentValue) return true

    // For text fields, check if suggestion builds on existing rather than replacing
    if (typeof currentValue === 'string' && typeof suggestedValue === 'string') {
      return suggestedValue.includes(currentValue) || currentValue.includes(suggestedValue)
    }

    return true
  }
}
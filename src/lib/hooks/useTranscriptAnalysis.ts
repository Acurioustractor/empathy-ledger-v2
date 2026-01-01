import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface AnalysisOptions {
  generateStory?: boolean
  includeThemes?: boolean
  culturalContext?: string
  targetAudience?: 'all' | 'children' | 'youth' | 'adults' | 'elders'
  storyType?: 'personal' | 'family' | 'community' | 'cultural' | 'professional' | 'historical' | 'educational' | 'healing'
  maxLength?: number
}

export interface AnalysisResult {
  success: boolean
  analysis: {
    themes: string[]
    emotionalTone: string
    keyMoments: Array<{
      text: string
      timestamp?: number
      significance: string
      emotion: string
    }>
    culturalElements: string[]
    suggestedTitle: string
    suggestedSummary: string
    mediaSuggestions: Array<{
      type: 'photo' | 'video' | 'audio'
      description: string
      placement: 'hero' | 'inline' | 'gallery'
      relatedTheme: string
    }>
  }
  story?: {
    id?: string
    title: string
    content: string
    summary: string
    themes: string[]
    culturalContext: any
    metadata: {
      generatedAt: string
      model: string
      confidence: number
      wordCount: number
      readingTime: number
    }
  }
  transcriptId: string
  message: string
}

export interface AnalysisStatus {
  transcript: {
    id: string
    title: string
    analysed: boolean
    analysisDate?: string
    confidence?: number
    themes: string[]
  }
  generatedStories: Array<{
    id: string
    title: string
    status: string
    created_at: string
  }>
  hasAnalysis: boolean
}

export function useTranscriptAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)

  const analyzeTranscript = async (
    transcriptId: string,
    options: AnalysisOptions = {}
  ): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true)
    setError(null)
    setProgress(10)

    const defaultOptions: AnalysisOptions = {
      generateStory: true,
      includeThemes: true,
      targetAudience: 'all',
      storyType: 'personal',
      maxLength: 3000,
      ...options
    }

    try {
      setProgress(30)
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      
      const response = await fetch('/api/ai/analyse-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          transcriptId,
          ...defaultOptions
        }),
      })

      setProgress(60)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyse transcript')
      }

      const data: AnalysisResult = await response.json()
      
      setProgress(90)
      setResult(data)
      setProgress(100)
      
      return data

    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'An error occurred during analysis')
      return null
    } finally {
      setIsAnalyzing(false)
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 500)
    }
  }

  const checkAnalysisStatus = async (
    transcriptId: string
  ): Promise<AnalysisStatus | null> => {
    try {
      const response = await fetch(`/api/ai/analyse-transcript?transcriptId=${transcriptId}`)
      
      if (!response.ok) {
        throw new Error('Failed to check analysis status')
      }

      const data: AnalysisStatus = await response.json()
      return data

    } catch (err: any) {
      console.error('Status check error:', err)
      setError(err.message || 'Failed to check status')
      return null
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setProgress(0)
  }

  return {
    analyzeTranscript,
    checkAnalysisStatus,
    isAnalyzing,
    progress,
    error,
    result,
    reset
  }
}
/**
 * React hooks for Storyteller Analytics
 */

import { useState, useEffect } from 'react'
import {
  getStorytellerDashboard,
  getStorytellerThemes,
  getStorytellerQuotes,
  type StorytellerAnalytics,
  type ThemeAnalysis,
  type PowerfulQuote
} from '@/lib/analytics/storyteller-analytics'

/**
 * Hook for storyteller dashboard data
 */
export function useStorytellerAnalytics(storytellerId: string) {
  const [data, setData] = useState<StorytellerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      if (!storytellerId) return

      try {
        setLoading(true)
        setError(null)

        const analytics = await getStorytellerDashboard(storytellerId)
        setData(analytics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [storytellerId])

  const refresh = async () => {
    if (!storytellerId) return

    try {
      setLoading(true)
      const analytics = await getStorytellerDashboard(storytellerId)
      setData(analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics')
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refresh
  }
}

/**
 * Hook for storyteller themes
 */
export function useStorytellerThemes(storytellerId: string) {
  const [themes, setThemes] = useState<ThemeAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchThemes() {
      if (!storytellerId) return

      try {
        setLoading(true)
        setError(null)

        const themeData = await getStorytellerThemes(storytellerId)
        setThemes(themeData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch themes')
      } finally {
        setLoading(false)
      }
    }

    fetchThemes()
  }, [storytellerId])

  return {
    themes,
    loading,
    error
  }
}

/**
 * Hook for storyteller quotes
 */
export function useStorytellerQuotes(storytellerId: string, limit = 10) {
  const [quotes, setQuotes] = useState<PowerfulQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuotes() {
      if (!storytellerId) return

      try {
        setLoading(true)
        setError(null)

        const quoteData = await getStorytellerQuotes(storytellerId, limit)
        setQuotes(quoteData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quotes')
      } finally {
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [storytellerId, limit])

  return {
    quotes,
    loading,
    error
  }
}

/**
 * Hook for combined storyteller insights
 */
export function useStorytellerInsights(storytellerId: string) {
  const analytics = useStorytellerAnalytics(storytellerId)
  const themes = useStorytellerThemes(storytellerId)
  const quotes = useStorytellerQuotes(storytellerId, 5)

  const loading = analytics.loading || themes.loading || quotes.loading
  const error = analytics.error || themes.error || quotes.error

  return {
    analytics: analytics.data,
    themes: themes.themes,
    quotes: quotes.quotes,
    loading,
    error,
    refresh: analytics.refresh
  }
}
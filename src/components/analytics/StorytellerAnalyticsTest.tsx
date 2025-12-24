'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Users,
  Star,
  MessageCircle,
  TrendingUp,
  Award,
  Quote,
  Activity,
  BookOpen,
  Network
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface StorytellerAnalytics {
  id: string
  total_stories: number
  total_transcripts: number
  total_word_count: number
  total_engagement_score: number
  impact_reach: number
  primary_themes: string[]
  connection_count: number
  storytelling_style: string
  last_calculated_at: string
}

interface StorytellerQuote {
  id: string
  quote_text: string
  emotional_impact_score: number
  wisdom_score: number
  quotability_score: number
  themes: string[]
  quote_category: string
}

interface StorytellerEngagement {
  id: string
  stories_created: number
  connections_made: number
  story_views: number
  engagement_score: number
  period_type: string
  period_start: string
}

interface Props {
  storytellerId: string
}

export function StorytellerAnalyticsTest({ storytellerId }: Props) {
  const [analytics, setAnalytics] = useState<StorytellerAnalytics | null>(null)
  const [quotes, setQuotes] = useState<StorytellerQuote[]>([])
  const [engagement, setEngagement] = useState<StorytellerEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [storytellerId])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching analytics for storyteller:', storytellerId)

      // Use API route instead of direct Supabase calls to bypass RLS issues
      const response = await fetch(`/api/storytellers/${storytellerId}/analytics`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Analytics API result:', data)

      if (data.error) {
        setError(`API error: ${data.error}`)
        return
      }

      setAnalytics(data.analytics)
      setQuotes(data.quotes || [])
      setEngagement(data.engagement || [])

      // Log any errors from individual queries
      if (data.errors?.analytics) {
        console.warn('Analytics query error:', data.errors.analytics)
      }
      if (data.errors?.quotes) {
        console.warn('Quotes query error:', data.errors.quotes)
      }
      if (data.errors?.engagement) {
        console.warn('Engagement query error:', data.errors.engagement)
      }

    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Force load after 2 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('⏰ Forcing analytics load after timeout')
        fetchAnalyticsData()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [loading])

  if (loading && !analytics) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
        <p className="mt-2 text-stone-600">Loading analytics...</p>
        <p className="mt-1 text-xs text-stone-500">User ID: {storytellerId}</p>
        <Button onClick={fetchAnalyticsData} variant="outline" className="mt-4">
          Retry Load
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchAnalyticsData} className="mt-2">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-sage-600" />
        <h2 className="text-2xl font-bold">Storyteller Analytics Dashboard</h2>
      </div>

      {/* Analytics Overview */}
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <BookOpen className="h-4 w-4 text-sage-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_stories}</div>
              <p className="text-xs text-stone-600">
                +{analytics.total_transcripts} transcripts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Reach</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.impact_reach}</div>
              <p className="text-xs text-stone-600">people reached</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-clay-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.total_engagement_score)}</div>
              <p className="text-xs text-stone-600">out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Network className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.connection_count}</div>
              <p className="text-xs text-stone-600">storyteller network</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-stone-600">No analytics data found for this storyteller</p>
            <Button onClick={fetchAnalyticsData} className="mt-2">Generate Analytics</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="themes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Primary Themes
              </CardTitle>
              <CardDescription>
                Main narrative themes in your storytelling
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.primary_themes && analytics.primary_themes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.primary_themes.map((theme, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {theme}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-stone-600">No themes identified yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-sage-600" />
                Powerful Quotes
              </CardTitle>
              <CardDescription>
                Most impactful quotes from your stories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <div key={quote.id} className="border-l-4 border-sage-600 pl-4 py-2">
                    <blockquote className="text-stone-800 italic">
                      "{quote.quote_text}"
                    </blockquote>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {quote.quote_category}
                      </Badge>
                      <span className="text-xs text-stone-600">
                        Impact: {Math.round(quote.emotional_impact_score * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-stone-600">No quotes extracted yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Recent Engagement
              </CardTitle>
              <CardDescription>
                Your storytelling activity and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {engagement.length > 0 ? (
                <div className="space-y-3">
                  {engagement.map((period) => (
                    <div key={period.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{period.period_type} Period</p>
                        <p className="text-sm text-stone-600">
                          {new Date(period.period_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{Math.round(period.engagement_score)}</p>
                        <p className="text-xs text-stone-600">engagement score</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-600">No engagement data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-clay-600" />
                Storytelling Style
              </CardTitle>
              <CardDescription>
                Your unique narrative approach and characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.storytelling_style ? (
                <div className="space-y-3">
                  <Badge variant="default" className="text-lg px-4 py-2 capitalize">
                    {analytics.storytelling_style}
                  </Badge>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium text-stone-700">Word Count</p>
                      <p className="text-2xl font-bold">{analytics.total_word_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">Last Updated</p>
                      <p className="text-sm text-stone-600">
                        {new Date(analytics.last_calculated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stone-600">Storytelling style analysis not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-stone-500">
        Analytics data last updated: {analytics?.last_calculated_at ?
          new Date(analytics.last_calculated_at).toLocaleString() : 'Never'
        }
      </div>
    </div>
  )
}

export default StorytellerAnalyticsTest
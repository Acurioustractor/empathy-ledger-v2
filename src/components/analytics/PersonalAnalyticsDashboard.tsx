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
  TrendingUp,
  Award,
  Quote,
  Activity,
  BookOpen,
  Heart,
  Target,
  Brain,
  Network
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/auth.context'

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
  theme_distribution: Record<string, number>
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

interface StorytellerDemographics {
  id: string
  current_location: any
  cultural_background: string[]
  areas_of_expertise: string[]
  generation_category: string
  community_roles: string[]
}

export function PersonalAnalyticsDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<StorytellerAnalytics | null>(null)
  const [quotes, setQuotes] = useState<StorytellerQuote[]>([])
  const [engagement, setEngagement] = useState<StorytellerEngagement[]>([])
  const [demographics, setDemographics] = useState<StorytellerDemographics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchPersonalAnalytics()
    }
  }, [user])

  const fetchPersonalAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch storyteller analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('storyteller_analytics')
        .select('*')
        .eq('storyteller_id', user!.id)
        .single()

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        console.error('Analytics error:', analyticsError)
      }

      // Fetch top quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('storyteller_quotes')
        .select('*')
        .eq('storyteller_id', user!.id)
        .order('quotability_score', { ascending: false })
        .limit(3)

      if (quotesError) {
        console.error('Quotes error:', quotesError)
      }

      // Fetch recent engagement
      const { data: engagementData, error: engagementError } = await supabase
        .from('storyteller_engagement')
        .select('*')
        .eq('storyteller_id', user!.id)
        .order('period_start', { ascending: false })
        .limit(3)

      if (engagementError) {
        console.error('Engagement error:', engagementError)
      }

      // Fetch demographics
      const { data: demographicsData, error: demographicsError } = await supabase
        .from('storyteller_demographics')
        .select('*')
        .eq('storyteller_id', user!.id)
        .single()

      if (demographicsError && demographicsError.code !== 'PGRST116') {
        console.error('Demographics error:', demographicsError)
      }

      setAnalytics(analyticsData)
      setQuotes(quotesData || [])
      setEngagement(engagementData || [])
      setDemographics(demographicsData)

    } catch (err) {
      console.error('Error fetching personal analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-grey-600">Please sign in to view your storyteller analytics</p>
        <Button className="mt-4">Sign In</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-grey-600">Loading your analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchPersonalAnalytics} className="mt-2">Retry</Button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-sm border">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-grey-900 mb-2">
          Welcome to Your Analytics Dashboard!
        </h3>
        <p className="text-grey-600 mb-6 max-w-md mx-auto">
          Start sharing stories and transcripts to see personalized insights about your storytelling journey,
          themes, impact, and community connections.
        </p>
        <div className="flex gap-3 justify-center">
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Share Your First Story
          </Button>
          <Button variant="outline" onClick={fetchPersonalAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Your Storytelling Analytics</h2>
        <Badge variant="secondary" className="ml-auto">
          Private Dashboard
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories & Transcripts</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_stories + analytics.total_transcripts}</div>
            <p className="text-xs text-grey-600">
              {analytics.total_stories} stories, {analytics.total_transcripts} transcripts
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
            <p className="text-xs text-grey-600">people reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.total_engagement_score)}</div>
            <p className="text-xs text-grey-600">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.connection_count}</div>
            <p className="text-xs text-grey-600">storyteller connections</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Storytelling Style
                </CardTitle>
                <CardDescription>Your unique narrative approach</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="text-lg px-4 py-2 capitalize mb-4">
                  {analytics.storytelling_style}
                </Badge>
                <div className="space-y-2 text-sm text-grey-600">
                  <p><strong>Total Words:</strong> {analytics.total_word_count.toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(analytics.last_calculated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {demographics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Profile Summary
                  </CardTitle>
                  <CardDescription>Your storyteller background</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {demographics.cultural_background && (
                      <p><strong>Background:</strong> {demographics.cultural_background.join(', ')}</p>
                    )}
                    {demographics.areas_of_expertise && (
                      <p><strong>Expertise:</strong> {demographics.areas_of_expertise.join(', ')}</p>
                    )}
                    {demographics.community_roles && (
                      <p><strong>Role:</strong> {demographics.community_roles.join(', ')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {engagement.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagement.map((period) => (
                    <div key={period.id} className="flex justify-between items-center p-3 bg-grey-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{period.period_type} Period</p>
                        <p className="text-sm text-grey-600">
                          {new Date(period.period_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{Math.round(period.engagement_score)}</p>
                        <p className="text-xs text-grey-600">engagement score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Your Primary Themes
              </CardTitle>
              <CardDescription>
                Main narrative themes identified in your storytelling
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.primary_themes && analytics.primary_themes.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {analytics.primary_themes.map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {theme}
                      </Badge>
                    ))}
                  </div>

                  {analytics.theme_distribution && Object.keys(analytics.theme_distribution).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Theme Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.theme_distribution).map(([theme, percentage]) => (
                          <div key={theme} className="flex items-center gap-3">
                            <span className="text-sm w-32">{theme}</span>
                            <div className="flex-1 bg-grey-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-grey-600">{percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-grey-600">No themes identified yet. Add more content to see theme analysis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-blue-600" />
                Your Powerful Quotes
              </CardTitle>
              <CardDescription>
                Most impactful quotes from your stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length > 0 ? (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="border-l-4 border-blue-600 pl-4 py-2">
                      <blockquote className="text-grey-800 italic mb-2">
                        "{quote.quote_text}"
                      </blockquote>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {quote.quote_category}
                        </Badge>
                        <span className="text-xs text-grey-600">
                          Impact: {Math.round(quote.emotional_impact_score * 100)}%
                        </span>
                        <span className="text-xs text-grey-600">
                          Wisdom: {Math.round(quote.wisdom_score * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-grey-600">No quotes extracted yet. Share more stories to see powerful quotes identified.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Growth & Next Steps
              </CardTitle>
              <CardDescription>
                Ways to expand your storytelling impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Immediate Opportunities</h4>
                  <ul className="space-y-2 text-sm text-grey-700">
                    <li>• Add more transcripts to increase theme diversity</li>
                    <li>• Write stories based on your transcripts to boost engagement</li>
                    <li>• Connect with other storytellers to expand your network</li>
                    <li>• Share your quotes to increase community impact</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <Button>Add New Transcript</Button>
                    <Button variant="outline">Write Story</Button>
                    <Button variant="outline">Find Connections</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-grey-500">
        Analytics last updated: {new Date(analytics.last_calculated_at).toLocaleString()}
      </div>
    </div>
  )
}

export default PersonalAnalyticsDashboard
'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams, redirect } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Heart,
  Compass,
  Star,
  BookOpen,
  Users,
  Globe,
  Lightbulb,
  Quote,
  Brain,
  Eye,
  Target,
  Sparkles,
  MessageCircle
} from 'lucide-react'

interface PersonalInsights {
  storyteller_id: string;
  narrative_themes: string[];
  core_values: string[];
  life_philosophy: string;
  strengths: string[];
  growth_areas: string[];
  cultural_identity_markers: string[];
  community_contributions: string[];
  generated_at: string;
}

interface StorytellerProfile {
  id: string;
  display_name: string;
  bio: string | null;
  cultural_background: string | null;
}

export default function StorytellerInsightsPage() {
  const params = useParams()
  const storytellerId = params.id as string
  const { isSuperAdmin, isAdmin } = useAuth()

  // Admin-only access
  useEffect(() => {
    if (!isSuperAdmin && !isAdmin) {
      redirect(`/storytellers/${storytellerId}`)
    }
  }, [isSuperAdmin, isAdmin, storytellerId])

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [insights, setInsights] = useState<PersonalInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (storytellerId) {
      loadStorytellerData()
      loadInsights()
    }
  }, [storytellerId])

  const loadStorytellerData = async () => {
    try {
      const response = await fetch(`/api/storytellers/${storytellerId}`)
      if (response.ok) {
        const data = await response.json()
        setStoryteller(data)
      }
    } catch (err) {
      console.error('Error loading storyteller:', err)
    }
  }

  const loadInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/storytellers/${storytellerId}/transcript-analysis`)
      
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights)
      } else {
        throw new Error('Failed to load insights')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold text-grey-900 mb-2">Loading Insights...</h2>
              <p className="text-grey-600">Analyzing your personal narrative patterns</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                Personal Insights
              </CardTitle>
              <CardDescription>
                {error ? error : 'Ready to discover your personal insights? Upload a transcript or story to get started with AI-powered analysis.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">What You'll Get:</h3>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Your core values and life philosophy
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Narrative themes from your stories
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Personal strengths and growth areas
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Cultural identity markers
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Community contribution patterns
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <Link href={`/storytellers/${storytellerId}/dashboard`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Insights from Dashboard
                  </Button>
                </Link>
                <Link href={`/storytellers/${storytellerId}/analytics`}>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Analytics Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/storytellers/${storytellerId}`} className="text-purple-600 hover:text-purple-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-grey-900 mb-2">
                Personal Insights
              </h1>
              <p className="text-grey-600">
                Deep understanding from {storyteller?.display_name}'s life stories
              </p>
            </div>
            
            <Link href={`/storytellers/${storytellerId}/analytics`}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* Life Philosophy - Hero Section */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Compass className="h-6 w-6" />
                Life Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Quote className="h-8 w-8 text-purple-200 mt-1 flex-shrink-0" />
                <p className="text-lg leading-relaxed font-medium">
                  {insights.life_philosophy}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Core Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Core Values
              </CardTitle>
              <CardDescription>
                The fundamental principles that guide your life and decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.core_values.map((value, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium text-grey-900">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Narrative Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Life Story Themes
              </CardTitle>
              <CardDescription>
                Recurring patterns and themes that define your personal narrative
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.narrative_themes.map((theme, index) => (
                  <div key={index} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="font-semibold text-grey-900 mb-2">{theme}</h3>
                        <p className="text-sm text-grey-600">
                          A central theme woven throughout your life experiences
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Natural Strengths
                </CardTitle>
                <CardDescription>
                  Qualities and abilities that shine through your stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Sparkles className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-grey-900">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Growth Opportunities
                </CardTitle>
                <CardDescription>
                  Areas identified for personal and professional development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.growth_areas.map((area, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-grey-900">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cultural Identity */}
          {insights.cultural_identity_markers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  Cultural Identity Markers
                </CardTitle>
                <CardDescription>
                  Elements that reflect your cultural identity and heritage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.cultural_identity_markers.map((marker, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium text-grey-900">{marker}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Contributions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Community Contributions
              </CardTitle>
              <CardDescription>
                Ways you contribute to and support your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.community_contributions.map((contribution, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-1" />
                      <span className="text-sm text-grey-900">{contribution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/storytellers/${storytellerId}/skills`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Star className="h-4 w-4 mr-2" />
                Explore Your Skills
              </Button>
            </Link>
            <Link href={`/storytellers/${storytellerId}/opportunities`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Find Opportunities
              </Button>
            </Link>
            <Link href={`/storytellers/${storytellerId}/impact`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Impact Stories
              </Button>
            </Link>
          </div>

          {/* Generation Timestamp */}
          <div className="text-center py-4">
            <p className="text-sm text-grey-500">
              Insights generated on {new Date(insights.generated_at).toLocaleDateString()} at {new Date(insights.generated_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
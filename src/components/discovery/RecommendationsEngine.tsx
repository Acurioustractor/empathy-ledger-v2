'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkles, Users, BookOpen, ArrowRight } from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  description: string
  type: 'story' | 'storyteller' | 'theme' | 'collection'
  relevance_score: number
  recommendation_type: 'similar_to_viewed' | 'related_themes' | 'collaborative' | 'trending'
  metadata: any
}

interface RecommendationsEngineProps {
  organizationId: string
  userId?: string
  basedOn?: {
    type: 'story' | 'storyteller' | 'theme'
    id: string
  }
}

export function RecommendationsEngine({
  organizationId,
  userId,
  basedOn
}: RecommendationsEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [organizationId, userId, basedOn])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.append('organization_id', organizationId)
      if (userId) params.append('user_id', userId)
      if (basedOn) {
        params.append('based_on_type', basedOn.type)
        params.append('based_on_id', basedOn.id)
      }

      const response = await fetch(`/api/discovery/recommendations?${params}`)
      const data = await response.json()

      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationType = (type: string) => {
    switch (type) {
      case 'similar_to_viewed':
        return { label: 'Similar to what you viewed', icon: <BookOpen className="w-4 h-4" />, color: 'blue' }
      case 'related_themes':
        return { label: 'Related themes', icon: <Sparkles className="w-4 h-4" />, color: 'purple' }
      case 'collaborative':
        return { label: 'Others also viewed', icon: <Users className="w-4 h-4" />, color: 'green' }
      case 'trending':
        return { label: 'Trending now', icon: <Brain className="w-4 h-4" />, color: 'orange' }
      default:
        return { label: 'Recommended', icon: <Sparkles className="w-4 h-4" />, color: 'gray' }
    }
  }

  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.recommendation_type]) {
      acc[rec.recommendation_type] = []
    }
    acc[rec.recommendation_type].push(rec)
    return acc
  }, {} as Record<string, Recommendation[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          Recommendations for You
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          AI-powered content suggestions based on your interests and behavior
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="w-8 h-8 text-gray-300 animate-pulse mx-auto mb-4" />
            <p className="text-gray-500">Generating recommendations...</p>
          </CardContent>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Explore more content to get personalized recommendations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecommendations).map(([type, recs]) => {
            const typeInfo = getRecommendationType(type)
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`p-2 bg-${typeInfo.color}-100 rounded-lg`}>
                      {typeInfo.icon}
                    </div>
                    {typeInfo.label}
                  </CardTitle>
                  <CardDescription>
                    {recs.length} recommendation{recs.length !== 1 ? 's' : ''} based on your activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recs.slice(0, 4).map(rec => (
                      <div
                        key={rec.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="text-xs mb-2 capitalize">
                              {rec.type}
                            </Badge>
                            <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                              {rec.title}
                            </h4>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-${typeInfo.color}-500`}
                                style={{ width: `${rec.relevance_score * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(rec.relevance_score * 100)}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* How Recommendations Work */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg">How We Recommend Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h5 className="font-semibold">Content-Based Filtering</h5>
              <p className="text-gray-600 text-xs">
                Analyzes themes, cultural context, and content similarity to suggest related items
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h5 className="font-semibold">Collaborative Filtering</h5>
              <p className="text-gray-600 text-xs">
                Learns from patterns of what similar users engage with and enjoy
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h5 className="font-semibold">AI-Powered Analysis</h5>
              <p className="text-gray-600 text-xs">
                Uses semantic understanding to find meaningful connections beyond keywords
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

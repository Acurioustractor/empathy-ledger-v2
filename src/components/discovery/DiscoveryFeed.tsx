'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  Eye,
  Users,
  RefreshCw,
  Bookmark
} from 'lucide-react'

interface DiscoveryItem {
  id: string
  type: 'story' | 'storyteller' | 'theme' | 'media'
  title: string
  description: string
  reason: string // Why this is recommended
  score: number
  metadata: any
}

interface DiscoveryFeedProps {
  organizationId: string
  userId?: string
}

export function DiscoveryFeed({ organizationId, userId }: DiscoveryFeedProps) {
  const [feedType, setFeedType] = useState<'personalized' | 'trending' | 'new' | 'popular'>('personalized')
  const [items, setItems] = useState<DiscoveryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFeed()
  }, [organizationId, feedType, userId])

  const fetchFeed = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.append('organization_id', organizationId)
      params.append('feed_type', feedType)
      if (userId) params.append('user_id', userId)

      const response = await fetch(`/api/discovery/feed?${params}`)
      const data = await response.json()

      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching discovery feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveItem = async (itemId: string) => {
    try {
      await fetch('/api/discovery/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, user_id: userId })
      })

      setSavedItems(prev => new Set(prev).add(itemId))
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return '📖'
      case 'storyteller': return '👤'
      case 'theme': return '🎨'
      case 'media': return '🖼️'
      default: return '✨'
    }
  }

  const getFeedIcon = () => {
    switch (feedType) {
      case 'personalized': return <Sparkles className="w-5 h-5 text-purple-600" />
      case 'trending': return <TrendingUp className="w-5 h-5 text-orange-600" />
      case 'new': return <Clock className="w-5 h-5 text-blue-600" />
      case 'popular': return <Heart className="w-5 h-5 text-pink-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discover</h2>
          <p className="text-sm text-gray-600">
            Explore stories, people, and themes tailored for you
          </p>
        </div>
        <Button onClick={fetchFeed} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Feed Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={feedType} onValueChange={(v: any) => setFeedType(v)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personalized">
                <Sparkles className="w-4 h-4 mr-1" />
                For You
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new">
                <Clock className="w-4 h-4 mr-1" />
                New
              </TabsTrigger>
              <TabsTrigger value="popular">
                <Heart className="w-4 h-4 mr-1" />
                Popular
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feed Items */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading recommendations...</p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back later for personalized content
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      saveItem(item.id)
                    }}
                    className={savedItems.has(item.id) ? 'text-yellow-600' : ''}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${savedItems.has(item.id) ? 'fill-current' : ''}`}
                    />
                  </Button>
                </div>
                <CardTitle className="text-lg group-hover:text-clay-600 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Recommendation Reason */}
                  <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    {getFeedIcon()}
                    <div>
                      <p className="text-xs font-semibold text-purple-900 mb-1">
                        Why you might like this
                      </p>
                      <p className="text-xs text-purple-700">{item.reason}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {item.metadata.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.metadata.views}
                      </div>
                    )}
                    {item.metadata.likes && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.metadata.likes}
                      </div>
                    )}
                    {item.metadata.contributors && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.metadata.contributors}
                      </div>
                    )}
                  </div>

                  {/* Relevance Score */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${item.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {Math.round(item.score * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feed Description */}
      <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">About This Feed</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          {feedType === 'personalized' && (
            <p>
              <strong>Personalized recommendations</strong> based on your interests, viewed content,
              and interaction history. Our AI learns what you engage with most.
            </p>
          )}
          {feedType === 'trending' && (
            <p>
              <strong>Trending content</strong> shows what's gaining traction in your organization.
              Discover stories and themes that others are engaging with right now.
            </p>
          )}
          {feedType === 'new' && (
            <p>
              <strong>Recently added content</strong> shows the latest stories, storytellers, and media
              added to your organization. Be the first to explore new contributions.
            </p>
          )}
          {feedType === 'popular' && (
            <p>
              <strong>Most popular content</strong> ranked by views, likes, and community engagement.
              See what resonates most with your organization.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

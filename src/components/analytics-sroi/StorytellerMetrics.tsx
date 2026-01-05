'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, BookOpen, Award, TrendingUp } from 'lucide-react'

interface StorytellerMetricsProps {
  organizationId: string
  period: string
}

export function StorytellerMetrics({ organizationId, period }: StorytellerMetricsProps) {
  const [storytellerData, setStorytellerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStorytellerMetrics()
  }, [organizationId, period])

  const loadStorytellerMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/organization/${organizationId}/storytellers?period=${period}`
      )
      if (response.ok) {
        const data = await response.json()
        setStorytellerData(data)
      }
    } catch (err) {
      console.error('Error loading storyteller metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse"><div className="h-64 bg-gray-200 rounded" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Storyteller Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Storytellers
            </CardTitle>
            <Users className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{storytellerData?.active_count || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Contributing this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Storytellers
            </CardTitle>
            <UserPlus className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{storytellerData?.new_count || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Joined this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Stories/Storyteller
            </CardTitle>
            <BookOpen className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {storytellerData?.avg_stories_per_storyteller?.toFixed(1) || '0.0'}
            </div>
            <p className="text-sm text-gray-600 mt-1">Contribution rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Retention Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {storytellerData?.retention_rate?.toFixed(0) || 0}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Return contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {storytellerData?.top_contributors?.map((storyteller: any, index: number) => (
              <div
                key={storyteller.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{storyteller.name}</h4>
                  <p className="text-sm text-gray-600">
                    {storyteller.story_count} {storyteller.story_count === 1 ? 'story' : 'stories'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{storyteller.total_views}</p>
                  <p className="text-xs text-gray-500">total views</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No contributors this period</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

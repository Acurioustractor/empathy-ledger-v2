'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Share2, MessageCircle, TrendingUp, BookOpen } from 'lucide-react'

interface EngagementMetricsProps {
  organizationId: string
  period: string
}

export function EngagementMetrics({ organizationId, period }: EngagementMetricsProps) {
  const [engagementData, setEngagementData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEngagementMetrics()
  }, [organizationId, period])

  const loadEngagementMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/organization/${organizationId}/engagement?period=${period}`
      )
      if (response.ok) {
        const data = await response.json()
        setEngagementData(data)
      }
    } catch (err) {
      console.error('Error loading engagement metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Views Over Time Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Line chart visualization</p>
              <p className="text-sm text-gray-500 mt-1">
                {engagementData?.total_views || 0} total views this period
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shares by Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-500" />
            Shares by Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {engagementData?.shares_by_platform?.map((platform: any) => (
              <div key={platform.name} className="flex items-center justify-between">
                <span className="text-gray-700">{platform.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${platform.percentage}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 w-12 text-right">
                    {platform.count}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No share data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-500" />
            Top Performing Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {engagementData?.top_stories?.map((story: any, index: number) => (
              <div
                key={story.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center font-semibold text-sky-700">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{story.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {story.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" /> {story.shares}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {story.comments}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {story.engagement_rate}%
                  </p>
                  <p className="text-xs text-gray-500">engagement</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No stories published this period</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

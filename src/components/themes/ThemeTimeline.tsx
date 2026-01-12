'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar } from 'lucide-react'

interface ThemeTimelineProps {
  theme: {
    id: string
    theme_name: string
    timeline_data?: Array<{
      month: string
      count: number
      prominence: number
    }>
  }
  timeRange: string
}

export function ThemeTimeline({ theme, timeRange }: ThemeTimelineProps) {
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimelineData()
  }, [theme.id, timeRange])

  const fetchTimelineData = async () => {
    try {
      setLoading(true)

      // If theme already has timeline data, use it
      if (theme.timeline_data && theme.timeline_data.length > 0) {
        setTimelineData(theme.timeline_data)
        setLoading(false)
        return
      }

      // Otherwise fetch from API
      const response = await fetch(
        `/api/analytics/themes/timeline?theme_id=${theme.id}&time_range=${timeRange}`
      )

      if (!response.ok) throw new Error('Failed to fetch timeline')

      const data = await response.json()
      setTimelineData(data.timeline || [])
    } catch (error) {
      console.error('Error fetching timeline:', error)
      // Generate mock data for development
      setTimelineData(generateMockTimeline())
    } finally {
      setLoading(false)
    }
  }

  const generateMockTimeline = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, i) => ({
      month,
      count: Math.floor(Math.random() * 20) + 5,
      prominence: (Math.random() * 0.5) + 0.3
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clay-600 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-clay-600" />
          6-Month Timeline: {theme.theme_name}
        </CardTitle>
        <CardDescription>
          Story mentions and prominence over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {timelineData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No timeline data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Story Count', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: 'Prominence', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(value: any, name: string) => {
                  if (name === 'prominence') {
                    return [(value * 100).toFixed(1) + '%', 'Prominence']
                  }
                  return [value, 'Stories']
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#D97757"
                strokeWidth={2}
                name="Stories"
                dot={{ fill: '#D97757' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="prominence"
                stroke="#4A90A4"
                strokeWidth={2}
                name="Prominence"
                dot={{ fill: '#4A90A4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

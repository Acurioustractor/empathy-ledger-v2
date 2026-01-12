'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProminenceChartProps {
  theme: { theme_name: string; prominence_score: number }
  timeRange: string
}

export function ProminenceChart({ theme, timeRange }: ProminenceChartProps) {
  // Mock data - in production, fetch from API
  const data = [
    { category: 'Stories', value: theme.prominence_score * 100 },
    { category: 'Storytellers', value: (theme.prominence_score * 0.8) * 100 },
    { category: 'Engagement', value: (theme.prominence_score * 0.6) * 100 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Prominence Breakdown</CardTitle>
        <CardDescription>How prominent is this theme across different metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
            <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
            <Bar dataKey="value" fill="#D97757" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

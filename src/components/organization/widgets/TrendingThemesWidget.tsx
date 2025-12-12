'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { ThemeData } from '@/lib/services/organization-dashboard.service'

interface TrendingThemesWidgetProps {
  themes: ThemeData[]
  organizationId: string
}

// Cultural color palette
const THEME_COLORS = [
  '#8f7961', // earth-600
  '#6b8e6b', // sage-600
  '#b87333', // clay-600
  '#78716c', // stone-500
  '#a18072', // earth-400
  '#8ba88b', // sage-400
  '#cd9a6d', // clay-400
  '#a8a29e', // stone-400
]

export function TrendingThemesWidget({ themes, organizationId }: TrendingThemesWidgetProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-sage-600" />
      case 'down':
        return <TrendingDown className="w-3 h-3 text-clay-600" />
      default:
        return <Minus className="w-3 h-3 text-stone-400" />
    }
  }

  if (themes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-earth-600" />
            Trending Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-stone-500">
            <p>No themes found yet</p>
            <p className="text-sm mt-1">Themes will appear as stories are created</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = themes.slice(0, 6).map((theme, index) => ({
    name: theme.name.length > 12 ? theme.name.slice(0, 12) + '...' : theme.name,
    fullName: theme.name,
    count: theme.count,
    trend: theme.trend,
    fill: THEME_COLORS[index % THEME_COLORS.length]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-earth-600" />
            Trending Themes
          </span>
          <a
            href={`/organisations/${organizationId}/analytics`}
            className="text-sm font-normal text-earth-600 hover:text-earth-700"
          >
            View all
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Bar Chart */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12, fill: '#78716c' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-2 rounded-lg shadow-lg border border-stone-200">
                        <p className="font-medium text-earth-800">{data.fullName}</p>
                        <p className="text-sm text-stone-600">{data.count} stories</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Theme badges with trends */}
        <div className="flex flex-wrap gap-2">
          {themes.slice(0, 5).map((theme, index) => (
            <Badge
              key={theme.name}
              variant="outline"
              className="flex items-center gap-1 bg-stone-50"
            >
              {theme.name}
              {getTrendIcon(theme.trend)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

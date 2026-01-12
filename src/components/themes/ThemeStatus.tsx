'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Sparkles, Users, BookOpen, Calendar } from 'lucide-react'

interface ThemeStatusProps {
  theme: {
    theme_name: string
    status: 'emerging' | 'growing' | 'stable' | 'declining'
    usage_count: number
    storyteller_count: number
    story_count: number
    growth_rate: number
    first_seen: string
    last_used: string
  }
}

export function ThemeStatus({ theme }: ThemeStatusProps) {
  const getStatusInfo = () => {
    switch (theme.status) {
      case 'emerging':
        return {
          icon: <Sparkles className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          description: 'This theme is newly appearing in stories and showing early growth potential.'
        }
      case 'growing':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          description: 'This theme is gaining traction with increasing mentions across stories and storytellers.'
        }
      case 'stable':
        return {
          icon: <Minus className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          description: 'This theme maintains consistent presence without significant growth or decline.'
        }
      case 'declining':
        return {
          icon: <TrendingDown className="w-5 h-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          description: 'This theme is appearing less frequently in recent stories.'
        }
      default:
        return {
          icon: null,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: ''
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme Status</CardTitle>
          <CardDescription>{theme.theme_name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${statusInfo.bgColor}`}>
            <div className={statusInfo.color}>
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold capitalize ${statusInfo.color}`}>
                  {theme.status}
                </span>
                {theme.growth_rate !== 0 && (
                  <Badge variant="outline" className="text-xs">
                    {theme.growth_rate > 0 ? '+' : ''}{theme.growth_rate}% growth
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-clay-600" />
                <span className="text-sm font-medium text-gray-700">Stories</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{theme.story_count}</p>
              <p className="text-xs text-gray-500 mt-1">{theme.usage_count} total mentions</p>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-gray-700">Storytellers</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{theme.storyteller_count}</p>
              <p className="text-xs text-gray-500 mt-1">unique contributors</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>First seen</span>
              </div>
              <span className="font-medium text-gray-900">
                {new Date(theme.first_seen).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Last used</span>
              </div>
              <span className="font-medium text-gray-900">
                {new Date(theme.last_used).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

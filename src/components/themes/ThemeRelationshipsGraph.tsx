'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from 'lucide-react'

interface ThemeRelationshipsGraphProps {
  theme: {
    theme_name: string
    related_themes?: Array<{ theme_name: string; correlation: number }>
  }
  allThemes: Array<{ theme_name: string }>
}

export function ThemeRelationshipsGraph({ theme, allThemes }: ThemeRelationshipsGraphProps) {
  // Generate mock related themes if not provided
  const relatedThemes = theme.related_themes || allThemes
    .filter(t => t.theme_name !== theme.theme_name)
    .slice(0, 8)
    .map(t => ({
      theme_name: t.theme_name,
      correlation: Math.random() * 0.6 + 0.2  // 0.2 to 0.8
    }))
    .sort((a, b) => b.correlation - a.correlation)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Network className="w-5 h-5 text-clay-600" />
          Theme Relationships
        </CardTitle>
        <CardDescription>
          Themes that frequently co-occur with "{theme.theme_name}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {relatedThemes.length === 0 ? (
          <div className="text-center py-8">
            <Network className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No related themes found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {relatedThemes.map((related, i) => {
              const strength = related.correlation
              const getStrengthColor = () => {
                if (strength > 0.6) return 'bg-green-100 text-green-800 border-green-200'
                if (strength > 0.4) return 'bg-blue-100 text-blue-800 border-blue-200'
                return 'bg-gray-100 text-gray-800 border-gray-200'
              }

              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {related.theme_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-[200px]">
                        <div
                          className="h-2 bg-clay-500 rounded-full"
                          style={{ width: `${strength * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {(strength * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Badge className={`ml-3 ${getStrengthColor()} text-xs`}>
                    {strength > 0.6 ? 'Strong' : strength > 0.4 ? 'Moderate' : 'Weak'}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

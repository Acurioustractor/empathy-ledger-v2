'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Download, TrendingUp } from 'lucide-react'

interface Theme {
  name: string
  count: number
  category?: string
  confidence?: number
  storyIds?: string[]
}

interface ThemeDistributionChartProps {
  themes: Theme[]
  onThemeClick?: (theme: Theme) => void
  showCategories?: boolean
  limit?: number
  testMode?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  'Cultural Sovereignty': 'bg-clay-600',
  'Knowledge Transmission': 'bg-sage-600',
  'Community Wellbeing': 'bg-sky-600',
  'Land & Environment': 'bg-green-600',
  'Justice & Rights': 'bg-ember-600',
  'Language & Expression': 'bg-purple-600',
  'Economic Development': 'bg-yellow-600',
  'Governance': 'bg-indigo-600',
  'default': 'bg-gray-600'
}

export function ThemeDistributionChart({
  themes,
  onThemeClick,
  showCategories = true,
  limit = 10,
  testMode = false
}: ThemeDistributionChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  // Sort themes by count and limit
  const sortedThemes = [...themes]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  const maxCount = Math.max(...sortedThemes.map(t => t.count), 1)

  const getCategoryColor = (category?: string): string => {
    if (!category) return CATEGORY_COLORS.default
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
  }

  const handleExport = () => {
    if (testMode) {
      console.log('Export chart (test mode)')
      return
    }

    const exportData = {
      themes: sortedThemes,
      exportedAt: new Date().toISOString(),
      totalThemes: themes.length,
      topThemes: limit
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme-distribution-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  if (themes.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <BarChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No themes to display</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Theme Distribution</h3>
          <p className="text-sm text-gray-600">
            Top {sortedThemes.length} themes across {themes.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart className="w-4 h-4 mr-2" />
            Chart
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <Card className="p-6">
          <div className="space-y-4">
            {sortedThemes.map((theme, index) => {
              const widthPercent = (theme.count / maxCount) * 100
              const categoryColor = getCategoryColor(theme.category)

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => onThemeClick?.(theme)}
                        className={`text-sm font-medium text-gray-900 truncate hover:text-clay-700 transition-colors ${
                          onThemeClick ? 'cursor-pointer' : 'cursor-default'
                        }`}
                        disabled={!onThemeClick}
                      >
                        {theme.name}
                      </button>
                      {showCategories && theme.category && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {theme.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {theme.confidence !== undefined && (
                        <span className="text-xs text-gray-500">
                          {Math.round(theme.confidence * 100)}%
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {theme.count}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-8 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className={`h-full ${categoryColor} transition-all duration-500 ease-out flex items-center px-3`}
                      style={{ width: `${widthPercent}%` }}
                    >
                      {widthPercent > 20 && (
                        <span className="text-xs font-medium text-white">
                          {theme.count} {theme.count === 1 ? 'mention' : 'mentions'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Theme
                  </th>
                  {showCategories && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Max
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedThemes.map((theme, index) => (
                  <tr
                    key={index}
                    className={onThemeClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                    onClick={() => onThemeClick?.(theme)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                      {theme.storyIds && (
                        <div className="text-xs text-gray-500">
                          {theme.storyIds.length} {theme.storyIds.length === 1 ? 'story' : 'stories'}
                        </div>
                      )}
                    </td>
                    {showCategories && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {theme.category && (
                          <Badge variant="outline" className="text-xs">
                            {theme.category}
                          </Badge>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {theme.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {theme.confidence !== undefined
                        ? `${Math.round(theme.confidence * 100)}%`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {Math.round((theme.count / maxCount) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Category Legend */}
      {showCategories && viewMode === 'chart' && (
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CATEGORY_COLORS)
              .filter(([key]) => key !== 'default')
              .map(([category, color]) => (
                <div key={category} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-xs text-gray-600">{category}</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Themes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{themes.length}</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Mentions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {themes.reduce((sum, t) => sum + t.count, 0)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-600">Avg Confidence</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {themes.length > 0
              ? Math.round(
                  (themes.reduce((sum, t) => sum + (t.confidence || 0), 0) / themes.length) * 100
                )
              : 0}%
          </div>
        </Card>
      </div>
    </div>
  )
}

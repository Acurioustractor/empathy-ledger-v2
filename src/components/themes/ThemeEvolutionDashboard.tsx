'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Network
} from 'lucide-react'
import { ThemeTimeline } from './ThemeTimeline'
import { ProminenceChart } from './ProminenceChart'
import { ThemeStatus } from './ThemeStatus'
import { SemanticShiftDetector } from './SemanticShiftDetector'
import { ThemeRelationshipsGraph } from './ThemeRelationshipsGraph'
import { GrowthRateCalculator } from './GrowthRateCalculator'

export interface Theme {
  id: string
  theme_name: string
  theme_category: string
  usage_count: number
  first_seen: string
  last_used: string
  status: 'emerging' | 'growing' | 'stable' | 'declining'
  growth_rate: number
  prominence_score: number
  storyteller_count: number
  story_count: number
  timeline_data?: Array<{
    month: string
    count: number
    prominence: number
  }>
  related_themes?: Array<{
    theme_name: string
    correlation: number
  }>
}

interface ThemeEvolutionDashboardProps {
  organizationId?: string
  projectId?: string
}

export function ThemeEvolutionDashboard({
  organizationId,
  projectId
}: ThemeEvolutionDashboardProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '12months' | 'all'>('6months')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Fetch theme evolution data
  useEffect(() => {
    fetchThemeEvolution()
  }, [organizationId, projectId, timeRange])

  const fetchThemeEvolution = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (organizationId) params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)
      params.append('time_range', timeRange)

      const response = await fetch(`/api/analytics/themes/evolution?${params}`)
      if (!response.ok) throw new Error('Failed to fetch theme evolution')

      const data = await response.json()
      setThemes(data.themes || [])

      // Auto-select first theme
      if (data.themes && data.themes.length > 0 && !selectedTheme) {
        setSelectedTheme(data.themes[0])
      }
    } catch (error) {
      console.error('Error fetching theme evolution:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // Export theme data as CSV
    const csvContent = [
      ['Theme', 'Category', 'Status', 'Usage Count', 'Growth Rate', 'Prominence', 'Storytellers', 'Stories'].join(','),
      ...themes.map(t => [
        t.theme_name,
        t.theme_category,
        t.status,
        t.usage_count,
        `${t.growth_rate}%`,
        t.prominence_score.toFixed(2),
        t.storyteller_count,
        t.story_count
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme-evolution-${timeRange}.csv`
    a.click()
  }

  // Filter themes
  const filteredThemes = themes.filter(theme => {
    if (filterStatus !== 'all' && theme.status !== filterStatus) return false
    if (filterCategory !== 'all' && theme.theme_category !== filterCategory) return false
    return true
  })

  // Get unique categories
  const categories = Array.from(new Set(themes.map(t => t.theme_category)))

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emerging': return 'bg-green-100 text-green-800 border-green-200'
      case 'growing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'stable': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'declining': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'emerging': return <Sparkles className="w-3 h-3" />
      case 'growing': return <TrendingUp className="w-3 h-3" />
      case 'stable': return <Minus className="w-3 h-3" />
      case 'declining': return <TrendingDown className="w-3 h-3" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading theme evolution data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Theme Evolution</h2>
          <p className="text-sm text-gray-600">
            Track how narrative themes emerge, grow, and evolve over time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="emerging">Emerging</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterStatus !== 'all' || filterCategory !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus('all')
                  setFilterCategory('all')
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Themes ({filteredThemes.length})</CardTitle>
            <CardDescription>Select a theme to view details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredThemes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No themes found</p>
            ) : (
              filteredThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-all
                    ${selectedTheme?.id === theme.id
                      ? 'bg-clay-50 border-clay-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-clay-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-900 line-clamp-2">
                      {theme.theme_name}
                    </span>
                    <Badge className={`${getStatusColor(theme.status)} text-xs flex items-center gap-1`}>
                      {getStatusIcon(theme.status)}
                      {theme.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{theme.theme_category}</span>
                    <span className="font-medium">{theme.usage_count} uses</span>
                  </div>
                  {theme.growth_rate !== 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {theme.growth_rate > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-orange-600" />
                      )}
                      <span className={theme.growth_rate > 0 ? 'text-green-600' : 'text-orange-600'}>
                        {theme.growth_rate > 0 ? '+' : ''}{theme.growth_rate}%
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Theme Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTheme ? (
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="relationships">
                  <Network className="w-4 h-4 mr-2" />
                  Network
                </TabsTrigger>
                <TabsTrigger value="shifts">Shifts</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                <ThemeTimeline theme={selectedTheme} timeRange={timeRange} />
                <ProminenceChart theme={selectedTheme} timeRange={timeRange} />
                <GrowthRateCalculator theme={selectedTheme} />
              </TabsContent>

              <TabsContent value="status">
                <ThemeStatus theme={selectedTheme} />
              </TabsContent>

              <TabsContent value="relationships">
                <ThemeRelationshipsGraph theme={selectedTheme} allThemes={themes} />
              </TabsContent>

              <TabsContent value="shifts">
                <SemanticShiftDetector theme={selectedTheme} timeRange={timeRange} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a theme to view evolution details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

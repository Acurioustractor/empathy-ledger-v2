'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Brain,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Clock,
  Filter,
  Download,
  Calendar,
  Building,
  User
} from 'lucide-react'
import { ThemeDistributionChart } from '../analysis/ThemeDistributionChart'

interface TranscriptAnalytics {
  totalTranscripts: number
  totalAnalyzed: number
  themeDistribution: Array<{
    name: string
    count: number
    category?: string
    confidence?: number
  }>
  quoteQuality: {
    average: number
    total: number
  }
  culturalSensitivity: {
    sacred: number
    sensitive: number
    standard: number
  }
  impactDepth: {
    mention: number
    description: number
    demonstration: number
    transformation: number
  }
  processingCosts: {
    total: number
    average: number
  }
  processingTime: {
    average: number
    total: number
  }
  dateRange: {
    start: string
    end: string
  }
}

interface TranscriptAnalyticsDashboardProps {
  analytics: TranscriptAnalytics
  onFilterChange?: (filters: AnalyticsFilters) => void
  onExport?: () => void
  testMode?: boolean
}

interface AnalyticsFilters {
  dateRange?: { start: string; end: string }
  organizationId?: string
  projectId?: string
  storytellerId?: string
  themeCategory?: string
}

export function TranscriptAnalyticsDashboard({
  analytics,
  onFilterChange,
  onExport,
  testMode = false
}: TranscriptAnalyticsDashboardProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AnalyticsFilters>({})

  const handleFilterUpdate = (key: keyof AnalyticsFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleExport = () => {
    if (testMode) {
      console.log('Export analytics (test mode)')
      return
    }

    onExport?.()
  }

  const analysisRate = analytics.totalTranscripts > 0
    ? (analytics.totalAnalyzed / analytics.totalTranscripts) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transcript Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            {analytics.dateRange.start && analytics.dateRange.end && (
              <>
                {new Date(analytics.dateRange.start).toLocaleDateString()} -{' '}
                {new Date(analytics.dateRange.end).toLocaleDateString()}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterUpdate('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterUpdate('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Organization</label>
              <Input
                placeholder="Organization ID"
                value={filters.organizationId || ''}
                onChange={(e) => handleFilterUpdate('organizationId', e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Project</label>
              <Input
                placeholder="Project ID"
                value={filters.projectId || ''}
                onChange={(e) => handleFilterUpdate('projectId', e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Storyteller</label>
              <Input
                placeholder="Storyteller ID"
                value={filters.storytellerId || ''}
                onChange={(e) => handleFilterUpdate('storytellerId', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transcripts */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transcripts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalTranscripts}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totalAnalyzed} analyzed ({Math.round(analysisRate)}%)
              </p>
            </div>
            <FileText className="w-10 h-10 text-sky-600 opacity-50" />
          </div>
        </Card>

        {/* Total Themes */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Themes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.themeDistribution.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.themeDistribution.reduce((sum, t) => sum + t.count, 0)} mentions
              </p>
            </div>
            <Brain className="w-10 h-10 text-clay-600 opacity-50" />
          </div>
        </Card>

        {/* Total Quotes */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quotes Extracted</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.quoteQuality.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(analytics.quoteQuality.average * 100)}% avg quality
              </p>
            </div>
            <MessageSquare className="w-10 h-10 text-sage-600 opacity-50" />
          </div>
        </Card>

        {/* Processing Costs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Costs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${analytics.processingCosts.total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${analytics.processingCosts.average.toFixed(4)} avg
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Cultural Sensitivity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Sensitivity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-ember-600" />
                <span className="text-sm text-gray-700">Sacred Content</span>
              </div>
              <Badge variant="secondary">
                {analytics.culturalSensitivity.sacred}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-600" />
                <span className="text-sm text-gray-700">Sensitive Content</span>
              </div>
              <Badge variant="secondary">
                {analytics.culturalSensitivity.sensitive}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600" />
                <span className="text-sm text-gray-700">Standard Content</span>
              </div>
              <Badge variant="secondary">
                {analytics.culturalSensitivity.standard}
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {analytics.culturalSensitivity.sacred + analytics.culturalSensitivity.sensitive}
              </span>{' '}
              transcripts require Elder review
            </div>
          </div>
        </Card>

        {/* Impact Depth Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Depth Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-400" />
                <span className="text-sm text-gray-700">Mention</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400"
                    style={{
                      width: `${(analytics.impactDepth.mention / analytics.totalAnalyzed) * 100}%`
                    }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 text-center">
                  {analytics.impactDepth.mention}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-400" />
                <span className="text-sm text-gray-700">Description</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400"
                    style={{
                      width: `${(analytics.impactDepth.description / analytics.totalAnalyzed) * 100}%`
                    }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 text-center">
                  {analytics.impactDepth.description}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-400" />
                <span className="text-sm text-gray-700">Demonstration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400"
                    style={{
                      width: `${(analytics.impactDepth.demonstration / analytics.totalAnalyzed) * 100}%`
                    }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 text-center">
                  {analytics.impactDepth.demonstration}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-400" />
                <span className="text-sm text-gray-700">Transformation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400"
                    style={{
                      width: `${(analytics.impactDepth.transformation / analytics.totalAnalyzed) * 100}%`
                    }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 text-center">
                  {analytics.impactDepth.transformation}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Theme Distribution Chart */}
      {analytics.themeDistribution.length > 0 && (
        <ThemeDistributionChart
          themes={analytics.themeDistribution}
          showCategories
          limit={10}
          testMode={testMode}
        />
      )}

      {/* Processing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">Processing Time</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average per Transcript</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analytics.processingTime.average / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Processing Time</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analytics.processingTime.total / 60000).toFixed(1)}m
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average per Transcript</span>
              <span className="text-lg font-semibold text-gray-900">
                ${analytics.processingCosts.average.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Costs</span>
              <span className="text-lg font-semibold text-gray-900">
                ${analytics.processingCosts.total.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Cost per quote: ${(analytics.processingCosts.total / analytics.quoteQuality.total).toFixed(4)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Share2,
  Download,
  Calendar,
  Building2,
  Eye,
  MessageCircle,
  Heart,
  AlertCircle
} from 'lucide-react'
import { MetricsOverview } from './MetricsOverview'
import { EngagementMetrics } from './EngagementMetrics'
import { StorytellerMetrics } from './StorytellerMetrics'
import { DemographicsBreakdown } from './DemographicsBreakdown'

interface OrganizationAnalyticsDashboardProps {
  organizationId: string
  organizations?: Array<{ id: string; name: string }>
  canManage?: boolean
}

type TimePeriod = 'month' | 'quarter' | 'year' | 'all-time'

export function OrganizationAnalyticsDashboard({
  organizationId: initialOrgId,
  organizations = [],
  canManage = false
}: OrganizationAnalyticsDashboardProps) {
  const [selectedOrg, setSelectedOrg] = useState(initialOrgId)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [overviewData, setOverviewData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [selectedOrg, timePeriod])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/analytics/organization/${selectedOrg}/overview?period=${timePeriod}`
      )

      if (!response.ok) {
        throw new Error('Failed to load analytics')
      }

      const data = await response.json()
      setOverviewData(data)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/reports/export`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: selectedOrg,
            period: timePeriod,
            reportType: 'analytics_overview',
            format: 'pdf'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${timePeriod}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export report. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-sky-600" />
            Organization Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Measure impact, track engagement, and demonstrate outcomes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Organization Selector */}
          {organizations.length > 1 && (
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Time Period Selector */}
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error Loading Analytics</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={loadAnalytics}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !overviewData && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Insights Cards */}
      {overviewData && !isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Stories
              </CardTitle>
              <BookOpen className="h-5 w-5 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {overviewData.total_stories || 0}
              </div>
              {overviewData.stories_trend && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  overviewData.stories_trend > 0 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {overviewData.stories_trend > 0 ? '+' : ''}{overviewData.stories_trend} this period
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Storytellers
              </CardTitle>
              <Users className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {overviewData.active_storytellers || 0}
              </div>
              {overviewData.storytellers_trend && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  overviewData.storytellers_trend > 0 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {overviewData.storytellers_trend > 0 ? '+' : ''}{overviewData.storytellers_trend} new
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Engagement
              </CardTitle>
              <Heart className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {overviewData.total_engagement || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Views, shares, and comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reach
              </CardTitle>
              <Eye className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {overviewData.total_reach || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Unique visitors
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      {overviewData && !isLoading && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="storytellers">Storytellers</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MetricsOverview
              organizationId={selectedOrg}
              period={timePeriod}
            />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <EngagementMetrics
              organizationId={selectedOrg}
              period={timePeriod}
            />
          </TabsContent>

          <TabsContent value="storytellers" className="space-y-6">
            <StorytellerMetrics
              organizationId={selectedOrg}
              period={timePeriod}
            />
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <DemographicsBreakdown
              organizationId={selectedOrg}
              period={timePeriod}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Cultural Integrity Notice */}
      <Card className="border-sage-200 bg-sage-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-sage-600 mt-0.5" />
            <div>
              <p className="font-medium text-sage-900">Cultural Integrity</p>
              <p className="text-sm text-sage-700 mt-1">
                These analytics honor storyteller privacy and cultural protocols.
                Stories marked as sacred or sensitive are not included in public metrics.
                All data respects OCAP® principles (Ownership, Control, Access, Possession).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Download, TrendingUp, Users, BookOpen, FolderOpen, Activity, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface AnalyticsData {
  users: {
    total: number
    active_monthly: number
    new_this_month: number
    growth_rate: number
  }
  stories: {
    total: number
    published_this_month: number
    average_length: number
    engagement_rate: number
  }
  projects: {
    total: number
    active: number
    completed_this_month: number
    completion_rate: number
  }
  organisations: {
    total: number
    active: number
    new_this_month: number
    average_members: number
  }
  activity: {
    daily_active_users: Array<{ date: string; count: number }>
    popular_content: Array<{ title: string; views: number; type: string }>
    top_storytellers: Array<{ name: string; stories: number; engagement: number }>
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, description }: MetricCardProps) {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-grey-600'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            <span className={`text-xs font-medium ${getChangeColor(change)}`}>
              {formatChange(change)}
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?range=${timeRange}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting analytics:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-grey-900">Analytics</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-grey-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-grey-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Analytics</h1>
          <p className="text-grey-600">
            Platform insights, user engagement, and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <>
          <div className="grid gap-6 md:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={formatNumber(analytics.users.total)}
              change={analytics.users.growth_rate}
              changeLabel="vs last period"
              icon={Users}
              description={`${analytics.users.active_monthly} active this month`}
            />
            <MetricCard
              title="Total Stories"
              value={formatNumber(analytics.stories.total)}
              change={analytics.stories.engagement_rate}
              changeLabel="engagement rate"
              icon={BookOpen}
              description={`${analytics.stories.published_this_month} published this month`}
            />
            <MetricCard
              title="Active Projects"
              value={analytics.projects.active}
              change={analytics.projects.completion_rate}
              changeLabel="completion rate"
              icon={FolderOpen}
              description={`${analytics.projects.completed_this_month} completed this month`}
            />
            <MetricCard
              title="Organizations"
              value={analytics.organisations.total}
              change={(analytics.organisations.new_this_month / analytics.organisations.total) * 100}
              changeLabel="new this month"
              icon={BarChart3}
              description={`Avg ${analytics.organisations.average_members} members each`}
            />
          </div>

          {/* Activity and Engagement */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Daily Active Users
                </CardTitle>
                <CardDescription>
                  User activity over the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.activity.daily_active_users.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-grey-600">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-grey-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(day.count / Math.max(...analytics.activity.daily_active_users.map(d => d.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Content
                </CardTitle>
                <CardDescription>
                  Most viewed stories and content this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.activity.popular_content.slice(0, 6).map((content, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate">
                          {content.title}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {content.type}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium text-grey-600 ml-2">
                        {formatNumber(content.views)} views
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Storytellers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Storytellers
              </CardTitle>
              <CardDescription>
                Most active storytellers by stories and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.activity.top_storytellers.slice(0, 8).map((storyteller, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{storyteller.name}</div>
                        <div className="text-xs text-grey-500">
                          {storyteller.stories} stories
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(storyteller.engagement)}% engagement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">New users this month</span>
                    <span className="font-medium">{analytics.users.new_this_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Monthly active users</span>
                    <span className="font-medium">{analytics.users.active_monthly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Growth rate</span>
                    <span className={`font-medium ${analytics.users.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.users.growth_rate >= 0 ? '+' : ''}{analytics.users.growth_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Avg. story length</span>
                    <span className="font-medium">{analytics.stories.average_length} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Stories this month</span>
                    <span className="font-medium">{analytics.stories.published_this_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Engagement rate</span>
                    <span className="font-medium text-blue-600">
                      {analytics.stories.engagement_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Active organisations</span>
                    <span className="font-medium">{analytics.organisations.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">New this month</span>
                    <span className="font-medium">{analytics.organisations.new_this_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-grey-600">Avg. members</span>
                    <span className="font-medium">{analytics.organisations.average_members}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
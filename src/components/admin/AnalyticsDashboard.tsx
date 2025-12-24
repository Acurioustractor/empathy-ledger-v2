'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Globe,
  Heart,
  Shield,
  Crown,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    newUsersThisMonth: number
    activeUsersThisWeek: number
    totalStories: number
    publishedStories: number
    pendingStories: number
    storiesThisMonth: number
    totalStorytellers: number
    activeStorytellers: number
  }
  trends: {
    userGrowth: {
      thisMonth: number
      percentage: number
    }
    storyGrowth: {
      thisMonth: number
      percentage: number
    }
  }
  breakdown: {
    culturalSensitivity: Record<string, number>
    storyTypes: Record<string, number>
  }
  activity: {
    dailyStoryCreation: Record<string, number>
  }
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/analytics/overview')
      const analyticsData = await response.json()
      
      if (response.ok) {
        setData(analyticsData)
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch analytics:', analyticsData.error)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const getTrendIcon = (percentage: number) => {
    if (percentage > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (percentage < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return <Activity className="w-4 h-4 text-stone-500" />
  }

  const getTrendColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600'
    if (percentage < 0) return 'text-red-600'
    return 'text-stone-600'
  }

  const formatPercentage = (num: number) => {
    const sign = num > 0 ? '+' : ''
    return `${sign}${num}%`
  }

  const getCulturalSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getStoryTypeIcon = (type: string) => {
    switch (type) {
      case 'traditional': return <Crown className="w-4 h-4" />
      case 'personal': return <Heart className="w-4 h-4" />
      case 'historical': return <Globe className="w-4 h-4" />
      case 'educational': return <BookOpen className="w-4 h-4" />
      case 'healing': return <Shield className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <div className="text-lg font-medium mb-2">Loading analytics...</div>
            <div className="text-muted-foreground">Please wait while we gather platform data</div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <div className="text-lg font-medium mb-2">Unable to load analytics</div>
            <div className="text-muted-foreground mb-4">There was an error loading the analytics data</div>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Platform Analytics</h2>
          <p className="text-muted-foreground">
            Monitor platform usage, engagement, and cultural impact metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-clay-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.userGrowth.percentage)}`}>
              {getTrendIcon(data.trends.userGrowth.percentage)}
              {formatPercentage(data.trends.userGrowth.percentage)} this month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <BookOpen className="w-4 h-4 text-sage-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalStories.toLocaleString()}</div>
            <div className={`text-xs flex items-center gap-1 ${getTrendColor(data.trends.storyGrowth.percentage)}`}>
              {getTrendIcon(data.trends.storyGrowth.percentage)}
              {formatPercentage(data.trends.storyGrowth.percentage)} this month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Stories</CardTitle>
              <Activity className="w-4 h-4 text-sage-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.publishedStories.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {data.overview.pendingStories || 0} pending review
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Storytellers</CardTitle>
              <Crown className="w-4 h-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.overview.totalStorytellers || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {data.overview.activeStorytellers || 0} active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cultural Sensitivity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cultural Sensitivity Levels
            </CardTitle>
            <CardDescription>
              Distribution of published stories by cultural sensitivity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.breakdown.culturalSensitivity).map(([level, count]) => {
              const total = Object.values(data.breakdown.culturalSensitivity).reduce((sum, c) => sum + c, 0)
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0
              
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getCulturalSensitivityColor(level)} variant="secondary">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count} stories</span>
                  </div>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Story Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Story Types
            </CardTitle>
            <CardDescription>
              Distribution of published stories by type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.breakdown.storyTypes).map(([type, count]) => {
              const total = Object.values(data.breakdown.storyTypes).reduce((sum, c) => sum + c, 0)
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStoryTypeIcon(type)}
                      <span className="font-medium">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{count} stories</span>
                  </div>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity (Last 30 Days)
          </CardTitle>
          <CardDescription>
            Daily story creation activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(data.activity.dailyStoryCreation)
              .slice(-14) // Show last 14 days
              .map(([date, count]) => {
                const maxCount = Math.max(...Object.values(data.activity.dailyStoryCreation))
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0
                
                return (
                  <div key={date} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2 relative">
                      <div 
                        className="bg-sage-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
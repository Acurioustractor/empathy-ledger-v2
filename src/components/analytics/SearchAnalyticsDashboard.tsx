'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Search,
  TrendingUp,
  Clock,
  Target,
  Users,
  BarChart3,
  Filter,
  Sparkles
} from 'lucide-react'

interface SearchAnalyticsDashboardProps {
  organizationId: string
}

interface SearchMetrics {
  total_searches: number
  unique_users: number
  avg_results_per_search: number
  avg_search_time_ms: number
  top_queries: Array<{ query: string; count: number }>
  search_trends: Array<{ date: string; count: number }>
  result_click_rate: number
  no_results_rate: number
  filter_usage: Array<{ filter: string; count: number }>
  search_types: Array<{ type: string; count: number }>
}

export function SearchAnalyticsDashboard({ organizationId }: SearchAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [organizationId, timeRange])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/analytics/search?organization_id=${organizationId}&time_range=${timeRange}`
      )
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching search analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#D97757', '#2D5F4F', '#4A90A4', '#D4A373', '#8B5A8E']

  if (loading || !metrics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Search Analytics</h2>
        <p className="text-sm text-gray-600">
          Insights into search behavior and content discovery patterns
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <Badge
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
            {range === '90d' && 'Last 90 Days'}
          </Badge>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_searches.toLocaleString()}</p>
              </div>
              <Search className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.unique_users}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Results</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avg_results_per_search.toFixed(1)}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avg_search_time_ms}ms</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="queries">Top Queries</TabsTrigger>
          <TabsTrigger value="filters">Filter Usage</TabsTrigger>
          <TabsTrigger value="types">Search Types</TabsTrigger>
        </TabsList>

        {/* Search Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Search Volume Over Time</CardTitle>
              <CardDescription>Number of searches performed each day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.search_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#D97757"
                    strokeWidth={2}
                    name="Searches"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Queries */}
        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Search Queries</CardTitle>
              <CardDescription>What people are searching for most often</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.top_queries.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="query" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4A90A4" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {metrics.top_queries.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm font-medium">{item.query}</span>
                    </div>
                    <Badge variant="secondary">{item.count} searches</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filter Usage */}
        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle>Filter Usage Distribution</CardTitle>
              <CardDescription>How often each filter type is used</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.filter_usage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ filter, percent }) => `${filter} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.filter_usage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {metrics.filter_usage.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.filter}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Types */}
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Search Type Distribution</CardTitle>
              <CardDescription>Breakdown of keyword vs semantic searches</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.search_types}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2D5F4F" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {metrics.search_types.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      {item.type === 'semantic' ? (
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Search className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="font-medium capitalize">{item.type} Search</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{
                            width: `${(item.count / metrics.total_searches) * 100}%`
                          }}
                        />
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Effectiveness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Click-through Rate</span>
                <span className="font-semibold">{(metrics.result_click_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${metrics.result_click_rate * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">No Results Rate</span>
                <span className="font-semibold">{(metrics.no_results_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${metrics.no_results_rate * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>
                <strong>{metrics.search_trends[metrics.search_trends.length - 1]?.count || 0}</strong> searches yesterday,
                showing {metrics.search_trends.length > 7 && metrics.search_trends[metrics.search_trends.length - 1].count > metrics.search_trends[metrics.search_trends.length - 8].count ? 'growth' : 'steady activity'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-orange-600 mt-0.5" />
              <p>
                <strong>{(100 - metrics.no_results_rate * 100).toFixed(0)}%</strong> of searches return results
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Filter className="w-4 h-4 text-green-600 mt-0.5" />
              <p>
                Users apply filters <strong>{((metrics.filter_usage.reduce((sum, f) => sum + f.count, 0) / metrics.total_searches) * 100).toFixed(0)}%</strong> of the time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

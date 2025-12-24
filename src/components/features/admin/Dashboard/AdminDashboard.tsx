'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  Building2,
  FolderOpen,
  TrendingUp,
  Activity,
  DollarSign,
  Eye,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStorytellers } from '@/lib/hooks/useStorytellers'

// Mock data for charts
const engagementData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 700 },
  { name: 'Sun', value: 900 },
]

const storiesData = [
  { month: 'Jan', stories: 65, views: 450 },
  { month: 'Feb', stories: 78, views: 520 },
  { month: 'Mar', stories: 90, views: 680 },
  { month: 'Apr', stories: 81, views: 790 },
  { month: 'May', stories: 95, views: 850 },
  { month: 'Jun', stories: 110, views: 920 },
]

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  colour?: string
}

function MetricCard({ title, value, change, icon: Icon, colour = 'blue' }: MetricCardProps) {
  const isPositive = change && change > 0
  const colorClasses = {
    blue: 'bg-sage-100 text-sage-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-clay-100 text-clay-600',
    orange: 'bg-orange-100 text-orange-600',
  }[colour]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {isPositive ? (
                  <ArrowUp className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600" />
                )}
                <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(change)}%
                </span>
                <span className="text-stone-500">from last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { summary, isLoading } = useStorytellers({ limit: 1 })
  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-stone-500">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Storyteller
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Storytellers"
          value={summary?.total || 0}
          change={12}
          icon={Users}
          colour="blue"
        />
        <MetricCard
          title="Total Stories"
          value={summary?.totalStories || 0}
          change={18}
          icon={BookOpen}
          colour="green"
        />
        <MetricCard
          title="Active Organizations"
          value={19}
          change={5}
          icon={Building2}
          colour="purple"
        />
        <MetricCard
          title="Total Views"
          value={summary?.totalViews || '0'}
          change={-3}
          icon={Eye}
          colour="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <CardDescription>User engagement over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stories & Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stories & Views</CardTitle>
            <CardDescription>Monthly story creation and view counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stories" fill="#3b82f6" />
                <Bar dataKey="views" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and updates across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4 mt-4">
              {/* Activity Items */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New story published by Sarah Johnson</p>
                      <p className="text-xs text-stone-500">2 minutes ago</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="stories">
              <p className="text-sm text-stone-500">No recent story activity</p>
            </TabsContent>
            <TabsContent value="users">
              <p className="text-sm text-stone-500">No recent user activity</p>
            </TabsContent>
            <TabsContent value="system">
              <p className="text-sm text-stone-500">No recent system activity</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sage-100 rounded-lg">
                <Users className="h-6 w-6 text-sage-600" />
              </div>
              <div>
                <p className="font-medium">Manage Storytellers</p>
                <p className="text-sm text-stone-500">View and edit all storytellers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Review Stories</p>
                <p className="text-sm text-stone-500">Moderate and approve content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-clay-100 rounded-lg">
                <Activity className="h-6 w-6 text-clay-600" />
              </div>
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-stone-500">Detailed platform insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
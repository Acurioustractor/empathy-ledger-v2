'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BookOpen,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Share2,
  Settings,
  ArrowUp,
  Clock,
  Star
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data
const viewsData = [
  { day: 'Mon', views: 120 },
  { day: 'Tue', views: 180 },
  { day: 'Wed', views: 150 },
  { day: 'Thu', views: 220 },
  { day: 'Fri', views: 280 },
  { day: 'Sat', views: 200 },
  { day: 'Sun', views: 240 },
]

const engagementData = [
  { name: 'Reads', value: 65, colour: '#3b82f6' },
  { name: 'Likes', value: 25, colour: '#10b981' },
  { name: 'Comments', value: 10, colour: '#f59e0b' },
]

const recentStories = [
  {
    id: 1,
    title: 'Finding My Voice Through Traditional Songs',
    status: 'published',
    views: 342,
    likes: 28,
    comments: 12,
    publishedAt: '2 days ago',
  },
  {
    id: 2,
    title: 'The Sacred Journey of a Midwife',
    status: 'published',
    views: 289,
    likes: 34,
    comments: 8,
    publishedAt: '5 days ago',
  },
  {
    id: 3,
    title: 'Community Responsibility and Respect',
    status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    publishedAt: 'Not published',
  },
]

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  subtitle?: string
}

function MetricCard({ title, value, change, icon: Icon, subtitle }: MetricCardProps) {
  const isPositive = change && change > 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-grey-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-grey-500">{subtitle}</p>}
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <ArrowUp className={`h-3 w-3 ${isPositive ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(change)}%
                </span>
                <span className="text-grey-500">from last week</span>
              </div>
            )}
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StorytellerDashboard() {
  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, Sarah!</h1>
                <p className="text-grey-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Darwin, Northern Territory
                  <span className="mx-2">•</span>
                  <Users className="h-4 w-4" />
                  Snow Foundation
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Story
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Stories"
              value="24"
              change={12}
              icon={BookOpen}
              subtitle="3 drafts, 21 published"
            />
            <MetricCard
              title="Total Views"
              value="3,421"
              change={28}
              icon={Eye}
              subtitle="Last 30 days"
            />
            <MetricCard
              title="Engagement Rate"
              value="8.4%"
              change={-5}
              icon={Heart}
              subtitle="Likes + Comments"
            />
            <MetricCard
              title="Followers"
              value="187"
              change={15}
              icon={Users}
              subtitle="Active followers"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Story Views</CardTitle>
                <CardDescription>Your story views over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
                <CardDescription>How people interact with your stories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.colour} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {engagementData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.colour }} />
                      <span className="text-sm text-grey-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stories Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Stories</CardTitle>
                  <CardDescription>Manage and track your story performance</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Story
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="published" className="w-full">
                <TabsList>
                  <TabsTrigger value="published">Published (21)</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts (3)</TabsTrigger>
                  <TabsTrigger value="archived">Archived (0)</TabsTrigger>
                </TabsList>
                <TabsContent value="published" className="space-y-4 mt-4">
                  {recentStories.filter(s => s.status === 'published').map((story) => (
                    <div key={story.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-grey-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{story.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-grey-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {story.publishedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {story.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {story.likes} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {story.comments} comments
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Share</Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="drafts" className="space-y-4 mt-4">
                  {recentStories.filter(s => s.status === 'draft').map((story) => (
                    <div key={story.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-grey-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{story.title}</h4>
                        <p className="text-sm text-grey-500 mt-1">Draft - Not published</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Continue Writing</Button>
                        <Button variant="ghost" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="archived">
                  <p className="text-sm text-grey-500 text-center py-8">No archived stories</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Story Templates</p>
                    <p className="text-sm text-grey-500">Start from a template</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-grey-500">Detailed insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-grey-500">Manage preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
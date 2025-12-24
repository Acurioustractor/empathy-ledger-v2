'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Eye,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Bell,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface PartnerDashboardProps {
  appId: string
  appName: string
}

interface DashboardData {
  metrics: {
    totalViews: number
    viewsTrend: number
    activeStories: number
    storiesTrend: number
    avgReadTime: string
    readTimeTrend: number
    activeProjects: number
  }
  recentActivity: Array<{
    id: string
    type: 'consent_approved' | 'consent_declined' | 'message_received' | 'request_sent'
    title: string
    description: string
    timestamp: string
    storytellerName?: string
    storyTitle?: string
  }>
  engagementData: Array<{
    date: string
    views: number
    reads: number
  }>
  pendingRequests: number
  unreadMessages: number
}

export function PartnerDashboard({ appId, appName }: PartnerDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch(`/api/partner/dashboard?app_id=${appId}`)
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [appId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
      </div>
    )
  }

  // Mock data for demo
  const mockData: DashboardData = data || {
    metrics: {
      totalViews: 1247,
      viewsTrend: 18,
      activeStories: 23,
      storiesTrend: 3,
      avgReadTime: '5:32',
      readTimeTrend: 12,
      activeProjects: 4
    },
    recentActivity: [
      {
        id: '1',
        type: 'consent_approved',
        title: 'Story approved',
        description: '"Climate Journey" approved for Climate Justice project',
        timestamp: '2 hours ago',
        storytellerName: 'Maria T.',
        storyTitle: 'Climate Journey'
      },
      {
        id: '2',
        type: 'message_received',
        title: 'New message',
        description: 'David K. replied to your message about "My Story"',
        timestamp: 'Yesterday',
        storytellerName: 'David K.'
      },
      {
        id: '3',
        type: 'request_sent',
        title: 'Request pending',
        description: 'Waiting for approval on "Finding Hope"',
        timestamp: '3 days ago',
        storyTitle: 'Finding Hope'
      }
    ],
    engagementData: [
      { date: 'Mon', views: 120, reads: 89 },
      { date: 'Tue', views: 145, reads: 102 },
      { date: 'Wed', views: 132, reads: 95 },
      { date: 'Thu', views: 178, reads: 134 },
      { date: 'Fri', views: 198, reads: 156 },
      { date: 'Sat', views: 167, reads: 123 },
      { date: 'Sun', views: 189, reads: 145 }
    ],
    pendingRequests: 3,
    unreadMessages: 2
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Welcome back to {appName}
          </h1>
          <p className="text-stone-500 mt-1">
            Here's what's happening with your stories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {(mockData.pendingRequests + mockData.unreadMessages) > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {mockData.pendingRequests + mockData.unreadMessages}
              </span>
            )}
          </Button>
          <Button className="bg-sage-600 hover:bg-sage-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={mockData.metrics.totalViews.toLocaleString()}
          trend={mockData.metrics.viewsTrend}
          icon={Eye}
        />
        <MetricCard
          title="Active Stories"
          value={mockData.metrics.activeStories.toString()}
          trend={mockData.metrics.storiesTrend}
          trendLabel="new"
          icon={BookOpen}
        />
        <MetricCard
          title="Avg Read Time"
          value={mockData.metrics.avgReadTime}
          trend={mockData.metrics.readTimeTrend}
          icon={Clock}
        />
        <MetricCard
          title="Projects"
          value={mockData.metrics.activeProjects.toString()}
          icon={FolderKanban}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sage-600" />
              Engagement This Week
            </CardTitle>
            <CardDescription>
              Views and completed reads across all your stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.engagementData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5a7c65" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5a7c65" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="readsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b6f4e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b6f4e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                  <YAxis stroke="#78716c" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fafaf9',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#5a7c65"
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                    name="Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="reads"
                    stroke="#8b6f4e"
                    fill="url(#readsGradient)"
                    strokeWidth={2}
                    name="Reads"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sage-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sage-600">
              View all activity
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon={BookOpen}
              title="Browse Stories"
              description="Find stories for your projects"
              href="/portal/catalog"
            />
            <QuickActionCard
              icon={FolderKanban}
              title="Manage Projects"
              description="Organize your story collections"
              href="/portal/projects"
            />
            <QuickActionCard
              icon={MessageSquare}
              title="Messages"
              description={mockData.unreadMessages > 0 ? `${mockData.unreadMessages} unread` : 'Chat with storytellers'}
              href="/portal/messages"
              badge={mockData.unreadMessages}
            />
            <QuickActionCard
              icon={BarChart3}
              title="Analytics"
              description="View detailed engagement data"
              href="/portal/analytics"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Sub-components

function MetricCard({
  title,
  value,
  trend,
  trendLabel = '%',
  icon: Icon
}: {
  title: string
  value: string
  trend?: number
  trendLabel?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">{title}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
            {trend !== undefined && (
              <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}{trendLabel}
                <span className="text-stone-400 ml-1">vs last period</span>
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-sage-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-sage-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  activity
}: {
  activity: DashboardData['recentActivity'][0]
}) {
  const iconMap = {
    consent_approved: CheckCircle2,
    consent_declined: XCircle,
    message_received: MessageSquare,
    request_sent: Clock
  }

  const colorMap = {
    consent_approved: 'text-green-600 bg-green-100',
    consent_declined: 'text-red-600 bg-red-100',
    message_received: 'text-sage-600 bg-sage-100',
    request_sent: 'text-amber-600 bg-amber-100'
  }

  const Icon = iconMap[activity.type]
  const colorClass = colorMap[activity.type]

  return (
    <div className="flex items-start gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">
          {activity.title}
        </p>
        <p className="text-xs text-stone-500 truncate">
          {activity.description}
        </p>
        <p className="text-xs text-stone-400 mt-1">
          {activity.timestamp}
        </p>
      </div>
    </div>
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  badge
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  badge?: number
}) {
  return (
    <a
      href={href}
      className="block p-4 rounded-lg border border-stone-200 hover:border-sage-300 hover:bg-sage-50 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-stone-100 group-hover:bg-sage-100 flex items-center justify-center transition-colors">
          <Icon className="h-5 w-5 text-stone-600 group-hover:text-sage-600" />
        </div>
        {badge !== undefined && badge > 0 && (
          <Badge variant="destructive" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="font-medium text-stone-900 mt-3">{title}</h3>
      <p className="text-sm text-stone-500 mt-1">{description}</p>
    </a>
  )
}

export default PartnerDashboard

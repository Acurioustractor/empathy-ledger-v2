'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  Shield,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
  FileText,
  Activity,
  TrendingUp,
  RefreshCw,
  Database,
  BarChart3,
  Network,
  Globe,
  FolderOpen,
  Image,
  Settings,
  Layout,
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStories: 0,
    pendingReviews: 0,
    totalOrganizations: 0,
    flaggedContent: 0,
    elderApprovals: 0,
    recentActivity: 0,
    totalTranscripts: 0,
    storiesThisWeek: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchAdminStats = async () => {
    try {
      setIsLoadingStats(true)
      setError(null)

      const [usersRes, storiesRes, reviewsRes, orgsRes] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/stories'),
        fetch('/api/admin/stats/reviews'),
        fetch('/api/admin/stats/organisations'),
      ])

      const [usersData, storiesData, reviewsData, orgsData] = await Promise.all([
        usersRes.ok ? usersRes.json() : { total: 0, active: 0 },
        storiesRes.ok ? storiesRes.json() : { total: 0 },
        reviewsRes.ok ? reviewsRes.json() : { pending: 0, flagged: 0 },
        orgsRes.ok ? orgsRes.json() : { total: 0 },
      ])

      setStats({
        totalUsers: usersData.total || 0,
        activeUsers: usersData.active || 0,
        totalStories: storiesData.total || 0,
        pendingReviews: reviewsData.pending || 0,
        totalOrganizations: orgsData.total || 0,
        flaggedContent: reviewsData.flagged || 0,
        elderApprovals: reviewsData.elderApprovals || 0,
        recentActivity: usersData.recentActivity || 0,
        totalTranscripts: storiesData.transcripts || 0,
        storiesThisWeek: storiesData.thisWeek || 0,
      })
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string
    value: number | string
    icon: React.ElementType
    color: string
    subtitle?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">{title}</p>
            <p className="text-3xl font-bold mt-1">
              {isLoadingStats ? (
                <span className="inline-block w-16 h-8 bg-stone-200 animate-pulse rounded" />
              ) : (
                typeof value === 'number' ? value.toLocaleString() : value
              )}
            </p>
            {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ActionCard = ({ title, description, href, icon: Icon, color, count, urgent }: {
    title: string
    description: string
    href: string
    icon: React.ElementType
    color: string
    count?: number
    urgent?: boolean
  }) => (
    <Link href={href}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${urgent ? 'border-orange-300 bg-orange-50' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {count !== undefined && count > 0 && (
              <Badge variant={urgent ? "destructive" : "secondary"} className="text-xs">
                {count}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold mt-3">{title}</h3>
          <p className="text-sm text-stone-500 mt-1">{description}</p>
          <div className="flex items-center mt-3 text-sm font-medium text-terracotta-600">
            Go to {title.toLowerCase()} <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminStats}
            disabled={isLoadingStats}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/admin/quick-add">
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error loading data</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAdminStats}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgent Actions */}
      {(stats.pendingReviews > 0 || stats.flaggedContent > 0 || stats.elderApprovals > 0) && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.pendingReviews > 0 && (
                <Link href="/admin/reviews">
                  <Badge variant="outline" className="py-2 px-3 text-sm bg-white cursor-pointer hover:bg-stone-50">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    {stats.pendingReviews} pending reviews
                  </Badge>
                </Link>
              )}
              {stats.flaggedContent > 0 && (
                <Link href="/admin/reviews?filter=flagged">
                  <Badge variant="outline" className="py-2 px-3 text-sm bg-white cursor-pointer hover:bg-stone-50">
                    <Flag className="w-4 h-4 mr-2 text-red-500" />
                    {stats.flaggedContent} flagged content
                  </Badge>
                </Link>
              )}
              {stats.elderApprovals > 0 && (
                <Link href="/admin/reviews?filter=elder">
                  <Badge variant="outline" className="py-2 px-3 text-sm bg-white cursor-pointer hover:bg-stone-50">
                    <Shield className="w-4 h-4 mr-2 text-clay-500" />
                    {stats.elderApprovals} elder approvals
                  </Badge>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Storytellers"
          value={stats.totalUsers}
          icon={Users}
          color="bg-sage-500"
          subtitle={`${stats.activeUsers} active`}
        />
        <StatCard
          title="Total Stories"
          value={stats.totalStories}
          icon={BookOpen}
          color="bg-green-500"
          subtitle={stats.storiesThisWeek > 0 ? `+${stats.storiesThisWeek} this week` : undefined}
        />
        <StatCard
          title="Organizations"
          value={stats.totalOrganizations}
          icon={Building2}
          color="bg-clay-500"
        />
        <StatCard
          title="Transcripts"
          value={stats.totalTranscripts}
          icon={FileText}
          color="bg-terracotta-500"
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="Quick Add"
            description="Add storyteller with transcript"
            href="/admin/quick-add"
            icon={PlusCircle}
            color="bg-green-500"
          />
          <ActionCard
            title="Storytellers"
            description="Manage all storytellers"
            href="/admin/storytellers"
            icon={Users}
            color="bg-sage-500"
            count={stats.totalUsers}
          />
          <ActionCard
            title="Reviews"
            description="Content moderation queue"
            href="/admin/reviews"
            icon={Shield}
            color="bg-orange-500"
            count={stats.pendingReviews}
            urgent={stats.pendingReviews > 0}
          />
          <ActionCard
            title="Transcripts"
            description="Manage transcripts"
            href="/admin/transcripts"
            icon={FileText}
            color="bg-terracotta-500"
            count={stats.totalTranscripts}
          />
        </div>
      </div>

      {/* Content Management */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Content Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Stories"
            description="View and manage all stories"
            href="/admin/stories"
            icon={BookOpen}
            color="bg-emerald-500"
            count={stats.totalStories}
          />
          <ActionCard
            title="Organizations"
            description="Manage organizations"
            href="/admin/organisations"
            icon={Building2}
            color="bg-clay-500"
            count={stats.totalOrganizations}
          />
          <ActionCard
            title="Projects"
            description="Manage storytelling projects"
            href="/admin/projects"
            icon={FolderOpen}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Analytics & Visualizations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Analytics & Visualizations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ActionCard
            title="Analytics Dashboard"
            description="Platform metrics and insights"
            href="/admin/analytics"
            icon={BarChart3}
            color="bg-blue-500"
          />
          <ActionCard
            title="Database Explorer"
            description="Browse all 106 database tables"
            href="/admin/database-explorer"
            icon={Database}
            color="bg-indigo-500"
          />
          <ActionCard
            title="Network Graph"
            description="Interactive D3.js visualization"
            href="/admin/visualizations/network-graph"
            icon={Network}
            color="bg-violet-500"
          />
          <ActionCard
            title="Interactive Diagram"
            description="System-organized table browser"
            href="/admin/visualizations/interactive-diagram"
            icon={Layout}
            color="bg-purple-500"
          />
          <ActionCard
            title="World Tour Analytics"
            description="Global engagement metrics"
            href="/admin/world-tour/analytics"
            icon={Globe}
            color="bg-cyan-500"
          />
        </div>
      </div>

      {/* System Tools */}
      <div>
        <h2 className="text-lg font-semibold mb-4">System Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Activity Log"
            description="View platform activity"
            href="/admin/audit-log"
            icon={Activity}
            color="bg-stone-600"
          />
          <ActionCard
            title="Media Gallery"
            description="Manage photos and media"
            href="/admin/galleries"
            icon={Image}
            color="bg-pink-500"
          />
          <ActionCard
            title="Settings"
            description="System configuration"
            href="/admin/settings"
            icon={Settings}
            color="bg-gray-600"
          />
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">All Services</p>
                  <p className="text-sm text-stone-500">Operational</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sage-500" />
                <div>
                  <p className="font-medium">Data Status</p>
                  <p className="text-sm text-stone-500">{isLoadingStats ? 'Loading...' : 'Synced'}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-sage-600 border-sage-200 bg-sage-50">
                {isLoadingStats ? 'Loading' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard

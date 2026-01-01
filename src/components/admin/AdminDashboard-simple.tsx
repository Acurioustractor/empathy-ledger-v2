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
  Settings,
  BarChart3,
  Eye,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  console.log('🔧 AdminDashboard: Component rendering...')

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStories: 0,
    pendingReviews: 0,
    totalOrganizations: 0,
    flaggedContent: 0,
    elderApprovals: 0,
    recentActivity: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real admin statistics
  const fetchAdminStats = async () => {
    console.log('🔧 AdminDashboard: Fetching admin stats...')
    try {
      setIsLoadingStats(true)
      setError(null)

      // Fetch users count
      const usersResponse = await fetch('/api/admin/stats/users')
      if (!usersResponse.ok) throw new Error('Failed to fetch users stats')
      const usersData = await usersResponse.json()

      // Fetch stories count
      const storiesResponse = await fetch('/api/admin/stats/stories')
      if (!storiesResponse.ok) throw new Error('Failed to fetch stories stats')
      const storiesData = await storiesResponse.json()

      // Fetch pending reviews count
      const reviewsResponse = await fetch('/api/admin/stats/reviews')
      if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews stats')
      const reviewsData = await reviewsResponse.json()

      // Fetch organisations count
      const orgsResponse = await fetch('/api/admin/stats/organisations')
      if (!orgsResponse.ok) throw new Error('Failed to fetch organisations stats')
      const orgsData = await orgsResponse.json()

      setStats({
        totalUsers: usersData.total || 0,
        activeUsers: usersData.active || 0,
        totalStories: storiesData.total || 0,
        pendingReviews: reviewsData.pending || 0,
        totalOrganizations: orgsData.total || 0,
        flaggedContent: reviewsData.flagged || 0,
        elderApprovals: reviewsData.elderApprovals || 0,
        recentActivity: usersData.recentActivity || 0
      })
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    console.log('🔧 AdminDashboard: Component mounted, fetching data...')
    fetchAdminStats()
  }, [])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Dashboard</h1>
          <p className="text-grey-600">Overview and platform management</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>Error: {error}</span>
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchAdminStats}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalUsers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Active community members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalStories?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.pendingReviews?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalOrganizations?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Active tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Storytelling Workflow Highlight */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BookOpen className="h-5 w-5" />
            Storytelling Workflow Guide
          </CardTitle>
          <CardDescription>
            Follow our step-by-step guide to create stories from transcripts to publication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-blue-700">Complete guided workflow including:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Setup storytellers and organisations</li>
                <li>• Upload and manage transcripts</li>
                <li>• AI-powered story generation</li>
                <li>• Gallery creation and linking</li>
                <li>• Review, edit, and publish</li>
              </ul>
            </div>
            <Link href="/admin/workflow">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Workflow Guide
                <BookOpen className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-grey-600">Manage Users</h3>
                <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <Link href="/admin/storytellers">
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Storytellers
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-grey-600">Content</h3>
                <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.totalStories}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <Link href="/admin/stories">
              <Button className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Stories
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-grey-600">Organizations</h3>
                <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.totalOrganizations}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <Link href="/admin/organisations">
              <Button className="w-full">
                <Building2 className="w-4 h-4 mr-2" />
                Organizations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-grey-600">Reviews</h3>
                <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.pendingReviews}</p>
              </div>
              <Flag className="h-8 w-8 text-orange-600" />
            </div>
            <Link href="/admin/reviews">
              <Button className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Reviews
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Status</CardTitle>
          <CardDescription>Current system status and quick actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">System Status</p>
                  <p className="text-sm text-grey-600">All services operational</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                Healthy
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Data Status</p>
                  <p className="text-sm text-grey-600">Statistics loaded</p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {isLoadingStats ? 'Loading...' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
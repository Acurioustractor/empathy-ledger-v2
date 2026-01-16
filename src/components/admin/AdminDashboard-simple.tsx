'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  Shield,
  BarChart3,
  Eye,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  AlertTriangle,
  FolderOpen,
  ImagePlus,
  Camera,
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    // Users
    totalStorytellers: 0,
    activeStorytellers: 0,
    featuredStorytellers: 0,
    // Stories
    totalStories: 0,
    publishedStories: 0,
    draftStories: 0,
    featuredStories: 0,
    storiesWithImages: 0,
    // Content
    totalTranscripts: 0,
    transcriptsWithoutStories: 0,
    featuredWithoutImages: 0,
    // Organizations
    totalOrganizations: 0,
    totalProjects: 0,
    totalGalleries: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real admin statistics
  const fetchAdminStats = async () => {
    try {
      setIsLoadingStats(true)
      setError(null)

      // Fetch all stats in parallel
      const [usersRes, storiesRes, reviewsRes, orgsRes] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/stories'),
        fetch('/api/admin/stats/reviews'),
        fetch('/api/admin/stats/organisations')
      ])

      if (!usersRes.ok || !storiesRes.ok || !reviewsRes.ok || !orgsRes.ok) {
        throw new Error('Failed to fetch some stats')
      }

      const [usersData, storiesData, reviewsData, orgsData] = await Promise.all([
        usersRes.json(),
        storiesRes.json(),
        reviewsRes.json(),
        orgsRes.json()
      ])

      setStats({
        // Users
        totalStorytellers: usersData.total || 0,
        activeStorytellers: usersData.active || 0,
        featuredStorytellers: usersData.featured || 0,
        // Stories
        totalStories: storiesData.total || 0,
        publishedStories: storiesData.published || 0,
        draftStories: storiesData.draft || 0,
        featuredStories: storiesData.featured || 0,
        storiesWithImages: storiesData.withImages || 0,
        // Content
        totalTranscripts: storiesData.transcripts || 0,
        transcriptsWithoutStories: reviewsData.transcriptsWithoutStories || 0,
        featuredWithoutImages: reviewsData.featuredWithoutImages || 0,
        // Organizations
        totalOrganizations: orgsData.total || 0,
        totalProjects: orgsData.projects || 0,
        totalGalleries: orgsData.galleries || 0,
      })
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Load data when auth is ready
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchAdminStats()
    }
  }, [isAuthLoading, isAuthenticated])

  // Calculate attention items
  const attentionItems = []
  if (stats.featuredWithoutImages > 0) {
    attentionItems.push({
      label: 'Featured stories need images',
      count: stats.featuredWithoutImages,
      link: '/admin/story-images',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    })
  }
  if (stats.transcriptsWithoutStories > 0) {
    attentionItems.push({
      label: 'Transcripts ready for stories',
      count: stats.transcriptsWithoutStories,
      link: '/admin/transcripts',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    })
  }
  if (stats.draftStories > 0) {
    attentionItems.push({
      label: 'Draft stories to review',
      count: stats.draftStories,
      link: '/admin/stories',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    })
  }

  // Show loading while auth initializes
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-600 mx-auto mb-4"></div>
          <p className="text-grey-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Dashboard</h1>
          <p className="text-grey-600">Overview and platform management</p>
        </div>
        <Button variant="outline" onClick={fetchAdminStats} disabled={isLoadingStats}>
          <Clock className="w-4 h-4 mr-2" />
          {isLoadingStats ? 'Loading...' : 'Refresh'}
        </Button>
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

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storytellers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalStorytellers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStorytellers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalStories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedStories} published, {stats.draftStories} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcripts</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalTranscripts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Audio recordings processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : stats.totalOrganizations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProjects} projects, {stats.totalGalleries} galleries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attention Required Section */}
      {attentionItems.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {attentionItems.map((item, index) => (
                <Link key={index} href={item.link}>
                  <div className={`p-4 rounded-lg ${item.bgColor} hover:opacity-80 transition-opacity cursor-pointer`}>
                    <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                    <p className="text-sm text-grey-700">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/admin/storytellers" className="block">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Storytellers</h3>
                  <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.totalStorytellers}</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/admin/stories" className="block">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Stories</h3>
                  <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.totalStories}</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/admin/transcripts" className="block">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Transcripts</h3>
                  <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.totalTranscripts}</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/admin/story-images" className="block">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ImagePlus className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Story Images</h3>
                  <p className="text-2xl font-bold">{isLoadingStats ? '...' : stats.storiesWithImages}</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href="/admin/photos" className="block">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Camera className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-medium">Media Library</h3>
                  <p className="text-sm text-grey-600">Manage photos</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Story Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Published</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {stats.publishedStories}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Drafts</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {stats.draftStories}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Featured</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.featuredStories}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">With Images</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {stats.storiesWithImages}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Total Transcripts</span>
                <span className="font-semibold">{stats.totalTranscripts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Ready for Stories</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.transcriptsWithoutStories}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Conversion Rate</span>
                <span className="font-semibold">
                  {stats.totalTranscripts > 0
                    ? Math.round(((stats.totalTranscripts - stats.transcriptsWithoutStories) / stats.totalTranscripts) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Organizations</span>
                <span className="font-semibold">{stats.totalOrganizations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Projects</span>
                <span className="font-semibold">{stats.totalProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Galleries</span>
                <span className="font-semibold">{stats.totalGalleries}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Status</CardTitle>
          <CardDescription>Current system status</CardDescription>
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

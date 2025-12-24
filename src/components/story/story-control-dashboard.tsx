'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Clock,
  Link as LinkIcon,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import ShareLinkManager from './share-link-manager'
import WithdrawStoryDialog from './withdraw-story-dialog'
import { cn } from '@/lib/utils'

interface StoryControlDashboardProps {
  story: {
    id: string
    title: string
    status: string
    created_at: string
    updated_at?: string
    storyteller?: {
      id: string
      display_name: string
      profile_image_url?: string
    }
    project?: {
      id: string
      name: string
    }
  }
  shareLinks: Array<{
    id: string
    token: string
    view_count: number
    revoked: boolean
    expires_at: string
    created_at: string
    last_accessed_at: string | null
  }>
  analytics: {
    totalViews: number
    activeLinks: number
    lastAccessed: string | null
  }
}

export default function StoryControlDashboard({
  story,
  shareLinks,
  analytics,
}: StoryControlDashboardProps) {
  const router = useRouter()
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300'
      case 'withdrawn':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(dateString)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Story Control
            </h1>
            <p className="text-lg text-muted-foreground">
              {story.title}
            </p>
            {story.project && (
              <p className="text-sm text-muted-foreground mt-1">
                Project: {story.project.name}
              </p>
            )}
          </div>

          <Badge
            variant="outline"
            className={cn('text-sm px-3 py-1', getStatusColor(story.status))}
          >
            {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
          <p className="font-semibold">You're in control of your story</p>
          <p className="text-blue-700 dark:text-blue-300">
            You can create share links, track who views your story, and withdraw it at any time.
            When you withdraw your story, all share links stop working immediately.
          </p>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Total Views</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all share links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Active Links</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.activeLinks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Last Viewed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.lastAccessed ? (
                <span className="text-base">
                  {formatRelativeTime(analytics.lastAccessed)}
                </span>
              ) : (
                <span className="text-base text-muted-foreground">Never</span>
              )}
            </div>
            {analytics.lastAccessed && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(analytics.lastAccessed)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Share Links Manager */}
      <div className="mb-8">
        <ShareLinkManager storyId={story.id} storyTitle={story.title} />
      </div>

      <Separator className="my-8" />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanent actions that affect your story's availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Withdraw This Story
              </h3>
              <p className="text-sm text-muted-foreground">
                Immediately stop all share links from working. People with the link will
                see "Story has been withdrawn by the storyteller."
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-green-600 dark:text-green-400">
                  ✓ All {shareLinks.length} share link{shareLinks.length !== 1 ? 's' : ''} will stop working within seconds
                </p>
                <p className="text-green-600 dark:text-green-400">
                  ✓ You can re-publish your story later if you change your mind
                </p>
                <p className="text-amber-600 dark:text-amber-400">
                  ⚠ We can't delete screenshots people already took
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setWithdrawDialogOpen(true)}
              disabled={story.status === 'withdrawn'}
            >
              {story.status === 'withdrawn' ? 'Already Withdrawn' : 'Withdraw Story'}
            </Button>
          </div>

          {story.status === 'withdrawn' && (
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-100">
                <p className="font-semibold">Story Currently Withdrawn</p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  All share links have been disabled. To make your story available again,
                  change the status back to "Published" in the story editor.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <WithdrawStoryDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        storyId={story.id}
        storyTitle={story.title}
        shareLinkCount={shareLinks.length}
        onSuccess={() => {
          router.refresh()
          setWithdrawDialogOpen(false)
        }}
      />
    </div>
  )
}

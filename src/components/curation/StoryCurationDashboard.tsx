'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Tag, Sparkles, CheckCircle, FolderOpen, TrendingUp } from 'lucide-react'

// Import sub-components (to be created)
import { StoryAssignment } from './StoryAssignment'
import { ThemeTagger } from './ThemeTagger'
import { CampaignOrganizer } from './CampaignOrganizer'
import { QualityReviewQueue } from './QualityReviewQueue'

interface StoryCurationDashboardProps {
  organizationId: string
  projectId?: string
}

interface CurationStats {
  totalStories: number
  assignedToProjects: number
  unassigned: number
  taggedWithThemes: number
  untagged: number
  inCampaigns: number
  pendingReview: number
  publishReady: number
  recentActivity: {
    last7Days: number
    last30Days: number
  }
  byStatus: {
    draft: number
    inReview: number
    approved: number
    published: number
  }
}

export function StoryCurationDashboard({ organizationId, projectId }: StoryCurationDashboardProps) {
  const [stats, setStats] = useState<CurationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assign')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ organization_id: organizationId })
        if (projectId) params.set('project_id', projectId)

        const response = await fetch(`/api/curation/stats?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch curation stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [organizationId, projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-sky-600" />
          Story Curation
        </h1>
        <p className="text-muted-foreground mt-2">
          Organize stories into projects, tag with themes, and prepare for publication
        </p>
      </div>

      {/* Cultural Reminder */}
      <Card className="bg-gradient-to-r from-sage-50 to-sky-50 border-sage-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-sage-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sage-900">Curation as Cultural Stewardship</h3>
              <p className="text-sm text-sage-800 mt-1">
                Curation is about honoring each story's place in the larger narrative. Stories
                belong to storytellers - we simply help organize them for maximum impact while
                maintaining cultural integrity. Every assignment, tag, and campaign should amplify
                Indigenous voices, not extract from them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Stories */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stories</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalStories}</p>
                </div>
                <BookOpen className="h-8 w-8 text-sky-600 opacity-20" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {stats.recentActivity.last7Days} added this week
              </div>
            </CardContent>
          </Card>

          {/* Project Assignment */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned to Projects</p>
                  <p className="text-3xl font-bold mt-1">{stats.assignedToProjects}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-sage-600 opacity-20" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {stats.unassigned} unassigned
              </div>
            </CardContent>
          </Card>

          {/* Theme Tagging */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tagged with Themes</p>
                  <p className="text-3xl font-bold mt-1">{stats.taggedWithThemes}</p>
                </div>
                <Tag className="h-8 w-8 text-amber-600 opacity-20" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {stats.untagged} need tagging
              </div>
            </CardContent>
          </Card>

          {/* Publish Ready */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publish Ready</p>
                  <p className="text-3xl font-bold mt-1">{stats.publishReady}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-sage-600 opacity-20" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {stats.pendingReview} pending review
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Story Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-clay-50 rounded-lg border border-clay-200">
                <p className="text-2xl font-bold text-clay-700">{stats.byStatus.draft}</p>
                <p className="text-sm text-muted-foreground mt-1">Draft</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-2xl font-bold text-amber-700">{stats.byStatus.inReview}</p>
                <p className="text-sm text-muted-foreground mt-1">In Review</p>
              </div>
              <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200">
                <p className="text-2xl font-bold text-sky-700">{stats.byStatus.approved}</p>
                <p className="text-sm text-muted-foreground mt-1">Approved</p>
              </div>
              <div className="text-center p-4 bg-sage-50 rounded-lg border border-sage-200">
                <p className="text-2xl font-bold text-sage-700">{stats.byStatus.published}</p>
                <p className="text-sm text-muted-foreground mt-1">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Curation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Assign to Projects</span>
            <span className="sm:hidden">Assign</span>
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Tag Themes</span>
            <span className="sm:hidden">Themes</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Quality Review</span>
            <span className="sm:hidden">Review</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-4">
          <StoryAssignment
            organizationId={organizationId}
            projectId={projectId}
            onAssignmentComplete={() => {
              // Refresh stats
              window.location.reload()
            }}
          />
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <ThemeTagger
            organizationId={organizationId}
            projectId={projectId}
            onTaggingComplete={() => {
              window.location.reload()
            }}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignOrganizer
            organizationId={organizationId}
            projectId={projectId}
            onCampaignUpdate={() => {
              window.location.reload()
            }}
          />
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <QualityReviewQueue
            organizationId={organizationId}
            projectId={projectId}
            onReviewComplete={() => {
              window.location.reload()
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

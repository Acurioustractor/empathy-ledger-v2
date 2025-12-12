'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Vault,
  Shield,
  History,
  Download,
  AlertTriangle,
  Settings,
  ArrowLeft,
  Eye,
  Share2,
  Ban,
  FileCheck,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  Filter,
  Clock
} from 'lucide-react'
import { StoryVault } from '@/components/vault/StoryVault'
import { useGDPRActions } from '@/lib/hooks/useRevocation'
import { cn } from '@/lib/utils'

// Activity types for the history view
type ActivityType = 'all' | 'view' | 'share' | 'revoke' | 'consent' | 'edit' | 'delete' | 'create'

interface ActivityEvent {
  id: string
  timestamp: string
  action: string
  action_category: string
  entity_type: string
  entity_id: string
  story_title?: string
  actor_id?: string
  actor_type?: string
  change_summary?: string
  ip_address?: string
}

export default function VaultDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stories')

  // Activity history state
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all')
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  const { exportUserData, requestAccountDeletion, isLoading: isGDPRLoading, error: gdprError } = useGDPRActions()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin?redirect=/vault')
        return
      }
      setUser(user)

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setIsLoading(false)
    }

    fetchUser()
  }, [supabase, router])

  // Fetch activity history
  const fetchActivityHistory = useCallback(async () => {
    if (!user) return

    setIsLoadingActivity(true)
    setActivityError(null)

    try {
      // First get all user's stories
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('id, title')
        .or(`author_id.eq.${user.id},storyteller_id.eq.${user.id}`)

      if (storiesError) throw storiesError

      if (!stories || stories.length === 0) {
        setActivityEvents([])
        setIsLoadingActivity(false)
        return
      }

      // Create a map of story IDs to titles
      const storyMap = new Map(stories.map(s => [s.id, s.title]))
      const storyIds = stories.map(s => s.id)

      // Fetch audit logs for all stories
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'story')
        .in('entity_id', storyIds)
        .order('created_at', { ascending: false })
        .limit(100)

      if (logsError) throw logsError

      // Map logs to activity events
      const events: ActivityEvent[] = (logs || []).map(log => ({
        id: log.id,
        timestamp: log.created_at,
        action: log.action,
        action_category: log.action_category,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        story_title: storyMap.get(log.entity_id) || 'Unknown Story',
        actor_id: log.actor_id,
        actor_type: log.actor_type,
        change_summary: log.change_summary,
        ip_address: log.ip_address
      }))

      setActivityEvents(events)
    } catch (err) {
      console.error('Failed to fetch activity history:', err)
      setActivityError('Failed to load activity history')
    } finally {
      setIsLoadingActivity(false)
    }
  }, [user, supabase])

  // Fetch activity when tab changes to history
  useEffect(() => {
    if (activeTab === 'history' && user && activityEvents.length === 0) {
      fetchActivityHistory()
    }
  }, [activeTab, user, activityEvents.length, fetchActivityHistory])

  // Filter activity events
  const filteredActivity = activityEvents.filter(event => {
    if (activityFilter === 'all') return true

    switch (activityFilter) {
      case 'view':
        return event.action === 'view' || event.action === 'embed_view'
      case 'share':
        return event.action === 'share' || event.action === 'distribute' || event.action === 'embed_create'
      case 'revoke':
        return event.action_category === 'revocation' || event.action.includes('revoke')
      case 'consent':
        return event.action_category === 'consent' || event.action.includes('consent')
      case 'edit':
        return event.action === 'update'
      case 'delete':
        return event.action === 'archive' || event.action === 'delete'
      case 'create':
        return event.action === 'create'
      default:
        return true
    }
  })

  // Get icon for action
  const getActionIcon = (action: string, category: string) => {
    if (action === 'view' || action === 'embed_view') return Eye
    if (action.includes('share') || action.includes('distribute') || action.includes('embed_create')) return Share2
    if (category === 'revocation' || action.includes('revoke')) return Ban
    if (category === 'consent' || action.includes('consent')) return FileCheck
    if (action === 'update') return Edit3
    if (action === 'archive' || action === 'delete') return Trash2
    if (action === 'create') return Plus
    return History
  }

  // Get action color
  const getActionColor = (action: string, category: string) => {
    if (category === 'revocation' || action.includes('revoke')) return 'text-red-500'
    if (category === 'consent') return 'text-green-500'
    if (action === 'archive' || action === 'delete') return 'text-orange-500'
    if (action.includes('share') || action.includes('distribute')) return 'text-blue-500'
    return 'text-muted-foreground'
  }

  const handleViewStoryDetails = (storyId: string) => {
    router.push(`/stories/${storyId}`)
  }

  const handleManageEmbeds = (storyId: string) => {
    router.push(`/stories/${storyId}?tab=embeds`)
  }

  const handleManageDistributions = (storyId: string) => {
    router.push(`/stories/${storyId}?tab=distributions`)
  }

  const handleExportData = async () => {
    const data = await exportUserData()
    if (data) {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `empathy-ledger-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Vault className="h-8 w-8 text-clay-600" />
              Story Vault
            </h1>
            <p className="text-muted-foreground mt-1">
              Your stories, your control. Manage ownership, distributions, and privacy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportData} disabled={isGDPRLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('privacy')}>
            <Settings className="mr-2 h-4 w-4" />
            Privacy Settings
          </Button>
        </div>
      </div>

      {/* Error display */}
      {gdprError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{gdprError}</AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="stories" className="gap-2">
            <Vault className="h-4 w-4" />
            My Stories
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy & GDPR
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Activity History
          </TabsTrigger>
        </TabsList>

        {/* Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <StoryVault
            storytellerId={user.id}
            onViewStoryDetails={handleViewStoryDetails}
            onManageEmbeds={handleManageEmbeds}
            onManageDistributions={handleManageDistributions}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* GDPR Rights Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Data Rights
                </CardTitle>
                <CardDescription>
                  Under GDPR, you have the right to access, correct, and delete your personal data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Export Your Data</div>
                      <div className="text-sm text-muted-foreground">
                        Download all your stories, media, and account data
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleExportData} disabled={isGDPRLoading}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Request Account Deletion</div>
                      <div className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (confirm('Are you sure you want to request account deletion? This action cannot be undone.')) {
                          await requestAccountDeletion()
                        }
                      }}
                      disabled={isGDPRLoading}
                    >
                      Request Deletion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Consent Overview
                </CardTitle>
                <CardDescription>
                  Manage consent status for your stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Stories shared externally require verified consent. You can withdraw consent
                  at any time, which will automatically revoke all active distributions.
                </p>
                <Alert>
                  <AlertDescription>
                    To manage consent for individual stories, use the Stories tab and select
                    "Manage Distributions" from the story menu.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Indigenous Data Sovereignty */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-sage-600" />
                  Indigenous Data Sovereignty (OCAP)
                </CardTitle>
                <CardDescription>
                  Empathy Ledger respects Indigenous data sovereignty principles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium text-sage-700 dark:text-sage-300 mb-1">Ownership</div>
                    <div className="text-sm text-muted-foreground">
                      You own your stories and maintain control over how they are used
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium text-sage-700 dark:text-sage-300 mb-1">Control</div>
                    <div className="text-sm text-muted-foreground">
                      You decide who can access your stories and for what purpose
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium text-sage-700 dark:text-sage-300 mb-1">Access</div>
                    <div className="text-sm text-muted-foreground">
                      You can revoke access at any time through this vault
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium text-sage-700 dark:text-sage-300 mb-1">Possession</div>
                    <div className="text-sm text-muted-foreground">
                      Your data remains yours and can be exported or deleted
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Activity History
                  </CardTitle>
                  <CardDescription>
                    View all actions taken on your stories across the platform
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v as ActivityType)}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activity</SelectItem>
                      <SelectItem value="view">Views</SelectItem>
                      <SelectItem value="share">Shares</SelectItem>
                      <SelectItem value="revoke">Revocations</SelectItem>
                      <SelectItem value="consent">Consent</SelectItem>
                      <SelectItem value="edit">Edits</SelectItem>
                      <SelectItem value="create">Created</SelectItem>
                      <SelectItem value="delete">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchActivityHistory}
                    disabled={isLoadingActivity}
                  >
                    <RefreshCw className={cn('h-4 w-4', isLoadingActivity && 'animate-spin')} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activityError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{activityError}</AlertDescription>
                </Alert>
              )}

              {isLoadingActivity ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredActivity.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-lg font-medium">No activity found</p>
                  <p className="text-sm text-muted-foreground">
                    {activityFilter !== 'all'
                      ? 'Try changing the filter to see more activity'
                      : 'Actions on your stories will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredActivity.map((event, index) => {
                    const Icon = getActionIcon(event.action, event.action_category)
                    const colorClass = getActionColor(event.action, event.action_category)
                    const isFirst = index === 0
                    const isLast = index === filteredActivity.length - 1

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {/* Timeline line */}
                        <div className="relative flex flex-col items-center">
                          <div className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background',
                            colorClass.replace('text-', 'border-')
                          )}>
                            <Icon className={cn('h-4 w-4', colorClass)} />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-full bg-border absolute top-12" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium capitalize">
                              {event.action.replace(/_/g, ' ')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.action_category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.change_summary || `Action on "${event.story_title}"`}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => handleViewStoryDetails(event.entity_id)}
                            >
                              View Story
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tip for individual story view */}
              <Alert className="mt-6">
                <History className="h-4 w-4" />
                <AlertDescription>
                  For detailed provenance trails, select "View Details" from the story menu
                  in the Stories tab to see the complete timeline for each story.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

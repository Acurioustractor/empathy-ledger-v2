'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Share2,
  Shield,
  Eye,
  EyeOff,
  Image,
  User,
  Clock,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  History,
  BookOpen,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react'

interface ExternalApp {
  id: string
  app_name: string
  app_display_name: string
  app_description: string | null
  allowed_story_types: string[] | null
  is_active: boolean
}

interface Story {
  id: string
  title: string
  status: string
  created_at: string
}

interface Consent {
  id: string
  story_id: string
  app_id: string
  consent_granted: boolean
  consent_granted_at: string | null
  share_full_content: boolean
  share_summary_only: boolean
  share_media: boolean
  share_attribution: boolean
  anonymous_sharing: boolean
}

interface AccessLog {
  id: string
  story_id: string
  app_id: string
  access_type: string
  accessed_at: string
}

interface SharingSettingsProps {
  className?: string
}

export function SharingSettings({ className }: SharingSettingsProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [apps, setApps] = useState<ExternalApp[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [consents, setConsents] = useState<Consent[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])

  const [selectedApp, setSelectedApp] = useState<ExternalApp | null>(null)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [consentSettings, setConsentSettings] = useState({
    share_full_content: false,
    share_summary_only: true,
    share_media: false,
    share_attribution: true,
    anonymous_sharing: false
  })

  useEffect(() => {
    fetchSharingData()
  }, [])

  const fetchSharingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/storytellers/sharing')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch sharing data')
      }

      setApps(data.data.apps)
      setStories(data.data.stories)
      setConsents(data.data.consents)
      setAccessLogs(data.data.accessLogs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sharing settings')
    } finally {
      setLoading(false)
    }
  }

  const getConsentForStoryAndApp = (storyId: string, appId: string): Consent | undefined => {
    return consents.find(c => c.story_id === storyId && c.app_id === appId)
  }

  const getStoriesSharedWithApp = (appId: string): number => {
    return consents.filter(c => c.app_id === appId && c.consent_granted).length
  }

  const getAccessCountForApp = (appId: string): number => {
    return accessLogs.filter(l => l.app_id === appId).length
  }

  const handleToggleConsent = async (story: Story, app: ExternalApp, enabled: boolean) => {
    try {
      setSaving(true)
      setError(null)

      const existingConsent = getConsentForStoryAndApp(story.id, app.id)

      const response = await fetch('/api/storytellers/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: story.id,
          app_id: app.id,
          consent_granted: enabled,
          ...(existingConsent ? {
            share_full_content: existingConsent.share_full_content,
            share_summary_only: existingConsent.share_summary_only,
            share_media: existingConsent.share_media,
            share_attribution: existingConsent.share_attribution,
            anonymous_sharing: existingConsent.anonymous_sharing
          } : consentSettings)
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update consent')
      }

      setSuccess(enabled ? 'Sharing enabled successfully' : 'Sharing disabled')
      setTimeout(() => setSuccess(null), 3000)
      await fetchSharingData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update consent')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateConsentSettings = async () => {
    if (!selectedStory || !selectedApp) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/storytellers/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: selectedStory.id,
          app_id: selectedApp.id,
          consent_granted: true,
          ...consentSettings
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update settings')
      }

      setSuccess('Settings updated successfully')
      setShowConsentDialog(false)
      setTimeout(() => setSuccess(null), 3000)
      await fetchSharingData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleRevokeAllForApp = async (appId: string) => {
    if (!confirm('Are you sure you want to revoke sharing with this app for all your stories?')) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/storytellers/sharing?app_id=${appId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to revoke consent')
      }

      setSuccess('All sharing revoked for this app')
      setTimeout(() => setSuccess(null), 3000)
      await fetchSharingData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke consent')
    } finally {
      setSaving(false)
    }
  }

  const openConsentSettings = (story: Story, app: ExternalApp) => {
    setSelectedStory(story)
    setSelectedApp(app)

    const existingConsent = getConsentForStoryAndApp(story.id, app.id)
    if (existingConsent) {
      setConsentSettings({
        share_full_content: existingConsent.share_full_content,
        share_summary_only: existingConsent.share_summary_only,
        share_media: existingConsent.share_media,
        share_attribution: existingConsent.share_attribution,
        anonymous_sharing: existingConsent.anonymous_sharing
      })
    } else {
      setConsentSettings({
        share_full_content: false,
        share_summary_only: true,
        share_media: false,
        share_attribution: true,
        anonymous_sharing: false
      })
    }

    setShowConsentDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-earth-600" />
        <span className="ml-2 text-stone-600">Loading sharing settings...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-sage-200 bg-sage-50">
          <CheckCircle className="h-4 w-4 text-sage-600" />
          <AlertDescription className="text-sage-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="apps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="apps" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            External Apps
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            My Stories
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Access History
          </TabsTrigger>
        </TabsList>

        {/* External Apps Tab */}
        <TabsContent value="apps" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-earth-800">Connected Applications</h3>
              <p className="text-sm text-stone-600">
                Manage which external platforms can access your stories
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSharingData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {apps.length === 0 ? (
            <Card className="bg-stone-50">
              <CardContent className="py-8 text-center">
                <Building2 className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                <p className="text-stone-600">No external applications are currently available</p>
                <p className="text-sm text-stone-500 mt-1">
                  External apps will appear here when they are registered by administrators
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {apps.map(app => (
                <Card key={app.id} className="border-stone-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-earth-100">
                          <ExternalLink className="w-5 h-5 text-earth-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{app.app_display_name}</CardTitle>
                          <CardDescription>{app.app_description || 'External platform'}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-sage-50 text-sage-700">
                          {getStoriesSharedWithApp(app.id)} stories shared
                        </Badge>
                        <Badge variant="outline" className="bg-stone-50">
                          {getAccessCountForApp(app.id)} accesses
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {app.allowed_story_types && app.allowed_story_types.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-stone-500 mb-2">Allowed story types:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.allowed_story_types.map(type => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-600">
                        Share individual stories with {app.app_display_name} in the Stories tab
                      </p>
                      {getStoriesSharedWithApp(app.id) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRevokeAllForApp(app.id)}
                          disabled={saving}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Revoke All
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-earth-800">Story Sharing Settings</h3>
            <p className="text-sm text-stone-600">
              Control how each of your stories is shared with external applications
            </p>
          </div>

          {stories.length === 0 ? (
            <Card className="bg-stone-50">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                <p className="text-stone-600">You don't have any stories yet</p>
                <p className="text-sm text-stone-500 mt-1">
                  Create a story to start sharing it with external platforms
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stories.map(story => (
                <Card key={story.id} className="border-stone-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{story.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={
                              story.status === 'published'
                                ? 'bg-sage-50 text-sage-700'
                                : 'bg-amber-50 text-amber-700'
                            }
                          >
                            {story.status}
                          </Badge>
                          <span className="text-xs">
                            Created {formatDate(story.created_at)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {apps.length === 0 ? (
                      <p className="text-sm text-stone-500 italic">
                        No external applications available for sharing
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {apps.map(app => {
                          const consent = getConsentForStoryAndApp(story.id, app.id)
                          const isShared = consent?.consent_granted || false

                          return (
                            <div
                              key={app.id}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-50"
                            >
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={isShared}
                                  onCheckedChange={(checked) =>
                                    handleToggleConsent(story, app, checked)
                                  }
                                  disabled={saving}
                                />
                                <div>
                                  <p className="text-sm font-medium text-stone-700">
                                    {app.app_display_name}
                                  </p>
                                  {isShared && consent && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {consent.share_full_content ? (
                                        <Badge variant="outline" className="text-xs">
                                          <Eye className="w-3 h-3 mr-1" />
                                          Full content
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">
                                          <EyeOff className="w-3 h-3 mr-1" />
                                          Summary only
                                        </Badge>
                                      )}
                                      {consent.anonymous_sharing && (
                                        <Badge variant="outline" className="text-xs">
                                          <User className="w-3 h-3 mr-1" />
                                          Anonymous
                                        </Badge>
                                      )}
                                      {consent.share_media && (
                                        <Badge variant="outline" className="text-xs">
                                          <Image className="w-3 h-3 mr-1" />
                                          Media
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isShared && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openConsentSettings(story, app)}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-earth-800">Access History</h3>
            <p className="text-sm text-stone-600">
              See when and how your stories have been accessed by external applications
            </p>
          </div>

          {accessLogs.length === 0 ? (
            <Card className="bg-stone-50">
              <CardContent className="py-8 text-center">
                <History className="w-12 h-12 mx-auto text-stone-400 mb-4" />
                <p className="text-stone-600">No access history yet</p>
                <p className="text-sm text-stone-500 mt-1">
                  Access logs will appear here when external apps view your shared stories
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {accessLogs.map(log => {
                    const app = apps.find(a => a.id === log.app_id)
                    const story = stories.find(s => s.id === log.story_id)

                    return (
                      <div key={log.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-stone-100">
                            <Eye className="w-4 h-4 text-stone-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-700">
                              {app?.app_display_name || 'Unknown App'}
                            </p>
                            <p className="text-xs text-stone-500">
                              {log.access_type} &middot; {story?.title || 'Unknown Story'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400">
                          {formatDate(log.accessed_at)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Consent Settings Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sharing Settings</DialogTitle>
            <DialogDescription>
              Configure how "{selectedStory?.title}" is shared with {selectedApp?.app_display_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Content sharing */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Content to share</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-stone-500" />
                    <span className="text-sm">Share full story content</span>
                  </div>
                  <Switch
                    checked={consentSettings.share_full_content}
                    onCheckedChange={(checked) =>
                      setConsentSettings(prev => ({
                        ...prev,
                        share_full_content: checked,
                        share_summary_only: !checked
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-stone-500" />
                    <span className="text-sm">Share media (photos, videos)</span>
                  </div>
                  <Switch
                    checked={consentSettings.share_media}
                    onCheckedChange={(checked) =>
                      setConsentSettings(prev => ({ ...prev, share_media: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Attribution */}
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <Label className="text-sm font-medium">Attribution</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-500" />
                    <span className="text-sm">Show my name</span>
                  </div>
                  <Switch
                    checked={consentSettings.share_attribution}
                    onCheckedChange={(checked) =>
                      setConsentSettings(prev => ({
                        ...prev,
                        share_attribution: checked,
                        anonymous_sharing: !checked
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-stone-500" />
                    <span className="text-sm">Share anonymously</span>
                  </div>
                  <Switch
                    checked={consentSettings.anonymous_sharing}
                    onCheckedChange={(checked) =>
                      setConsentSettings(prev => ({
                        ...prev,
                        anonymous_sharing: checked,
                        share_attribution: !checked
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Info box */}
            <Alert className="bg-earth-50 border-earth-200">
              <Info className="h-4 w-4 text-earth-600" />
              <AlertDescription className="text-earth-700 text-sm">
                You can change or revoke these settings at any time. The external app will
                respect your latest preferences.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConsentSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

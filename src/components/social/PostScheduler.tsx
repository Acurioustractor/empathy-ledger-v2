'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Link2,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'

interface Story {
  id: string
  title: string
  slug: string
  excerpt?: string
}

interface SocialConnection {
  id: string
  platform_username?: string
  platform?: {
    slug: string
    name: string
    max_content_length: number
  }
}

interface ScheduledPost {
  id: string
  story_id: string
  connection_id: string
  content: string
  excerpt?: string
  hashtags: string[]
  media_urls: string[]
  link_url?: string
  scheduled_for: string
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
  platform_post_url?: string
  last_error?: string
  story?: Story
  connection?: SocialConnection
}

interface PostSchedulerProps {
  storyId: string
  storyTitle: string
  storyExcerpt?: string
  storyUrl?: string
  organizationId: string
}

const platformIcons: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  bluesky: Twitter,
  youtube: Youtube,
  facebook: Facebook
}

export default function PostScheduler({
  storyId,
  storyTitle,
  storyExcerpt,
  storyUrl,
  organizationId
}: PostSchedulerProps) {
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

  // New post form state
  const [selectedConnection, setSelectedConnection] = useState<string>('')
  const [postContent, setPostContent] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [storyId, organizationId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [connectionsRes, postsRes] = await Promise.all([
        fetch(`/api/admin/social-connections?organization_id=${organizationId}`),
        fetch(`/api/admin/scheduled-posts?story_id=${storyId}`)
      ])

      if (connectionsRes.ok) {
        const data = await connectionsRes.json()
        setConnections((data.connections || []).filter((c: any) => c.status === 'active'))
      }

      if (postsRes.ok) {
        const data = await postsRes.json()
        setScheduledPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching scheduler data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenScheduleDialog = () => {
    // Pre-fill with story content
    const truncatedExcerpt = storyExcerpt?.substring(0, 200) || storyTitle
    setPostContent(`${truncatedExcerpt}...\n\nRead the full story: ${storyUrl || '[link]'}`)
    setHashtags('')
    setScheduledDate('')
    setScheduledTime('')
    setSelectedConnection('')
    setIsScheduleDialogOpen(true)
  }

  const handleSchedulePost = async () => {
    if (!selectedConnection || !postContent || !scheduledDate || !scheduledTime) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      const hashtagArray = hashtags.split(/[,\s]+/).filter(Boolean).map(t => t.replace('#', ''))

      const res = await fetch('/api/admin/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: storyId,
          organization_id: organizationId,
          connection_id: selectedConnection,
          content: postContent,
          hashtags: hashtagArray,
          link_url: storyUrl,
          scheduled_for: scheduledFor
        })
      })

      if (res.ok) {
        const data = await res.json()
        setScheduledPosts(prev => [...prev, data.post])
        setIsScheduleDialogOpen(false)
      } else {
        const error = await res.json()
        alert(`Failed to schedule post: ${error.error}`)
      }
    } catch (error) {
      console.error('Error scheduling post:', error)
      alert('Failed to schedule post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelPost = async (postId: string) => {
    if (!confirm('Cancel this scheduled post?')) return

    try {
      const res = await fetch(`/api/admin/scheduled-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (res.ok) {
        setScheduledPosts(prev =>
          prev.map(p => p.id === postId ? { ...p, status: 'cancelled' } : p)
        )
      }
    } catch (error) {
      console.error('Error cancelling post:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>
      case 'publishing':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Publishing</Badge>
      case 'published':
        return <Badge className="bg-sage-100 text-sage-700 border-sage-200"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge>
      case 'failed':
        return <Badge className="bg-clay-100 text-clay-700 border-clay-200"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>
      case 'cancelled':
        return <Badge className="bg-stone-100 text-stone-600 border-stone-200">Cancelled</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24">
            <RefreshCw className="w-5 h-5 animate-spin text-sage-600" />
            <span className="ml-2 text-stone-600">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Social Media Publishing
          </CardTitle>
          <CardDescription>
            Schedule this story to be shared on social media
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-6 text-stone-500">
              <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No social media accounts connected.</p>
              <p className="text-sm">Connect accounts in organization settings to enable publishing.</p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleOpenScheduleDialog}
                className="w-full bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 mb-4"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Post
              </Button>

              {/* Scheduled Posts List */}
              {scheduledPosts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-700">Scheduled Posts</h4>
                  {scheduledPosts.map(post => {
                    const Icon = platformIcons[post.connection?.platform?.slug || ''] || Link2
                    return (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg border border-stone-200 bg-stone-50/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-stone-500" />
                            <span className="text-sm font-medium">
                              {post.connection?.platform?.name || 'Unknown'}
                            </span>
                            {post.connection?.platform_username && (
                              <span className="text-xs text-stone-500">
                                @{post.connection.platform_username}
                              </span>
                            )}
                          </div>
                          {getStatusBadge(post.status)}
                        </div>

                        <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                          {post.content}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.scheduled_for).toLocaleString()}
                          </span>

                          {post.status === 'scheduled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-clay-600 hover:text-clay-700"
                              onClick={() => handleCancelPost(post.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          )}

                          {post.status === 'published' && post.platform_post_url && (
                            <a
                              href={post.platform_post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sage-600 hover:text-sage-700 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Post
                            </a>
                          )}
                        </div>

                        {post.last_error && (
                          <p className="mt-2 text-xs text-clay-600 bg-clay-50 p-2 rounded">
                            Error: {post.last_error}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Social Media Post</DialogTitle>
            <DialogDescription>
              Share "{storyTitle}" on social media
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Platform *
              </label>
              <select
                value={selectedConnection}
                onChange={(e) => setSelectedConnection(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="">Select a platform...</option>
                {connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.platform?.name} {conn.platform_username && `(@${conn.platform_username})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Content */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Post Content *
              </label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="Write your post..."
              />
              <p className="text-xs text-stone-500 mt-1">
                {postContent.length} characters
                {selectedConnection && connections.find(c => c.id === selectedConnection)?.platform?.max_content_length && (
                  <> / {connections.find(c => c.id === selectedConnection)?.platform?.max_content_length} max</>
                )}
              </p>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Hashtags (optional)
              </label>
              <Input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#storytelling #community"
              />
            </div>

            {/* Schedule Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Time *
                </label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedulePost}
              disabled={submitting || !selectedConnection || !postContent || !scheduledDate || !scheduledTime}
              className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

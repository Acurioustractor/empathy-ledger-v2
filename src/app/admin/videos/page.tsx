'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Video,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Play,
  Pencil,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Tag,
  Users,
  MapPin,
  Clock,
  Calendar,
  Loader2,
  RefreshCw,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react'
import { VideoEmbed } from '@/components/media/VideoEmbed'
import { VideoTagger } from '@/components/video/VideoTagger'

interface VideoLink {
  id: string
  title: string
  description: string | null
  videoUrl: string
  embedUrl: string
  platform: string
  thumbnailUrl: string | null
  customThumbnailUrl: string | null
  duration: number | null
  recordedAt: string | null
  project: string | null // Legacy field
  organizationId: string | null
  projectId: string | null
  organization: {
    id: string
    name: string
    slug: string
    shortName: string | null
    logoUrl: string | null
  } | null
  projectDetails: {
    id: string
    name: string
  } | null
  sensitivityLevel: string
  requiresElderApproval: boolean
  status: string
  createdAt: string
  updatedAt: string
  tags: Array<{ id: string; name: string; slug: string; category: string }>
  storytellers: Array<{ id: string; name: string; imageUrl: string | null; relationship: string; consentStatus: string }>
  location: {
    placeName: string | null
    locality: string | null
    region: string | null
    country: string | null
    indigenousTerritory: string | null
  } | null
}

interface Organization {
  id: string
  name: string
  slug: string
  shortName: string | null
  logoUrl: string | null
  projects: Array<{ id: string; name: string; status: string }>
}

interface Project {
  id: string
  name: string
  organizationId: string
  organizationName: string | null
}

const PLATFORMS = [
  { value: 'descript', label: 'Descript' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'loom', label: 'Loom' },
  { value: 'wistia', label: 'Wistia' },
  { value: 'other', label: 'Other' },
]

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState<VideoLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // View and filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPlayerDialog, setShowPlayerDialog] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoLink | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    platform: '',
    organizationId: '',
    projectId: '',
    customThumbnailUrl: '',
    recordedAt: '',
  })
  const [saving, setSaving] = useState(false)

  // Organizations and projects from database
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24',
        sort: sortBy,
        order: sortOrder,
      })

      if (searchQuery) params.set('q', searchQuery)
      if (platformFilter) params.set('platform', platformFilter)
      if (projectFilter) params.set('project', projectFilter)

      const response = await fetch(`/api/videos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos')
      }

      setVideos(data.videos || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, platformFilter, projectFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Fetch organizations with their projects
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const [orgsResponse, projectsResponse] = await Promise.all([
          fetch('/api/organizations?withProjects=true'),
          fetch('/api/projects')
        ])
        const orgsData = await orgsResponse.json()
        const projectsData = await projectsResponse.json()
        setOrganizations(orgsData.organizations || [])
        setProjects(projectsData.projects || [])
      } catch (err) {
        console.error('Failed to fetch organizations:', err)
      } finally {
        setLoadingOrgs(false)
      }
    }
    fetchOrganizations()
  }, [])

  // Handle add video
  const handleAddVideo = async () => {
    if (!formData.title || !formData.videoUrl) return

    setSaving(true)
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl,
          platform: formData.platform || undefined,
          organizationId: formData.organizationId || undefined,
          projectId: formData.projectId || undefined,
          customThumbnailUrl: formData.customThumbnailUrl || undefined,
          recordedAt: formData.recordedAt || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setShowAddDialog(false)
      setFormData({ title: '', description: '', videoUrl: '', platform: '', organizationId: '', projectId: '', customThumbnailUrl: '', recordedAt: '' })
      fetchVideos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video')
    } finally {
      setSaving(false)
    }
  }

  // Handle edit video
  const handleEditVideo = async () => {
    if (!selectedVideo || !formData.title) return

    setSaving(true)
    try {
      const response = await fetch(`/api/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          organizationId: formData.organizationId || null,
          projectId: formData.projectId || null,
          customThumbnailUrl: formData.customThumbnailUrl || null,
          recordedAt: formData.recordedAt || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setShowEditDialog(false)
      setSelectedVideo(null)
      fetchVideos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video')
    } finally {
      setSaving(false)
    }
  }

  // Handle delete video
  const handleDeleteVideo = async (video: VideoLink) => {
    if (!confirm(`Delete "${video.title}"? This cannot be undone.`)) return

    try {
      const response = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      fetchVideos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video')
    }
  }

  // Open edit dialog
  const openEditDialog = (video: VideoLink) => {
    setSelectedVideo(video)
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      platform: video.platform,
      organizationId: video.organizationId || '',
      projectId: video.projectId || '',
      customThumbnailUrl: video.customThumbnailUrl || '',
      recordedAt: video.recordedAt ? video.recordedAt.split('T')[0] : '',
    })
    setShowEditDialog(true)
  }

  // Open player dialog
  const openPlayer = (video: VideoLink) => {
    setSelectedVideo(video)
    setShowPlayerDialog(true)
  }

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-sage-50/30 to-stone-50 border border-stone-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Video className="h-6 w-6 text-purple-600" />
              Video Library
            </h1>
            <p className="text-stone-600 mt-1">
              Manage Descript videos and external video links with tagging and metadata
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              {total} videos
            </Badge>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Video Link</DialogTitle>
                  <DialogDescription>
                    Add a Descript, YouTube, Vimeo, or other video link
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Video title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL *</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://share.descript.com/view/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports Descript, YouTube, Vimeo, Loom, and Wistia
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(v) => setFormData({ ...formData, platform: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Select
                        value={formData.organizationId || '_none'}
                        onValueChange={(v) => setFormData({ ...formData, organizationId: v === '_none' ? '' : v, projectId: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">No Organization</SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select
                        value={formData.projectId || '_none'}
                        onValueChange={(v) => setFormData({ ...formData, projectId: v === '_none' ? '' : v })}
                        disabled={!formData.organizationId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.organizationId ? "Select project" : "Select org first"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">No Project</SelectItem>
                          {projects
                            .filter(p => p.organizationId === formData.organizationId)
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recording Date</Label>
                      <Input
                        type="date"
                        value={formData.recordedAt}
                        onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Custom Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      value={formData.customThumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, customThumbnailUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVideo} disabled={saving || !formData.title || !formData.videoUrl}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Video'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                placeholder="Search videos..."
                className="pl-9"
              />
            </div>

            {/* Platform filter */}
            <Select
              value={platformFilter || '_all'}
              onValueChange={(v) => { setPlatformFilter(v === '_all' ? '' : v); setPage(1) }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Platforms</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Organization filter */}
            <Select
              value={projectFilter || '_all'}
              onValueChange={(v) => { setProjectFilter(v === '_all' ? '' : v); setPage(1) }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="recorded_at">Recorded Date</SelectItem>
                <SelectItem value="updated_at">Last Updated</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            <div className="border-l pl-4 flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="icon" onClick={fetchVideos}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Active filters */}
          {(searchQuery || platformFilter || projectFilter) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {platformFilter && (
                <Badge variant="secondary" className="gap-1">
                  {PLATFORMS.find(p => p.value === platformFilter)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPlatformFilter('')} />
                </Badge>
              )}
              {projectFilter && (
                <Badge variant="secondary" className="gap-1">
                  {projects.find(p => p.slug === projectFilter)?.title}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setProjectFilter('')} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(''); setPlatformFilter(''); setProjectFilter('') }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Video Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || platformFilter || projectFilter
                ? 'Try adjusting your filters'
                : 'Add your first video to get started'}
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="relative aspect-video bg-stone-100 cursor-pointer"
                onClick={() => openPlayer(video)}
              >
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-12 w-12 text-stone-300" />
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3">
                    <Play className="h-6 w-6 text-stone-900" />
                  </div>
                </div>
                {/* Duration */}
                {video.duration && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                    {formatDuration(video.duration)}
                  </Badge>
                )}
                {/* Platform badge */}
                <Badge variant="secondary" className="absolute top-2 left-2 text-xs capitalize">
                  {video.platform}
                </Badge>
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate" title={video.title}>
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {video.project && (
                        <span>{projects.find(p => p.slug === video.project)?.title || video.project}</span>
                      )}
                      {video.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {video.tags.length}
                        </span>
                      )}
                      {video.storytellers.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {video.storytellers.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openPlayer(video)}>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(video)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(video.videoUrl, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Original
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteVideo(video)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((video) => (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="relative w-32 aspect-video bg-stone-100 rounded overflow-hidden cursor-pointer shrink-0"
                  onClick={() => openPlayer(video)}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-6 w-6 text-stone-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{video.platform}</Badge>
                    {video.project && (
                      <span>{projects.find(p => p.slug === video.project)?.title}</span>
                    )}
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    {video.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {video.tags.length} tags
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(video)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(video.videoUrl, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Original
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteVideo(video)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
              <TabsTrigger value="tags">Tags & People</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={formData.organizationId || '_none'}
                  onValueChange={(v) => setFormData({ ...formData, organizationId: v === '_none' ? '' : v, projectId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={formData.projectId || '_none'}
                  onValueChange={(v) => setFormData({ ...formData, projectId: v === '_none' ? '' : v })}
                  disabled={!formData.organizationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.organizationId ? "Select project" : "Select org first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {projects
                      .filter(p => p.organizationId === formData.organizationId)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recording Date</Label>
                <Input
                  type="date"
                  value={formData.recordedAt}
                  onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input value={formData.videoUrl} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Platform: {selectedVideo?.platform} • To change the URL, delete and re-add the video
                </p>
              </div>
            </TabsContent>
            <TabsContent value="thumbnail" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Current Thumbnail</Label>
                  <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden">
                    {(formData.customThumbnailUrl || selectedVideo?.thumbnailUrl) ? (
                      <img
                        src={formData.customThumbnailUrl || selectedVideo?.thumbnailUrl || ''}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-stone-300" />
                      </div>
                    )}
                  </div>
                  {/* Fetch from source button */}
                  {selectedVideo && ['descript', 'youtube'].includes(selectedVideo.platform) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={async () => {
                        try {
                          setSaving(true)
                          const res = await fetch(`/api/videos/${selectedVideo.id}/thumbnail`, {
                            method: 'PUT'
                          })
                          const data = await res.json()
                          if (!res.ok) throw new Error(data.error)
                          // Update the selected video with new thumbnail
                          setSelectedVideo({
                            ...selectedVideo,
                            thumbnailUrl: data.video.thumbnailUrl
                          })
                          fetchVideos()
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to fetch thumbnail')
                        } finally {
                          setSaving(false)
                        }
                      }}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Fetch from {selectedVideo.platform === 'descript' ? 'Descript' : 'YouTube'}
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Custom Thumbnail URL</Label>
                  <Input
                    value={formData.customThumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, customThumbnailUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a URL to use a custom thumbnail, or leave empty to use the auto-generated one
                  </p>
                  {formData.customThumbnailUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setFormData({ ...formData, customThumbnailUrl: '' })}
                    >
                      Reset to Auto
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tags" className="mt-4">
              {selectedVideo && (
                <VideoTagger
                  videoId={selectedVideo.id}
                  onSave={() => {
                    fetchVideos()
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVideo} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="p-4">
              <VideoEmbed
                videoUrl={selectedVideo.videoUrl}
                videoEmbedCode={selectedVideo.embedUrl}
                videoPlatform={selectedVideo.platform}
                videoThumbnail={selectedVideo.thumbnailUrl || undefined}
                showControls={false}
              />
              {selectedVideo.description && (
                <p className="text-sm text-muted-foreground mt-4">
                  {selectedVideo.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                {selectedVideo.organization && (
                  <Badge variant="outline">
                    {selectedVideo.organization.name}
                  </Badge>
                )}
                {selectedVideo.projectDetails && (
                  <Badge variant="outline" className="bg-green-50">
                    {selectedVideo.projectDetails.name}
                  </Badge>
                )}
                {selectedVideo.tags.slice(0, 5).map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
                {selectedVideo.tags.length > 5 && (
                  <Badge variant="secondary">+{selectedVideo.tags.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

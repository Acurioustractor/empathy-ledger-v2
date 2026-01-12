'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tags,
  MapPin,
  Users,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle,
  Loader2,
  Grid3x3,
  List,
  Eye,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnhancedMediaTagger } from '@/components/media/EnhancedMediaTagger'
import { BatchTaggingBar } from '@/components/media/BatchTaggingBar'

interface MediaItem {
  id: string
  title: string
  thumbnail_url: string
  media_type: 'image' | 'video'
  status: string
  created_at: string
  tags?: Array<{ id: string; name: string; category: string }>
  location?: { place_name: string; indigenous_territory?: string }
  storytellers?: Array<{ id: string; display_name: string }>
}

export default function EnhancedTaggingTestPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [stats, setStats] = useState({
    total: 0,
    withTags: 0,
    withLocation: 0,
    withStorytellers: 0
  })

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch media assets with related data
      const response = await fetch('/api/admin/media?limit=50')
      if (response.ok) {
        const data = await response.json()
        const mediaItems = (data.media || []).map((item: any) => ({
          id: item.id,
          title: item.title || item.filename || 'Untitled',
          thumbnail_url: item.thumbnailUrl || item.publicUrl || '',
          media_type: item.mimeType?.startsWith('video/') ? 'video' : 'image',
          status: item.status || 'active',
          created_at: item.createdAt || item.created_at,
          tags: item.tags || [],
          location: item.location,
          storytellers: item.storytellers || []
        }))

        setMedia(mediaItems)

        // Calculate stats
        const withTags = mediaItems.filter((m: MediaItem) => (m.tags?.length || 0) > 0).length
        const withLocation = mediaItems.filter((m: MediaItem) => m.location).length
        const withStorytellers = mediaItems.filter((m: MediaItem) => (m.storytellers?.length || 0) > 0).length

        setStats({
          total: mediaItems.length,
          withTags,
          withLocation,
          withStorytellers
        })
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === media.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(media.map(m => m.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBatchComplete = () => {
    fetchMedia()
    handleClearSelection()
  }

  const editingMedia = editingMediaId
    ? media.find(m => m.id === editingMediaId)
    : null

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <span className="ml-2 text-stone-600">Loading media...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl pb-32">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-clay-900">Enhanced Tagging Test</h1>
          <Badge variant="outline" className="bg-sage-50 text-sage-700 border-sage-300">
            Phase 1 Complete
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Test the new enhanced tagging system with tags, locations, and storyteller linking
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-stone-50 to-stone-100/50 border-stone-200">
          <CardContent className="p-4 text-center">
            <ImageIcon className="h-5 w-5 text-stone-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
            <p className="text-xs text-stone-600">Total Media</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sage-50 to-sage-100/50 border-sage-200">
          <CardContent className="p-4 text-center">
            <Tags className="h-5 w-5 text-sage-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-sage-700">{stats.withTags}</p>
            <p className="text-xs text-stone-600">With Tags</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-earth-50 to-earth-100/50 border-earth-200">
          <CardContent className="p-4 text-center">
            <MapPin className="h-5 w-5 text-earth-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-earth-700">{stats.withLocation}</p>
            <p className="text-xs text-stone-600">With Location</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-clay-50 to-clay-100/50 border-clay-200">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-clay-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-clay-700">{stats.withStorytellers}</p>
            <p className="text-xs text-stone-600">With Storytellers</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Overview */}
      <Alert className="mb-6 bg-sage-50 border-sage-200">
        <CheckCircle className="h-4 w-4 text-sage-600" />
        <AlertDescription className="text-sage-800">
          <strong>Enhanced Tagging Features:</strong>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li><strong>Tags:</strong> Multi-dimensional tagging with categories (general, cultural, location, project, theme)</li>
            <li><strong>Locations:</strong> Interactive map picker with indigenous territory auto-detection</li>
            <li><strong>Storytellers:</strong> Link media to storytellers with relationship types</li>
            <li><strong>Batch Operations:</strong> Select multiple items and apply tags in bulk</li>
            <li><strong>Cultural Sensitivity:</strong> Elder approval workflow for sacred content</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-4">
                {media.length} items
                {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.size === media.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMedia}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'group relative overflow-hidden cursor-pointer transition-all',
                'hover:shadow-lg hover:scale-[1.02]',
                selectedIds.has(item.id) && 'ring-2 ring-sage-500'
              )}
              onClick={() => handleSelect(item.id)}
            >
              {/* Media Preview */}
              <div className="relative aspect-square bg-stone-100">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}

                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  {selectedIds.has(item.id) ? (
                    <CheckCircle2 className="h-6 w-6 text-sage-600 bg-white rounded-full" />
                  ) : (
                    <Circle className="h-6 w-6 text-white opacity-70 group-hover:opacity-100" />
                  )}
                </div>

                {/* Status indicators */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {(item.tags?.length || 0) > 0 && (
                    <Badge variant="secondary" className="bg-sage-100 text-sage-700 text-xs">
                      <Tags className="h-3 w-3 mr-1" />
                      {item.tags?.length}
                    </Badge>
                  )}
                  {item.location && (
                    <Badge variant="secondary" className="bg-earth-100 text-earth-700 text-xs">
                      <MapPin className="h-3 w-3" />
                    </Badge>
                  )}
                  {(item.storytellers?.length || 0) > 0 && (
                    <Badge variant="secondary" className="bg-clay-100 text-clay-700 text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {item.storytellers?.length}
                    </Badge>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingMediaId(item.id)
                    }}
                  >
                    <Tags className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(item.thumbnail_url, '_blank')
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-200">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-4 p-4 hover:bg-stone-50 cursor-pointer transition-colors',
                    selectedIds.has(item.id) && 'bg-sage-50'
                  )}
                  onClick={() => handleSelect(item.id)}
                >
                  <div className="flex-shrink-0">
                    {selectedIds.has(item.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-sage-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-stone-400" />
                    )}
                  </div>

                  <div className="flex-shrink-0 w-16 h-16 bg-stone-100 rounded overflow-hidden">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(item.tags?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Tags className="h-3 w-3 mr-1" />
                        {item.tags?.length} tags
                      </Badge>
                    )}
                    {item.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location.place_name}
                      </Badge>
                    )}
                    {(item.storytellers?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {item.storytellers?.length}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingMediaId(item.id)
                    }}
                  >
                    <Tags className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {media.length === 0 && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            No media found. Upload some media to test the enhanced tagging system.
          </AlertDescription>
        </Alert>
      )}

      {/* Batch Tagging Bar */}
      {selectedIds.size > 0 && (
        <BatchTaggingBar
          selectedIds={Array.from(selectedIds)}
          onClearSelection={handleClearSelection}
          onComplete={handleBatchComplete}
        />
      )}

      {/* Media Tagger Dialog */}
      <Dialog open={!!editingMediaId} onOpenChange={(open) => !open && setEditingMediaId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Edit Media: {editingMedia?.title || 'Untitled'}
            </DialogTitle>
          </DialogHeader>

          {editingMediaId && editingMedia && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Media Preview */}
              <div className="space-y-4">
                {editingMedia.thumbnail_url ? (
                  <img
                    src={editingMedia.thumbnail_url}
                    alt={editingMedia.title}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="aspect-square bg-stone-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-stone-400" />
                  </div>
                )}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Type:</strong> {editingMedia.media_type}</p>
                  <p><strong>Status:</strong> {editingMedia.status}</p>
                  <p><strong>Created:</strong> {new Date(editingMedia.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Enhanced Tagger */}
              <EnhancedMediaTagger
                mediaId={editingMediaId}
                mediaUrl={editingMedia.thumbnail_url || ''}
                onSave={() => {
                  setEditingMediaId(null)
                  fetchMedia()
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

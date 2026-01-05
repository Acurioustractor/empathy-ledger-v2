'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Image as ImageIcon,
  Video,
  Search,
  Grid3x3,
  List,
  Trash2,
  Edit,
  Download,
  Eye,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  title?: string
  caption?: string
  alt_text?: string
  cultural_tags?: string[]
  created_at: string
  file_size?: number
}

interface MediaGalleryProps {
  storyId?: string
  storytellerId: string
  media?: MediaItem[]
  onSelect?: (selectedIds: string[]) => void
  onEdit?: (mediaId: string) => void
  onDelete?: (mediaIds: string[]) => void
  selectable?: boolean
  className?: string
  testMode?: boolean
}

type ViewMode = 'grid' | 'list'

export function MediaGallery({
  storyId,
  storytellerId,
  media = [],
  onSelect,
  onEdit,
  onDelete,
  selectable = false,
  className,
  testMode = false
}: MediaGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(media)

  // Filter media based on search
  const filteredMedia = mediaItems.filter(item => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.caption?.toLowerCase().includes(searchLower) ||
      item.cultural_tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  })

  const handleSelect = (id: string) => {
    if (!selectable) return

    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelect?.(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set())
      onSelect?.([])
    } else {
      const allIds = new Set(filteredMedia.map(item => item.id))
      setSelectedIds(allIds)
      onSelect?.(Array.from(allIds))
    }
  }

  const handleDelete = () => {
    if (selectedIds.size === 0) return
    onDelete?.(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-sky-600" />
                Media Gallery
              </CardTitle>
              <CardDescription>
                {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
                {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
              </CardDescription>
            </div>

            {/* View Mode Toggle */}
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, caption, or tags..."
              className="pl-9"
            />
          </div>

          {/* Bulk Actions */}
          {selectable && filteredMedia.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
              </Button>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedIds.size})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            {searchQuery
              ? `No media found matching "${searchQuery}"`
              : 'No media files yet. Upload photos and videos to get started.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredMedia.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'group relative overflow-hidden cursor-pointer transition-all',
                'hover:shadow-lg hover:scale-[1.02]',
                selectedIds.has(item.id) && 'ring-2 ring-sky-500'
              )}
              onClick={() => handleSelect(item.id)}
            >
              {/* Media Preview */}
              <div className="relative aspect-square bg-slate-100">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.title || 'Media item'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  </div>
                )}

                {/* Selection Checkbox */}
                {selectable && (
                  <div className="absolute top-2 left-2 z-10">
                    {selectedIds.has(item.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-sky-600 bg-white rounded-full" />
                    ) : (
                      <Circle className="h-6 w-6 text-white opacity-70 group-hover:opacity-100" />
                    )}
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0">
                    {item.type}
                  </Badge>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(item.id)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(item.url, '_blank')
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Media Info */}
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {item.title || 'Untitled'}
                </p>
                {item.caption && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {item.caption}
                  </p>
                )}
                {item.cultural_tags && item.cultural_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.cultural_tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.cultural_tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.cultural_tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredMedia.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors',
                    selectedIds.has(item.id) && 'bg-sky-50'
                  )}
                  onClick={() => handleSelect(item.id)}
                >
                  {/* Selection Checkbox */}
                  {selectable && (
                    <div className="flex-shrink-0">
                      {selectedIds.has(item.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-sky-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.alt_text || item.title || 'Media'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{item.title || 'Untitled'}</p>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    {item.caption && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(item.file_size)}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Cultural Tags */}
                  {item.cultural_tags && item.cultural_tags.length > 0 && (
                    <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                      {item.cultural_tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(item.id)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.url, '_blank')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

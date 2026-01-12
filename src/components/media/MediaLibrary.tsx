'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MediaGrid } from './MediaGrid'
import { MediaUploader } from './MediaUploader'
import { MediaEditor } from './MediaEditor'
import { Upload, Search, Filter, Grid3x3, List } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'audio' | 'video' | 'document'
  caption?: string
  cultural_tags?: string[]
  alt_text?: string
  file_size: number
  duration?: number
  width?: number
  height?: number
  created_at: string
}

interface MediaLibraryProps {
  onSelect?: (media: MediaAsset) => void
  multiSelect?: boolean
  allowedTypes?: Array<'image' | 'audio' | 'video' | 'document'>
  className?: string
  apiEndpoint?: string // Custom API endpoint (default: /api/media/library)
}

export function MediaLibrary({
  onSelect,
  multiSelect = false,
  allowedTypes = ['image', 'audio', 'video', 'document'],
  className,
  apiEndpoint = '/api/media/library'
}: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([])
  const [showUploader, setShowUploader] = useState(false)
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null)

  useEffect(() => {
    loadMedia()
  }, [typeFilter])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const response = await fetch(`${apiEndpoint}?${params}`)
      if (!response.ok) throw new Error('Failed to load media')

      const data = await response.json()
      setMedia(data.media || [])
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = (asset: MediaAsset) => {
    if (multiSelect) {
      setSelectedMedia(prev =>
        prev.find(m => m.id === asset.id)
          ? prev.filter(m => m.id !== asset.id)
          : [...prev, asset]
      )
    } else {
      onSelect?.(asset)
    }
  }

  const handleUploadComplete = (newMedia: MediaAsset[]) => {
    setMedia(prev => [...newMedia, ...prev])
    setShowUploader(false)
  }

  const handleMediaUpdate = (updated: MediaAsset) => {
    setMedia(prev => prev.map(m => m.id === updated.id ? updated : m))
    setEditingMedia(null)
  }

  const handleMediaDelete = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id))
  }

  const filteredMedia = media.filter(asset => {
    const matchesSearch = searchQuery
      ? asset.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.cultural_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    const matchesType = allowedTypes.includes(asset.type)

    return matchesSearch && matchesType
  })

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">Media Library</h2>
          <Button
            onClick={() => setShowUploader(true)}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media..."
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border border-[#2C2C2C]/20 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-none",
                viewMode === 'grid' && "bg-[#D97757]/10 text-[#D97757]"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-none",
                viewMode === 'list' && "bg-[#D97757]/10 text-[#D97757]"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#D97757] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#2C2C2C]/60">Loading media...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12 bg-[#F8F6F1] rounded-lg border-2 border-dashed border-[#2C2C2C]/20">
            <Upload className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/40" />
            <p className="text-[#2C2C2C]/60 mb-4">
              {searchQuery ? 'No media found matching your search' : 'No media uploaded yet'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowUploader(true)}
                className="bg-[#D97757] hover:bg-[#D97757]/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Media
              </Button>
            )}
          </div>
        ) : (
          <MediaGrid
            media={filteredMedia}
            viewMode={viewMode}
            selectedMedia={selectedMedia}
            onSelect={handleMediaSelect}
            onEdit={setEditingMedia}
            onDelete={handleMediaDelete}
          />
        )}

        {/* Selection Actions */}
        {multiSelect && selectedMedia.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t-2 border-[#2C2C2C]/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#2C2C2C]/70">
                {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMedia([])}
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={() => onSelect?.(selectedMedia as any)}
                  className="bg-[#D97757] hover:bg-[#D97757]/90"
                >
                  Use Selected Media
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Uploader Dialog */}
      {showUploader && (
        <MediaUploader
          onComplete={handleUploadComplete}
          onCancel={() => setShowUploader(false)}
        />
      )}

      {/* Editor Dialog */}
      {editingMedia && (
        <MediaEditor
          media={editingMedia}
          onSave={handleMediaUpdate}
          onCancel={() => setEditingMedia(null)}
        />
      )}
    </>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MediaSelector } from '@/components/media/MediaSelector'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  ImageIcon,
  X,
  Check,
  ExternalLink,
  User,
  Filter,
  RefreshCw,
  ImagePlus,
  Trash2
} from 'lucide-react'

interface Story {
  id: string
  title: string
  story_image_url: string | null
  status: string
  is_featured: boolean
  storyteller: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'audio' | 'video' | 'document'
  caption?: string
  alt_text?: string
}

export default function StoryImagesAdminPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [imageFilter, setImageFilter] = useState<'all' | 'with' | 'without'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Media selector state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    filterStories()
  }, [stories, searchTerm, imageFilter, statusFilter])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stories/images')
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories || [])
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStories = () => {
    let filtered = stories

    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.storyteller?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (imageFilter === 'with') {
      filtered = filtered.filter(story => story.story_image_url)
    } else if (imageFilter === 'without') {
      filtered = filtered.filter(story => !story.story_image_url)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter)
    }

    setFilteredStories(filtered)
  }

  const handleSelectImage = (story: Story) => {
    setSelectedStory(story)
    setIsMediaSelectorOpen(true)
  }

  const handleMediaSelect = async (media: MediaAsset | MediaAsset[]) => {
    if (!selectedStory) return

    const asset = Array.isArray(media) ? media[0] : media
    if (!asset) return

    setIsUpdating(selectedStory.id)

    try {
      const response = await fetch(`/api/admin/stories/${selectedStory.id}/image`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_image_url: asset.url })
      })

      if (response.ok) {
        // Update local state
        setStories(prev => prev.map(s =>
          s.id === selectedStory.id
            ? { ...s, story_image_url: asset.url }
            : s
        ))
      }
    } catch (error) {
      console.error('Error updating story image:', error)
    } finally {
      setIsUpdating(null)
      setIsMediaSelectorOpen(false)
      setSelectedStory(null)
    }
  }

  const handleRemoveImage = async (story: Story) => {
    if (!confirm(`Remove image from "${story.title}"?`)) return

    setIsUpdating(story.id)

    try {
      const response = await fetch(`/api/admin/stories/${story.id}/image`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStories(prev => prev.map(s =>
          s.id === story.id
            ? { ...s, story_image_url: null }
            : s
        ))
      }
    } catch (error) {
      console.error('Error removing story image:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const storiesWithImages = stories.filter(s => s.story_image_url).length
  const storiesWithoutImages = stories.filter(s => !s.story_image_url).length
  const featuredStories = stories.filter(s => s.is_featured).length
  const featuredWithoutImages = stories.filter(s => s.is_featured && !s.story_image_url).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-terracotta" />
          <span className="ml-2">Loading stories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-charcoal-900">Story Image Management</h1>
          <Link href="/admin/photos">
            <Button variant="outline" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Media Library
            </Button>
          </Link>
        </div>
        <p className="text-charcoal-600">
          Add featured images to stories from the media library
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-terracotta">{stories.length}</p>
            <p className="text-xs text-charcoal-600">Total Stories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-sage-600">{storiesWithImages}</p>
            <p className="text-xs text-charcoal-600">With Images</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-ochre-600">{storiesWithoutImages}</p>
            <p className="text-xs text-charcoal-600">Without Images</p>
          </CardContent>
        </Card>
        <Card className={featuredWithoutImages > 0 ? 'border-terracotta border-2' : ''}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-terracotta-600">{featuredWithoutImages}</p>
            <p className="text-xs text-charcoal-600">Featured Missing Images</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={imageFilter}
              onChange={(e) => setImageFilter(e.target.value as any)}
              className="px-4 py-2 border border-charcoal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="all">All Stories</option>
              <option value="without">Missing Images</option>
              <option value="with">Has Images</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-charcoal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <Button
              onClick={fetchStories}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <Card
            key={story.id}
            className={`overflow-hidden transition-all ${
              story.is_featured && !story.story_image_url
                ? 'ring-2 ring-terracotta'
                : ''
            }`}
          >
            {/* Image Preview */}
            <div className="relative aspect-video bg-cream">
              {story.story_image_url ? (
                <>
                  <Image
                    src={story.story_image_url}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={() => handleSelectImage(story)}
                      disabled={isUpdating === story.id}
                    >
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 hover:bg-terracotta-100"
                      onClick={() => handleRemoveImage(story)}
                      disabled={isUpdating === story.id}
                    >
                      <Trash2 className="w-4 h-4 text-terracotta" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-2 left-2 bg-sage-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Has Image
                  </Badge>
                </>
              ) : story.storyteller?.avatar_url ? (
                <>
                  <Image
                    src={story.storyteller.avatar_url}
                    alt={story.storyteller.display_name}
                    fill
                    className="object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={() => handleSelectImage(story)}
                      className="bg-terracotta hover:bg-terracotta-700 gap-2"
                      disabled={isUpdating === story.id}
                    >
                      {isUpdating === story.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImagePlus className="w-4 h-4" />
                      )}
                      Add Image
                    </Button>
                  </div>
                  <Badge className="absolute bottom-2 left-2 bg-ochre-500 text-white">
                    Using Avatar
                  </Badge>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-terracotta/10 via-ochre/10 to-sage/10">
                  <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg mb-3">
                    <span className="text-xl font-bold text-ochre-700">
                      {story.storyteller?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleSelectImage(story)}
                    className="bg-terracotta hover:bg-terracotta-700 gap-2"
                    disabled={isUpdating === story.id}
                  >
                    {isUpdating === story.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                    Add Image
                  </Button>
                </div>
              )}

              {/* Featured Badge */}
              {story.is_featured && (
                <Badge className="absolute top-2 left-2 bg-ochre-500 text-white">
                  Featured
                </Badge>
              )}
            </div>

            {/* Story Info */}
            <CardContent className="p-4">
              <h3 className="font-semibold text-charcoal-900 line-clamp-2 mb-2">
                {story.title}
              </h3>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-charcoal-600">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-32">
                    {story.storyteller?.display_name || 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      story.status === 'published'
                        ? 'border-sage-500 text-sage-700'
                        : 'border-charcoal-300 text-charcoal-600'
                    }
                  >
                    {story.status}
                  </Badge>

                  <Link href={`/stories/${story.id}`} target="_blank">
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900 mb-2">No stories found</h3>
          <p className="text-charcoal-600">Try adjusting your filters.</p>
        </div>
      )}

      {/* Media Selector Dialog */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => {
          setIsMediaSelectorOpen(false)
          setSelectedStory(null)
        }}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        title={`Select Image for "${selectedStory?.title || 'Story'}"`}
        apiEndpoint="/api/admin/media/library"
      />
    </div>
  )
}

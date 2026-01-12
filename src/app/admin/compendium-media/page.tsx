'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RefreshCcw, Search, Tag, Upload, LibraryBig } from 'lucide-react'

interface MediaItem {
  id: string
  file_url: string
  title: string
  description?: string | null
  caption?: string | null
  alt_text?: string | null
  cultural_tags: string[]
  project_slugs: string[]
  created_at: string
  file_type?: string | null
}

interface VideoEmbed {
  id: string
  title: string
  description?: string | null
  created_at: string
  platform?: string
  embed_url?: string | null
  video_url?: string | null
  thumbnail_url?: string | null
}

interface GalleryItem {
  id: string
  kind: 'photo' | 'video'
  created_at: string
  title: string
  description?: string | null
  caption?: string | null
  alt_text?: string | null
  file_url?: string
  cultural_tags?: string[]
  project_slugs?: string[]
  platform?: string
  embed_url?: string
}

interface LibraryItem {
  id: string
  url: string
  type: string
  title?: string
  caption?: string | null
  alt_text?: string | null
  created_at?: string | null
}

const EXCLUDED_TAGS = new Set([
  'compendium-2026',
  'source:webflow-portfolio',
  'source:admin-upload',
  'consent:internal',
])

export default function CompendiumMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [videos, setVideos] = useState<VideoEmbed[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [galleryTitle, setGalleryTitle] = useState('Compendium 2026')

  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkTags, setBulkTags] = useState('')
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadSummary, setUploadSummary] = useState<string | null>(null)
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [librarySearch, setLibrarySearch] = useState('')
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [librarySelectedIds, setLibrarySelectedIds] = useState<Set<string>>(new Set())
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null)

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    items.forEach((item) => {
      (item.cultural_tags || []).forEach((tag) => {
        if (!EXCLUDED_TAGS.has(tag)) {
          tags.add(tag)
        }
      })
    })
    return Array.from(tags).sort()
  }, [items])

  const availableProjects = useMemo(() => {
    const projects = new Set<string>()
    items.forEach((item) => {
      (item.project_slugs || []).forEach((slug) => projects.add(slug))
    })
    return Array.from(projects).sort()
  }, [items])

  const galleryItems = useMemo<GalleryItem[]>(() => {
    const photos: GalleryItem[] = items.map((item) => ({
      ...item,
      kind: 'photo',
      created_at: item.created_at,
    }))

    const embeds: GalleryItem[] = videos.map((video) => ({
      id: video.id,
      kind: 'video',
      created_at: video.created_at,
      title: video.title,
      description: video.description,
      platform: video.platform,
      embed_url: video.embed_url,
    }))

    return [...embeds, ...photos].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
  }, [items, videos])

  const compendiumIds = useMemo(() => new Set(items.map((item) => item.id)), [items])

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (tagFilter.trim()) params.set('tag', tagFilter.trim())
      if (projectFilter.trim()) params.set('project', projectFilter.trim())
      const response = await fetch(`/api/admin/compendium-media?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch compendium media')
      }
      const data = await response.json()
      setItems(data.items || [])
      setVideos(data.videos || [])
      if (data.gallery?.title) {
        setGalleryTitle(data.gallery.title)
      }
    } catch (fetchError) {
      console.error(fetchError)
      setError('Unable to load compendium media right now.')
    } finally {
      setLoading(false)
    }
  }, [projectFilter, search, tagFilter])

  const fetchLibrary = useCallback(async () => {
    try {
      setLibraryLoading(true)
      setLibraryMessage(null)
      const params = new URLSearchParams()
      params.set('limit', '60')
      params.set('type', 'image')
      if (librarySearch.trim()) params.set('search', librarySearch.trim())

      const response = await fetch(`/api/admin/media/library?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch media library')
      }

      const data = await response.json()
      setLibraryItems(data.media || [])
    } catch (libraryError) {
      console.error(libraryError)
      setLibraryMessage('Unable to load the media library.')
    } finally {
      setLibraryLoading(false)
    }
  }, [librarySearch])

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchMedia()
    }, 250)
    return () => clearTimeout(handle)
  }, [fetchMedia, projectFilter, search, tagFilter])

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchLibrary()
    }, 300)
    return () => clearTimeout(handle)
  }, [fetchLibrary, librarySearch])

  const clearFilters = () => {
    setSearch('')
    setTagFilter('')
    setProjectFilter('')
  }

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadFiles(files)
    setUploadSummary(null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
  }

  const uploadSelectedFiles = async () => {
    if (uploadFiles.length === 0) return
    try {
      setUploading(true)
      setUploadSummary(null)
      const formData = new FormData()
      uploadFiles.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/admin/compendium-media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadSummary(
        `Uploaded ${data.uploaded} · Skipped ${data.skipped} · Failed ${data.failed}`
      )
      setUploadFiles([])
      fetchMedia()
    } catch (uploadError) {
      console.error(uploadError)
      setUploadSummary('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const toggleLibrarySelection = (id: string) => {
    setLibrarySelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAllLibrary = () => {
    const selectableIds = libraryItems
      .filter((item) => !compendiumIds.has(item.id))
      .map((item) => item.id)
    setLibrarySelectedIds(new Set(selectableIds))
  }

  const addLibraryToCompendium = async () => {
    if (librarySelectedIds.size === 0) return
    try {
      setLibraryLoading(true)
      setLibraryMessage(null)
      const response = await fetch('/api/admin/compendium-media/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: Array.from(librarySelectedIds) }),
      })

      if (!response.ok) {
        throw new Error('Failed to link media assets')
      }

      const data = await response.json()
      setLibraryMessage(`Added ${data.added} · Skipped ${data.skipped}`)
      setLibrarySelectedIds(new Set())
      fetchMedia()
      fetchLibrary()
    } catch (libraryError) {
      console.error(libraryError)
      setLibraryMessage('Failed to add items to the compendium gallery.')
    } finally {
      setLibraryLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const parseTags = (value: string) =>
    value
      .split(/[,;]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)

  const applyBulkTags = async () => {
    const tags = parseTags(bulkTags)
    if (tags.length === 0 || selectedIds.size === 0) return

    try {
      setBulkUpdating(true)
      const response = await fetch('/api/admin/compendium-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          tags,
        }),
      })

      if (!response.ok) {
        throw new Error('Bulk tag update failed')
      }

      setBulkTags('')
      setSelectedIds(new Set())
      fetchMedia()
    } catch (bulkError) {
      console.error(bulkError)
      setError('Bulk tagging failed. Please try again.')
    } finally {
      setBulkUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-grey-900">{galleryTitle} Media</h1>
        <p className="text-sm text-grey-600">
          Search and review Compendium 2026 photos and Descript video links.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <p className="text-sm text-grey-500">Filter by keyword, tag, or project slug.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
            <Button variant="outline" onClick={fetchMedia}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, caption, description"
                className="pl-9"
              />
            </div>
            <Input
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              placeholder="Filter by tag (e.g. consent:internal)"
            />
            <Input
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              placeholder="Filter by project slug"
            />
          </div>

          {(availableProjects.length > 0 || availableTags.length > 0) && (
            <div className="space-y-3">
              {availableProjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableProjects.map((slug) => (
                    <Button
                      key={slug}
                      variant={projectFilter === slug ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProjectFilter(slug)}
                    >
                      {slug}
                    </Button>
                  ))}
                </div>
              )}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={tagFilter === tag ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTagFilter(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Photos</CardTitle>
          <p className="text-sm text-grey-500">
            Upload images to the Compendium 2026 media library.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUploadChange}
          />
          {uploadFiles.length > 0 && (
            <div className="rounded-lg border border-grey-200 bg-grey-50 px-3 py-2 text-sm text-grey-600">
              {uploadFiles.map((file) => (
                <div key={file.name} className="flex justify-between">
                  <span>{file.name}</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button onClick={uploadSelectedFiles} disabled={uploading || uploadFiles.length === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            {uploadSummary && (
              <span className="text-sm text-grey-600">{uploadSummary}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LibraryBig className="h-4 w-4" />
            Pick From Media Library
          </CardTitle>
          <p className="text-sm text-grey-500">
            Add existing media assets into the Compendium gallery without re-uploading.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
              placeholder="Search library by title or filename"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchLibrary}
                disabled={libraryLoading}
              >
                Refresh
              </Button>
              <Button
                onClick={addLibraryToCompendium}
                disabled={libraryLoading || librarySelectedIds.size === 0}
              >
                Add Selected
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-grey-500">
            <span>{libraryItems.length} items</span>
            <span>•</span>
            <span>{librarySelectedIds.size} selected</span>
            <Button variant="ghost" size="sm" onClick={selectAllLibrary}>
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLibrarySelectedIds(new Set())}
            >
              Clear
            </Button>
            {libraryMessage && (
              <span className="text-grey-600">{libraryMessage}</span>
            )}
          </div>

          {libraryLoading ? (
            <div className="text-sm text-grey-500">Loading library...</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {libraryItems.map((item) => {
                const alreadyInCompendium = compendiumIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden rounded-lg border bg-white ${
                      alreadyInCompendium ? 'border-sage-200 opacity-70' : 'border-grey-200'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-grey-100">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.title || 'Media asset'}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-grey-400">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-sm font-medium text-grey-900 line-clamp-2">
                        {item.title || item.caption || item.alt_text || 'Untitled'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-grey-500">
                        {alreadyInCompendium ? (
                          <Badge variant="sage-soft">In compendium</Badge>
                        ) : (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={librarySelectedIds.has(item.id)}
                              onChange={() => toggleLibrarySelection(item.id)}
                              className="h-4 w-4"
                            />
                            Select
                          </label>
                        )}
                        <span>{item.type}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Tag Editor</CardTitle>
          <p className="text-sm text-grey-500">
            Apply tags to selected photos. Tags append to existing manual tags.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={bulkTags}
              onChange={(event) => setBulkTags(event.target.value)}
              placeholder="Add tags (comma or semicolon separated)"
            />
            <div className="flex gap-2">
              <Button
                onClick={applyBulkTags}
                disabled={bulkUpdating || selectedIds.size === 0 || parseTags(bulkTags).length === 0}
              >
                <Tag className="mr-2 h-4 w-4" />
                {bulkUpdating ? 'Applying...' : 'Apply Tags'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
                disabled={selectedIds.size === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <p className="text-xs text-grey-500">
            Selected {selectedIds.size} photo{selectedIds.size === 1 ? '' : 's'}.
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-grey-500">
        <span>
          {loading
            ? 'Loading media...'
            : `${items.length} photos · ${videos.length} videos`}
        </span>
        <Badge variant="outline">compendium-2026</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {galleryItems.map((item) => {
          const isPhoto = item.kind === 'photo'
          const consentTag = (item.cultural_tags || []).find((tag) => tag.startsWith('consent:'))
          const extraTags = (item.cultural_tags || []).filter(
            (tag) => !EXCLUDED_TAGS.has(tag) && !tag.startsWith('consent:')
          )
          const embedUrl =
            item.embed_url && item.embed_url.includes('/view/')
              ? item.embed_url.replace('/view/', '/embed/')
              : item.embed_url
          return (
            <Card
              key={`${item.kind}-${item.id}`}
              className={`overflow-hidden ${isPhoto && selectedIds.has(item.id) ? 'ring-2 ring-sage-400' : ''}`}
            >
              <div className="relative aspect-[4/3] w-full bg-grey-100">
                {isPhoto ? (
                  <>
                    <img
                      src={item.file_url}
                      alt={item.alt_text || item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <label className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 shadow">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="h-4 w-4"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={item.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-grey-500">
                        Video embed unavailable
                      </div>
                    )}
                  </>
                )}
              </div>
              <CardContent className="space-y-2 pt-4">
                <div>
                  <p className="text-sm font-medium text-grey-900">{item.title}</p>
                  {item.caption && (
                    <p className="text-xs text-grey-500">{item.caption}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isPhoto &&
                    (item.project_slugs || []).map((slug) => (
                      <Badge key={slug} variant="sky">
                        {slug}
                      </Badge>
                    ))}
                  {consentTag && (
                    <Badge variant="clay-soft">{consentTag}</Badge>
                  )}
                  {!isPhoto && (
                    <Badge variant="sage-soft">descript</Badge>
                  )}
                  {extraTags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

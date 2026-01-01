'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  FolderOpen,
  Activity,
  Eye,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectMediaTabProps } from './types'

// Media upload form component
const MediaUploadForm: React.FC<{
  onUpload: (file: File, metadata: any) => void
  uploading: boolean
}> = ({ onUpload, uploading }) => {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    description: '',
    altText: '',
    culturalSensitivity: 'standard',
    privacy: 'organisation'
  })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      onUpload(file, metadata)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label>File</Label>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colours",
            dragActive ? "border-blue-500 bg-blue-50" : "border-stone-300 hover:border-stone-400",
            file ? "border-green-500 bg-green-50" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.txt"
          />
          {file ? (
            <div>
              <p className="font-semibold text-green-600">{file.name}</p>
              <p className="text-sm text-stone-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <Plus className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p>Drop a file here or click to select</p>
              <p className="text-xs text-stone-500 mt-1">
                Images, videos, audio, PDFs (max 50MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Fields */}
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          placeholder="Describe this media file..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="altText">Alt Text (Optional)</Label>
        <Input
          id="altText"
          value={metadata.altText}
          onChange={(e) => setMetadata({ ...metadata, altText: e.target.value })}
          placeholder="Alternative text for accessibility..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="culturalSensitivity">Cultural Sensitivity</Label>
          <Select
            value={metadata.culturalSensitivity}
            onValueChange={(value) => setMetadata({ ...metadata, culturalSensitivity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="sensitive">Culturally Sensitive</SelectItem>
              <SelectItem value="sacred">Sacred/Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="privacy">Privacy Level</Label>
          <Select
            value={metadata.privacy}
            onValueChange={(value) => setMetadata({ ...metadata, privacy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organisation">Organization Only</SelectItem>
              <SelectItem value="project">Project Team Only</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
      </div>
    </form>
  )
}

export const ProjectMediaTab: React.FC<ProjectMediaTabProps> = ({ projectId }) => {
  const [media, setMedia] = useState<any[]>([])
  const [galleries, setGalleries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [stats, setStats] = useState<any>({})
  const [selectedGallery, setSelectedGallery] = useState<string>('all')

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/media`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch media')
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGalleries = async () => {
    try {
      // For now, we'll simulate galleries. Later this could be a separate API
      const galleryData = [
        { id: 'all', name: 'All Media', count: media.length },
        { id: 'photos', name: 'Photos', count: media.filter(m => m.type?.startsWith('image')).length },
        { id: 'videos', name: 'Videos', count: media.filter(m => m.type?.startsWith('video')).length },
        { id: 'documents', name: 'Documents', count: media.filter(m => m.type?.includes('pdf') || m.type?.includes('document')).length }
      ]
      setGalleries(galleryData)
    } catch (error) {
      console.error('Error setting up galleries:', error)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [projectId])

  useEffect(() => {
    fetchGalleries()
  }, [media])

  const handleFileUpload = async (file: File, metadata: any) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', metadata.description || '')
      formData.append('altText', metadata.altText || '')
      formData.append('culturalSensitivity', metadata.culturalSensitivity || 'standard')
      formData.append('privacy', metadata.privacy || 'organisation')

      const response = await fetch(`/api/admin/projects/${projectId}/media`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchMedia()
        setIsUploadDialogOpen(false)
        console.log('Media uploaded successfully')
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/media?mediaId=${mediaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMedia()
        console.log('Media deleted successfully')
      } else {
        console.error('Failed to delete media')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <div className="text-center py-8">Loading media...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Media & Galleries</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Organize photos, videos, documents, and other media files into galleries
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                Create Gallery
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Gallery</DialogTitle>
                <DialogDescription>
                  Create a themed gallery to organise your project media
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="galleryName">Gallery Name</Label>
                  <Input id="galleryName" placeholder="e.g. Elder Interviews, Community Events..." />
                </div>
                <div>
                  <Label htmlFor="galleryDescription">Description</Label>
                  <Textarea id="galleryDescription" placeholder="Describe what this gallery contains..." rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>Cancel</Button>
                  <Button>Create Gallery</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Media to Project</DialogTitle>
                <DialogDescription>
                  Upload photos, videos, documents, or other media files to this project
                </DialogDescription>
              </DialogHeader>
              <MediaUploadForm onUpload={handleFileUpload} uploading={uploading} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Media Stats */}
      {stats.totalFiles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Files</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.images}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.videos}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Videos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.audio}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Audio</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">{formatFileSize(stats.totalSize)}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Size</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gallery Filters */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b pb-4">
          {galleries.map((gallery) => (
            <Button
              key={gallery.id}
              variant={selectedGallery === gallery.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGallery(gallery.id)}
              className="flex items-center gap-2"
            >
              {gallery.name}
              <Badge variant="secondary" className="ml-1">
                {gallery.count}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media uploaded yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Upload photos, videos, documents, and other media files to organise your project content.
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload First Media
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.filter(item => {
            if (selectedGallery === 'all') return true
            if (selectedGallery === 'photos') return item.type?.startsWith('image')
            if (selectedGallery === 'videos') return item.type?.startsWith('video')
            if (selectedGallery === 'documents') return item.type?.includes('pdf') || item.type?.includes('document')
            return true
          }).map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-stone-100 dark:bg-stone-800 relative">
                {item.type?.startsWith('image/') ? (
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.altText || item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.type?.startsWith('video/') ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-12 h-12 text-stone-400" />
                    <span className="ml-2 text-stone-600">Video</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-12 h-12 text-stone-400" />
                    <span className="ml-2 text-stone-600">File</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold truncate" title={item.name}>{item.name}</h4>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
                {item.description && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-xs">
                    {item.culturalSensitivity}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMedia(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
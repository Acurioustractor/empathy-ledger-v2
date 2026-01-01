'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import {
  Images,
  Video,
  Play,
  Download,
  Calendar,
  User,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  FileText,
  Heart,
  MapPin,
  Clock,
  Plus,
  Loader2,
  Tag,
  Users,
  Folder,
  Camera,
  Shield,
  ChevronDown,
  Check,
  X,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VideoThumbnail } from '@/components/media/VideoThumbnail'
import { VideoPlayerModal } from '@/components/media/VideoPlayerModal'
import PhotoUploadManager from '@/components/galleries/PhotoUploadManager'

interface MediaAsset {
  id: string
  filename: string
  originalFilename: string
  type: 'image' | 'video' | 'audio'
  url: string
  title: string
  description: string
  size: number
  mimeType: string
  createdAt: string
  addedAt: string
  uploader: {
    id: string
    name: string
    avatarUrl?: string
  }
  tags: string[]
  galleryItemId: string
}

interface PhotoGallery {
  id: string
  title: string
  description: string
  galleryType: string
  photoCount: number
  totalSizeBytes: number
  privacyLevel: string
  culturalSensitivityLevel: string
  requiresElderApproval: boolean
  autoOrganizeEnabled: boolean
  faceGroupingEnabled: boolean
  locationGroupingEnabled: boolean
  coverPhotoId?: string
  createdAt: string
  updatedAt: string
  lastUpdatedAt: string
  project?: {
    id: string
    name: string
    description: string
  }
  storyteller?: {
    id: string
    name: string
    avatarUrl?: string
  }
  photos: MediaAsset[]
  stats: {
    totalPhotos: number
    images: number
    videos: number
    totalSize: number
  }
}

interface GalleriesResponse {
  success: boolean
  galleries: PhotoGallery[]
  storytellerVideos: MediaAsset[]
  stats: {
    totalGalleries: number
    totalPhotos: number
    totalImages: number
    totalVideos: number
    totalSize: number
    totalViews: number
  }
}

interface OrganizationGalleriesProps {
  params: Promise<{ id: string }>
}

export default function OrganizationGalleries({ params }: OrganizationGalleriesProps) {
  const [organizationId, setOrganizationId] = useState<string>('')
  const [galleries, setGalleries] = useState<PhotoGallery[]>([])
  const [storytellerVideos, setStorytellerVideos] = useState<MediaAsset[]>([])
  const [allPhotos, setAllPhotos] = useState<MediaAsset[]>([])
  const [stats, setStats] = useState<GalleriesResponse['stats'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'audio'>('all')
  const [viewMode, setViewMode] = useState<'galleries' | 'grid' | 'list'>('galleries')
  const [selectedGallery, setSelectedGallery] = useState<PhotoGallery | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<MediaAsset | null>(null)

  // Create Gallery Modal State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [storytellers, setStorytellers] = useState([])

  // Searchable storyteller dropdown state
  const [storytellerSearch, setStorytellerSearch] = useState('')
  const [isStorytellerDropdownOpen, setIsStorytellerDropdownOpen] = useState(false)
  const [selectedStorytellers, setSelectedStorytellers] = useState<any[]>([])

  const router = useRouter()

  // Form state for gallery creation
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    galleryType: 'organization',
    privacyLevel: 'organization',
    culturalSensitivityLevel: 'standard',
    projectId: 'none',
    storytellerIds: [] as string[],
    requiresElderApproval: false,
    autoOrganizeEnabled: true,
    faceGroupingEnabled: false,
    locationGroupingEnabled: false
  })

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setOrganizationId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (organizationId) {
      fetchGalleries()
      fetchProjectsAndStorytellers()
    }
  }, [organizationId])

  const fetchProjectsAndStorytellers = async () => {
    try {
      // Fetch projects
      const projectsResponse = await fetch(`/api/organisations/${organizationId}/projects`)
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        console.log('📋 Projects data:', projectsData)
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      }

      // Fetch storytellers
      const storytellersResponse = await fetch(`/api/organisations/${organizationId}/storytellers`)
      if (storytellersResponse.ok) {
        const storytellersData = await storytellersResponse.json()
        console.log('👥 Storytellers data:', storytellersData)
        // Handle different response formats
        if (Array.isArray(storytellersData)) {
          setStorytellers(storytellersData)
        } else if (storytellersData && Array.isArray(storytellersData.storytellers)) {
          setStorytellers(storytellersData.storytellers)
        } else if (storytellersData && Array.isArray(storytellersData.data)) {
          setStorytellers(storytellersData.data)
        } else {
          console.warn('Unexpected storytellers response format:', storytellersData)
          setStorytellers([])
        }
      }
    } catch (error) {
      console.error('Error fetching projects and storytellers:', error)
      setProjects([])
      setStorytellers([])
    }
  }

  const handleCreateGallery = async () => {
    if (!galleryForm.title.trim()) {
      alert('Gallery title is required')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/organisations/${organizationId}/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: galleryForm.title,
          description: galleryForm.description,
          galleryType: galleryForm.galleryType,
          privacyLevel: galleryForm.privacyLevel,
          culturalSensitivityLevel: galleryForm.culturalSensitivityLevel,
          projectId: galleryForm.projectId === 'none' ? null : galleryForm.projectId,
          storytellerIds: galleryForm.storytellerIds,
          requiresElderApproval: galleryForm.requiresElderApproval,
          autoOrganizeEnabled: galleryForm.autoOrganizeEnabled,
          faceGroupingEnabled: galleryForm.faceGroupingEnabled,
          locationGroupingEnabled: galleryForm.locationGroupingEnabled
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create gallery')
      }

      // Success - close dialog and refresh
      setIsCreateDialogOpen(false)
      resetGalleryForm()
      fetchGalleries()

      alert(result.message || 'Gallery created successfully!')

    } catch (error) {
      console.error('Error creating gallery:', error)
      alert(error instanceof Error ? error.message : 'Failed to create gallery')
    } finally {
      setIsCreating(false)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setGalleryForm(prev => ({ ...prev, [field]: value }))
  }

  // Storyteller search and selection functions
  const filteredStorytellers = storytellers.filter((storyteller: any) => {
    const name = storyteller.displayName || storyteller.fullName || ''
    return name.toLowerCase().includes(storytellerSearch.toLowerCase())
  })

  const handleStorytellerSelect = (storyteller: any) => {
    const isSelected = selectedStorytellers.some(s => s.id === storyteller.id)

    if (isSelected) {
      // Remove storyteller
      const newSelected = selectedStorytellers.filter(s => s.id !== storyteller.id)
      setSelectedStorytellers(newSelected)
      setGalleryForm(prev => ({
        ...prev,
        storytellerIds: newSelected.map(s => s.id)
      }))
    } else {
      // Add storyteller
      const newSelected = [...selectedStorytellers, storyteller]
      setSelectedStorytellers(newSelected)
      setGalleryForm(prev => ({
        ...prev,
        storytellerIds: newSelected.map(s => s.id)
      }))
    }
    setStorytellerSearch('')
  }

  const handleStorytellerClear = () => {
    setSelectedStorytellers([])
    setGalleryForm(prev => ({ ...prev, storytellerIds: [] }))
    setStorytellerSearch('')
  }

  const removeStoryteller = (storytellerId: string) => {
    const newSelected = selectedStorytellers.filter(s => s.id !== storytellerId)
    setSelectedStorytellers(newSelected)
    setGalleryForm(prev => ({
      ...prev,
      storytellerIds: newSelected.map(s => s.id)
    }))
  }

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      description: '',
      galleryType: 'organization',
      privacyLevel: 'organization',
      culturalSensitivityLevel: 'standard',
      projectId: 'none',
      storytellerIds: [],
      requiresElderApproval: false,
      autoOrganizeEnabled: true,
      faceGroupingEnabled: false,
      locationGroupingEnabled: false
    })
    setSelectedStorytellers([])
    setStorytellerSearch('')
  }

  const fetchGalleries = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching galleries for organisation:', organizationId)
      
      const response = await fetch(`/api/organisations/${organizationId}/galleries`)
      const data: GalleriesResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch galleries')
      }
      
      console.log('✅ Fetched galleries:', data.galleries.length)
      console.log('📺 Fetched storyteller videos:', data.storytellerVideos?.length || 0)
      console.log('📊 Stats:', data.stats)
      console.log('🔍 Gallery data:', data.galleries.map(g => ({ id: g.id, title: g.title, photoCount: g.photoCount })))

      setGalleries(data.galleries)
      setStorytellerVideos(data.storytellerVideos || [])
      setStats(data.stats)
      
      // Extract all photos for grid/list view
      const allPhotosFromGalleries = data.galleries.flatMap(gallery => 
        gallery.photos.map(photo => ({
          ...photo,
          gallery: {
            id: gallery.id,
            title: gallery.title,
            project: gallery.project
          }
        }))
      )
      setAllPhotos(allPhotosFromGalleries)
      
    } catch (error) {
      console.error('❌ Error fetching galleries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter photos when in grid/list mode
  const currentPhotos = selectedGallery ? selectedGallery.photos : allPhotos
  
  const filteredPhotos = currentPhotos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.uploader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = selectedType === 'all' || photo.type === selectedType
    
    return matchesSearch && matchesType
  })

  // Filter galleries when in gallery mode
  const filteredGalleries = galleries.filter(gallery => {
    return gallery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gallery.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (gallery.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPrivacyBadge = (level: string) => {
    switch (level) {
      case 'public':
        return <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">Public</Badge>
      case 'organisation':
        return <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">Organization</Badge>
      case 'private':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">Private</Badge>
      case 'restricted':
        return <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">Restricted</Badge>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'audio':
        return <Play className="w-4 h-4" />
      case 'image':
      default:
        return <Images className="w-4 h-4" />
    }
  }

  const handleVideoClick = (video: MediaAsset) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
  }

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false)
    setSelectedVideo(null)
  }

  const handleDeletePhoto = async (photo: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete "${photo.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/galleries/${selectedGallery?.id}/media?association_id=${photo.galleryItemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete photo')
      }

      // Remove the photo from the allPhotos state
      setAllPhotos(prev => prev.filter(p => p.galleryItemId !== photo.galleryItemId))

      // Also remove from the selected gallery if it's currently selected
      if (selectedGallery) {
        setSelectedGallery(prev => prev ? {
          ...prev,
          media_associations: (prev.media_associations || []).filter(p => p.galleryItemId !== photo.galleryItemId),
          photo_count: Math.max(0, prev.photo_count - 1)
        } : null)
      }

      console.log(`✅ Successfully deleted photo: ${photo.title}`)
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo. Please try again.')
    }
  }

  const handlePhotosUploaded = (newPhotos: any[]) => {
    // Refresh the page data to show new photos
    fetchGalleries()
    setIsUploadDialogOpen(false)
    console.log(`✅ Successfully uploaded ${newPhotos.length} photos`)
  }

  const handleDownloadPhoto = async (photo: MediaAsset) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.originalFilename || photo.filename || 'photo.jpg'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading photo:', error)
      alert('Failed to download photo. Please try again.')
    }
  }

  const handleDownloadGallery = async (gallery: PhotoGallery) => {
    if (gallery.photos.length === 0) {
      alert('This gallery has no photos to download')
      return
    }

    if (!confirm(`Download all ${gallery.photos.length} photos from "${gallery.title}"?`)) {
      return
    }

    try {
      // Download each photo
      for (const photo of gallery.photos) {
        await handleDownloadPhoto(photo)
        // Small delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      alert(`Successfully downloaded ${gallery.photos.length} photos!`)
    } catch (error) {
      console.error('Error downloading gallery:', error)
      alert('Failed to download some photos. Please try again.')
    }
  }

  const displayStats = stats || {
    totalGalleries: 0,
    totalPhotos: 0,
    totalImages: 0,
    totalVideos: 0,
    totalSize: 0,
    totalViews: 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">
          Loading galleries...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {selectedGallery ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedGallery(null)}
                  className="p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  ← Back to Galleries
                </Button>
              </div>
              <h1 className="text-2xl font-bold">{selectedGallery.title}</h1>
              <p className="text-muted-foreground">
                {selectedGallery.description || `${selectedGallery.photoCount} photos`}
                {selectedGallery.project && (
                  <span className="ml-2">• Part of {selectedGallery.project.name}</span>
                )}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">Photo Galleries</h1>
              <p className="text-muted-foreground">
                Photo collections organised by projects and themes
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedGallery && (
            <>
              {selectedGallery.photoCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadGallery(selectedGallery)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({selectedGallery.photoCount})
                </Button>
              )}
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
            </>
          )}
          {!selectedGallery && (
            <>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Gallery
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Create Photo Gallery
                    </DialogTitle>
                    <DialogDescription>
                      Create a new photo gallery for your organization. Photos added to this gallery will be automatically tagged with your organization.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Basic Information
                      </h4>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="gallery-title">Gallery Title *</Label>
                          <Input
                            id="gallery-title"
                            value={galleryForm.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            placeholder="Enter gallery title..."
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="gallery-description">Description</Label>
                          <Textarea
                            id="gallery-description"
                            value={galleryForm.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            placeholder="Describe what this gallery contains..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Project & Storyteller Association */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Project & Storyteller Tagging
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="project">Associate with Project (Optional)</Label>
                          <Select value={galleryForm.projectId} onValueChange={(value) => handleFormChange('projectId', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a project..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Project</SelectItem>
                              {Array.isArray(projects) ? projects.map((project: any) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              )) : null}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="storyteller">Featured Storytellers (Optional)</Label>

                          {/* Selected storytellers display */}
                          {selectedStorytellers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {selectedStorytellers.map((storyteller) => (
                                <Badge
                                  key={storyteller.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 pr-1"
                                >
                                  <span>{storyteller.displayName || storyteller.fullName}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeStoryteller(storyteller.id)}
                                    className="ml-1 rounded-full hover:bg-background/50 p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Popover open={isStorytellerDropdownOpen} onOpenChange={setIsStorytellerDropdownOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isStorytellerDropdownOpen}
                                className="w-full justify-between"
                              >
                                {selectedStorytellers.length === 0
                                  ? "Choose storytellers..."
                                  : `${selectedStorytellers.length} storyteller${selectedStorytellers.length === 1 ? '' : 's'} selected`
                                }
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <div className="p-4 border-b">
                                <Input
                                  placeholder="Search storytellers..."
                                  value={storytellerSearch}
                                  onChange={(e) => setStorytellerSearch(e.target.value)}
                                  className="mb-2"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleStorytellerClear}
                                  className="w-full"
                                >
                                  Clear Selection
                                </Button>
                              </div>
                              <div className="max-h-60 overflow-auto">
                                {filteredStorytellers.length === 0 ? (
                                  <div className="p-4 text-sm text-muted-foreground">
                                    No storytellers found.
                                  </div>
                                ) : (
                                  filteredStorytellers.map((storyteller: any) => {
                                    const isSelected = selectedStorytellers.some(s => s.id === storyteller.id)
                                    return (
                                      <Button
                                        key={storyteller.id}
                                        variant="ghost"
                                        className={cn(
                                          "w-full justify-start p-3 h-auto",
                                          isSelected && "bg-accent"
                                        )}
                                        onClick={() => handleStorytellerSelect(storyteller)}
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                          <div className="flex items-center justify-center w-4 h-4">
                                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                                          </div>
                                          <div className="text-left flex-1">
                                            <div className="font-medium">
                                              {storyteller.displayName || storyteller.fullName}
                                            </div>
                                            {storyteller.organisation && (
                                              <div className="text-xs text-muted-foreground">
                                                {storyteller.organisation}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </Button>
                                    )
                                  })
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded border border-blue-200">
                        <Tag className="h-3 w-3 inline mr-1" />
                        All photos added to this gallery will be automatically tagged with your organization name and tenant.
                        {galleryForm.projectId && galleryForm.projectId !== 'none' && " They will also be tagged with the selected project."}
                      </div>
                    </div>

                    {/* Privacy & Cultural Settings */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Privacy & Cultural Settings
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="privacy">Privacy Level</Label>
                          <Select value={galleryForm.privacyLevel} onValueChange={(value) => handleFormChange('privacyLevel', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public - Anyone can view</SelectItem>
                              <SelectItem value="organization">Organization - Members only</SelectItem>
                              <SelectItem value="private">Private - Invited users only</SelectItem>
                              <SelectItem value="restricted">Restricted - Elder approval required</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="cultural">Cultural Sensitivity</Label>
                          <Select value={galleryForm.culturalSensitivityLevel} onValueChange={(value) => handleFormChange('culturalSensitivityLevel', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard Content</SelectItem>
                              <SelectItem value="medium">Medium Sensitivity</SelectItem>
                              <SelectItem value="high">High Sensitivity</SelectItem>
                              <SelectItem value="restricted">Restricted/Sacred Content</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Features */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Organization Features
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Requires Elder Approval</Label>
                            <div className="text-xs text-slate-500">
                              Photos in this gallery require elder review before being visible
                            </div>
                          </div>
                          <Switch
                            checked={galleryForm.requiresElderApproval}
                            onCheckedChange={(checked) => handleFormChange('requiresElderApproval', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Auto-Organization</Label>
                            <div className="text-xs text-slate-500">
                              Automatically organize photos by date and event
                            </div>
                          </div>
                          <Switch
                            checked={galleryForm.autoOrganizeEnabled}
                            onCheckedChange={(checked) => handleFormChange('autoOrganizeEnabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Face Grouping</Label>
                            <div className="text-xs text-slate-500">
                              Group photos by people (requires privacy consent)
                            </div>
                          </div>
                          <Switch
                            checked={galleryForm.faceGroupingEnabled}
                            onCheckedChange={(checked) => handleFormChange('faceGroupingEnabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Location Grouping</Label>
                            <div className="text-xs text-slate-500">
                              Group photos by geographic location
                            </div>
                          </div>
                          <Switch
                            checked={galleryForm.locationGroupingEnabled}
                            onCheckedChange={(checked) => handleFormChange('locationGroupingEnabled', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateGallery}
                      disabled={isCreating || !galleryForm.title.trim()}
                    >
                      {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Gallery
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant={viewMode === 'galleries' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('galleries')}
              >
                📁 Galleries
              </Button>
            </>
          )}
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{displayStats.totalGalleries}</div>
                <div className="text-xs text-muted-foreground">Galleries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-lg font-semibold">{displayStats.totalPhotos}</div>
                <div className="text-xs text-muted-foreground">Total Photos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-lg font-semibold">{displayStats.totalImages}</div>
                <div className="text-xs text-muted-foreground">Images</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-lg font-semibold">{displayStats.totalVideos}</div>
                <div className="text-xs text-muted-foreground">Videos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              <div>
                <div className="text-lg font-semibold">{formatFileSize(displayStats.totalSize)}</div>
                <div className="text-xs text-muted-foreground">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by title, description, storyteller, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Galleries View */}
      {viewMode === 'galleries' && !selectedGallery ? (
        <div className="space-y-6">
          {/* Storyteller Videos Section */}
          {storytellerVideos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Storyteller Videos</h2>
                    <p className="text-sm text-slate-600">
                      {storytellerVideos.length} {storytellerVideos.length === 1 ? 'video' : 'videos'} from community storytellers
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {storytellerVideos.map((video) => (
                  <Card key={video.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white">
                    <VideoThumbnail
                      url={video.url}
                      title={video.title}
                      className="aspect-video"
                      onClick={() => handleVideoClick(video)}
                    />
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colours">
                        {video.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">{video.uploader.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Photo Galleries Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Images className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Photo Galleries</h2>
                  <p className="text-sm text-slate-600">
                    {filteredGalleries.length} {filteredGalleries.length === 1 ? 'gallery' : 'galleries'} • {stats?.totalPhotos || 0} photos
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleries.map((gallery) => (
                <Card key={gallery.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white"
                      onClick={() => setSelectedGallery(gallery)}>
                  {/* Hero Image Section */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {gallery.photos.length > 0 ? (
                      <>
                        <img
                          src={gallery.photos[0]?.url || '/placeholder-gallery.jpg'}
                          alt={gallery.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                        <Images className="w-16 h-16 text-slate-400" />
                      </div>
                    )}

                    {/* Top badges */}
                    <div className="absolute top-3 left-3">
                      {getPrivacyBadge(gallery.privacyLevel)}
                    </div>

                    {/* Photo count badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                      <Images className="w-4 h-4" />
                      {gallery.photoCount}
                    </div>

                    {/* Download button */}
                    {gallery.photoCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadGallery(gallery)
                        }}
                        className="absolute bottom-3 left-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Download all photos"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {/* Project badge if exists */}
                    {gallery.project && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-slate-700 hover:bg-white border-0 font-medium">
                          {gallery.project.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-5 space-y-3">
                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colours">
                        {gallery.title}
                      </h3>
                      {gallery.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {gallery.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      {/* Left Column */}
                      <div className="space-y-2">
                        {gallery.storyteller && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium truncate">{gallery.storyteller.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(gallery.lastUpdatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-2 text-right">
                        <div className="text-xs text-slate-600 font-medium">
                          {formatFileSize(gallery.totalSizeBytes)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {gallery.stats?.images || 0} images
                          {(gallery.stats?.videos || 0) > 0 && ` • ${gallery.stats.videos} videos`}
                        </div>
                      </div>
                    </div>

                    {/* Special badges */}
                    {gallery.requiresElderApproval && (
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50 font-medium">
                          <Heart className="w-3 h-3 mr-1" />
                          Elder Review Required
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="aspect-video bg-muted relative">
                {photo.type === 'video' ? (
                  <VideoThumbnail
                    url={photo.url}
                    title={photo.title}
                    className="w-full h-full"
                    onClick={() => handleVideoClick(photo)}
                  />
                ) : photo.type === 'image' ? (
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    onClick={() => setSelectedAsset(photo)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" onClick={() => setSelectedAsset(photo)}>
                    {getTypeIcon(photo.type)}
                  </div>
                )}

                {/* Action buttons overlay */}
                <div
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDownloadPhoto(photo)
                    }}
                    title="Download photo"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeletePhoto(photo)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{photo.title}</h3>
                  {getTypeIcon(photo.type)}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {photo.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <User className="w-3 h-3" />
                  <span>{photo.uploader.name}</span>
                </div>
                
                {(photo as any).gallery && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Images className="w-3 h-3" />
                    <span>{(photo as any).gallery.title}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span>{formatFileSize(photo.size)}</span>
                </div>
                
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {photo.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{photo.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  {photo.type === 'video' ? (
                    <VideoThumbnail
                      url={photo.url}
                      title={photo.title}
                      className="w-full h-full rounded"
                      onClick={() => handleVideoClick(photo)}
                    />
                  ) : photo.type === 'image' ? (
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    getTypeIcon(photo.type)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{photo.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {photo.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{photo.uploader.name}</span>
                        </div>
                        
                        {(photo as any).gallery && (
                          <div className="flex items-center gap-1">
                            <Images className="w-3 h-3" />
                            <span>{(photo as any).gallery.title}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <span>{formatFileSize(photo.size)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => photo.type === 'video' ? handleVideoClick(photo) : setSelectedAsset(photo)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPhoto(photo)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePhoto(photo)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'galleries' && filteredGalleries.length === 0 && (
        <Card className="p-12 text-center">
          <Images className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No galleries found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search terms' : 'No photo galleries have been created yet'}
          </p>
        </Card>
      )}

      {viewMode !== 'galleries' && filteredPhotos.length === 0 && (
        <Card className="p-12 text-center">
          <Images className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No photos found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search terms' : selectedGallery ? 'No photos in this gallery' : 'No photos have been uploaded yet'}
          </p>
        </Card>
      )}

      {/* Upload Photos Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Photos to {selectedGallery?.title}</DialogTitle>
            <DialogDescription>
              Upload new photos to this gallery. Photos will be available immediately after upload.
            </DialogDescription>
          </DialogHeader>
          {selectedGallery && (
            <PhotoUploadManager
              galleryId={selectedGallery.id}
              onPhotosUploaded={handlePhotosUploaded}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          isOpen={showVideoPlayer}
          onClose={closeVideoPlayer}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          description={selectedVideo.description}
          storytellerName={selectedVideo.uploader.name}
        />
      )}
    </div>
  )
}
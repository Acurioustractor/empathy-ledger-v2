'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Camera,
  Eye,
  Edit,
  Download,
  Grid3x3,
  List,
  Tag,
  Trash2,
  Link,
  Globe,
  Lock,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface Photo {
  id: string
  filename: string
  title: string
  description: string
  fileSize: number
  mimeType: string
  width: number
  height: number
  publicUrl: string
  thumbnailUrl?: string
  uploadedBy: string
  uploaderName: string
  organizationId?: string
  organizationName?: string
  visibility: 'public' | 'community' | 'private'
  consentStatus: 'pending' | 'granted' | 'denied'
  culturalSensitivityLevel: 'low' | 'medium' | 'high'
  accessCount: number
  status: 'active' | 'flagged' | 'hidden' | 'deleted'
  createdAt: string
  galleries: Array<{
    id: string
    title: string
    slug: string
  }>
  culturalTags: string[]
  metadata: {
    tenantId?: string
    originalFilename?: string
  }
}

export default function PhotosAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all')
  const [selectedSensitivity, setSelectedSensitivity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [linkedFilter, setLinkedFilter] = useState<string>('all')

  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTaggingOpen, setIsTaggingOpen] = useState(false)
  const [photoToTag, setPhotoToTag] = useState<Photo | null>(null)
  const [newTags, setNewTags] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [isLinkingOpen, setIsLinkingOpen] = useState(false)
  const [photoToLink, setPhotoToLink] = useState<Photo | null>(null)
  const [availableGalleries, setAvailableGalleries] = useState<Array<{id: string, title: string}>>([])
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<Set<string>>(new Set())

  // Stats
  const [organisations, setOrganizations] = useState<string[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  const filterPhotos = useCallback(() => {
    let filtered = photos

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(photo =>
        photo.filename.toLowerCase().includes(search) ||
        photo.title.toLowerCase().includes(search) ||
        photo.description.toLowerCase().includes(search) ||
        photo.organizationName?.toLowerCase().includes(search) ||
        photo.culturalTags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    if (selectedOrganization !== 'all') {
      filtered = filtered.filter(photo => photo.organizationName === selectedOrganization)
    }

    if (selectedProject !== 'all') {
      filtered = filtered.filter(photo =>
        photo.culturalTags.some(tag => tag.includes(selectedProject))
      )
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(photo =>
        photo.culturalTags.some(tag => tag.includes(selectedLocation))
      )
    }

    if (selectedVisibility !== 'all') {
      filtered = filtered.filter(photo => photo.visibility === selectedVisibility)
    }

    if (selectedSensitivity !== 'all') {
      filtered = filtered.filter(photo => photo.culturalSensitivityLevel === selectedSensitivity)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(photo => photo.status === selectedStatus)
    }

    if (linkedFilter !== 'all') {
      if (linkedFilter === 'linked') {
        filtered = filtered.filter(photo => photo.galleries.length > 0)
      } else if (linkedFilter === 'unlinked') {
        filtered = filtered.filter(photo => photo.galleries.length === 0)
      }
    }

    setFilteredPhotos(filtered)
  }, [photos, searchTerm, selectedOrganization, selectedProject, selectedLocation, selectedVisibility, selectedSensitivity, selectedStatus, linkedFilter])

  useEffect(() => {
    fetchPhotos()
    fetchGalleries()
  }, [])

  useEffect(() => {
    filterPhotos()
  }, [filterPhotos])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.media || [])

        // Extract unique filter options with proper typing
        const orgs = [...new Set(data.media?.map((p: Photo) => p.organizationName).filter(Boolean))] as string[]
        const projs = [...new Set(data.media?.flatMap((p: Photo) => p.culturalTags?.filter(tag => tag.includes('project') || tag.includes('trek') || tag.includes('foundation'))) || [])] as string[]
        const locs = [...new Set(data.media?.flatMap((p: Photo) => p.culturalTags?.filter(tag => !tag.includes('project') && !tag.includes('trek') && !tag.includes('foundation') && !tag.includes('gallery'))) || [])] as string[]

        setOrganizations(orgs)
        setProjects(projs)
        setLocations(locs)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/admin/galleries')
      if (response.ok) {
        const data = await response.json()
        const galleries = data.galleries?.map((g: any) => ({
          id: g.id,
          title: g.title
        })) || []
        setAvailableGalleries(galleries)
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
    }
  }

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    setIsDetailModalOpen(true)
  }

  const handleDeletePhoto = async (photo: Photo) => {
    setPhotoToDelete(photo)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!photoToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/media?id=${photoToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the photo from the local state
        setPhotos(prev => prev.filter(p => p.id !== photoToDelete.id))
        setIsDeleteConfirmOpen(false)
        setPhotoToDelete(null)
      } else {
        console.error('Failed to delete photo')
        alert('Failed to delete photo. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Error deleting photo. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTagPhoto = (photo: Photo) => {
    setPhotoToTag(photo)
    setNewTags(photo.culturalTags.join(', '))
    setIsTaggingOpen(true)
  }

  const savePhotoTags = async () => {
    if (!photoToTag) return

    try {
      const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(Boolean)

      // Parse tags to determine field updates
      let updatedSensitivity = photoToTag.culturalSensitivityLevel
      let updatedVisibility = photoToTag.visibility
      let updatedDescription = photoToTag.description

      // Update sensitivity based on tags
      if (tagsArray.some(tag => ['sacred', 'ceremonial'].includes(tag.toLowerCase()))) {
        updatedSensitivity = 'high'
      } else if (tagsArray.some(tag => ['cultural', 'traditional-knowledge'].includes(tag.toLowerCase()))) {
        updatedSensitivity = 'medium'
      } else if (tagsArray.some(tag => ['community', 'public'].includes(tag.toLowerCase()))) {
        updatedSensitivity = 'low'
      }

      // Update visibility based on tags
      if (tagsArray.some(tag => ['public'].includes(tag.toLowerCase()))) {
        updatedVisibility = 'public'
      } else if (tagsArray.some(tag => ['private', 'sacred'].includes(tag.toLowerCase()))) {
        updatedVisibility = 'private'
      } else if (tagsArray.some(tag => ['community'].includes(tag.toLowerCase()))) {
        updatedVisibility = 'community'
      }

      // Add tags to description
      const existingDesc = photoToTag.description || ''
      const tagString = `Tags: ${tagsArray.join(', ')}`

      // Only append if tags aren't already in description
      if (!existingDesc.includes('Tags:')) {
        updatedDescription = existingDesc + (existingDesc ? '\n\n' : '') + tagString
      } else {
        // Replace existing tags
        updatedDescription = existingDesc.replace(/Tags:.*$/m, tagString)
      }

      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: photoToTag.id,
          title: photoToTag.title,
          description: updatedDescription,
          visibility: updatedVisibility,
          consentStatus: photoToTag.consentStatus,
          culturalSensitivityLevel: updatedSensitivity,
        }),
      })

      if (response.ok) {
        // Update the photo in local state
        setPhotos(prev => prev.map(p =>
          p.id === photoToTag.id
            ? {
                ...p,
                culturalTags: tagsArray,
                description: updatedDescription,
                visibility: updatedVisibility,
                culturalSensitivityLevel: updatedSensitivity
              }
            : p
        ))
        setIsTaggingOpen(false)
        setPhotoToTag(null)
        setNewTags('')
      } else {
        console.error('Failed to update photo tags')
        alert('Failed to update tags. Please try again.')
      }
    } catch (error) {
      console.error('Error updating photo tags:', error)
      alert('Error updating tags. Please try again.')
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      return newSet
    })
  }

  const selectAllFilteredPhotos = () => {
    setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)))
  }

  const clearSelection = () => {
    setSelectedPhotos(new Set())
  }

  const handleBatchDelete = () => {
    if (selectedPhotos.size === 0) return

    const photosToDelete = filteredPhotos.filter(p => selectedPhotos.has(p.id))
    // For now, delete the first selected photo (can be enhanced to handle multiple)
    if (photosToDelete.length > 0) {
      handleDeletePhoto(photosToDelete[0])
    }
  }

  const handleBatchTag = () => {
    if (selectedPhotos.size === 0) return

    const photosToTag = filteredPhotos.filter(p => selectedPhotos.has(p.id))
    // For now, tag the first selected photo (can be enhanced to handle multiple)
    if (photosToTag.length > 0) {
      handleTagPhoto(photosToTag[0])
    }
  }

  const handleLinkPhoto = (photo: Photo) => {
    setPhotoToLink(photo)
    setSelectedGalleryIds(new Set(photo.galleries.map(g => g.id)))
    setIsLinkingOpen(true)
  }

  const saveLinkToGalleries = async () => {
    if (!photoToLink) return

    try {
      const galleryIds = Array.from(selectedGalleryIds)

      const response = await fetch('/api/admin/media/link-galleries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: photoToLink.id,
          galleryIds
        }),
      })

      if (response.ok) {
        // Update the photo in local state
        const updatedGalleries = availableGalleries
          .filter(g => galleryIds.includes(g.id))
          .map(g => ({ id: g.id, title: g.title, slug: g.title.toLowerCase().replace(/\s+/g, '-') }))

        setPhotos(prev => prev.map(p =>
          p.id === photoToLink.id
            ? { ...p, galleries: updatedGalleries }
            : p
        ))
        setIsLinkingOpen(false)
        setPhotoToLink(null)
        setSelectedGalleryIds(new Set())
      } else {
        console.error('Failed to link photo to galleries')
        alert('Failed to link photo. Please try again.')
      }
    } catch (error) {
      console.error('Error linking photo to galleries:', error)
      alert('Error linking photo. Please try again.')
    }
  }

  const handleBulkLink = async () => {
    const unlinkedPhotosList = photos.filter(p => p.galleries.length === 0)

    if (unlinkedPhotosList.length === 0) {
      alert('No unlinked photos found!')
      return
    }

    if (availableGalleries.length === 0) {
      alert('No galleries available for linking!')
      return
    }

    const confirmed = confirm(
      `Link ${unlinkedPhotosList.length} unlinked photos to the "Deadly Hearts Trek Gallery"?

This will help organise your media collection.`
    )

    if (!confirmed) return

    // Find the Deadly Hearts Trek Gallery (or use the first gallery as fallback)
    const deadlyHeartsGallery = availableGalleries.find(g =>
      g.title.toLowerCase().includes('deadly hearts')
    ) || availableGalleries[0]

    try {
      // Link each unlinked photo to the Deadly Hearts gallery
      const promises = unlinkedPhotosList.map(photo =>
        fetch('/api/admin/media/link-galleries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoId: photo.id,
            galleryIds: [deadlyHeartsGallery.id]
          }),
        })
      )

      await Promise.all(promises)

      // Update local state
      setPhotos(prev => prev.map(p =>
        unlinkedPhotosList.some(up => up.id === p.id)
          ? {
              ...p,
              galleries: [{
                id: deadlyHeartsGallery.id,
                title: deadlyHeartsGallery.title,
                slug: deadlyHeartsGallery.title.toLowerCase().replace(/\s+/g, '-')
              }]
            }
          : p
      ))

      alert(`Successfully linked ${unlinkedPhotosList.length} photos to "${deadlyHeartsGallery.title}"!`)

    } catch (error) {
      console.error('Error bulk linking photos:', error)
      alert('Failed to link photos. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      case 'hidden': return 'bg-grey-100 text-grey-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-purple-100 text-purple-800'
      case 'private': return 'bg-grey-100 text-grey-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  // Calculate stats
  const totalPhotos = photos.length
  const activePhotos = photos.filter(p => p.status === 'active').length
  const flaggedPhotos = photos.filter(p => p.status === 'flagged').length
  const linkedPhotos = photos.filter(p => p.galleries.length > 0).length
  const unlinkedPhotos = totalPhotos - linkedPhotos
  const highSensitivityPhotos = photos.filter(p => p.culturalSensitivityLevel === 'high').length
  const totalSize = photos.reduce((sum, p) => sum + p.fileSize, 0) / (1024 * 1024)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading photos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-grey-900 mb-2">Photos Admin</h1>
        <p className="text-grey-600">
          Manage all photos with advanced filtering and cultural protocols
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalPhotos}</p>
              <p className="text-xs text-grey-600">Total Photos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activePhotos}</p>
              <p className="text-xs text-grey-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{flaggedPhotos}</p>
              <p className="text-xs text-grey-600">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{linkedPhotos}</p>
              <p className="text-xs text-grey-600">Gallery Linked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{unlinkedPhotos}</p>
              <p className="text-xs text-grey-600">Unlinked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{highSensitivityPhotos}</p>
              <p className="text-xs text-grey-600">High Sensitivity</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{Math.round(totalSize)}</p>
              <p className="text-xs text-grey-600">MB Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
              <Input
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Organizations</option>
              {organisations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="private">Private</option>
            </select>

            <select
              value={selectedSensitivity}
              onChange={(e) => setSelectedSensitivity(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Sensitivity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>

            <select
              value={linkedFilter}
              onChange={(e) => setLinkedFilter(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Photos</option>
              <option value="linked">Gallery Linked</option>
              <option value="unlinked">Unlinked</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isBatchMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsBatchMode(!isBatchMode)
                  setSelectedPhotos(new Set())
                }}
                className={isBatchMode ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {isBatchMode ? 'Exit Select' : 'Select'}
              </Button>

              {isBatchMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllFilteredPhotos}
                    disabled={filteredPhotos.length === 0}
                  >
                    Select All ({filteredPhotos.length})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedPhotos.size === 0}
                  >
                    Clear ({selectedPhotos.size})
                  </Button>

                  {selectedPhotos.size > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchTag}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        Tag ({selectedPhotos.size})
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete ({selectedPhotos.size})
                      </Button>
                    </>
                  )}
                </>
              )}

              <div className="border-l pl-2 ml-2">
                <span className="text-sm text-grey-600">
                  Showing {filteredPhotos.length} of {totalPhotos} photos
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => handleBulkLink()}
                  disabled={unlinkedPhotos === 0}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Link {unlinkedPhotos} Unlinked
                </Button>
                <Button variant="outline" size="sm" className="ml-2">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, index) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div onClick={() => handleViewPhoto(photo)} className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-grey-50 to-grey-100 flex items-center justify-center relative overflow-hidden">
                  {photo.publicUrl ? (
                    <img
                      src={photo.publicUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex flex-col items-center justify-center text-grey-400" style={{ display: photo.publicUrl ? 'none' : 'flex' }}>
                    <Camera className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium">Photo Preview</p>
                    <p className="text-xs">{photo.mimeType}</p>
                  </div>
                </div>
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPhoto(photo);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagPhoto(photo);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagPhoto(photo);
                      }}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLinkPhoto(photo);
                      }}
                    >
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {isBatchMode && (
                    <div className="bg-white rounded-md p-1 shadow-sm">
                      <Checkbox
                        checked={selectedPhotos.has(photo.id)}
                        onCheckedChange={() => togglePhotoSelection(photo.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <Badge className="bg-blue-600 text-white text-xs font-medium shadow-sm">
                    #{index + 1}
                  </Badge>
                  {photo.galleries.length > 0 && (
                    <Badge className="bg-green-600 text-white text-xs font-medium shadow-sm">
                      <Link className="w-3 h-3 mr-1" />
                      {photo.galleries.length}
                    </Badge>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <Badge className={`${getSensitivityColor(photo.culturalSensitivityLevel)} text-xs font-medium shadow-sm`}>
                    {photo.culturalSensitivityLevel.toUpperCase()}
                  </Badge>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-semibold truncate mb-1">{photo.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-grey-200 text-xs truncate">{photo.organizationName}</p>
                    <p className="text-grey-300 text-xs font-medium">
                      {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getVisibilityColor(photo.visibility)} size="sm">
                      {photo.visibility === 'public' ? <Globe className="w-3 h-3 mr-1" /> :
                       photo.visibility === 'private' ? <Lock className="w-3 h-3 mr-1" /> :
                       <Users className="w-3 h-3 mr-1" />}
                      {photo.visibility}
                    </Badge>
                    {photo.consentStatus === 'granted' && (
                      <Badge className="bg-green-100 text-green-800" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Consented
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Card body with additional info */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-grey-600">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {photo.width} × {photo.height}
                    </Badge>
                  </div>

                  {photo.culturalTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {photo.culturalTags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {photo.culturalTags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{photo.culturalTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Quick action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-grey-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open image in new tab for download
                        if (photo.publicUrl) {
                          window.open(photo.publicUrl, '_blank');
                        }
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo);
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-grey-50">
                  <tr>
                    {isBatchMode && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">
                        <Checkbox
                          checked={selectedPhotos.size === filteredPhotos.length && filteredPhotos.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllFilteredPhotos()
                            } else {
                              clearSelection()
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Photo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Organization</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Galleries</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-200">
                  {filteredPhotos.map((photo, index) => (
                    <tr key={photo.id} className="hover:bg-grey-50">
                      {isBatchMode && (
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedPhotos.has(photo.id)}
                            onCheckedChange={() => togglePhotoSelection(photo.id)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 text-sm text-grey-500">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-grey-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                            {photo.publicUrl ? (
                              <img
                                src={photo.publicUrl}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center text-grey-400" style={{ display: photo.publicUrl ? 'none' : 'flex' }}>
                              <Camera className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-grey-900 truncate">
                              {photo.title}
                            </p>
                            <p className="text-sm text-grey-500 truncate">
                              {photo.filename}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getVisibilityColor(photo.visibility)} size="sm">
                                {photo.visibility}
                              </Badge>
                              <Badge className={getSensitivityColor(photo.culturalSensitivityLevel)} size="sm">
                                {photo.culturalSensitivityLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-grey-900">
                        {photo.organizationName || 'None'}
                      </td>
                      <td className="px-4 py-4 text-sm text-grey-500">
                        {photo.culturalTags.find(tag => tag.includes('foundation') || tag.includes('trek')) || 'None'}
                      </td>
                      <td className="px-4 py-4 text-sm text-grey-500">
                        {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(photo.status)}>
                            {photo.status}
                          </Badge>
                          <Badge className={getSensitivityColor(photo.culturalSensitivityLevel)}>
                            {photo.culturalSensitivityLevel}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-grey-500">
                        {photo.galleries.length > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            {photo.galleries.length} galleries
                          </Badge>
                        ) : (
                          <span className="text-grey-400">Unlinked</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleViewPhoto(photo)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-grey-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-grey-900 mb-2">No photos found</h3>
          <p className="text-grey-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Photo Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Photo Preview */}
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-grey-50 to-grey-100 rounded-lg overflow-hidden relative">
                  {selectedPhoto.publicUrl ? (
                    <img
                      src={selectedPhoto.publicUrl}
                      alt={selectedPhoto.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex flex-col items-center justify-center text-grey-500" style={{ display: selectedPhoto.publicUrl ? 'none' : 'flex' }}>
                    <Camera className="w-20 h-20 mx-auto mb-4" />
                    <p className="font-semibold text-lg mb-2">{selectedPhoto.title}</p>
                    <p className="text-sm mb-1">({selectedPhoto.mimeType})</p>
                    <p className="text-sm">{selectedPhoto.width} × {selectedPhoto.height}</p>
                    <p className="text-sm text-grey-400 mt-2">Original image not available</p>
                  </div>

                  {/* Image overlay with info */}
                  {selectedPhoto.publicUrl && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                      <p className="text-white font-semibold">{selectedPhoto.title}</p>
                      <p className="text-grey-200 text-sm">{selectedPhoto.width} × {selectedPhoto.height}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Photo Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <strong>Title:</strong> {selectedPhoto.title}
                    </div>
                    <div>
                      <strong>Filename:</strong> {selectedPhoto.filename}
                    </div>
                    <div>
                      <strong>Size:</strong> {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div>
                      <strong>Uploaded By:</strong> {selectedPhoto.uploaderName}
                    </div>
                    <div>
                      <strong>Organization:</strong> {selectedPhoto.organizationName || 'None'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cultural Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Visibility:</span>
                      <Badge className={getVisibilityColor(selectedPhoto.visibility)}>
                        {selectedPhoto.visibility}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cultural Sensitivity:</span>
                      <Badge className={getSensitivityColor(selectedPhoto.culturalSensitivityLevel)}>
                        {selectedPhoto.culturalSensitivityLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consent Status:</span>
                      <Badge className={
                        selectedPhoto.consentStatus === 'granted' ? 'bg-green-100 text-green-800' :
                        selectedPhoto.consentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {selectedPhoto.consentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gallery Associations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPhoto.galleries.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPhoto.galleries.map(gallery => (
                          <div key={gallery.id} className="flex items-center justify-between p-2 bg-grey-50 rounded">
                            <span className="font-medium">{gallery.title}</span>
                            <Badge variant="outline">{gallery.slug}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-grey-500 text-center py-4">Not linked to any galleries</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cultural Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.culturalTags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          {photoToDelete && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-grey-50 rounded-lg">
                <div className="w-16 h-16 bg-grey-200 rounded-lg overflow-hidden flex-shrink-0">
                  {photoToDelete.publicUrl ? (
                    <img
                      src={photoToDelete.publicUrl}
                      alt={photoToDelete.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-grey-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{photoToDelete.title}</p>
                  <p className="text-sm text-grey-500 truncate">{photoToDelete.filename}</p>
                  <p className="text-xs text-grey-400">
                    {(photoToDelete.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action cannot be undone.
                  {photoToDelete.galleries.length > 0 && (
                    <span className="block mt-1">
                      This photo is linked to {photoToDelete.galleries.length} gallery(ies)
                      and will be hidden instead of permanently deleted.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false)
                    setPhotoToDelete(null)
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {photoToDelete.galleries.length > 0 ? 'Hiding...' : 'Deleting...'}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {photoToDelete.galleries.length > 0 ? 'Hide Photo' : 'Delete Photo'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tagging Dialog */}
      <Dialog open={isTaggingOpen} onOpenChange={setIsTaggingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Edit Cultural Tags
            </DialogTitle>
          </DialogHeader>

          {photoToTag && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-grey-50 rounded-lg">
                <div className="w-16 h-16 bg-grey-200 rounded-lg overflow-hidden flex-shrink-0">
                  {photoToTag.publicUrl ? (
                    <img
                      src={photoToTag.publicUrl}
                      alt={photoToTag.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-grey-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{photoToTag.title}</p>
                  <p className="text-sm text-grey-500 truncate">{photoToTag.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getSensitivityColor(photoToTag.culturalSensitivityLevel)} size="sm">
                      {photoToTag.culturalSensitivityLevel}
                    </Badge>
                    <Badge className={getVisibilityColor(photoToTag.visibility)} size="sm">
                      {photoToTag.visibility}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cultural Tags</label>
                <Input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., sacred, ceremonial, snow-foundation)"
                  className="w-full"
                />
                <p className="text-xs text-grey-500">
                  Separate multiple tags with commas. Common tags: sacred, ceremonial, cultural, community,
                  consent-required, gallery-featured, snow-foundation, deadly-hearts-trek
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Cultural Protocol:</strong> Please ensure tags accurately reflect the cultural sensitivity
                  and ceremonial significance of this content. Improper tagging may affect visibility and access permissions.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTaggingOpen(false)
                    setPhotoToTag(null)
                    setNewTags('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={savePhotoTags}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Save Tags
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gallery Linking Dialog */}
      <Dialog open={isLinkingOpen} onOpenChange={setIsLinkingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Link Photo to Galleries
            </DialogTitle>
          </DialogHeader>

          {photoToLink && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-grey-50 rounded-lg">
                <div className="w-16 h-16 bg-grey-200 rounded-lg overflow-hidden flex-shrink-0">
                  {photoToLink.publicUrl ? (
                    <img
                      src={photoToLink.publicUrl}
                      alt={photoToLink.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-grey-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{photoToLink.title}</p>
                  <p className="text-sm text-grey-500 truncate">{photoToLink.filename}</p>
                  <p className="text-xs text-grey-400">
                    Currently linked to {photoToLink.galleries.length} galller{photoToLink.galleries.length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Select Galleries</label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {availableGalleries.map(gallery => (
                    <div
                      key={gallery.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colours ${
                        selectedGalleryIds.has(gallery.id)
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-grey-200 hover:bg-grey-50'
                      }`}
                      onClick={() => {
                        const newSet = new Set(selectedGalleryIds)
                        if (newSet.has(gallery.id)) {
                          newSet.delete(gallery.id)
                        } else {
                          newSet.add(gallery.id)
                        }
                        setSelectedGalleryIds(newSet)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedGalleryIds.has(gallery.id)}
                          onChange={() => {}} // Handled by parent onClick
                        />
                        <div>
                          <p className="font-medium">{gallery.title}</p>
                          <p className="text-xs text-grey-500">Gallery ID: {gallery.id}</p>
                        </div>
                      </div>
                      {photoToLink.galleries.some(g => g.id === gallery.id) && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Currently Linked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {availableGalleries.length === 0 && (
                  <p className="text-grey-500 text-center py-4">No galleries available</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Gallery Management:</strong> Linking photos to galleries will make them visible
                  in gallery views and searchable by gallery context. You can link a photo to multiple galleries.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLinkingOpen(false)
                    setPhotoToLink(null)
                    setSelectedGalleryIds(new Set())
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveLinkToGalleries}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Save Links ({selectedGalleryIds.size})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
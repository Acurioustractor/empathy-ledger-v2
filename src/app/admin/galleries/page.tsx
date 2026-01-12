'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MediaLinkingManager from '@/components/media/MediaLinkingManager'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Image,
  Edit,
  Eye,
  Calendar,
  User,
  MapPin,
  Flag,
  Shield,
  Trash2,
  Plus,
  FileImage,
  Users,
  Heart,
  MessageCircle,
  Share,
  Loader2,
  LayoutGrid,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface Gallery {
  id: string
  title: string
  description?: string
  created_at: string
  created_by: string
  cover_image_id?: string
  media_count: number
  visibility: 'public' | 'community' | 'organisation' | 'private'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  tags: string[]
  location?: string
  featured: boolean
  status: 'active' | 'hidden' | 'flagged' | 'under_review'

  // Creator info
  creator?: {
    id: string
    display_name: string
    community_roles: string[]
  }

  // Statistics
  stats?: {
    views_count: number
    likes_count: number
    comments_count: number
    shares_count: number
  }

  // Cultural protocols
  elder_approved: boolean
  ceremonial_content: boolean
  traditional_knowledge: boolean
  consent_status: 'granted' | 'pending' | 'denied'
}

export default function GalleriesAdminPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [filteredGalleries, setFilteredGalleries] = useState<Gallery[]>([])
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all')
  const [editingGallery, setEditingGallery] = useState<Partial<Gallery>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newGallery, setNewGallery] = useState({
    title: '',
    description: '',
    visibility: 'private' as const,
    cultural_sensitivity_level: 'low' as const,
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchGalleries()
    fetchPhotoCount()
  }, [])

  useEffect(() => {
    filterGalleries()
  }, [galleries, searchTerm, statusFilter, visibilityFilter, sensitivityFilter])

  const fetchPhotoCount = async () => {
    try {
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const data = await response.json()
        setTotalPhotos(data.summary.total)
      }
    } catch (error) {
      console.error('Error fetching photo count:', error)
    }
  }

  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/galleries?limit=50')
      if (response.ok) {
        const data = await response.json()
        setGalleries(data.galleries || [])
      } else {
        console.error('Failed to fetch galleries')
        setGalleries([])
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
      setGalleries([])
    } finally {
      setLoading(false)
    }
  }

  const filterGalleries = () => {
    let filtered = galleries

    if (searchTerm) {
      filtered = filtered.filter(gallery =>
        gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        gallery.creator?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(gallery => gallery.status === statusFilter)
    }

    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(gallery => gallery.visibility === visibilityFilter)
    }

    if (sensitivityFilter !== 'all') {
      filtered = filtered.filter(gallery => gallery.cultural_sensitivity_level === sensitivityFilter)
    }

    setFilteredGalleries(filtered)
  }

  const handleViewGallery = (gallery: Gallery) => {
    setSelectedGallery(gallery)
    setEditingGallery(gallery)
    setIsEditing(false)
    setIsDetailModalOpen(true)

    fetch(`/api/galleries/${gallery.id}/photos`)
      .then(res => res.json())
      .then(data => {
        console.log(`Gallery "${gallery.title}" has ${data.total || 0} photos linked`)
      })
      .catch(err => {
        console.error('Error fetching gallery photos:', err)
      })
  }

  const handleEditGallery = () => {
    setIsEditing(true)
  }

  const handleSaveGallery = async () => {
    console.log('Saving gallery:', editingGallery)
    setIsEditing(false)
    fetchGalleries()
  }

  const handleDeleteGallery = async (galleryId: string) => {
    if (confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/galleries?id=${galleryId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchGalleries()
        } else {
          const error = await response.json()
          alert('Failed to delete gallery: ' + (error.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting gallery:', error)
        alert('Error deleting gallery. Please try again.')
      }
    }
  }

  const handleCreateGallery = async () => {
    if (!newGallery.title.trim()) {
      alert('Please enter a gallery title')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGallery.title,
          description: newGallery.description,
          visibility: newGallery.visibility,
          culturalSensitivityLevel: newGallery.cultural_sensitivity_level
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsCreateModalOpen(false)
        setNewGallery({
          title: '',
          description: '',
          visibility: 'private',
          cultural_sensitivity_level: 'low',
        })
        fetchGalleries()
        // Open the new gallery for editing
        if (data.gallery) {
          handleViewGallery(data.gallery)
        }
      } else {
        const error = await response.json()
        alert('Failed to create gallery: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating gallery:', error)
      alert('Error creating gallery. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'hidden': return <Badge variant="secondary">Hidden</Badge>
      case 'flagged': return <Badge variant="destructive">Flagged</Badge>
      case 'under_review': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Under Review</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Public</Badge>
      case 'community': return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Community</Badge>
      case 'organisation': return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Organization</Badge>
      case 'organization': return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Organization</Badge>
      case 'private': return <Badge className="bg-stone-100 text-stone-700 border-stone-200">Private</Badge>
      default: return <Badge variant="outline" className="capitalize">{visibility}</Badge>
    }
  }

  const getSensitivityBadge = (level: string) => {
    switch (level) {
      case 'high': return <Badge variant="destructive">High Sensitivity</Badge>
      case 'medium': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Medium Sensitivity</Badge>
      case 'low': return <Badge className="bg-green-100 text-green-800 border-green-200">Low Sensitivity</Badge>
      default: return <Badge variant="outline">{level}</Badge>
    }
  }

  const totalGalleries = galleries.length
  const activeGalleries = galleries.filter(g => g.status === 'active').length
  const flaggedGalleries = galleries.filter(g => g.status === 'flagged').length
  const underReview = galleries.filter(g => g.status === 'under_review').length
  const highSensitivity = galleries.filter(g => g.cultural_sensitivity_level === 'high').length
  const elderApproved = galleries.filter(g => g.elder_approved).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        <span className="ml-3 text-stone-600">Loading galleries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Galleries</h1>
        <p className="text-stone-500 mt-1">
          Manage photo and video galleries with cultural sensitivity protocols
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutGrid className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{totalGalleries}</p>
                <p className="text-xs text-stone-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{activeGalleries}</p>
                <p className="text-xs text-stone-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flag className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{flaggedGalleries}</p>
                <p className="text-xs text-stone-500">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{underReview}</p>
                <p className="text-xs text-stone-500">Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{elderApproved}</p>
                <p className="text-xs text-stone-500">Elder OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{highSensitivity}</p>
                <p className="text-xs text-stone-500">High Sens.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sage-50 to-sage-100 border-sage-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-200 rounded-lg">
                <FileImage className="h-5 w-5 text-sage-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-800">{totalPhotos}</p>
                <p className="text-xs text-sage-600">Photos</p>
              </div>
            </div>
            <Button
              onClick={() => setIsPhotoViewerOpen(true)}
              size="sm"
              variant="outline"
              className="w-full mt-3 border-sage-300 text-sage-700 hover:bg-sage-100"
            >
              View All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="organisation">Organization</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Sensitivity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sensitivity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-sage-600 hover:bg-sage-700" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Gallery
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Galleries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredGalleries.map((gallery) => (
          <Card key={gallery.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title & Featured */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-stone-900 truncate">{gallery.title}</h3>
                    {gallery.featured && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        <Flag className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getStatusBadge(gallery.status)}
                    {getVisibilityBadge(gallery.visibility)}
                    {getSensitivityBadge(gallery.cultural_sensitivity_level)}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {gallery.creator?.display_name || 'Unknown Creator'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileImage className="w-4 h-4" />
                      {gallery.media_count} media
                    </span>
                    {gallery.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {gallery.location}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {gallery.description && (
                    <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  {/* Cultural Indicators */}
                  {(gallery.elder_approved || gallery.ceremonial_content || gallery.traditional_knowledge) && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {gallery.elder_approved && (
                        <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                          <Shield className="w-3 h-3 mr-1" />
                          Elder Approved
                        </Badge>
                      )}
                      {gallery.ceremonial_content && (
                        <Badge variant="outline" className="text-indigo-700 border-indigo-300 bg-indigo-50">
                          Ceremonial
                        </Badge>
                      )}
                      {gallery.traditional_knowledge && (
                        <Badge variant="outline" className="text-violet-700 border-violet-300 bg-violet-50">
                          Traditional Knowledge
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {gallery.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {gallery.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {gallery.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gallery.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center border-t pt-3">
                    <div>
                      <p className="font-semibold text-stone-900">{gallery.stats?.views_count || 0}</p>
                      <p className="text-xs text-stone-500">Views</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{gallery.stats?.likes_count || 0}</p>
                      <p className="text-xs text-stone-500">Likes</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{gallery.stats?.comments_count || 0}</p>
                      <p className="text-xs text-stone-500">Comments</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{gallery.stats?.shares_count || 0}</p>
                      <p className="text-xs text-stone-500">Shares</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleViewGallery(gallery)}
                    size="sm"
                    className="bg-sage-600 hover:bg-sage-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-stone-500 mt-3 pt-3 border-t">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {new Date(gallery.created_at).toLocaleDateString()}
                </span>
                <Badge variant={gallery.consent_status === 'granted' ? 'default' : 'secondary'} className={
                  gallery.consent_status === 'granted' ? 'bg-green-100 text-green-800' :
                  gallery.consent_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }>
                  Consent: {gallery.consent_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGalleries.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No galleries found</h3>
          <p className="text-stone-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Gallery Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{selectedGallery?.title}</DialogTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={handleEditGallery} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveGallery} className="bg-sage-600 hover:bg-sage-700" size="sm">
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
            <DialogDescription className="sr-only">
              Review gallery details, cultural protocols, and linked media.
            </DialogDescription>
          </DialogHeader>

          {selectedGallery && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Left Column - Gallery Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Gallery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                          <Input
                            value={editingGallery.title || ''}
                            onChange={(e) => setEditingGallery(prev => ({
                              ...prev,
                              title: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                          <textarea
                            value={editingGallery.description || ''}
                            onChange={(e) => setEditingGallery(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                          <Input
                            value={editingGallery.location || ''}
                            onChange={(e) => setEditingGallery(prev => ({
                              ...prev,
                              location: e.target.value
                            }))}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Title</p>
                          <p className="text-sm text-stone-900">{selectedGallery.title}</p>
                        </div>
                        {selectedGallery.description && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Description</p>
                            <p className="text-sm text-stone-700">{selectedGallery.description}</p>
                          </div>
                        )}
                        {selectedGallery.location && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Location</p>
                            <p className="text-sm text-stone-700">{selectedGallery.location}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Creator</p>
                          <p className="text-sm text-stone-700">{selectedGallery.creator?.display_name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Created</p>
                          <p className="text-sm text-stone-700">
                            {new Date(selectedGallery.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Media Count</p>
                          <p className="text-sm text-stone-700">{selectedGallery.media_count} items</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Cultural Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Cultural Sensitivity</span>
                      {getSensitivityBadge(selectedGallery.cultural_sensitivity_level)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Elder Approved</span>
                      <Badge className={selectedGallery.elder_approved ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}>
                        {selectedGallery.elder_approved ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Ceremonial Content</span>
                      <Badge className={selectedGallery.ceremonial_content ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-600'}>
                        {selectedGallery.ceremonial_content ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Traditional Knowledge</span>
                      <Badge className={selectedGallery.traditional_knowledge ? 'bg-indigo-100 text-indigo-800' : 'bg-stone-100 text-stone-600'}>
                        {selectedGallery.traditional_knowledge ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Consent Status</span>
                      <Badge className={
                        selectedGallery.consent_status === 'granted' ? 'bg-green-100 text-green-800' :
                        selectedGallery.consent_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {selectedGallery.consent_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Media & Settings */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Gallery Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Status</span>
                      {getStatusBadge(selectedGallery.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Visibility</span>
                      {getVisibilityBadge(selectedGallery.visibility)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Featured</span>
                      <Badge className={selectedGallery.featured ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}>
                        {selectedGallery.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-stone-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedGallery.stats?.views_count || 0}</p>
                        <p className="text-xs text-stone-500">Views</p>
                      </div>
                      <div className="text-center p-3 bg-stone-50 rounded-lg">
                        <p className="text-2xl font-bold text-rose-600">{selectedGallery.stats?.likes_count || 0}</p>
                        <p className="text-xs text-stone-500">Likes</p>
                      </div>
                      <div className="text-center p-3 bg-stone-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedGallery.stats?.comments_count || 0}</p>
                        <p className="text-xs text-stone-500">Comments</p>
                      </div>
                      <div className="text-center p-3 bg-stone-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{selectedGallery.stats?.shares_count || 0}</p>
                        <p className="text-xs text-stone-500">Shares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedGallery.tags.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedGallery.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Media Management */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Gallery Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MediaLinkingManager
                      contentType="gallery"
                      contentId={selectedGallery.id}
                      contentTitle={selectedGallery.title}
                      className="max-h-96"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* All Photos Viewer Dialog */}
      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>All Photos ({totalPhotos})</DialogTitle>
            <DialogDescription className="sr-only">
              Browse all photos and open their metadata details.
            </DialogDescription>
          </DialogHeader>
          <AllPhotosViewer onClose={() => setIsPhotoViewerOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Gallery Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Gallery</DialogTitle>
            <DialogDescription className="sr-only">
              Add a gallery with visibility and cultural sensitivity settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={newGallery.title}
                onChange={(e) => setNewGallery(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter gallery title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                value={newGallery.description}
                onChange={(e) => setNewGallery(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter gallery description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Visibility</label>
                <Select
                  value={newGallery.visibility}
                  onValueChange={(v: 'public' | 'community' | 'organisation' | 'private') =>
                    setNewGallery(prev => ({ ...prev, visibility: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="organisation">Organization</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Cultural Sensitivity</label>
                <Select
                  value={newGallery.cultural_sensitivity_level}
                  onValueChange={(v: 'low' | 'medium' | 'high') =>
                    setNewGallery(prev => ({ ...prev, cultural_sensitivity_level: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button className="bg-sage-600 hover:bg-sage-700" onClick={handleCreateGallery} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Gallery
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// All Photos Viewer Component
function AllPhotosViewer({ onClose }: { onClose: () => void }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.media || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        <span className="ml-3 text-stone-600">Loading photos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Photo Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-sage-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-sage-700">{photos.length}</p>
          <p className="text-sm text-stone-600">Total Photos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(photos.reduce((sum, p) => sum + (p.fileSize || 0), 0) / (1024 * 1024))} MB
          </p>
          <p className="text-sm text-stone-600">Total Size</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {photos.filter(p => p.organizationName === 'Snow Foundation').length}
          </p>
          <p className="text-sm text-stone-600">Snow Foundation</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">
            {photos.filter(p => p.galleries?.length === 0).length}
          </p>
          <p className="text-sm text-stone-600">Unlinked</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="h-96 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-stone-100 aspect-square border border-stone-200 hover:border-sage-400 transition-colors"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="w-full h-full flex items-center justify-center">
                <FileImage className="w-8 h-8 text-stone-400" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center">
                  <Eye className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">View</p>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <Badge className="bg-sage-600 text-white text-xs">
                  #{index + 1}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.filename}</p>
                <p className="text-stone-300 text-xs">
                  {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.title || selectedPhoto.filename}</DialogTitle>
              <DialogDescription className="sr-only">
                View photo metadata and linked gallery details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase">Filename</p>
                  <p className="text-sm">{selectedPhoto.filename}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase">Size</p>
                  <p className="text-sm">{(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase">Organization</p>
                  <p className="text-sm">{selectedPhoto.organizationName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase">Visibility</p>
                  <Badge className={
                    selectedPhoto.visibility === 'public' ? 'bg-blue-100 text-blue-800' :
                    selectedPhoto.visibility === 'private' ? 'bg-stone-100 text-stone-800' :
                    'bg-purple-100 text-purple-800'
                  }>
                    {selectedPhoto.visibility}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase">Cultural Sensitivity</p>
                  <Badge className={
                    selectedPhoto.culturalSensitivityLevel === 'high' ? 'bg-red-100 text-red-800' :
                    selectedPhoto.culturalSensitivityLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {selectedPhoto.culturalSensitivityLevel}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase">Galleries</p>
                  <p className="text-sm">{selectedPhoto.galleries?.length > 0 ?
                    selectedPhoto.galleries.map((g: any) => g.title).join(', ') :
                    'Not linked to any gallery'
                  }</p>
                </div>
                {selectedPhoto.culturalTags?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-stone-500 uppercase">Cultural Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPhoto.culturalTags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center bg-stone-100 rounded-lg h-64">
                <div className="text-center text-stone-500">
                  <FileImage className="w-16 h-16 mx-auto mb-2" />
                  <p>Photo Preview</p>
                  <p className="text-xs">({selectedPhoto.mimeType})</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

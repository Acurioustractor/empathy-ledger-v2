'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import MediaLinkingManager from '@/components/media/MediaLinkingManager'
import {
  Dialog,
  DialogContent,
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
  Share
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

      // Fetch galleries from admin API (bypasses auth restrictions)
      const response = await fetch('/api/admin/galleries?limit=50')
      if (response.ok) {
        const data = await response.json()
        // Data is already transformed by admin API
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

    // Fetch and log photos to verify they're linked
    fetch(`/api/galleries/${gallery.id}/photos`)
      .then(res => res.json())
      .then(data => {
        console.log(`✅ Gallery "${gallery.title}" has ${data.total || 0} photos linked`)
        console.log('Photo data:', data.photos?.slice(0, 5)) // Show first 5 photos
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
    // Add API call here
    setIsEditing(false)
    fetchGalleries()
  }

  const handleDeleteGallery = async (galleryId: string) => {
    if (confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      try {
        console.log('Deleting gallery:', galleryId)

        const response = await fetch(`/api/admin/galleries?id=${galleryId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          console.log('✅ Gallery deleted successfully')
          // Refresh the galleries list
          fetchGalleries()
        } else {
          const error = await response.json()
          console.error('❌ Failed to delete gallery:', error)
          alert('Failed to delete gallery: ' + (error.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('❌ Error deleting gallery:', error)
        alert('Error deleting gallery. Please try again.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'hidden': return 'bg-stone-100 text-stone-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-sage-100 text-sage-800'
      case 'community': return 'bg-clay-100 text-clay-800'
      case 'organisation': return 'bg-terracotta-100 text-terracotta-800'
      case 'private': return 'bg-stone-100 text-stone-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-stone-100 text-stone-800'
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
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading galleries...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Galleries Admin</h1>
        <p className="text-stone-600">
          Manage photo and video galleries with cultural sensitivity protocols
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sage-600">{totalGalleries}</p>
              <p className="text-xs text-stone-600">Total Galleries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeGalleries}</p>
              <p className="text-xs text-stone-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{flaggedGalleries}</p>
              <p className="text-xs text-stone-600">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{underReview}</p>
              <p className="text-xs text-stone-600">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-clay-600">{elderApproved}</p>
              <p className="text-xs text-stone-600">Elder Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{highSensitivity}</p>
              <p className="text-xs text-stone-600">High Sensitivity</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{totalPhotos}</p>
              <p className="text-xs text-stone-600">Total Photos</p>
              <Button
                onClick={() => setIsPhotoViewerOpen(true)}
                size="sm"
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileImage className="w-3 h-3 mr-1" />
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
              <option value="under_review">Under Review</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="organisation">Organization</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Sensitivity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mt-4">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Gallery
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Galleries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGalleries.map((gallery) => (
          <Card key={gallery.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{gallery.title}</h3>
                    {gallery.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Flag className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getStatusColor(gallery.status)}>
                      {gallery.status}
                    </Badge>
                    <Badge className={getVisibilityColor(gallery.visibility)}>
                      {gallery.visibility}
                    </Badge>
                    <Badge className={getSensitivityColor(gallery.cultural_sensitivity_level)}>
                      {gallery.cultural_sensitivity_level} sensitivity
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-stone-600 mb-3">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {gallery.creator?.display_name}
                    </span>
                    <span className="flex items-center">
                      <FileImage className="w-3 h-3 mr-1" />
                      {gallery.media_count} media
                    </span>
                    {gallery.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {gallery.location}
                      </span>
                    )}
                  </div>

                  {gallery.description && (
                    <p className="text-sm text-stone-700 mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  {/* Cultural Indicators */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {gallery.elder_approved && (
                      <Badge className="bg-clay-100 text-clay-800" size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        Elder Approved
                      </Badge>
                    )}
                    {gallery.ceremonial_content && (
                      <Badge className="bg-terracotta-100 text-terracotta-800" size="sm">
                        Ceremonial
                      </Badge>
                    )}
                    {gallery.traditional_knowledge && (
                      <Badge className="bg-violet-100 text-violet-800" size="sm">
                        Traditional Knowledge
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {gallery.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {gallery.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" size="sm">
                          #{tag}
                        </Badge>
                      ))}
                      {gallery.tags.length > 3 && (
                        <Badge variant="outline" size="sm">
                          +{gallery.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <p className="font-bold">{gallery.stats?.views_count || 0}</p>
                      <p className="text-stone-600 text-xs">Views</p>
                    </div>
                    <div>
                      <p className="font-bold">{gallery.stats?.likes_count || 0}</p>
                      <p className="text-stone-600 text-xs">Likes</p>
                    </div>
                    <div>
                      <p className="font-bold">{gallery.stats?.comments_count || 0}</p>
                      <p className="text-stone-600 text-xs">Comments</p>
                    </div>
                    <div>
                      <p className="font-bold">{gallery.stats?.shares_count || 0}</p>
                      <p className="text-stone-600 text-xs">Shares</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => handleViewGallery(gallery)}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="text-xs text-stone-500 flex items-center justify-between">
                <span>Created {new Date(gallery.created_at).toLocaleDateString()}</span>
                <span>Consent: {gallery.consent_status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGalleries.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No galleries found</h3>
          <p className="text-stone-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Gallery Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Gallery Details: {selectedGallery?.title}</DialogTitle>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEditGallery} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveGallery}
                      className="bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedGallery && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Gallery Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <Input
                            value={editingGallery.title || ''}
                            onChange={(e) => setEditingGallery(prev => ({
                              ...prev,
                              title: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={editingGallery.description || ''}
                            onChange={(e) => setEditingGallery(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
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
                      <>
                        <div>
                          <strong className="text-sm">Title:</strong>
                          <p className="text-sm text-stone-600">{selectedGallery.title}</p>
                        </div>
                        {selectedGallery.description && (
                          <div>
                            <strong className="text-sm">Description:</strong>
                            <p className="text-sm text-stone-600">{selectedGallery.description}</p>
                          </div>
                        )}
                        {selectedGallery.location && (
                          <div>
                            <strong className="text-sm">Location:</strong>
                            <p className="text-sm text-stone-600">{selectedGallery.location}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-sm">Creator:</strong>
                          <p className="text-sm text-stone-600">{selectedGallery.creator?.display_name}</p>
                        </div>
                        <div>
                          <strong className="text-sm">Created:</strong>
                          <p className="text-sm text-stone-600">
                            {new Date(selectedGallery.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <strong className="text-sm">Media Count:</strong>
                          <p className="text-sm text-stone-600">{selectedGallery.media_count} items</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cultural Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cultural Sensitivity:</span>
                      <Badge className={getSensitivityColor(selectedGallery.cultural_sensitivity_level)}>
                        {selectedGallery.cultural_sensitivity_level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Elder Approved:</span>
                      <Badge className={selectedGallery.elder_approved ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}>
                        {selectedGallery.elder_approved ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ceremonial Content:</span>
                      <Badge className={selectedGallery.ceremonial_content ? 'bg-clay-100 text-clay-800' : 'bg-stone-100 text-stone-800'}>
                        {selectedGallery.ceremonial_content ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Traditional Knowledge:</span>
                      <Badge className={selectedGallery.traditional_knowledge ? 'bg-terracotta-100 text-terracotta-800' : 'bg-stone-100 text-stone-800'}>
                        {selectedGallery.traditional_knowledge ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consent Status:</span>
                      <Badge className={
                        selectedGallery.consent_status === 'granted' ? 'bg-green-100 text-green-800' :
                        selectedGallery.consent_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {selectedGallery.consent_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Media & Settings */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className={getStatusColor(selectedGallery.status)}>
                        {selectedGallery.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Visibility:</span>
                      <Badge className={getVisibilityColor(selectedGallery.visibility)}>
                        {selectedGallery.visibility}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Featured:</span>
                      <Badge className={selectedGallery.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-stone-100 text-stone-800'}>
                        {selectedGallery.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-sage-600">{selectedGallery.stats?.views_count || 0}</p>
                        <p className="text-sm text-stone-600">Views</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{selectedGallery.stats?.likes_count || 0}</p>
                        <p className="text-sm text-stone-600">Likes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{selectedGallery.stats?.comments_count || 0}</p>
                        <p className="text-sm text-stone-600">Comments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-clay-600">{selectedGallery.stats?.shares_count || 0}</p>
                        <p className="text-sm text-stone-600">Shares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
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

                {/* Media Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Media</CardTitle>
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
          </DialogHeader>
          <AllPhotosViewer onClose={() => setIsPhotoViewerOpen(false)} />
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2">Loading photos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Photo Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-emerald-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{photos.length}</p>
          <p className="text-sm text-stone-600">Total Photos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-sage-600">
            {photos.reduce((sum, p) => sum + (p.fileSize || 0), 0) / (1024 * 1024) | 0} MB
          </p>
          <p className="text-sm text-stone-600">Total Size</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-clay-600">
            {photos.filter(p => p.organizationName === 'Snow Foundation').length}
          </p>
          <p className="text-sm text-stone-600">Snow Foundation</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {photos.filter(p => p.galleries.length === 0).length}
          </p>
          <p className="text-sm text-stone-600">Unlinked</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="h-96 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-stone-100 aspect-square"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="w-full h-full flex items-center justify-center">
                <FileImage className="w-8 h-8 text-stone-400" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center">
                  <Eye className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">View</p>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                  #{index + 1}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.filename}</p>
                <p className="text-stone-200 text-xs">
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
              <DialogTitle>{selectedPhoto.title}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <strong>Filename:</strong> {selectedPhoto.filename}
                </div>
                <div>
                  <strong>Size:</strong> {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
                <div>
                  <strong>Organization:</strong> {selectedPhoto.organizationName}
                </div>
                <div>
                  <strong>Visibility:</strong>
                  <Badge className={`ml-2 ${
                    selectedPhoto.visibility === 'public' ? 'bg-sage-100 text-sage-800' :
                    selectedPhoto.visibility === 'private' ? 'bg-stone-100 text-stone-800' :
                    'bg-clay-100 text-clay-800'
                  }`}>
                    {selectedPhoto.visibility}
                  </Badge>
                </div>
                <div>
                  <strong>Cultural Sensitivity:</strong>
                  <Badge className={`ml-2 ${
                    selectedPhoto.culturalSensitivityLevel === 'high' ? 'bg-red-100 text-red-800' :
                    selectedPhoto.culturalSensitivityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedPhoto.culturalSensitivityLevel}
                  </Badge>
                </div>
                <div>
                  <strong>Galleries:</strong> {selectedPhoto.galleries.length > 0 ?
                    selectedPhoto.galleries.map((g: any) => g.title).join(', ') :
                    'Not linked to any gallery'
                  }
                </div>
                <div>
                  <strong>Cultural Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPhoto.culturalTags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
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
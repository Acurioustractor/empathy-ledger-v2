'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import AdminNavigation from '@/components/admin/AdminNavigation'
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
  visibility: 'public' | 'community' | 'organization' | 'private'
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

  useEffect(() => {
    fetchGalleries()
  }, [])

  useEffect(() => {
    filterGalleries()
  }, [galleries, searchTerm, statusFilter, visibilityFilter, sensitivityFilter])

  const fetchGalleries = async () => {
    try {
      setLoading(true)
      
      // Fetch real galleries from API
      const response = await fetch('/api/galleries?limit=50')
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match Gallery interface
        const transformedGalleries = data.galleries?.map((gallery: any) => ({
          id: gallery.id,
          title: gallery.title || 'Untitled Gallery',
          description: gallery.description,
          created_at: gallery.created_at,
          created_by: gallery.created_by,
          cover_image_id: gallery.cover_image_id,
          media_count: 0, // Would need to count media items
          visibility: gallery.visibility || 'private',
          cultural_sensitivity_level: gallery.cultural_sensitivity_level || 'low',
          tags: gallery.tags || [],
          location: gallery.ceremony_location,
          featured: gallery.featured || false,
          status: gallery.status || 'active',
          
          // Creator info (would need to be fetched separately or joined)
          creator: {
            id: gallery.created_by,
            display_name: 'Unknown Creator', // Would need profile data
            community_roles: ['storyteller']
          },
          
          // Statistics (not available from current API)
          stats: {
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0
          },
          
          // Cultural protocols
          elder_approved: gallery.elder_approval_status === 'approved',
          ceremonial_content: gallery.cultural_sensitivity_level === 'high',
          traditional_knowledge: gallery.traditional_knowledge_content || false,
          consent_status: 'granted' as 'granted' | 'pending' | 'denied'
        })) || []
        
        setGalleries(transformedGalleries)
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
    if (confirm('Are you sure you want to delete this gallery?')) {
      console.log('Deleting gallery:', galleryId)
      // Add API call here
      fetchGalleries()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'hidden': return 'bg-gray-100 text-gray-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-purple-100 text-purple-800'
      case 'organization': return 'bg-indigo-100 text-indigo-800'
      case 'private': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation className="mb-8" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading galleries...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation className="mb-8" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Galleries Admin</h1>
        <p className="text-gray-600">
          Manage photo and video galleries with cultural sensitivity protocols
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalGalleries}</p>
              <p className="text-xs text-gray-600">Total Galleries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeGalleries}</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{flaggedGalleries}</p>
              <p className="text-xs text-gray-600">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{underReview}</p>
              <p className="text-xs text-gray-600">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{elderApproved}</p>
              <p className="text-xs text-gray-600">Elder Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{highSensitivity}</p>
              <p className="text-xs text-gray-600">High Sensitivity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="organization">Organization</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  {/* Cultural Indicators */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {gallery.elder_approved && (
                      <Badge className="bg-purple-100 text-purple-800" size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        Elder Approved
                      </Badge>
                    )}
                    {gallery.ceremonial_content && (
                      <Badge className="bg-indigo-100 text-indigo-800" size="sm">
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
                      <p className="text-gray-600 text-xs">Views</p>
                    </div>
                    <div>
                      <p className="font-bold">{gallery.stats?.likes_count || 0}</p>
                      <p className="text-gray-600 text-xs">Likes</p>
                    </div>
                    <div>
                      <p className="font-bold">{gallery.stats?.comments_count || 0}</p>
                      <p className="text-gray-600 text-xs">Comments</p>
                    </div>
                    <div>
                      <p className="font-bold">{gallery.stats?.shares_count || 0}</p>
                      <p className="text-gray-600 text-xs">Shares</p>
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

              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Created {new Date(gallery.created_at).toLocaleDateString()}</span>
                <span>Consent: {gallery.consent_status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGalleries.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No galleries found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          <p className="text-sm text-gray-600">{selectedGallery.title}</p>
                        </div>
                        {selectedGallery.description && (
                          <div>
                            <strong className="text-sm">Description:</strong>
                            <p className="text-sm text-gray-600">{selectedGallery.description}</p>
                          </div>
                        )}
                        {selectedGallery.location && (
                          <div>
                            <strong className="text-sm">Location:</strong>
                            <p className="text-sm text-gray-600">{selectedGallery.location}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-sm">Creator:</strong>
                          <p className="text-sm text-gray-600">{selectedGallery.creator?.display_name}</p>
                        </div>
                        <div>
                          <strong className="text-sm">Created:</strong>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedGallery.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <strong className="text-sm">Media Count:</strong>
                          <p className="text-sm text-gray-600">{selectedGallery.media_count} items</p>
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
                      <Badge className={selectedGallery.elder_approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedGallery.elder_approved ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ceremonial Content:</span>
                      <Badge className={selectedGallery.ceremonial_content ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedGallery.ceremonial_content ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Traditional Knowledge:</span>
                      <Badge className={selectedGallery.traditional_knowledge ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}>
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
                      <Badge className={selectedGallery.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
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
                        <p className="text-2xl font-bold text-blue-600">{selectedGallery.stats?.views_count || 0}</p>
                        <p className="text-sm text-gray-600">Views</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{selectedGallery.stats?.likes_count || 0}</p>
                        <p className="text-sm text-gray-600">Likes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{selectedGallery.stats?.comments_count || 0}</p>
                        <p className="text-sm text-gray-600">Comments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{selectedGallery.stats?.shares_count || 0}</p>
                        <p className="text-sm text-gray-600">Shares</p>
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
    </div>
  )
}
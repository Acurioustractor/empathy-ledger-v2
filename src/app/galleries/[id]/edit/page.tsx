'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Save,
  ArrowLeft,
  GripVertical,
  Trash2,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import type { Gallery, MediaAsset, GalleryMediaAssociation } from '@/types/database'
import Image from 'next/image'

interface GalleryWithMedia extends Gallery {
  cover_image?: MediaAsset
  media_associations?: (GalleryMediaAssociation & {
    media_asset?: MediaAsset
  })[]
}

interface EditableMediaAssociation extends GalleryMediaAssociation {
  media_asset?: MediaAsset
  isDeleted?: boolean
  hasChanges?: boolean
}

export default function GalleryEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const galleryId = params.id as string

  // State management
  const [gallery, setGallery] = useState<GalleryWithMedia | null>(null)
  const [mediaAssociations, setMediaAssociations] = useState<EditableMediaAssociation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    cultural_theme: '',
    cultural_sensitivity_level: 'medium' as 'low' | 'medium' | 'high',
    ceremonial_content: false,
    traditional_knowledge_content: false,
    visibility: 'private' as 'public' | 'community' | 'private',
    allow_downloads: false,
    allow_comments: true
  })

  // Fetch gallery data
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${galleryId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Gallery not found')
            return
          }
          if (response.status === 403) {
            setError('You do not have permission to edit this gallery')
            return
          }
          throw new Error('Failed to load gallery')
        }

        const data = await response.json()
        const galleryData = data.gallery as GalleryWithMedia

        // Check if user can edit this gallery
        if (galleryData.created_by !== user?.id) {
          setError('You do not have permission to edit this gallery')
          return
        }

        setGallery(galleryData)
        
        // Initialize form with gallery data
        setGalleryForm({
          title: galleryData.title || '',
          description: galleryData.description || '',
          cultural_theme: galleryData.cultural_theme || '',
          cultural_sensitivity_level: galleryData.cultural_sensitivity_level || 'medium',
          ceremonial_content: galleryData.ceremonial_content || false,
          traditional_knowledge_content: galleryData.traditional_knowledge_content || false,
          visibility: galleryData.visibility || 'private',
          allow_downloads: galleryData.allow_downloads || false,
          allow_comments: galleryData.allow_comments !== false // default true
        })

        // Initialize media associations with sort order
        const sortedMedia = (galleryData.media_associations || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(assoc => ({ ...assoc, hasChanges: false, isDeleted: false }))
        
        setMediaAssociations(sortedMedia)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (galleryId && user) {
      fetchGallery()
    }
  }, [galleryId, user])

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    const reorderedMedia = Array.from(mediaAssociations)
    const [removed] = reorderedMedia.splice(sourceIndex, 1)
    reorderedMedia.splice(destinationIndex, 0, removed)

    // Update sort orders
    const updatedMedia = reorderedMedia.map((item, index) => ({
      ...item,
      sort_order: index + 1,
      hasChanges: true
    }))

    setMediaAssociations(updatedMedia)
    setHasUnsavedChanges(true)
  }

  // Handle media caption/context updates
  const updateMediaAssociation = (id: string, updates: Partial<EditableMediaAssociation>) => {
    setMediaAssociations(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, hasChanges: true }
        : item
    ))
    setHasUnsavedChanges(true)
  }

  // Handle media deletion (soft delete)
  const handleDeleteMedia = (id: string) => {
    setMediaAssociations(prev => prev.map(item =>
      item.id === id 
        ? { ...item, isDeleted: true, hasChanges: true }
        : item
    ))
    setHasUnsavedChanges(true)
  }

  // Handle media restoration
  const handleRestoreMedia = (id: string) => {
    setMediaAssociations(prev => prev.map(item =>
      item.id === id 
        ? { ...item, isDeleted: false, hasChanges: true }
        : item
    ))
    setHasUnsavedChanges(true)
  }

  // Save all changes
  const handleSave = async () => {
    if (!gallery || !user) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update gallery metadata
      const galleryResponse = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...galleryForm,
          updated_at: new Date().toISOString()
        })
      })

      if (!galleryResponse.ok) {
        throw new Error('Failed to update gallery')
      }

      // Update media associations that have changes
      const changedAssociations = mediaAssociations.filter(item => item.hasChanges)
      
      for (const association of changedAssociations) {
        if (association.isDeleted) {
          // Delete the association
          await fetch(`/api/galleries/${galleryId}/media`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ associationId: association.id })
          })
        } else {
          // Update the association
          await fetch(`/api/galleries/${galleryId}/media`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: association.id,
              sort_order: association.sort_order,
              caption: association.caption,
              cultural_context: association.cultural_context,
              location_in_ceremony: association.location_in_ceremony,
              people_depicted: association.people_depicted,
              consent_status: association.consent_status
            })
          })
        }
      }

      setSuccess('Gallery updated successfully!')
      setHasUnsavedChanges(false)

      // Remove deleted items from state
      setMediaAssociations(prev => prev.filter(item => !item.isDeleted).map(item => ({
        ...item,
        hasChanges: false
      })))

      // Redirect back to gallery view after a delay
      setTimeout(() => {
        router.push(`/galleries/${galleryId}`)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Cultural theme options
  const culturalThemes = [
    { value: 'ceremony', label: 'Ceremony' },
    { value: 'community', label: 'Community' },
    { value: 'traditional_practices', label: 'Traditional Practices' },
    { value: 'contemporary', label: 'Contemporary Life' },
    { value: 'family', label: 'Family Stories' },
    { value: 'seasonal', label: 'Seasonal Activities' },
    { value: 'art_culture', label: 'Art & Culture' }
  ]

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Error Loading Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{error}</p>
              <Button onClick={() => router.push('/galleries')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Galleries
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/galleries/${galleryId}`)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Gallery</h1>
              <p className="text-gray-600">Make changes to your gallery settings and photo order</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved Changes
              </Badge>
            )}
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasUnsavedChanges}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Gallery Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={galleryForm.title}
                    onChange={(e) => {
                      setGalleryForm(prev => ({ ...prev, title: e.target.value }))
                      setHasUnsavedChanges(true)
                    }}
                    placeholder="Gallery title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={galleryForm.description}
                    onChange={(e) => {
                      setGalleryForm(prev => ({ ...prev, description: e.target.value }))
                      setHasUnsavedChanges(true)
                    }}
                    placeholder="Gallery description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cultural Theme</label>
                  <select
                    value={galleryForm.cultural_theme}
                    onChange={(e) => {
                      setGalleryForm(prev => ({ ...prev, cultural_theme: e.target.value }))
                      setHasUnsavedChanges(true)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select theme</option>
                    {culturalThemes.map(theme => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cultural Sensitivity</label>
                  <select
                    value={galleryForm.cultural_sensitivity_level}
                    onChange={(e) => {
                      setGalleryForm(prev => ({ ...prev, cultural_sensitivity_level: e.target.value as any }))
                      setHasUnsavedChanges(true)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="low">Community Open</option>
                    <option value="medium">Respectful Viewing</option>
                    <option value="high">Cultural Guidance Required</option>
                  </select>
                  <Badge className={`mt-2 ${getSensitivityColor(galleryForm.cultural_sensitivity_level)}`}>
                    {galleryForm.cultural_sensitivity_level === 'low' && 'Community Open'}
                    {galleryForm.cultural_sensitivity_level === 'medium' && 'Respectful Viewing'}  
                    {galleryForm.cultural_sensitivity_level === 'high' && 'Cultural Guidance'}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Visibility</label>
                  <select
                    value={galleryForm.visibility}
                    onChange={(e) => {
                      setGalleryForm(prev => ({ ...prev, visibility: e.target.value as any }))
                      setHasUnsavedChanges(true)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="private">Private</option>
                    <option value="community">Community</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.ceremonial_content}
                      onChange={(e) => {
                        setGalleryForm(prev => ({ ...prev, ceremonial_content: e.target.checked }))
                        setHasUnsavedChanges(true)
                      }}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Contains ceremonial content</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.traditional_knowledge_content}
                      onChange={(e) => {
                        setGalleryForm(prev => ({ ...prev, traditional_knowledge_content: e.target.checked }))
                        setHasUnsavedChanges(true)
                      }}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Contains traditional knowledge</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.allow_downloads}
                      onChange={(e) => {
                        setGalleryForm(prev => ({ ...prev, allow_downloads: e.target.checked }))
                        setHasUnsavedChanges(true)
                      }}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Allow downloads</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={galleryForm.allow_comments}
                      onChange={(e) => {
                        setGalleryForm(prev => ({ ...prev, allow_comments: e.target.checked }))
                        setHasUnsavedChanges(true)
                      }}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Allow comments</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Photo Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Photos ({mediaAssociations.filter(item => !item.isDeleted).length})</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mediaAssociations.length === 0 ? (
                  <div className="text-center py-12">
                    <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                    <p className="text-gray-500 mb-4">Add some photos to get started!</p>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Photo
                    </Button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="gallery-photos">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {mediaAssociations.map((association, index) => (
                            <Draggable 
                              key={association.id} 
                              draggableId={association.id} 
                              index={index}
                              isDragDisabled={association.isDeleted}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`
                                    border rounded-lg p-4 bg-white transition-all
                                    ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
                                    ${association.isDeleted ? 'opacity-50 bg-gray-50' : ''}
                                    ${association.hasChanges ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}
                                  `}
                                >
                                  <div className="flex items-start space-x-4">
                                    {/* Drag Handle */}
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing pt-2"
                                    >
                                      <GripVertical className="w-5 h-5 text-gray-400" />
                                    </div>

                                    {/* Photo Thumbnail */}
                                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                      {association.media_asset?.public_url ? (
                                        <Image
                                          src={association.media_asset.thumbnail_url || association.media_asset.public_url}
                                          alt={association.media_asset.alt_text || association.caption || ''}
                                          width={80}
                                          height={80}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full">
                                          <Upload className="w-6 h-6 text-gray-400" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Photo Details */}
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h4 className="font-medium text-gray-900">
                                            {association.media_asset?.title || association.media_asset?.filename || 'Untitled'}
                                          </h4>
                                          <p className="text-sm text-gray-500">
                                            Sort order: {association.sort_order}
                                          </p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          {association.isDeleted ? (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleRestoreMedia(association.id)}
                                              className="text-green-600 hover:text-green-700"
                                            >
                                              <Eye className="w-4 h-4 mr-1" />
                                              Restore
                                            </Button>
                                          ) : (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleDeleteMedia(association.id)}
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      {!association.isDeleted && (
                                        <>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <label className="text-xs text-gray-600 mb-1 block">Caption</label>
                                              <Input
                                                size="sm"
                                                value={association.caption || ''}
                                                onChange={(e) => updateMediaAssociation(association.id, { caption: e.target.value })}
                                                placeholder="Photo caption"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs text-gray-600 mb-1 block">Cultural Context</label>
                                              <Input
                                                size="sm"
                                                value={association.cultural_context || ''}
                                                onChange={(e) => updateMediaAssociation(association.id, { cultural_context: e.target.value })}
                                                placeholder="Cultural significance"
                                              />
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <label className="text-xs text-gray-600 mb-1 block">People Depicted</label>
                                            <Input
                                              size="sm"
                                              value={association.people_depicted?.join(', ') || ''}
                                              onChange={(e) => updateMediaAssociation(association.id, { 
                                                people_depicted: e.target.value.split(',').map(p => p.trim()).filter(Boolean) 
                                              })}
                                              placeholder="General descriptions (not names)"
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
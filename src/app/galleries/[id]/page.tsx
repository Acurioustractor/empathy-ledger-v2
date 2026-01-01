'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import PhotoUploadManager from '@/components/galleries/PhotoUploadManager'
import type { Gallery, MediaAsset, GalleryMediaAssociation } from '@/types/database'

interface GalleryWithMedia extends Gallery {
  cover_image?: {
    id: string
    public_url: string
    thumbnail_url?: string
    optimized_url?: string
    alt_text?: string
    title?: string
    description?: string
    cultural_sensitivity_level: string
    width?: number
    height?: number
  }
  created_by_profile?: {
    id: string
    display_name: string
    avatar_url?: string
    is_elder: boolean
  }
  organisation?: {
    id: string
    name: string
    slug: string
    logo_url?: string
    cultural_focus?: string[]
  }
  media_associations?: (GalleryMediaAssociation & {
    media_asset?: MediaAsset & {
      width?: number
      height?: number
    }
  })[]
}

interface PhotoModalProps {
  photo: any
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}

function PhotoModal({ photo, onClose, onPrevious, onNext, hasPrevious, hasNext }: PhotoModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrevious) onPrevious()
      if (event.key === 'ArrowRight' && hasNext) onNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Previous button */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next button */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <div className="relative max-w-full max-h-full">
          <Image
            src={photo.media_asset.optimized_url || photo.media_asset.public_url}
            alt={photo.media_asset.alt_text || photo.caption || ''}
            width={photo.media_asset.width || 800}
            height={photo.media_asset.height || 600}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Photo info */}
        {(photo.caption || photo.media_asset.title || photo.cultural_context) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-6">
            <div className="text-white max-w-2xl">
              {photo.media_asset.title && (
                <h3 className="text-xl font-semibold mb-2">{photo.media_asset.title}</h3>
              )}
              {photo.caption && (
                <p className="text-grey-200 mb-2">{photo.caption}</p>
              )}
              {photo.cultural_context && (
                <p className="text-grey-300 text-sm">{photo.cultural_context}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isSuperAdmin } = useAuth()
  const [gallery, setGallery] = useState<GalleryWithMedia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [showUploadManager, setShowUploadManager] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null)

  const fetchGallery = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/galleries/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Gallery not found')
        } else if (response.status === 403) {
          setError('You do not have permission to view this gallery')
        } else {
          setError('Failed to load gallery')
        }
        return
      }

      const data = await response.json()
      setGallery(data.gallery)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [params.id])

  const getSensitivityBadge = (level: string) => {
    const badges = {
      low: { label: 'Community Open', colour: 'bg-green-100 text-green-800' },
      medium: { label: 'Respectful Viewing', colour: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Cultural Guidance', colour: 'bg-red-100 text-red-800' }
    }
    
    const badge = badges[level as keyof typeof badges]
    if (!badge) return null
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.colour}`}>
        {badge.label}
      </span>
    )
  }

  const getCulturalThemeDisplay = (theme: string) => {
    const themes = {
      ceremony: 'Ceremony',
      community: 'Community',
      traditional_practices: 'Traditional Practices',
      contemporary: 'Contemporary Life',
      family: 'Family Stories',
      seasonal: 'Seasonal Activities',
      art_culture: 'Art & Culture'
    }
    return themes[theme as keyof typeof themes] || theme
  }

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const handleDeletePhoto = async (photo: any) => {
    if (!gallery || !photo.galleryItemId) return

    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${photo.title || 'this photo'}" from the gallery?`
    )

    if (!confirmDelete) return

    setDeletingPhoto(photo.id)

    try {
      const response = await fetch(`/api/galleries/${gallery.id}/media?association_id=${photo.galleryItemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      // Refresh the gallery to update the photo list
      await fetchGallery()
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo. Please try again.')
    } finally {
      setDeletingPhoto(null)
    }
  }

  const closeModal = () => {
    setSelectedPhotoIndex(null)
  }

  const goToPrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedPhotoIndex !== null && gallery?.media_associations && selectedPhotoIndex < gallery.media_associations.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1)
    }
  }

  const handlePhotosUploaded = (photos: any[]) => {
    // Refresh the gallery to show new photos
    fetchGallery()
    setShowUploadManager(false)
  }

  // Determine if user can upload photos (gallery creator or super admin)
  const canUploadPhotos = gallery && (gallery.created_by === user?.id || isSuperAdmin)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-grey-600">Loading gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <svg className="mx-auto h-24 w-24 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-grey-900">{error}</h3>
            <div className="mt-4">
              <Link
                href="/galleries"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Back to Galleries
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!gallery) return null

  const photos = gallery.media_associations || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link href="/galleries" className="text-orange-600 hover:text-orange-700">
            Galleries
          </Link>
          <span className="mx-2 text-grey-500">/</span>
          <span className="text-grey-900">{gallery.title}</span>
        </nav>

        {/* Gallery Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 lg:mr-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-grey-900">{gallery.title}</h1>
                {canUploadPhotos && (
                  <Link
                    href={`/galleries/${gallery.id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-grey-300 shadow-sm text-sm leading-4 font-medium rounded-md text-grey-700 bg-white hover:bg-grey-50"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                )}
              </div>

              {gallery.description && gallery.description.trim() !== '' && (
                <p className="text-grey-700 text-lg mb-6">{gallery.description}</p>
              )}

              {/* Cultural Context - only show if there are badges to display */}
              {(gallery.cultural_theme || gallery.cultural_sensitivity_level || gallery.ceremonial_content || gallery.traditional_knowledge_content) && (
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {gallery.cultural_theme && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                      {getCulturalThemeDisplay(gallery.cultural_theme)}
                    </span>
                  )}

                  {getSensitivityBadge(gallery.cultural_sensitivity_level)}

                  {gallery.ceremonial_content && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Ceremonial Content
                    </span>
                  )}

                  {gallery.traditional_knowledge_content && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Traditional Knowledge
                    </span>
                  )}
                </div>
              )}

              {/* Gallery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-grey-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {gallery.photo_count} photos
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {gallery.view_count} views
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2m-6 0h6" />
                  </svg>
                  {gallery.status}
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-grey-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-grey-900 mb-3">Created by</h3>
                <div className="flex items-center">
                  {gallery.created_by_profile?.avatar_url ? (
                    <Image
                      src={gallery.created_by_profile.avatar_url}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-grey-300 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-5 h-5 text-grey-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-grey-900">
                      {gallery.created_by_profile?.display_name || 'Unknown User'}
                    </p>
                    {gallery.created_by_profile?.is_elder && (
                      <p className="text-xs text-purple-600">Community Elder</p>
                    )}
                  </div>
                </div>

                {gallery.organisation && (
                  <div className="mt-4 pt-4 border-t border-grey-200">
                    <h4 className="text-sm font-medium text-grey-900 mb-2">Organization</h4>
                    <div className="flex items-center">
                      {gallery.organisation.logo_url ? (
                        <Image
                          src={gallery.organisation.logo_url}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded mr-2"
                        />
                      ) : (
                        <svg className="w-6 h-6 mr-2 text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      <span className="text-sm text-grey-600">{gallery.organisation.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-grey-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-grey-900">No photos yet</h3>
            <p className="mt-2 text-grey-500">
              {canUploadPhotos
                ? 'Add some photos to get started!'
                : 'This gallery is waiting for photos to be added.'
              }
            </p>
            {canUploadPhotos && (
              <div className="mt-4">
                <button
                  onClick={() => setShowUploadManager(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Add Photos
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {canUploadPhotos && (
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-grey-900">Photos ({gallery.photo_count})</h2>
                <button
                  onClick={() => setShowUploadManager(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add More Photos
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                onClick={() => handlePhotoClick(index)}
              >
                <div className="aspect-square relative overflow-hidden">
                  {photo.media_asset?.public_url ? (
                    <Image
                      src={photo.media_asset.thumbnail_url || photo.media_asset.public_url}
                      alt={photo.media_asset.alt_text || photo.caption || ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-amber-100">
                      <svg className="w-12 h-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Cultural sensitivity indicator */}
                  {photo.media_asset?.cultural_sensitivity_level === 'high' && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        Cultural Guidance
                      </span>
                    </div>
                  )}

                  {/* Delete button for gallery owners/admins */}
                  {canUploadPhotos && (
                    <div
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePhoto(photo)
                        }}
                        disabled={deletingPhoto === photo.id}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50 relative z-10"
                        title="Remove photo from gallery"
                      >
                        {deletingPhoto === photo.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
                </div>

                {photo.caption && (
                  <div className="p-3">
                    <p className="text-sm text-grey-700 line-clamp-2">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
            </div>
          </>
        )}

        {/* Photo Upload Manager */}
        {showUploadManager && gallery && canUploadPhotos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Add Photos to Gallery</h2>
                <button
                  onClick={() => setShowUploadManager(false)}
                  className="text-grey-400 hover:text-grey-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <PhotoUploadManager
                  galleryId={gallery.id}
                  onPhotosUploaded={handlePhotosUploaded}
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
          <PhotoModal
            photo={photos[selectedPhotoIndex]}
            onClose={closeModal}
            onPrevious={goToPrevious}
            onNext={goToNext}
            hasPrevious={selectedPhotoIndex > 0}
            hasNext={selectedPhotoIndex < photos.length - 1}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}
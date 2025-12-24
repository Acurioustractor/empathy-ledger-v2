'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Story, Gallery } from '@/types/database'

interface StoryGalleryConnectorProps {
  story?: Story
  storyId?: string
  onGalleriesUpdated?: (galleries: Gallery[]) => void
  maxGalleries?: number
}

interface StoryWithGalleries extends Story {
  related_galleries?: Gallery[]
}

export default function StoryGalleryConnector({ 
  story, 
  storyId, 
  onGalleriesUpdated,
  maxGalleries = 3 
}: StoryGalleryConnectorProps) {
  const [storyData, setStoryData] = useState<StoryWithGalleries | null>(story || null)
  const [availableGalleries, setAvailableGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConnector, setShowConnector] = useState(false)

  const currentStoryId = story?.id || storyId

  const fetchStoryGalleries = async () => {
    if (!currentStoryId) return

    try {
      setLoading(true)
      
      // Fetch story with related galleries
      const storyResponse = await fetch(`/api/stories/${currentStoryId}?include_galleries=true`)
      if (storyResponse.ok) {
        const storyData = await storyResponse.json()
        setStoryData(storyData.story)
      }

      // Fetch available galleries for connection
      const galleriesResponse = await fetch('/api/galleries?visibility=community&limit=50')
      if (galleriesResponse.ok) {
        const galleriesData = await galleriesResponse.json()
        setAvailableGalleries(galleriesData.galleries || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStoryGalleries()
  }, [currentStoryId])

  const connectGallery = async (galleryId: string) => {
    if (!currentStoryId) return

    try {
      const response = await fetch(`/api/stories/${currentStoryId}/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gallery_id: galleryId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to connect gallery')
      }

      // Refresh data
      await fetchStoryGalleries()
      
      if (onGalleriesUpdated && storyData?.related_galleries) {
        onGalleriesUpdated(storyData.related_galleries)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect gallery')
    }
  }

  const disconnectGallery = async (galleryId: string) => {
    if (!currentStoryId) return

    try {
      const response = await fetch(`/api/stories/${currentStoryId}/galleries/${galleryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to disconnect gallery')
      }

      // Update local state
      setStoryData(prev => prev ? {
        ...prev,
        related_galleries: prev.related_galleries?.filter(g => g.id !== galleryId) || []
      } : null)

      if (onGalleriesUpdated && storyData?.related_galleries) {
        const updatedGalleries = storyData.related_galleries.filter(g => g.id !== galleryId)
        onGalleriesUpdated(updatedGalleries)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect gallery')
    }
  }

  const relatedGalleries = storyData?.related_galleries || []
  const connectedGalleryIds = new Set(relatedGalleries.map(g => g.id))
  const availableToConnect = availableGalleries.filter(g => !connectedGalleryIds.has(g.id))

  if (loading && !storyData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-stone-200 rounded"></div>
            <div className="h-3 bg-stone-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-stone-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Related Photo Galleries
          </h3>
          
          {availableToConnect.length > 0 && (
            <button
              onClick={() => setShowConnector(!showConnector)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {showConnector ? 'Hide Options' : 'Connect Gallery'}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm text-red-600 hover:text-red-500 underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connected Galleries */}
      <div className="p-6">
        {relatedGalleries.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h4 className="mt-2 text-sm font-medium text-stone-900">No galleries connected</h4>
            <p className="mt-1 text-sm text-stone-500">
              Connect photo galleries to provide visual context for this story.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedGalleries.slice(0, maxGalleries).map((gallery) => (
              <div key={gallery.id} className="relative group">
                <Link
                  href={`/galleries/${gallery.id}`}
                  className="block bg-stone-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Gallery Preview */}
                  <div className="aspect-video bg-stone-200 overflow-hidden relative">
                    {gallery.cover_image_id ? (
                      <Image
                        src={gallery.cover_image_id} // This would need to be resolved to actual URL
                        alt={gallery.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Disconnect Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        disconnectGallery(gallery.id)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Disconnect gallery"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Gallery Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-stone-900 text-sm mb-1 line-clamp-1">
                      {gallery.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>{gallery.photo_count} photos</span>
                      {gallery.cultural_theme && (
                        <span className="capitalize">{gallery.cultural_theme.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Show More Link */}
            {relatedGalleries.length > maxGalleries && (
              <div className="flex items-center justify-center">
                <Link
                  href={`/stories/${currentStoryId}/galleries`}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View all {relatedGalleries.length} galleries
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gallery Connector */}
      {showConnector && (
        <div className="border-t border-stone-200 bg-stone-50">
          <div className="p-6">
            <h4 className="text-sm font-medium text-stone-900 mb-4">
              Connect a Gallery
            </h4>
            
            {availableToConnect.length === 0 ? (
              <p className="text-sm text-stone-500">
                No additional galleries available to connect.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableToConnect.map((gallery) => (
                  <div
                    key={gallery.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-stone-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {gallery.cover_image_id ? (
                          <Image
                            src={gallery.cover_image_id} // This would need to be resolved to actual URL
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-stone-900 text-sm">
                          {gallery.title}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-stone-500">
                          <span>{gallery.photo_count} photos</span>
                          {gallery.cultural_theme && (
                            <span className="capitalize">
                              {gallery.cultural_theme.replace('_', ' ')}
                            </span>
                          )}
                          {gallery.cultural_sensitivity_level && (
                            <span className={`px-2 py-0.5 rounded-full ${
                              gallery.cultural_sensitivity_level === 'high' ? 'bg-red-100 text-red-700' :
                              gallery.cultural_sensitivity_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {gallery.cultural_sensitivity_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => connectGallery(gallery.id)}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colours"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
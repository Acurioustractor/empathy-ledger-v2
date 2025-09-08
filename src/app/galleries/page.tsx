'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { Gallery } from '@/types/database'

interface GalleriesResponse {
  galleries: (Gallery & {
    cover_image?: {
      id: string
      public_url: string
      thumbnail_url: string
      alt_text: string
      cultural_sensitivity_level: string
    }
    created_by_profile?: {
      display_name: string
      avatar_url: string
    }
    organization?: {
      name: string
      slug: string
      logo_url: string
    }
  })[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const culturalThemes = [
  { value: '', label: 'All Themes' },
  { value: 'ceremony', label: 'Ceremonies' },
  { value: 'community', label: 'Community' },
  { value: 'traditional_practices', label: 'Traditional Practices' },
  { value: 'contemporary', label: 'Contemporary Life' },
  { value: 'family', label: 'Family Stories' },
  { value: 'seasonal', label: 'Seasonal Activities' },
  { value: 'art_culture', label: 'Art & Culture' }
]

const sensitivityLevels = [
  { value: '', label: 'All Levels' },
  { value: 'low', label: 'Community Open', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Respectful Viewing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Cultural Guidance', color: 'bg-red-100 text-red-800' }
]

export default function GalleriesPage() {
  const { user } = useAuth()
  const [galleries, setGalleries] = useState<GalleriesResponse['galleries']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    culturalTheme: '',
    sensitivity: '',
    organization: '',
    featured: false
  })

  const fetchGalleries = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })

      if (filters.culturalTheme) params.append('cultural_theme', filters.culturalTheme)
      if (filters.sensitivity) params.append('cultural_sensitivity', filters.sensitivity)
      if (filters.organization) params.append('organization_id', filters.organization)
      if (filters.featured) params.append('featured', 'true')

      const response = await fetch(`/api/galleries?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch galleries')
      }

      const data: GalleriesResponse = await response.json()
      setGalleries(data.galleries)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGalleries(1)
  }, [filters])

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getSensitivityBadge = (level: string) => {
    const levelInfo = sensitivityLevels.find(s => s.value === level)
    if (!levelInfo || !levelInfo.value) return null
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.color}`}>
        {levelInfo.label}
      </span>
    )
  }

  const getCulturalThemeDisplay = (theme: string) => {
    const themeInfo = culturalThemes.find(t => t.value === theme)
    return themeInfo?.label || theme
  }

  if (loading && galleries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading photo galleries...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Photo Galleries
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Explore visual stories and memories that capture the spirit of our communities, 
            shared with respect for cultural protocols and storyteller consent.
          </p>
        </div>

        {/* Create Gallery Button - only for authenticated users */}
        {user && (
          <div className="flex justify-center mb-8">
            <Link
              href="/galleries/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Gallery
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Galleries</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Theme
              </label>
              <select
                value={filters.culturalTheme}
                onChange={(e) => handleFilterChange('culturalTheme', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {culturalThemes.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Sensitivity
              </label>
              <select
                value={filters.sensitivity}
                onChange={(e) => handleFilterChange('sensitivity', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {sensitivityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Featured Only</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Galleries Grid */}
        {galleries.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No galleries found</h3>
            <p className="mt-2 text-gray-500">
              {user ? 'Be the first to create a gallery!' : 'Check back later for new galleries.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleries.map((gallery) => (
                <Link
                  key={gallery.id}
                  href={`/galleries/${gallery.id}`}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-gray-200 overflow-hidden relative">
                    {gallery.cover_image?.public_url ? (
                      <Image
                        src={gallery.cover_image.thumbnail_url || gallery.cover_image.public_url}
                        alt={gallery.cover_image.alt_text || gallery.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-amber-100">
                        <svg className="w-16 h-16 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Cultural Sensitivity Badge */}
                    {gallery.cultural_sensitivity_level && (
                      <div className="absolute top-3 right-3">
                        {getSensitivityBadge(gallery.cultural_sensitivity_level)}
                      </div>
                    )}

                    {/* Featured Badge */}
                    {gallery.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {gallery.title}
                    </h3>
                    
                    {gallery.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {gallery.description}
                      </p>
                    )}

                    {/* Cultural Theme */}
                    {gallery.cultural_theme && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                          {getCulturalThemeDisplay(gallery.cultural_theme)}
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        {gallery.created_by_profile?.avatar_url ? (
                          <Image
                            src={gallery.created_by_profile.avatar_url}
                            alt=""
                            width={24}
                            height={24}
                            className="rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
                        )}
                        <span>{gallery.created_by_profile?.display_name || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {gallery.photo_count}
                      </div>
                    </div>

                    {/* Organization */}
                    {gallery.organization && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                          {gallery.organization.logo_url ? (
                            <Image
                              src={gallery.organization.logo_url}
                              alt=""
                              width={16}
                              height={16}
                              className="rounded mr-2"
                            />
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {gallery.organization.name}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-4">
                <button
                  onClick={() => fetchGalleries(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => fetchGalleries(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
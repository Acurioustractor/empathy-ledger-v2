'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { MediaAsset, CulturalTag } from '@/types/database'

interface PhotoWithContext extends MediaAsset {
  uploaded_by_profile?: {
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
  }
  cultural_tags?: CulturalTag[]
  galleries?: {
    id: string
    title: string
    slug: string
    cultural_theme?: string
  }[]
}

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [photo, setPhoto] = useState<PhotoWithContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)

  const fetchPhoto = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/media/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Photo not found')
        } else if (response.status === 403) {
          setError('You do not have permission to view this photo')
        } else {
          setError('Failed to load photo')
        }
        return
      }

      const data = await response.json()
      setPhoto(data.asset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhoto()
  }, [params.id])

  const getSensitivityBadge = (level: string) => {
    const badges = {
      low: { label: 'Community Open', colour: 'bg-green-100 text-green-800', icon: '🌱' },
      medium: { label: 'Respectful Viewing', colour: 'bg-yellow-100 text-yellow-800', icon: '🤝' },
      high: { label: 'Cultural Guidance', colour: 'bg-red-100 text-red-800', icon: '🙏' }
    }
    
    const badge = badges[level as keyof typeof badges]
    if (!badge) return null
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.colour}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    if (!photo?.public_url) return
    
    try {
      const response = await fetch(photo.public_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = photo.original_filename || photo.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-grey-600">Loading photo...</p>
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

  if (!photo) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link href="/galleries" className="text-orange-600 hover:text-orange-700">
            Galleries
          </Link>
          {photo.galleries && photo.galleries.length > 0 && (
            <>
              <span className="mx-2 text-grey-500">/</span>
              <Link 
                href={`/galleries/${photo.galleries[0].id}`}
                className="text-orange-600 hover:text-orange-700"
              >
                {photo.galleries[0].title}
              </Link>
            </>
          )}
          <span className="mx-2 text-grey-500">/</span>
          <span className="text-grey-900">{photo.title || photo.filename}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Photo Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Photo */}
              <div className="relative">
                <div 
                  className="relative w-full"
                  style={{ 
                    aspectRatio: photo.width && photo.height 
                      ? `${photo.width}/${photo.height}` 
                      : '16/9' 
                  }}
                >
                  <Image
                    src={photo.optimized_url || photo.public_url || ''}
                    alt={photo.alt_text || photo.title || ''}
                    fill
                    className="object-contain bg-grey-100"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>

                {/* Cultural Sensitivity Overlay */}
                {photo.cultural_sensitivity_level === 'high' && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="bg-red-900 bg-opacity-90 text-white p-4 rounded-lg text-center max-w-sm">
                      <div className="text-2xl mb-2">🙏</div>
                      <h3 className="font-semibold mb-1">Cultural Guidance Required</h3>
                      <p className="text-sm">
                        This content requires cultural understanding and respect. 
                        Please view with appropriate guidance.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  {photo.uploaded_by === user?.id && (
                    <Link
                      href={`/photos/${photo.id}/edit`}
                      className="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-opacity"
                      title="Edit photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleDownload}
                    className="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-opacity"
                    title="Download photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setShowMetadata(!showMetadata)}
                    className={`${showMetadata ? 'bg-orange-600' : 'bg-black bg-opacity-70'} text-white p-2 rounded-full hover:bg-opacity-90 transition-colours`}
                    title="Toggle metadata"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Photo Title & Description */}
              <div className="p-6">
                {photo.title && (
                  <h1 className="text-2xl font-bold text-grey-900 mb-3">
                    {photo.title}
                  </h1>
                )}
                
                {photo.description && (
                  <p className="text-grey-700 text-lg leading-relaxed mb-4">
                    {photo.description}
                  </p>
                )}

                {/* Cultural Context */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {getSensitivityBadge(photo.cultural_sensitivity_level)}
                  
                  {photo.ceremonial_content && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      <span className="mr-1">🪶</span>
                      Ceremonial Content
                    </span>
                  )}

                  {photo.traditional_knowledge && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      <span className="mr-1">📚</span>
                      Traditional Knowledge
                    </span>
                  )}

                  {photo.elder_approval && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <span className="mr-1">✅</span>
                      Elder Approved
                    </span>
                  )}
                </div>

                {/* Tags */}
                {photo.tags && photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-grey-100 text-grey-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-grey-900 mb-4">Uploaded by</h3>
              <div className="flex items-center">
                {photo.uploaded_by_profile?.avatar_url ? (
                  <Image
                    src={photo.uploaded_by_profile.avatar_url}
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-grey-300 rounded-full mr-4" />
                )}
                <div>
                  <p className="font-medium text-grey-900">
                    {photo.uploaded_by_profile?.display_name || 'Unknown'}
                  </p>
                  {photo.uploaded_by_profile?.is_elder && (
                    <p className="text-sm text-purple-600">Community Elder</p>
                  )}
                </div>
              </div>

              {photo.organisation && (
                <div className="mt-4 pt-4 border-t border-grey-200">
                  <h4 className="text-sm font-medium text-grey-900 mb-2">Organization</h4>
                  <div className="flex items-center">
                    {photo.organisation.logo_url ? (
                      <Image
                        src={photo.organisation.logo_url}
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
                    <span className="text-sm text-grey-600">{photo.organisation.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Galleries */}
            {photo.galleries && photo.galleries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-grey-900 mb-4">
                  In Galleries
                </h3>
                <div className="space-y-2">
                  {photo.galleries.map((gallery) => (
                    <Link
                      key={gallery.id}
                      href={`/galleries/${gallery.id}`}
                      className="block p-3 rounded-lg hover:bg-grey-50 transition-colours"
                    >
                      <p className="font-medium text-orange-600 hover:text-orange-700">
                        {gallery.title}
                      </p>
                      {gallery.cultural_theme && (
                        <p className="text-sm text-grey-500 capitalize">
                          {gallery.cultural_theme.replace('_', ' ')}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Tags */}
            {photo.cultural_tags && photo.cultural_tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-grey-900 mb-4">
                  Cultural Context
                </h3>
                <div className="space-y-3">
                  {photo.cultural_tags.map((tag) => (
                    <div key={tag.id} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3"></span>
                      <div>
                        <p className="font-medium text-grey-900">{tag.name}</p>
                        {tag.description && (
                          <p className="text-sm text-grey-600">{tag.description}</p>
                        )}
                        {tag.traditional_name && (
                          <p className="text-sm text-grey-500 italic">
                            Traditional: {tag.traditional_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Metadata */}
            {showMetadata && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-grey-900 mb-4">
                  Technical Details
                </h3>
                <div className="space-y-3 text-sm">
                  {photo.width && photo.height && (
                    <div className="flex justify-between">
                      <span className="text-grey-600">Dimensions:</span>
                      <span className="text-grey-900">{photo.width} × {photo.height}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-grey-600">File Size:</span>
                    <span className="text-grey-900">{formatFileSize(photo.file_size)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-grey-600">Format:</span>
                    <span className="text-grey-900 uppercase">{photo.mime_type.split('/')[1]}</span>
                  </div>

                  {photo.capture_date && (
                    <div className="flex justify-between">
                      <span className="text-grey-600">Captured:</span>
                      <span className="text-grey-900">{formatDate(photo.capture_date)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-grey-600">Uploaded:</span>
                    <span className="text-grey-900">{formatDate(photo.created_at)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-grey-600">Views:</span>
                    <span className="text-grey-900">{photo.access_count}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-grey-600">Status:</span>
                    <span className={`${
                      photo.consent_status === 'granted' ? 'text-green-600' :
                      photo.consent_status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {photo.consent_status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
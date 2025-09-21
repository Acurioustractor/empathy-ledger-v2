'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/auth.context'
import type { Gallery, MediaAsset } from '@/types/database'

interface ReviewItem {
  id: string
  type: 'gallery' | 'media'
  title: string
  description?: string
  cultural_sensitivity_level: string
  ceremonial_content: boolean
  traditional_knowledge: boolean
  created_at: string
  created_by: string
  created_by_profile?: {
    display_name: string
    avatar_url?: string
  }
  preview_url?: string
  cultural_context?: any
  requires_elder_approval: boolean
  cultural_review_status: string
  elder_approval?: boolean
}

interface CulturalReviewWorkflowProps {
  userRole?: 'elder' | 'cultural_reviewer' | 'community_member'
  showOnlyPendingReview?: boolean
}

export default function CulturalReviewWorkflow({ 
  userRole = 'community_member',
  showOnlyPendingReview = true 
}: CulturalReviewWorkflowProps) {
  const { user } = useAuth()
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_changes' | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check if user has review permissions
  const canReview = userRole === 'elder' || userRole === 'cultural_reviewer'

  const fetchReviewItems = async () => {
    try {
      setLoading(true)
      
      // Fetch galleries needing review
      const galleriesPromise = fetch(`/api/galleries?cultural_review_status=pending&limit=50`)
      
      // Fetch media assets needing review  
      const mediaPromise = fetch(`/api/media?cultural_review_status=pending&limit=50`)

      const [galleriesResponse, mediaResponse] = await Promise.all([galleriesPromise, mediaPromise])

      const items: ReviewItem[] = []

      // Process galleries
      if (galleriesResponse.ok) {
        const galleriesData = await galleriesResponse.json()
        const galleries = galleriesData.galleries || []
        
        items.push(...galleries.map((gallery: Gallery & { created_by_profile?: any, cover_image?: any }) => ({
          id: gallery.id,
          type: 'gallery' as const,
          title: gallery.title,
          description: gallery.description,
          cultural_sensitivity_level: gallery.cultural_sensitivity_level,
          ceremonial_content: gallery.ceremony_type !== null,
          traditional_knowledge: gallery.traditional_knowledge_content,
          created_at: gallery.created_at,
          created_by: gallery.created_by,
          created_by_profile: gallery.created_by_profile,
          preview_url: gallery.cover_image?.thumbnail_url || gallery.cover_image?.public_url,
          cultural_context: gallery.cultural_context,
          requires_elder_approval: gallery.requires_elder_approval,
          cultural_review_status: gallery.cultural_review_status,
          elder_approval: gallery.elder_approval_status === 'approved'
        })))
      }

      // Process media assets
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        const assets = mediaData.assets || []
        
        items.push(...assets.map((asset: MediaAsset & { uploaded_by_profile?: any }) => ({
          id: asset.id,
          type: 'media' as const,
          title: asset.title || asset.filename,
          description: asset.description,
          cultural_sensitivity_level: asset.cultural_sensitivity_level,
          ceremonial_content: asset.ceremonial_content,
          traditional_knowledge: asset.traditional_knowledge,
          created_at: asset.created_at,
          created_by: asset.uploaded_by,
          created_by_profile: asset.uploaded_by_profile,
          preview_url: asset.thumbnail_url || asset.public_url,
          cultural_context: asset.cultural_context,
          requires_elder_approval: false, // Media assets don't have this field directly
          cultural_review_status: asset.cultural_review_status,
          elder_approval: asset.elder_approval || false
        })))
      }

      // Sort by creation date (newest first) and sensitivity level
      items.sort((a, b) => {
        // High sensitivity items first
        if (a.cultural_sensitivity_level === 'high' && b.cultural_sensitivity_level !== 'high') return -1
        if (b.cultural_sensitivity_level === 'high' && a.cultural_sensitivity_level !== 'high') return 1
        
        // Then by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setReviewItems(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canReview) {
      fetchReviewItems()
    }
  }, [canReview])

  const handleReviewAction = async (item: ReviewItem, action: 'approve' | 'reject' | 'request_changes', notes: string) => {
    if (!canReview) return

    setSubmitting(true)
    
    try {
      const endpoint = item.type === 'gallery' ? `/api/galleries/${item.id}` : `/api/media/${item.id}`
      
      const updateData = {
        cultural_review_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs_review',
        cultural_reviewer_id: user?.id,
        cultural_review_date: new Date().toISOString(),
        cultural_review_notes: notes
      }

      // For elder reviews, also update elder approval
      if (userRole === 'elder' && action === 'approve') {
        if (item.type === 'gallery') {
          (updateData as any).elder_approval_status = 'approved'
          ;(updateData as any).elder_approved_by = user?.id
          ;(updateData as any).elder_approval_date = new Date().toISOString()
        } else {
          (updateData as any).elder_approval = true
          ;(updateData as any).elder_approved_by = user?.id
          ;(updateData as any).elder_approval_date = new Date().toISOString()
        }
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Review update failed')
      }

      // Remove item from the list or update its status
      setReviewItems(prev => prev.filter(i => i.id !== item.id))
      setSelectedItem(null)
      setReviewAction(null)
      setReviewNotes('')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-grey-100 text-grey-800 border-grey-200'
    }
  }

  const getSensitivityIcon = (level: string) => {
    switch (level) {
      case 'high': return '🙏'
      case 'medium': return '🤝'
      case 'low': return '🌱'
      default: return '❓'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!canReview) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 0h12a2 2 0 012 2v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1a2 2 0 012-2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Cultural Review Access Required
        </h3>
        <p className="text-amber-700">
          Only community elders and designated cultural reviewers can access the cultural review workflow.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-grey-600">Loading items for review...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Review Items</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchReviewItems}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-grey-900">
              Cultural Review Workflow
            </h2>
            <p className="text-grey-600 mt-1">
              {userRole === 'elder' ? 'Elder Review' : 'Cultural Review'} • {reviewItems.length} items pending
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchReviewItems}
              className="px-4 py-2 text-sm border border-grey-300 rounded-md hover:bg-grey-50 transition-colours"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Review Items */}
      {reviewItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-grey-900 mb-2">All Caught Up!</h3>
          <p className="text-grey-500">
            There are no items pending cultural review at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviewItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Preview */}
              <div className="aspect-video bg-grey-100 overflow-hidden relative">
                {item.preview_url ? (
                  <Image
                    src={item.preview_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-16 h-16 text-grey-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'gallery' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'gallery' ? '📁 Gallery' : '🖼️ Photo'}
                  </span>
                </div>

                {/* Sensitivity Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSensitivityColor(item.cultural_sensitivity_level)}`}>
                    <span className="mr-1">{getSensitivityIcon(item.cultural_sensitivity_level)}</span>
                    {item.cultural_sensitivity_level} sensitivity
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-grey-900 mb-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-grey-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Cultural Context Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.ceremonial_content && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800">
                      🪶 Ceremonial
                    </span>
                  )}
                  
                  {item.traditional_knowledge && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                      📚 Traditional Knowledge
                    </span>
                  )}

                  {item.requires_elder_approval && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-amber-100 text-amber-800">
                      👵 Elder Approval Required
                    </span>
                  )}
                </div>

                {/* Submitter Info */}
                <div className="flex items-center justify-between mb-4 text-sm text-grey-500">
                  <div className="flex items-center">
                    {item.created_by_profile?.avatar_url ? (
                      <Image
                        src={item.created_by_profile.avatar_url}
                        alt=""
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-grey-300 rounded-full mr-2" />
                    )}
                    <span>{item.created_by_profile?.display_name || 'Unknown'}</span>
                  </div>
                  <span>{formatDate(item.created_at)}</span>
                </div>

                {/* Review Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setReviewAction('approve')
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colours text-sm font-medium"
                  >
                    ✓ Approve
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setReviewAction('request_changes')
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colours text-sm font-medium"
                  >
                    ⚠ Request Changes
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setReviewAction('reject')
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colours text-sm font-medium"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedItem && reviewAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-grey-900 mb-4">
                {reviewAction === 'approve' ? 'Approve Content' :
                 reviewAction === 'reject' ? 'Reject Content' :
                 'Request Changes'} - {selectedItem.title}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Review Notes
                  {reviewAction !== 'approve' && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-grey-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={
                    reviewAction === 'approve' ? 'Optional notes about the approval...' :
                    reviewAction === 'reject' ? 'Please explain why this content is being rejected...' :
                    'Please specify what changes are needed...'
                  }
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedItem(null)
                    setReviewAction(null)
                    setReviewNotes('')
                  }}
                  className="px-4 py-2 text-grey-700 border border-grey-300 rounded-md hover:bg-grey-50 transition-colours"
                  disabled={submitting}
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => handleReviewAction(selectedItem, reviewAction, reviewNotes)}
                  disabled={submitting || (reviewAction !== 'approve' && !reviewNotes.trim())}
                  className={`px-4 py-2 rounded-md text-white font-medium transition-colours disabled:opacity-50 disabled:cursor-not-allowed ${
                    reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    reviewAction === 'approve' ? 'Approve' :
                    reviewAction === 'reject' ? 'Reject' :
                    'Request Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
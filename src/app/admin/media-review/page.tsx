'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VideoReviewModal from '@/components/media/VideoReviewModal'
import AdminNavigation from '@/components/admin/AdminNavigation'
import {
  Play,
  Eye,
  Calendar,
  User,
  Clock,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  Users,
  BookOpen,
  Image,
  ArrowLeft
} from 'lucide-react'

interface MediaAsset {
  id: string
  filename: string
  file_type: string
  title?: string
  description?: string
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  cultural_review_status: 'pending' | 'approved' | 'rejected' | 'needs_review'
  consent_status: 'pending' | 'granted' | 'denied' | 'expired'
  ceremonial_content: boolean
  traditional_knowledge: boolean
  created_at: string
  uploaded_by: string
  duration?: number
  public_url?: string
  thumbnail_url?: string
  cultural_review_notes?: string
  cultural_review_date?: string
}

export default function MediaReviewPage() {
  const router = useRouter()
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const currentUser = {
    id: 'admin-user',
    display_name: 'Admin User',
    is_elder: false,
    community_roles: ['admin']
  }

  useEffect(() => {
    fetchMediaAssets()
  }, [])

  useEffect(() => {
    filterAssets()
  }, [mediaAssets, searchTerm, statusFilter, typeFilter])

  const fetchMediaAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/media?limit=100')
      if (response.ok) {
        const data = await response.json()
        setMediaAssets(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching media assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAssets = () => {
    let filtered = mediaAssets

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.cultural_review_status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.file_type === typeFilter)
    }

    setFilteredAssets(filtered)
  }

  const handleReviewAsset = (asset: MediaAsset) => {
    setSelectedAsset(asset)
    setIsReviewModalOpen(true)
  }

  const handleReviewComplete = async (decision: 'approved' | 'rejected', notes: string) => {
    console.log('Review completed:', decision, notes)
    // Refresh the data
    await fetchMediaAssets()
    setIsReviewModalOpen(false)
    setSelectedAsset(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'needs_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'needs_review': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const videoAssets = filteredAssets.filter(asset => asset.file_type === 'video')
  const pendingReview = filteredAssets.filter(asset => asset.cultural_review_status === 'pending')
  const highSensitivity = filteredAssets.filter(asset => asset.cultural_sensitivity_level === 'high')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading media assets...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation className="mb-8" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Media Review & Approval Dashboard
        </h1>
        <p className="text-gray-600">
          Review and approve media content with cultural sensitivity protocols
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Play className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{videoAssets.length}</p>
                <p className="text-gray-600">Video Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{pendingReview.length}</p>
                <p className="text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{highSensitivity.length}</p>
                <p className="text-gray-600">High Sensitivity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredAssets.length}</p>
                <p className="text-gray-600">Total Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by filename, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_review">Needs Review</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Media Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg truncate mr-2">
                  {asset.title || asset.filename}
                </CardTitle>
                <div className="flex space-x-1">
                  <Badge className={getStatusColor(asset.cultural_review_status)}>
                    {getStatusIcon(asset.cultural_review_status)}
                    <span className="ml-1 capitalize">{asset.cultural_review_status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Thumbnail */}
              {asset.thumbnail_url ? (
                <img
                  src={asset.thumbnail_url}
                  alt={asset.title || asset.filename}
                  className="w-full h-32 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="capitalize">{asset.file_type}</span>
                  {asset.duration && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getSensitivityColor(asset.cultural_sensitivity_level)}>
                    {asset.cultural_sensitivity_level} sensitivity
                  </Badge>
                  
                  {asset.ceremonial_content && (
                    <Badge variant="outline" className="border-purple-200 text-purple-800">
                      Ceremonial
                    </Badge>
                  )}
                  
                  {asset.traditional_knowledge && (
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      Traditional Knowledge
                    </Badge>
                  )}
                </div>
              </div>

              {/* Review Notes */}
              {asset.cultural_review_notes && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{asset.cultural_review_notes}</p>
                  {asset.cultural_review_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Reviewed on {new Date(asset.cultural_review_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleReviewAsset(asset)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={asset.file_type !== 'video'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Video Review Modal */}
      <VideoReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        mediaAsset={selectedAsset}
        onReviewComplete={handleReviewComplete}
        currentUser={currentUser}
      />
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import {
  Image,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Flag,
  Trash2,
  Edit,
  Upload,
  RefreshCw,
  Play,
  FileText,
  Shield,
  Volume2,
  Music,
  Users,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Zap,
  Camera,
  Video,
  X
} from 'lucide-react'
import { VideoUploader } from '@/components/media/VideoUploader'
import { VideoThumbnailSelector } from '@/components/media/VideoThumbnailSelector'

interface AdminMediaAsset {
  id: string
  filename: string
  title: string
  description: string
  fileSize: number
  mimeType: string
  width: number
  height: number
  publicUrl: string
  thumbnailUrl?: string
  optimizedUrl?: string
  uploadedBy: string
  uploaderName: string
  uploaderEmail: string
  organizationId?: string
  organizationName?: string
  visibility: 'public' | 'community' | 'private'
  consentStatus: 'pending' | 'granted' | 'denied'
  culturalSensitivityLevel: 'low' | 'medium' | 'high'
  accessCount: number
  status: 'active' | 'flagged' | 'hidden' | 'deleted'
  createdAt: string
  lastAccessedAt?: string
  galleries: Array<{
    id: string
    title: string
    slug: string
  }>
  culturalTags: string[]
  flags: {
    count: number
    reasons: string[]
    lastFlaggedAt?: string
  }
  metadata: {
    device?: string
    location?: string
    capturedAt?: string
  }
}

interface MediaResponse {
  media: AdminMediaAsset[]
  total: number
  summary: {
    total: number
    active: number
    flagged: number
    hidden: number
    totalSize: number
    publicMedia: number
    privateMedia: number
    totalViews: number
    pendingConsent: number
    highSensitivity: number
    galleryLinked: number
    totalGalleries: number
    snowFoundationPhotos: number
    deadlyHeartsPhotos: number
    unlinkedPhotos: number
  }
}

const MediaGalleryManagement: React.FC = () => {
  const [media, setMedia] = useState<AdminMediaAsset[]>([])
  const [summary, setSummary] = useState<MediaResponse['summary'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [consentFilter, setConsentFilter] = useState('all')
  const [sensitivityFilter, setSensitivityFilter] = useState('all')
  const [organizationFilter, setOrganizationFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // UI state
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMedia, setEditingMedia] = useState<AdminMediaAsset | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<AdminMediaAsset | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image')

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        visibility: visibilityFilter,
        consent: consentFilter,
        sensitivity: sensitivityFilter,
        organisation: organizationFilter
      })
      
      const response = await fetch(`/api/admin/media?${params}`)
      if (!response.ok) throw new Error('Failed to fetch media')
      
      const data: MediaResponse = await response.json()
      setMedia(data.media)
      setSummary(data.summary)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [searchTerm, statusFilter, visibilityFilter, consentFilter, sensitivityFilter, organizationFilter])

  const handleMediaAction = async (action: string, mediaId: string, data?: any) => {
    try {
      let response
      switch (action) {
        case 'edit':
          response = await fetch('/api/admin/media', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: mediaId, ...data })
          })
          break
        case 'delete':
          response = await fetch(`/api/admin/media?id=${mediaId}`, {
            method: 'DELETE'
          })
          break
      }
      
      if (response && response.ok) {
        fetchMedia()
        setShowEditModal(false)
        setEditingMedia(null)
      }
    } catch (error) {
      console.error('Error performing media action:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMediaTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Play className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'text-green-600 bg-green-100'
      case 'denied': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />
      case 'community': return <Users className="h-4 w-4" />
      default: return <Lock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading media assets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-10 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Image className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Total Media</p>
                <p className="text-lg font-semibold">{summary.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Active</p>
                <p className="text-lg font-semibold">{summary.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Flag className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Flagged</p>
                <p className="text-lg font-semibold">{summary.flagged}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Storage</p>
                <p className="text-lg font-semibold">{summary.totalSize} MB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-indigo-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Public</p>
                <p className="text-lg font-semibold">{summary.publicMedia}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-grey-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Private</p>
                <p className="text-lg font-semibold">{summary.privateMedia}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-pink-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Views</p>
                <p className="text-lg font-semibold">{summary.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Pending</p>
                <p className="text-lg font-semibold">{summary.pendingConsent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">High Sensitive</p>
                <p className="text-lg font-semibold">{summary.highSensitivity}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <EyeOff className="h-8 w-8 text-grey-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Hidden</p>
                <p className="text-lg font-semibold">{summary.hidden}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Stats Row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-700">Galleries</p>
                <p className="text-lg font-semibold text-blue-900">{summary.totalGalleries || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Image className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-700">Linked Photos</p>
                <p className="text-lg font-semibold text-green-900">{summary.galleryLinked || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-700">Snow Foundation</p>
                <p className="text-xs text-purple-600">Organization</p>
                <p className="text-lg font-semibold text-purple-900">{summary.snowFoundationPhotos || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-700">Deadly Hearts Trek</p>
                <p className="text-xs text-orange-600">Project</p>
                <p className="text-lg font-semibold text-orange-900">{summary.deadlyHeartsPhotos || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>
            
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="private">Private</option>
            </select>
            
            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Consent</option>
              <option value="granted">Granted</option>
              <option value="pending">Pending</option>
              <option value="denied">Denied</option>
            </select>
            
            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Sensitivity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Organizations</option>
              <option value="snow-foundation">Snow Foundation</option>
              <option value="deadly-hearts">Deadly Hearts Trek</option>
              <option value="empathy-ledger">Empathy Ledger</option>
            </select>
          </div>
          
          {/* View Mode & Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 bg-grey-100 text-grey-700 rounded-md hover:bg-grey-200 flex items-center gap-2"
            >
              {viewMode === 'grid' ? <div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-current"></div><div className="bg-current"></div><div className="bg-current"></div><div className="bg-current"></div></div> : <div className="w-4 h-4 flex flex-col gap-0.5"><div className="bg-current h-1"></div><div className="bg-current h-1"></div><div className="bg-current h-1"></div></div>}
              {viewMode === 'grid' ? 'Grid' : 'List'}
            </button>
            
            <button
              onClick={fetchMedia}
              className="px-4 py-2 bg-grey-100 text-grey-700 rounded-md hover:bg-grey-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Media Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {media.map((asset) => (
            <div key={asset.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Media Preview */}
              <div className="relative aspect-video bg-grey-100 rounded-t-lg overflow-hidden">
                {asset.mimeType.startsWith('image/') ? (
                  <img
                    src={asset.thumbnailUrl || asset.publicUrl}
                    alt={asset.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setPreviewMedia(asset)
                      setShowPreview(true)
                    }}
                  />
                ) : asset.mimeType.startsWith('video/') ? (
                  <div className="flex items-center justify-center h-full bg-grey-800 cursor-pointer"
                       onClick={() => {
                         setPreviewMedia(asset)
                         setShowPreview(true)
                       }}>
                    <Play className="h-12 w-12 text-white" />
                  </div>
                ) : asset.mimeType.startsWith('audio/') ? (
                  <div className="flex items-center justify-center h-full bg-blue-100 cursor-pointer"
                       onClick={() => {
                         setPreviewMedia(asset)
                         setShowPreview(true)
                       }}>
                    <Volume2 className="h-12 w-12 text-blue-600" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-grey-200">
                    <FileText className="h-12 w-12 text-grey-500" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {getVisibilityIcon(asset.visibility)}
                  {asset.flags.count > 0 && (
                    <Flag className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingMedia(asset)
                        setShowEditModal(true)
                      }}
                      className="p-1 bg-black bg-opacity-50 rounded text-white hover:bg-opacity-70"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleMediaAction('delete', asset.id)}
                      className="p-1 bg-black bg-opacity-50 rounded text-white hover:bg-opacity-70"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Media Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm truncate" title={asset.title}>
                  {asset.title}
                </h3>
                <p className="text-xs text-grey-500 truncate" title={asset.uploaderName}>
                  by {asset.uploaderName}
                </p>
                
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-grey-500">
                    {formatFileSize(asset.fileSize)}
                  </span>
                  <span className="text-grey-500">
                    {asset.accessCount} views
                  </span>
                </div>
                
                <div className="flex items-center gap-1 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${getConsentStatusColor(asset.consentStatus)}`}>
                    {asset.consentStatus}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${getSensitivityColor(asset.culturalSensitivityLevel)}`}>
                    {asset.culturalSensitivityLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-grey-200">
              <thead className="bg-grey-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-grey-200">
                {media.map((asset) => (
                  <tr key={asset.id} className="hover:bg-grey-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {asset.mimeType.startsWith('image/') ? (
                            <img
                              src={asset.thumbnailUrl || asset.publicUrl}
                              alt={asset.title}
                              className="h-12 w-12 rounded object-cover cursor-pointer"
                              onClick={() => {
                                setPreviewMedia(asset)
                                setShowPreview(true)
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-grey-200 flex items-center justify-center">
                              {getMediaTypeIcon(asset.mimeType)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-grey-900 truncate max-w-xs">
                            {asset.title}
                          </div>
                          <div className="text-sm text-grey-500">
                            {asset.filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-grey-900">{asset.uploaderName}</div>
                      <div className="text-sm text-grey-500">{asset.organizationName}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-grey-900">
                        {formatFileSize(asset.fileSize)}
                      </div>
                      <div className="text-sm text-grey-500">
                        {asset.accessCount} views
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800' :
                          asset.status === 'flagged' ? 'bg-red-100 text-red-800' :
                          'bg-grey-100 text-grey-800'
                        }`}>
                          {asset.status}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {getVisibilityIcon(asset.visibility)}
                          <span className={`px-2 py-1 text-xs rounded ${getConsentStatusColor(asset.consentStatus)}`}>
                            {asset.consentStatus}
                          </span>
                          {asset.flags.count > 0 && (
                            <span className="text-red-500 text-xs">
                              {asset.flags.count} flags
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setPreviewMedia(asset)
                            setShowPreview(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingMedia(asset)
                            setShowEditModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleMediaAction('delete', asset.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {media.length === 0 && (
        <div className="text-center py-8">
          <Image className="mx-auto h-12 w-12 text-grey-400" />
          <h3 className="mt-2 text-sm font-medium text-grey-900">No media assets found</h3>
          <p className="mt-1 text-sm text-grey-500">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMedia && (
        <div className="fixed inset-0 bg-grey-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Media Asset</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-grey-400 hover:text-grey-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const updateData = {
                title: formData.get('title'),
                description: formData.get('description'),
                visibility: formData.get('visibility'),
                consentStatus: formData.get('consentStatus'),
                culturalSensitivityLevel: formData.get('culturalSensitivityLevel'),
                status: formData.get('status'),
                altText: formData.get('altText')
              }
              handleMediaAction('edit', editingMedia.id, updateData)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingMedia.title}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Visibility</label>
                  <select
                    name="visibility"
                    defaultValue={editingMedia.visibility}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  >
                    <option value="public">Public</option>
                    <option value="community">Community</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Consent Status</label>
                  <select
                    name="consentStatus"
                    defaultValue={editingMedia.consentStatus}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="granted">Granted</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Cultural Sensitivity</label>
                  <select
                    name="culturalSensitivityLevel"
                    defaultValue={editingMedia.culturalSensitivityLevel}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingMedia.status}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-grey-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingMedia.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-grey-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    name="altText"
                    defaultValue={editingMedia.title}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-grey-700 bg-grey-100 rounded-md hover:bg-grey-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">{previewMedia.title}</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white hover:text-grey-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 max-h-[80vh] overflow-auto">
              {previewMedia.mimeType.startsWith('image/') ? (
                <img
                  src={previewMedia.publicUrl}
                  alt={previewMedia.title}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewMedia.mimeType.startsWith('video/') ? (
                <video
                  src={previewMedia.publicUrl}
                  controls
                  className="max-w-full h-auto mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              ) : previewMedia.mimeType.startsWith('audio/') ? (
                <div className="text-center py-8">
                  <Volume2 className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                  <audio
                    src={previewMedia.publicUrl}
                    controls
                    className="mx-auto"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-16 w-16 text-grey-400" />
                  <p className="mt-2 text-grey-600">Preview not available for this file type</p>
                  <a
                    href={previewMedia.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Open in new tab
                  </a>
                </div>
              )}

              <div className="mt-4 text-sm text-grey-600">
                <p><strong>Filename:</strong> {previewMedia.filename}</p>
                <p><strong>Size:</strong> {formatFileSize(previewMedia.fileSize)}</p>
                <p><strong>Dimensions:</strong> {previewMedia.width} × {previewMedia.height}</p>
                <p><strong>Uploader:</strong> {previewMedia.uploaderName}</p>
                <p><strong>Created:</strong> {new Date(previewMedia.createdAt).toLocaleString()}</p>
                {previewMedia.description && (
                  <p><strong>Description:</strong> {previewMedia.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-grey-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Upload Media</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-grey-400 hover:text-grey-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              {/* Upload Type Selector */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setUploadType('image')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    uploadType === 'image'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-grey-200 hover:border-grey-300'
                  }`}
                >
                  <Image className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Images</p>
                  <p className="text-xs text-grey-500">JPG, PNG, WebP, GIF</p>
                </button>

                <button
                  onClick={() => setUploadType('video')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    uploadType === 'video'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-grey-200 hover:border-grey-300'
                  }`}
                >
                  <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Videos</p>
                  <p className="text-xs text-grey-500">MP4, WebM, MOV</p>
                </button>
              </div>

              {/* Upload Component */}
              {uploadType === 'video' ? (
                <VideoUploader
                  onUploadComplete={(result) => {
                    console.log('Video uploaded:', result)
                    setShowUploadModal(false)
                    fetchMedia()
                  }}
                  onCancel={() => setShowUploadModal(false)}
                />
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="image-upload"
                    onChange={async (e) => {
                      const files = e.target.files
                      if (!files || files.length === 0) return

                      // Upload images to Supabase storage
                      for (const file of Array.from(files)) {
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('type', 'image')

                        try {
                          const response = await fetch('/api/media/upload', {
                            method: 'POST',
                            body: formData
                          })

                          if (response.ok) {
                            console.log('Image uploaded successfully')
                          }
                        } catch (error) {
                          console.error('Upload failed:', error)
                        }
                      }

                      setShowUploadModal(false)
                      fetchMedia()
                    }}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-grey-400 mb-4" />
                    <p className="text-lg font-medium mb-1">Drop images here or click to browse</p>
                    <p className="text-sm text-grey-500">
                      Supports: JPG, PNG, WebP, GIF up to 10MB each
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getMediaTypeIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-6 w-6" />
  } else if (mimeType.startsWith('video/')) {
    return <Play className="h-6 w-6" />
  } else if (mimeType.startsWith('audio/')) {
    return <Volume2 className="h-6 w-6" />
  } else {
    return <FileText className="h-6 w-6" />
  }
}

const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return <Globe className="h-4 w-4 text-green-500" />
    case 'community':
      return <Users className="h-4 w-4 text-blue-500" />
    case 'private':
      return <Lock className="h-4 w-4 text-grey-500" />
    default:
      return <Lock className="h-4 w-4 text-grey-500" />
  }
}

const getConsentStatusColor = (status: string) => {
  switch (status) {
    case 'granted':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'denied':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-grey-100 text-grey-800'
  }
}

const getSensitivityColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-grey-100 text-grey-800'
  }
}

export default MediaGalleryManagement
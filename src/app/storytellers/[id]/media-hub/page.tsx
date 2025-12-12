'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Download, 
  Eye, 
  EyeOff, 
  Share2, 
  Trash2, 
  Edit, 
  Filter, 
  Search, 
  Grid, 
  List, 
  BarChart3, 
  Settings, 
  Lock, 
  Globe, 
  Users, 
  Calendar,
  FileType,
  HardDrive,
  Zap,
  ArrowLeft,
  MoreVertical,
  Copy,
  ExternalLink,
  Tag,
  MapPin,
  Clock
} from 'lucide-react'

interface MediaAsset {
  id: string
  filename: string
  type: 'image' | 'video' | 'audio' | 'document'
  size: number
  url: string
  thumbnail_url?: string
  upload_date: string
  visibility: 'public' | 'private' | 'community' | 'restricted'
  usage_locations: Array<{
    type: 'story' | 'gallery' | 'profile'
    id: string
    title: string
    usage_count: number
  }>
  tags: string[]
  cultural_significance: 'none' | 'low' | 'medium' | 'high' | 'sacred'
  metadata: {
    views: number
    downloads: number
    shares: number
    location?: string
    date_taken?: string
    description?: string
  }
}

export default function MediaHub() {
  const { id } = useParams()
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterVisibility, setFilterVisibility] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Load user's actual media assets
  useEffect(() => {
    const fetchMediaAssets = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/storytellers/${id}/media`)
        if (response.ok) {
          const data = await response.json()
          setMediaAssets(data || [])
        } else {
          // If no media endpoint or error, show empty state
          setMediaAssets([])
        }
      } catch (error) {
        console.error('Error fetching media assets:', error)
        setMediaAssets([])
      } finally {
        setLoading(false)
      }
    }

    fetchMediaAssets()
  }, [id])

  const getFilteredAssets = () => {
    return mediaAssets.filter(asset => {
      const matchesSearch = asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === 'all' || asset.type === filterType
      const matchesVisibility = filterVisibility === 'all' || asset.visibility === filterVisibility
      
      return matchesSearch && matchesType && matchesVisibility
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-green-600" />
      case 'community': return <Users className="w-4 h-4 text-blue-600" />
      case 'private': return <Lock className="w-4 h-4 text-red-600" />
      case 'restricted': return <EyeOff className="w-4 h-4 text-orange-600" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getCulturalBadgeColor = (significance: string) => {
    switch (significance) {
      case 'sacred': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const filteredAssets = getFilteredAssets()
  const totalSize = mediaAssets.reduce((acc, asset) => acc + asset.size, 0)
  const totalViews = mediaAssets.reduce((acc, asset) => acc + asset.metadata.views, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p>Loading your media hub...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-grey-900 mb-2">Media Control Center</h1>
            <p className="text-grey-600">Complete control over your photos, videos, and media assets</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/storytellers/${id}/dashboard`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ImageIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{mediaAssets.length}</p>
                  <p className="text-grey-600">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HardDrive className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                  <p className="text-grey-600">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                  <p className="text-grey-600">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{mediaAssets.filter(a => a.usage_locations.length > 0).length}</p>
                  <p className="text-grey-600">In Use</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-grey-400" />
                <Input
                  placeholder="Search media by filename, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>

              {/* Visibility Filter */}
              <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Analytics Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={showAnalytics}
                  onCheckedChange={setShowAnalytics}
                />
                <label className="text-sm">Show Analytics</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <Dialog key={asset.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow group">
                    <div className="relative aspect-video bg-grey-100 rounded-t-lg overflow-hidden">
                      {asset.type === 'image' ? (
                        <img
                          src={asset.thumbnail_url || asset.url}
                          alt={asset.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : asset.type === 'video' ? (
                        <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                          <Video className="w-12 h-12 text-grey-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                          <FileType className="w-12 h-12 text-grey-400" />
                        </div>
                      )}
                      
                      {/* Overlay badges */}
                      <div className="absolute top-2 left-2">
                        {getVisibilityIcon(asset.visibility)}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className={getCulturalBadgeColor(asset.cultural_significance)} variant="secondary">
                          {asset.cultural_significance}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate mb-2">{asset.filename}</h3>
                      <div className="flex items-center justify-between text-sm text-grey-500 mb-2">
                        <span>{formatFileSize(asset.size)}</span>
                        <span>{asset.upload_date}</span>
                      </div>
                      
                      {showAnalytics && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Views: {asset.metadata.views}</span>
                            <span>Used: {asset.usage_locations.length} places</span>
                          </div>
                          {asset.usage_locations.length > 0 && (
                            <Progress 
                              value={Math.min(asset.metadata.views / 100, 100)} 
                              className="h-1"
                            />
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {asset.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {asset.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{asset.tags.length - 3}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                {/* Media Detail Modal */}
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{asset.filename}</DialogTitle>
                    <DialogDescription>
                      Media details and usage analytics
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Media Preview */}
                    <div className="space-y-4">
                      <div className="aspect-video bg-grey-100 rounded-lg overflow-hidden">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                            <Video className="w-16 h-16 text-grey-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </Button>
                      </div>
                    </div>

                    {/* Details and Analytics */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Visibility:</h4>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(asset.visibility)}
                            <span className="capitalize">{asset.visibility}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Cultural Significance:</h4>
                          <Badge className={getCulturalBadgeColor(asset.cultural_significance)}>
                            {asset.cultural_significance}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold">File Size:</h4>
                          <span>{formatFileSize(asset.size)}</span>
                        </div>
                      </div>

                      {/* Usage Analytics */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Usage Analytics</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{asset.metadata.views}</p>
                            <p className="text-sm text-grey-600">Views</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{asset.metadata.downloads}</p>
                            <p className="text-sm text-grey-600">Downloads</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-600">{asset.metadata.shares}</p>
                            <p className="text-sm text-grey-600">Shares</p>
                          </div>
                        </div>
                      </div>

                      {/* Usage Locations */}
                      {asset.usage_locations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Used In</h4>
                          <div className="space-y-2">
                            {asset.usage_locations.map((location) => (
                              <div key={location.id} className="flex items-center justify-between p-3 bg-grey-50 rounded-lg">
                                <div>
                                  <p className="font-medium">{location.title}</p>
                                  <p className="text-sm text-grey-600 capitalize">{location.type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{location.usage_count} views</p>
                                  <Button size="sm" variant="ghost" asChild>
                                    <Link href={`/${location.type}s/${location.id}`}>
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {asset.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="p-4 hover:bg-grey-50 transition-colours">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-grey-100 rounded-lg overflow-hidden flex-shrink-0">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.thumbnail_url || asset.url}
                            alt={asset.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                            <Video className="w-6 h-6 text-grey-400" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{asset.filename}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-grey-500">
                          <span>{formatFileSize(asset.size)}</span>
                          <span>{asset.upload_date}</span>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(asset.visibility)}
                            <span className="capitalize">{asset.visibility}</span>
                          </div>
                          <Badge className={getCulturalBadgeColor(asset.cultural_significance)} variant="secondary">
                            {asset.cultural_significance}
                          </Badge>
                        </div>
                      </div>

                      {/* Analytics */}
                      {showAnalytics && (
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{asset.metadata.views}</p>
                            <p className="text-grey-500">Views</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{asset.usage_locations.length}</p>
                            <p className="text-grey-500">Used</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3 ml-20">
                      {asset.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredAssets.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-grey-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-grey-900 mb-2">
                {mediaAssets.length === 0 ? 'No media uploaded yet' : 'No media found'}
              </h3>
              <p className="text-grey-600 mb-4">
                {mediaAssets.length === 0 
                  ? 'Upload photos, videos, and documents to build your media library' 
                  : 'Try adjusting your search or filters'
                }
              </p>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Media
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}
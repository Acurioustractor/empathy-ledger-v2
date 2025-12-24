'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart3,
  Eye,
  ExternalLink,
  FileImage,
  Video,
  User,
  BookOpen,
  FolderOpen,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface MediaUsageData {
  media_asset: {
    id: string
    title: string
    filename: string
  }
  usage: Array<{
    id: string
    used_in_type: 'story' | 'gallery' | 'profile' | 'project'
    used_in_id: string
    usage_context: string
    usage_role: string
    display_order: number
    view_count: number
    created_at: string
    content_details: any
  }>
  summary: {
    total_usage: number
    total_views: number
    usage_by_type: Record<string, number>
    last_used: string | null
  }
}

interface MediaUsageTrackerProps {
  mediaId: string
  className?: string
}

export default function MediaUsageTracker({ mediaId, className = '' }: MediaUsageTrackerProps) {
  const [data, setData] = useState<MediaUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/media/${mediaId}/usage`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Media not found')
        }
        if (response.status === 403) {
          throw new Error('Access denied')
        }
        throw new Error('Failed to load usage data')
      }

      const usageData = await response.json()
      setData(usageData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mediaId) {
      fetchUsageData()
    }
  }, [mediaId])

  const getUsageTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <BookOpen className="w-4 h-4" />
      case 'gallery': return <FolderOpen className="w-4 h-4" />
      case 'profile': return <User className="w-4 h-4" />
      case 'project': return <FileImage className="w-4 h-4" />
      default: return <FileImage className="w-4 h-4" />
    }
  }

  const getUsageTypeLabel = (type: string) => {
    switch (type) {
      case 'story': return 'Story'
      case 'gallery': return 'Gallery'
      case 'profile': return 'Profile'
      case 'project': return 'Project'
      default: return 'Unknown'
    }
  }

  const getUsageRoleColor = (role: string) => {
    switch (role) {
      case 'cover': return 'bg-clay-100 text-clay-800'
      case 'primary': return 'bg-sage-100 text-sage-800'
      case 'supporting': return 'bg-stone-100 text-stone-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getContentLink = (usage: MediaUsageData['usage'][0]) => {
    switch (usage.used_in_type) {
      case 'story':
        return `/stories/${usage.used_in_id}`
      case 'gallery':
        return `/galleries/${usage.used_in_id}`
      case 'profile':
        return `/storytellers/${usage.used_in_id}`
      case 'project':
        return `/projects/${usage.used_in_id}`
      default:
        return '#'
    }
  }

  const getContentTitle = (usage: MediaUsageData['usage'][0]) => {
    const details = usage.content_details
    if (!details) return 'Unknown Content'
    
    return details.title || details.display_name || `${getUsageTypeLabel(usage.used_in_type)} #${usage.used_in_id.slice(0, 8)}`
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Usage Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-stone-400 mr-2" />
            <span className="text-stone-600">Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Usage Tracking Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={fetchUsageData} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Usage Tracking
          </div>
          <Button 
            onClick={fetchUsageData} 
            variant="ghost" 
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.summary.total_usage}</div>
            <div className="text-sm text-stone-600">Total Uses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-sage-600">{data.summary.total_views}</div>
            <div className="text-sm text-stone-600">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(data.summary.usage_by_type).length}
            </div>
            <div className="text-sm text-stone-600">Content Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-clay-600">
              {data.summary.last_used ? new Date(data.summary.last_used).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-sm text-stone-600">Last Used</div>
          </div>
        </div>

        {/* Usage by Type */}
        {Object.keys(data.summary.usage_by_type).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-stone-700 mb-3">Usage by Content Type</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.summary.usage_by_type).map(([type, count]) => (
                <Badge key={type} variant="outline" className="capitalize">
                  {getUsageTypeIcon(type)}
                  <span className="ml-1">{getUsageTypeLabel(type)}: {count}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Usage List */}
        {data.usage.length === 0 ? (
          <div className="text-center py-8">
            <FileImage className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-stone-900 mb-1">No Usage Found</h3>
            <p className="text-stone-500">This media asset is not currently used in any content.</p>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-3">Where This Media is Used</h4>
            <div className="space-y-3">
              {data.usage.map((usage) => (
                <div 
                  key={usage.id}
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colours"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getUsageTypeIcon(usage.used_in_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={getContentLink(usage)}
                          className="text-sm font-medium text-stone-900 hover:text-orange-600 truncate"
                        >
                          {getContentTitle(usage)}
                        </Link>
                        <Badge className={getUsageRoleColor(usage.usage_role)}>
                          {usage.usage_role}
                        </Badge>
                      </div>
                      
                      {usage.usage_context && (
                        <p className="text-xs text-stone-600 truncate">{usage.usage_context}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-stone-500 mt-1">
                        <span className="capitalize">{getUsageTypeLabel(usage.used_in_type)}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {usage.view_count} views
                        </span>
                        <span>•</span>
                        <span>Added {new Date(usage.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={getContentLink(usage)}
                    className="flex-shrink-0 ml-2"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Info */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="text-xs text-stone-500">
            Tracking usage for: <span className="font-medium">{data.media_asset.title || data.media_asset.filename}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
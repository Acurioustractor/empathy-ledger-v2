'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  X,
  Image,
  Video,
  Play,
  FileText,
  User,
  Calendar,
  Link,
  Eye,
  Trash2
} from 'lucide-react'

interface MediaAsset {
  id: string
  filename: string
  title?: string
  file_type: string
  public_url?: string
  thumbnail_url?: string
  duration?: number
  cultural_sensitivity_level: string
  created_at: string
  uploaded_by: string
}

interface MediaUsage {
  id: string
  media_asset_id: string
  used_in_type: 'story' | 'gallery' | 'profile' | 'project' | 'transcript'
  used_in_id: string
  usage_context?: string
  usage_role?: string
  display_order: number
  view_count: number
  media_asset?: MediaAsset
}

interface MediaLinkingManagerProps {
  contentType: 'story' | 'gallery' | 'profile' | 'project' | 'transcript'
  contentId: string
  contentTitle?: string
  onMediaLinked?: (usage: MediaUsage) => void
  onMediaUnlinked?: (mediaId: string) => void
  className?: string
}

export default function MediaLinkingManager({
  contentType,
  contentId,
  contentTitle,
  onMediaLinked,
  onMediaUnlinked,
  className = ''
}: MediaLinkingManagerProps) {
  const [linkedMedia, setLinkedMedia] = useState<MediaUsage[]>([])
  const [availableMedia, setAvailableMedia] = useState<MediaAsset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('supporting')
  const [linkContext, setLinkContext] = useState('')

  useEffect(() => {
    fetchLinkedMedia()
    fetchAvailableMedia()
  }, [contentId, contentType])

  const fetchLinkedMedia = async () => {
    try {
      const response = await fetch(`/api/media/usage?used_in_type=${contentType}&used_in_id=${contentId}`)
      if (response.ok) {
        const data = await response.json()
        setLinkedMedia(data.usages || [])
      }
    } catch (error) {
      console.error('Error fetching linked media:', error)
    }
  }

  const fetchAvailableMedia = async () => {
    try {
      const response = await fetch('/api/media?limit=50')
      if (response.ok) {
        const data = await response.json()
        setAvailableMedia(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching available media:', error)
    }
  }

  const linkMedia = async (mediaAsset: MediaAsset) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/media/${mediaAsset.id}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          used_in_type: contentType,
          used_in_id: contentId,
          usage_context: linkContext || `Used in ${contentType}: ${contentTitle}`,
          usage_role: selectedRole,
          display_order: linkedMedia.length
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newUsage: MediaUsage = {
          id: data.usage.id,
          media_asset_id: mediaAsset.id,
          used_in_type: contentType,
          used_in_id: contentId,
          usage_context: linkContext,
          usage_role: selectedRole,
          display_order: linkedMedia.length,
          view_count: 0,
          media_asset: mediaAsset
        }
        
        setLinkedMedia(prev => [...prev, newUsage])
        onMediaLinked?.(newUsage)
        setIsLinkDialogOpen(false)
        setLinkContext('')
        setSelectedRole('supporting')
      }
    } catch (error) {
      console.error('Error linking media:', error)
    } finally {
      setLoading(false)
    }
  }

  const unlinkMedia = async (usage: MediaUsage) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/media/${usage.media_asset_id}/usage`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          used_in_type: contentType,
          used_in_id: contentId
        })
      })

      if (response.ok) {
        setLinkedMedia(prev => prev.filter(u => u.id !== usage.id))
        onMediaUnlinked?.(usage.media_asset_id)
      }
    } catch (error) {
      console.error('Error unlinking media:', error)
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async (mediaId: string) => {
    try {
      await fetch(`/api/media/${mediaId}/usage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          used_in_type: contentType,
          used_in_id: contentId,
          action: 'increment_view'
        })
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const getMediaIcon = (fileType: string) => {
    if (fileType.startsWith('video')) return <Video className="w-4 h-4" />
    if (fileType.startsWith('image')) return <Image className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'hero': return 'bg-clay-100 text-clay-800'
      case 'cover': return 'bg-sage-100 text-sage-800'
      case 'primary': return 'bg-green-100 text-green-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const filteredAvailableMedia = availableMedia.filter(media =>
    !linkedMedia.some(linked => linked.media_asset_id === media.id) &&
    (searchTerm === '' || 
     media.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
     media.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Linked Media ({linkedMedia.length})
        </h3>
        
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Link Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Link Media to {contentType}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search and Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Search media files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="hero">Hero Media</option>
                  <option value="cover">Cover Image</option>
                  <option value="primary">Primary Content</option>
                  <option value="supporting">Supporting Content</option>
                  <option value="attachment">Attachment</option>
                </select>
              </div>
              
              <Textarea
                placeholder="Context or caption for this media usage..."
                value={linkContext}
                onChange={(e) => setLinkContext(e.target.value)}
                rows={2}
              />
              
              {/* Available Media Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredAvailableMedia.map((media) => (
                  <Card key={media.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Media Thumbnail */}
                      <div className="aspect-video bg-stone-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                        {media.thumbnail_url ? (
                          <img 
                            src={media.thumbnail_url} 
                            alt={media.title || media.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getMediaIcon(media.file_type)
                        )}
                      </div>
                      
                      {/* Media Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm truncate">
                          {media.title || media.filename}
                        </h4>
                        
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span className="flex items-center">
                            {getMediaIcon(media.file_type)}
                            <span className="ml-1 capitalize">{media.file_type.split('/')[0]}</span>
                          </span>
                          {media.duration && (
                            <span>{Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          <Badge className={getSensitivityColor(media.cultural_sensitivity_level)} size="sm">
                            {media.cultural_sensitivity_level}
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={() => linkMedia(media)}
                          disabled={loading}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <Link className="w-3 h-3 mr-1" />
                          Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredAvailableMedia.length === 0 && (
                <div className="text-center py-8 text-stone-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No available media found</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Linked Media Grid */}
      {linkedMedia.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linkedMedia.map((usage) => (
            <Card key={usage.id}>
              <CardContent className="p-4">
                {/* Media Preview */}
                <div className="aspect-video bg-stone-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                  {usage.media_asset?.thumbnail_url ? (
                    <img 
                      src={usage.media_asset.thumbnail_url} 
                      alt={usage.media_asset.title || usage.media_asset.filename}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        incrementViewCount(usage.media_asset_id)
                        // Open media viewer
                      }}
                    />
                  ) : (
                    getMediaIcon(usage.media_asset?.file_type || 'unknown')
                  )}
                  
                  {usage.media_asset?.file_type.startsWith('video') && (
                    <Play className="absolute inset-0 w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-2" />
                  )}
                </div>
                
                {/* Media Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm truncate">
                    {usage.media_asset?.title || usage.media_asset?.filename}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center">
                      {getMediaIcon(usage.media_asset?.file_type || 'unknown')}
                      <span className="ml-1 capitalize">
                        {usage.media_asset?.file_type.split('/')[0]}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {usage.view_count}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge className={getRoleColor(usage.usage_role)} size="sm">
                      {usage.usage_role}
                    </Badge>
                    <Badge className={getSensitivityColor(usage.media_asset?.cultural_sensitivity_level || 'low')} size="sm">
                      {usage.media_asset?.cultural_sensitivity_level}
                    </Badge>
                  </div>
                  
                  {usage.usage_context && (
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {usage.usage_context}
                    </p>
                  )}
                  
                  <Button
                    onClick={() => unlinkMedia(usage)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Unlink
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-500">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No media linked yet</h3>
          <p className="text-sm">Link photos, videos, or other media to this {contentType}</p>
          <Button
            onClick={() => setIsLinkDialogOpen(true)}
            className="mt-4 bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Link First Media
          </Button>
        </div>
      )}
    </div>
  )
}
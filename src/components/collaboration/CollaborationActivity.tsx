'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Activity,
  Edit,
  FileText,
  GitCommit,
  UserPlus,
  UserX,
  Eye,
  Send,
  Clock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'edit' | 'publish' | 'unpublish' | 'comment' | 'version' | 'collaborator_added' | 'collaborator_removed' | 'view'
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
  description: string
  metadata?: Record<string, any>
  created_at: string
}

interface CollaborationActivityProps {
  storyId: string
  limit?: number
  showFilters?: boolean
  className?: string
}

export function CollaborationActivity({
  storyId,
  limit = 50,
  showFilters = false,
  className
}: CollaborationActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadActivity()
  }, [storyId, filter])

  const loadActivity = async () => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (filter !== 'all') params.set('type', filter)

      const response = await fetch(`/api/stories/${storyId}/activity?${params}`)
      if (!response.ok) throw new Error('Failed to load activity')

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Error loading activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit': return <Edit className="w-4 h-4 text-blue-600" />
      case 'publish': return <Send className="w-4 h-4 text-green-600" />
      case 'unpublish': return <FileText className="w-4 h-4 text-amber-600" />
      case 'version': return <GitCommit className="w-4 h-4 text-purple-600" />
      case 'collaborator_added': return <UserPlus className="w-4 h-4 text-[#D97757]" />
      case 'collaborator_removed': return <UserX className="w-4 h-4 text-red-600" />
      case 'view': return <Eye className="w-4 h-4 text-gray-600" />
      default: return <Activity className="w-4 h-4 text-[#2C2C2C]" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#D97757]" />
        <p className="text-sm text-[#2C2C2C]/60">Loading activity...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed">
        <Activity className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/40" />
        <p className="text-[#2C2C2C]/60">No activity yet</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-[#2C2C2C]" />
        <h3 className="font-serif text-xl font-bold">Recent Activity</h3>
        <Badge variant="secondary">{activities.length}</Badge>
      </div>

      {/* Activity Feed */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {activities.map((activity, index) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F8F6F1] flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-full bg-[#2C2C2C]/10 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.avatar_url} />
                        <AvatarFallback className="bg-[#D97757]/10 text-[#D97757] text-xs">
                          {getInitials(activity.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm text-[#2C2C2C]">
                        {activity.user.full_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#2C2C2C]/60">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(activity.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#2C2C2C]/70">
                    {activity.description}
                  </p>

                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-[#F8F6F1] rounded text-xs">
                      {activity.metadata.version_number && (
                        <span className="text-[#2C2C2C]/60">
                          Version {activity.metadata.version_number}
                        </span>
                      )}
                      {activity.metadata.changes && (
                        <span className="text-[#2C2C2C]/60">
                          {activity.metadata.changes}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

'use client'

/**
 * Story Connections Dashboard
 *
 * Shows storytellers where their stories are shared across the ACT ecosystem.
 * Designed with trauma-informed principles and cultural safety.
 *
 * ACT Philosophy Alignment:
 * - Storyteller-centric language ("Your story, your control")
 * - Gentle colors (ochre/terracotta for removal, not red)
 * - Elder authority respected (sacred content cannot be shared)
 * - Progressive disclosure (complexity shown only when needed)
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Share2,
  Eye,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryConnection {
  id: string
  storyId: string
  storyTitle: string
  siteName: string
  siteDescription: string
  sharedAt: Date
  status: 'active' | 'pending_removal' | 'removed'
  engagement: {
    views: number
    uniqueVisitors: number
  }
  culturalMarkers: string[]
  isSacred: boolean
  elderApproved: boolean
}

interface StoryConnectionsDashboardProps {
  storytellerId: string
  className?: string
}

export default function StoryConnectionsDashboard({
  storytellerId,
  className
}: StoryConnectionsDashboardProps) {
  const [connections, setConnections] = useState<StoryConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConnection, setSelectedConnection] = useState<StoryConnection | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [storytellerId])

  const fetchConnections = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/syndication/connections/${storytellerId}`)
      // const data = await response.json()

      // Mock data for PoC
      const mockData: StoryConnection[] = [
        {
          id: 'conn-1',
          storyId: 'story-1',
          storyTitle: 'My Journey to Healing',
          siteName: 'JusticeHub',
          siteDescription: 'Youth justice stories that inspire policy change',
          sharedAt: new Date('2026-01-01'),
          status: 'active',
          engagement: { views: 1247, uniqueVisitors: 892 },
          culturalMarkers: ['ceremony', 'family'],
          isSacred: false,
          elderApproved: true
        },
        {
          id: 'conn-2',
          storyId: 'story-1',
          storyTitle: 'My Journey to Healing',
          siteName: 'The Harvest',
          siteDescription: 'Community stories of growth and connection',
          sharedAt: new Date('2025-12-15'),
          status: 'active',
          engagement: { views: 423, uniqueVisitors: 301 },
          culturalMarkers: ['ceremony', 'family'],
          isSacred: false,
          elderApproved: true
        }
      ]

      setConnections(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching story connections:', error)
      setLoading(false)
    }
  }

  const handleRemoveConnection = (connection: StoryConnection) => {
    setSelectedConnection(connection)
  }

  const confirmRemoval = async () => {
    if (!selectedConnection) return

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/syndication/revoke', {
      //   method: 'POST',
      //   body: JSON.stringify({ connectionId: selectedConnection.id })
      // })

      // Update UI optimistically
      setConnections(prev =>
        prev.map(conn =>
          conn.id === selectedConnection.id
            ? { ...conn, status: 'pending_removal' as const }
            : conn
        )
      )

      setSelectedConnection(null)
    } catch (error) {
      console.error('Error removing connection:', error)
    }
  }

  const getStatusColor = (status: StoryConnection['status']) => {
    switch (status) {
      case 'active':
        return 'bg-sage-100 text-sage-800 border-sage-200'
      case 'pending_removal':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'removed':
        return 'bg-clay-100 text-clay-800 border-clay-200'
    }
  }

  const getStatusIcon = (status: StoryConnection['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />
      case 'pending_removal':
        return <Clock className="h-3 w-3" />
      case 'removed':
        return <X className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <Card className={cn("border-clay-200", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-clay-600">Loading your story connections...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedByStory = connections.reduce((acc, conn) => {
    if (!acc[conn.storyId]) {
      acc[conn.storyId] = {
        title: conn.storyTitle,
        connections: []
      }
    }
    acc[conn.storyId].connections.push(conn)
    return acc
  }, {} as Record<string, { title: string; connections: StoryConnection[] }>)

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-clay-200 bg-cream-50">
        <CardHeader>
          <CardTitle className="text-clay-900 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-clay-700" />
            Where Your Stories Live
          </CardTitle>
          <CardDescription className="text-clay-700">
            Your stories are connecting with communities across the ACT ecosystem.
            You can stop sharing anytime - your story, your control.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.keys(groupedByStory).length === 0 ? (
            <div className="text-center py-8 text-clay-600">
              <p className="mb-2">You haven't shared any stories yet.</p>
              <p className="text-sm">When you're ready, you can choose which communities to share with.</p>
            </div>
          ) : (
            Object.entries(groupedByStory).map(([storyId, { title, connections: storyConns }]) => (
              <div key={storyId} className="space-y-3">
                <h3 className="font-medium text-clay-900">{title}</h3>

                <div className="space-y-2">
                  {storyConns.map(connection => (
                    <Card
                      key={connection.id}
                      className="border-clay-200 hover:border-clay-300 transition-colors"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-clay-600" />
                              <span className="font-medium text-clay-900">
                                {connection.siteName}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", getStatusColor(connection.status))}
                              >
                                {getStatusIcon(connection.status)}
                                <span className="ml-1">
                                  {connection.status === 'active' && 'Shared'}
                                  {connection.status === 'pending_removal' && 'Removing...'}
                                  {connection.status === 'removed' && 'Removed'}
                                </span>
                              </Badge>
                            </div>

                            <p className="text-sm text-clay-700">
                              {connection.siteDescription}
                            </p>

                            {connection.culturalMarkers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {connection.culturalMarkers.map(marker => (
                                  <Badge
                                    key={marker}
                                    variant="secondary"
                                    className="text-xs bg-ochre-50 text-ochre-800 border-ochre-200"
                                  >
                                    {marker}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-clay-600">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{connection.engagement.views.toLocaleString()} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{connection.engagement.uniqueVisitors.toLocaleString()} people</span>
                              </div>
                            </div>

                            <p className="text-xs text-clay-500">
                              Shared {connection.sharedAt.toLocaleDateString('en-AU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          {connection.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveConnection(connection)}
                              className="border-ochre-300 text-ochre-800 hover:bg-ochre-50 hover:border-ochre-400"
                            >
                              Stop Sharing
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Gentle Removal Confirmation Modal */}
      {selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-ochre-200 bg-cream-50">
            <CardHeader>
              <CardTitle className="text-clay-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-ochre-600" />
                Stop Sharing This Story?
              </CardTitle>
              <CardDescription className="text-clay-700">
                Your story will be removed from {selectedConnection.siteName} within a few minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-ochre-50 border border-ochre-200 rounded-lg p-3">
                <p className="text-sm text-ochre-900 font-medium mb-1">
                  What happens next:
                </p>
                <ul className="text-sm text-ochre-800 space-y-1">
                  <li>• Your story will be removed from {selectedConnection.siteName}</li>
                  <li>• People won't be able to view it anymore</li>
                  <li>• You can share it again anytime you choose</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedConnection(null)}
                  className="flex-1 border-clay-300 text-clay-700 hover:bg-clay-50"
                >
                  Keep Sharing
                </Button>
                <Button
                  onClick={confirmRemoval}
                  className="flex-1 bg-ochre-600 hover:bg-ochre-700 text-white"
                >
                  Yes, Stop Sharing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

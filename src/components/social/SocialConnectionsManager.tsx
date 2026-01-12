'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Link2,
  Unlink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Settings
} from 'lucide-react'

interface SocialPlatform {
  id: string
  slug: string
  name: string
  icon_url?: string
  max_content_length: number
  supports_images: boolean
  supports_video: boolean
  supports_scheduling: boolean
}

interface SocialConnection {
  id: string
  organization_id: string
  platform_id: string
  platform_username?: string
  platform_profile_url?: string
  status: 'active' | 'expired' | 'revoked' | 'error'
  last_error?: string
  last_used_at?: string
  created_at: string
  platform?: SocialPlatform
}

interface SocialConnectionsManagerProps {
  organizationId: string
  organizationName?: string
}

const platformIcons: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  bluesky: Twitter, // Using Twitter icon as placeholder
  youtube: Youtube,
  facebook: Facebook
}

export default function SocialConnectionsManager({
  organizationId,
  organizationName
}: SocialConnectionsManagerProps) {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [organizationId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch platforms and connections in parallel
      const [platformsRes, connectionsRes] = await Promise.all([
        fetch('/api/admin/social-platforms'),
        fetch(`/api/admin/social-connections?organization_id=${organizationId}`)
      ])

      if (platformsRes.ok) {
        const data = await platformsRes.json()
        setPlatforms(data.platforms || [])
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Error fetching social data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConnectionForPlatform = (platformId: string): SocialConnection | undefined => {
    return connections.find(c => c.platform_id === platformId)
  }

  const handleConnect = async (platform: SocialPlatform) => {
    setConnectingPlatform(platform.slug)

    // In production, this would redirect to OAuth flow
    // For now, show a message
    alert(`OAuth connection for ${platform.name} would be initiated here.\n\nThis requires:\n1. OAuth client credentials for ${platform.name}\n2. Callback URL configuration\n3. Token storage`)

    setConnectingPlatform(null)
  }

  const handleDisconnect = async (connection: SocialConnection) => {
    if (!confirm(`Disconnect ${connection.platform?.name || 'this platform'}? This will cancel any scheduled posts.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/social-connections/${connection.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setConnections(prev => prev.filter(c => c.id !== connection.id))
      } else {
        alert('Failed to disconnect. Please try again.')
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('Failed to disconnect. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-sage-100 text-sage-700 border-sage-200"><CheckCircle className="w-3 h-3 mr-1" /> Connected</Badge>
      case 'expired':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>
      case 'error':
        return <Badge className="bg-clay-100 text-clay-700 border-clay-200"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>
      case 'revoked':
        return <Badge className="bg-stone-100 text-stone-600 border-stone-200"><Unlink className="w-3 h-3 mr-1" /> Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-sage-600" />
            <span className="ml-2 text-stone-600">Loading social connections...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Social Media Connections
        </CardTitle>
        <CardDescription>
          Connect social media accounts to publish {organizationName ? `${organizationName}'s` : 'your'} stories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map(platform => {
            const connection = getConnectionForPlatform(platform.id)
            const Icon = platformIcons[platform.slug] || Link2

            return (
              <div
                key={platform.id}
                className={`p-4 rounded-lg border ${
                  connection?.status === 'active'
                    ? 'border-sage-200 bg-sage-50/50'
                    : 'border-stone-200 bg-stone-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      connection?.status === 'active'
                        ? 'bg-sage-100'
                        : 'bg-stone-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        connection?.status === 'active'
                          ? 'text-sage-700'
                          : 'text-stone-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">{platform.name}</h4>
                      {connection?.platform_username && (
                        <p className="text-sm text-stone-600">@{connection.platform_username}</p>
                      )}
                    </div>
                  </div>
                  {connection && getStatusBadge(connection.status)}
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                  {platform.max_content_length && (
                    <span>{platform.max_content_length.toLocaleString()} chars</span>
                  )}
                  {platform.supports_images && <span>• Images</span>}
                  {platform.supports_video && <span>• Video</span>}
                  {platform.supports_scheduling && <span>• Scheduling</span>}
                </div>

                {connection?.last_error && (
                  <p className="mt-2 text-sm text-clay-600 bg-clay-50 p-2 rounded">
                    {connection.last_error}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  {connection?.status === 'active' ? (
                    <>
                      {connection.platform_profile_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={connection.platform_profile_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Profile
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-clay-600 border-clay-300 hover:bg-clay-50"
                        onClick={() => handleDisconnect(connection)}
                      >
                        <Unlink className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
                      onClick={() => handleConnect(platform)}
                      disabled={connectingPlatform === platform.slug}
                    >
                      {connectingPlatform === platform.slug ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Link2 className="w-3 h-3 mr-1" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {platforms.length === 0 && (
          <p className="text-center text-stone-500 py-8">
            No social platforms available. Contact support to enable social publishing.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sparkles, Users, Briefcase, Crown, MapPin, Heart,
  Plus, CheckCircle, AlertCircle, Star, Globe, Target
} from 'lucide-react'

/**
 * EMPATHY LEDGER - WORLD-CLASS CONNECTION MANAGER
 *
 * A sophisticated, culturally-sensitive interface for managing relationships
 * between storytellers, organisations, and projects.
 *
 * Features:
 * - Intelligent connection suggestions
 * - Cultural alignment indicators
 * - Elder wisdom recognition
 * - Cross-organizational collaboration
 * - Beautiful, intuitive design
 */

interface ConnectionManagerProps {
  storytellerId: string
  storytellerName: string
}

interface ConnectionSuggestion {
  targetId: string
  targetName: string
  targetType: 'organisation' | 'project'
  matchScore: number
  matchReasons: string[]
  suggestedRole: string
  culturalAlignment: boolean
  geographicalProximity: boolean
  priorityLevel: 'high' | 'medium' | 'low'
}

interface ExistingConnection {
  id: string
  type: 'organisation' | 'project'
  name: string
  role: string
  culturalAuthority: boolean
  connectedAt: string
}

export default function ConnectionManager({ storytellerId, storytellerName }: ConnectionManagerProps) {
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([])
  const [connections, setConnections] = useState<ExistingConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)

  useEffect(() => {
    loadConnectionData()
  }, [storytellerId])

  const loadConnectionData = async () => {
    setLoading(true)
    try {
      const [suggestionsRes, connectionsRes] = await Promise.all([
        fetch(`/api/admin/connections/suggest?storyteller_id=${storytellerId}`),
        fetch(`/api/admin/connections?storyteller_id=${storytellerId}`)
      ])

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json()
        setSuggestions(suggestionsData.suggestions || [])
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json()
        const allConnections = [
          ...(connectionsData.connections.organisations || []).map((c: any) => ({
            id: c.id,
            type: 'organisation' as const,
            name: c.organisation.name,
            role: c.role,
            culturalAuthority: c.cultural_authority,
            connectedAt: c.connected_at
          })),
          ...(connectionsData.connections.projects || []).map((c: any) => ({
            id: c.id,
            type: 'project' as const,
            name: c.project.name,
            role: c.role,
            culturalAuthority: c.cultural_authority,
            connectedAt: c.joined_at
          }))
        ]
        setConnections(allConnections)
      }
    } catch (error) {
      console.error('Failed to load connection data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createConnection = async (suggestion: ConnectionSuggestion) => {
    setCreating(suggestion.targetId)
    try {
      const response = await fetch('/api/admin/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId,
          targetType: suggestion.targetType,
          targetId: suggestion.targetId,
          role: suggestion.suggestedRole,
          culturalAuthority: suggestion.culturalAlignment && suggestion.priorityLevel === 'high'
        })
      })

      if (response.ok) {
        // Remove suggestion and reload connections
        setSuggestions(prev => prev.filter(s => s.targetId !== suggestion.targetId))
        await loadConnectionData()
      } else {
        const error = await response.json()
        console.error('Connection creation failed:', error)
      }
    } catch (error) {
      console.error('Failed to create connection:', error)
    } finally {
      setCreating(null)
    }
  }

  const getPriorityIcon = (level: string) => {
    switch (level) {
      case 'high': return <Star className="w-4 h-4 text-yellow-500" />
      case 'medium': return <Target className="w-4 h-4 text-sage-500" />
      default: return <Globe className="w-4 h-4 text-stone-400" />
    }
  }

  const getRoleIcon = (role: string) => {
    if (role.includes('elder') || role.includes('cultural')) {
      return <Crown className="w-4 h-4 text-clay-600" />
    }
    if (role.includes('admin') || role.includes('lead')) {
      return <Star className="w-4 h-4 text-yellow-600" />
    }
    return <Users className="w-4 h-4 text-sage-600" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-sage-600 animate-spin" />
          <h2 className="text-2xl font-bold">Loading Connection Intelligence...</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sage-500 to-clay-600 rounded-xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-stone-900">Connection Manager</h2>
            <p className="text-stone-600">
              Intelligent relationship management for <span className="font-semibold">{storytellerName}</span>
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-sage-50 text-sage-700 border-sage-200">
          <Heart className="w-3 h-3 mr-1" />
          Culturally Sensitive
        </Badge>
      </div>

      {/* Existing Connections */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Current Connections ({connections.length})
            </CardTitle>
            <CardDescription>
              Active relationships across organisations and projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(connection.role)}
                    <div>
                      <h4 className="font-semibold text-stone-900">{connection.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Badge variant="secondary" className="text-xs">
                          {connection.type}
                        </Badge>
                        <span>{connection.role}</span>
                        {connection.culturalAuthority && (
                          <Badge variant="outline" className="text-xs border-clay-200 text-clay-700">
                            <Crown className="w-3 h-3 mr-1" />
                            Cultural Authority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-stone-500">
                    Connected {new Date(connection.connectedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intelligent Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage-600" />
            Intelligent Suggestions ({suggestions.length})
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on cultural alignment, skills, and community needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No new connection suggestions at this time</p>
              <p className="text-sm">All suitable connections may already be established</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.targetId}
                  className={`p-6 border rounded-lg transition-all hover:shadow-md ${
                    suggestion.priorityLevel === 'high'
                      ? 'border-yellow-200 bg-yellow-50'
                      : suggestion.priorityLevel === 'medium'
                      ? 'border-sage-200 bg-sage-50'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getPriorityIcon(suggestion.priorityLevel)}
                        <h4 className="font-semibold text-lg">{suggestion.targetName}</h4>
                        <Badge variant="outline">
                          {suggestion.targetType}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-stone-600">
                          <span className="font-medium">{suggestion.matchScore}%</span>
                          <span>match</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {suggestion.matchReasons.map((reason, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-stone-700">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {reason}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={suggestion.culturalAlignment ? 'bg-clay-100 text-clay-700' : ''}
                        >
                          {suggestion.culturalAlignment ? (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              Cultural Alignment
                            </>
                          ) : (
                            'General Match'
                          )}
                        </Badge>

                        {suggestion.geographicalProximity && (
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            <MapPin className="w-3 h-3 mr-1" />
                            Geographic Proximity
                          </Badge>
                        )}

                        <Badge variant="outline" className="text-xs">
                          Suggested Role: {suggestion.suggestedRole}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={() => createConnection(suggestion)}
                      disabled={creating === suggestion.targetId}
                      className="ml-4"
                      size="sm"
                    >
                      {creating === suggestion.targetId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Connecting...
                        </div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
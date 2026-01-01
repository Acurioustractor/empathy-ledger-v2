'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  MapPin,
  Heart,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Globe,
  BookOpen,
  UserPlus
} from 'lucide-react'

interface NetworkConnectionsProps {
  storytellerId: string
  className?: string
  showRecommendations?: boolean
}

export function NetworkConnections({
  storytellerId,
  className,
  showRecommendations = true
}: NetworkConnectionsProps) {
  // Mock data for now - this will be replaced with real hook
  const connections = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      location: 'Darwin, NT',
      sharedThemes: ['Health & Healing', 'Community Leadership'],
      connectionStrength: 0.85,
      connectionType: 'thematic',
      reason: 'Both focus on community health initiatives',
      storiesCount: 8
    },
    {
      id: '2',
      name: 'Robert Williams',
      location: 'Katherine, NT',
      sharedThemes: ['Cultural Heritage', 'Youth Empowerment'],
      connectionStrength: 0.72,
      connectionType: 'geographic',
      reason: 'Works in the same region with similar cultural focus',
      storiesCount: 12
    },
    {
      id: '3',
      name: 'Dr. Jennifer Lee',
      location: 'Alice Springs, NT',
      sharedThemes: ['Professional Journey', 'Health & Healing'],
      connectionStrength: 0.68,
      connectionType: 'professional',
      reason: 'Similar professional background in healthcare',
      storiesCount: 5
    }
  ]

  const recommendations = [
    {
      id: '4',
      name: 'Mary Johnson',
      location: 'Tennant Creek, NT',
      sharedThemes: ['Family Legacy', 'Cultural Heritage'],
      connectionStrength: 0.78,
      reason: 'Strong narrative similarity in family stories',
      isRecommendation: true
    },
    {
      id: '5',
      name: 'James Thompson',
      location: 'Nhulunbuy, NT',
      sharedThemes: ['Community Leadership', 'Youth Empowerment'],
      connectionStrength: 0.65,
      reason: 'Similar community engagement patterns',
      isRecommendation: true
    }
  ]

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'thematic':
        return 'bg-purple-100 text-purple-700'
      case 'geographic':
        return 'bg-green-100 text-green-700'
      case 'professional':
        return 'bg-blue-100 text-blue-700'
      case 'cultural':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-grey-100 text-grey-700'
    }
  }

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'thematic':
        return <Sparkles className="h-4 w-4" />
      case 'geographic':
        return <MapPin className="h-4 w-4" />
      case 'professional':
        return <BookOpen className="h-4 w-4" />
      case 'cultural':
        return <Globe className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Network ({connections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </div>
          ) : (
            <div className="text-center text-grey-500 py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <Typography variant="body">No connections yet</Typography>
              <Typography variant="small" className="text-grey-400">
                Connect with other storytellers to build your network
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recommended Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Network Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Typography variant="h3" className="text-2xl font-bold text-blue-600">
                {connections.length}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Active Connections
              </Typography>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Typography variant="h3" className="text-2xl font-bold text-green-600">
                {Math.round(connections.reduce((sum, c) => sum + c.connectionStrength, 0) / connections.length * 100) || 0}%
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Avg. Connection Strength
              </Typography>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Typography variant="h3" className="text-2xl font-bold text-purple-600">
                {[...new Set(connections.flatMap(c => c.sharedThemes))].length}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Shared Themes
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ConnectionCardProps {
  connection: {
    id: string
    name: string
    location: string
    sharedThemes: string[]
    connectionStrength: number
    connectionType: string
    reason: string
    storiesCount: number
  }
}

function ConnectionCard({ connection }: ConnectionCardProps) {
  return (
    <div className="p-4 border border-grey-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Typography variant="h4" className="font-semibold">
              {connection.name}
            </Typography>
            <Badge
              variant="secondary"
              className={`text-xs ${getConnectionTypeColor(connection.connectionType)}`}
            >
              <span className="flex items-center gap-1">
                {getConnectionIcon(connection.connectionType)}
                {connection.connectionType}
              </span>
            </Badge>
          </div>

          <div className="flex items-center gap-1 mb-2 text-grey-600">
            <MapPin className="h-3 w-3" />
            <Typography variant="small">{connection.location}</Typography>
            <span className="mx-2">•</span>
            <BookOpen className="h-3 w-3" />
            <Typography variant="small">{connection.storiesCount} stories</Typography>
          </div>

          <Typography variant="small" className="text-grey-600 mb-3">
            {connection.reason}
          </Typography>

          <div className="flex flex-wrap gap-1 mb-3">
            {connection.sharedThemes.map(theme => (
              <Badge key={theme} variant="outline" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="small" className="text-grey-500">
                Connection strength:
              </Typography>
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-grey-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${connection.connectionStrength * 100}%` }}
                  />
                </div>
                <Typography variant="small" className="text-grey-600 min-w-[2.5rem]">
                  {Math.round(connection.connectionStrength * 100)}%
                </Typography>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: {
    id: string
    name: string
    location: string
    sharedThemes: string[]
    connectionStrength: number
    reason: string
    isRecommendation: boolean
  }
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Typography variant="h4" className="font-semibold">
              {recommendation.name}
            </Typography>
            <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
              Recommended
            </Badge>
          </div>

          <div className="flex items-center gap-1 mb-2 text-grey-600">
            <MapPin className="h-3 w-3" />
            <Typography variant="small">{recommendation.location}</Typography>
          </div>

          <Typography variant="small" className="text-grey-600 mb-3">
            {recommendation.reason}
          </Typography>

          <div className="flex flex-wrap gap-1 mb-3">
            {recommendation.sharedThemes.map(theme => (
              <Badge key={theme} variant="outline" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="small" className="text-grey-500">
                Similarity:
              </Typography>
              <Typography variant="small" className="text-blue-600 font-medium">
                {Math.round(recommendation.connectionStrength * 100)}% match
              </Typography>
            </div>

            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Connect
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getConnectionTypeColor(type: string) {
  switch (type) {
    case 'thematic':
      return 'bg-purple-100 text-purple-700'
    case 'geographic':
      return 'bg-green-100 text-green-700'
    case 'professional':
      return 'bg-blue-100 text-blue-700'
    case 'cultural':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-grey-100 text-grey-700'
  }
}

function getConnectionIcon(type: string) {
  switch (type) {
    case 'thematic':
      return <Sparkles className="h-4 w-4" />
    case 'geographic':
      return <MapPin className="h-4 w-4" />
    case 'professional':
      return <BookOpen className="h-4 w-4" />
    case 'cultural':
      return <Globe className="h-4 w-4" />
    default:
      return <Users className="h-4 w-4" />
  }
}
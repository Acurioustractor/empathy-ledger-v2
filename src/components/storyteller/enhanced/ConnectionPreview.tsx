'use client'

import React from 'react'
import Link from 'next/link'
import { Users, ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export interface ConnectionData {
  id: string
  display_name: string
  avatar_url?: string
  connection_type: 'narrative_similarity' | 'geographic' | 'thematic' | 'cultural' | 'professional' | 'generational' | 'experiential' | 'collaborative'
  connection_strength: number
  shared_themes?: string[]
  shared_locations?: string[]
  potential_collaboration_areas?: string[]
  theme_similarity_score?: number
  geographic_proximity_score?: number
  cultural_similarity_score?: number
}

export interface ConnectionPreviewProps {
  connections: ConnectionData[]
  maxDisplay?: number
  showStrength?: boolean
  onConnectionClick?: (connection: ConnectionData) => void
  onViewAllClick?: () => void
  className?: string
}

/**
 * ConnectionPreview - Preview of storyteller connections with strength indicators
 *
 * Features:
 * - Top connections by strength
 * - Connection type badges
 * - Shared themes display
 * - Strength visualization
 * - Click to view profile
 * - Hover details
 *
 * Usage:
 * <ConnectionPreview
 *   connections={storytellerConnections}
 *   maxDisplay={3}
 *   showStrength={true}
 * />
 */
export function ConnectionPreview({
  connections,
  maxDisplay = 3,
  showStrength = true,
  onConnectionClick,
  onViewAllClick,
  className
}: ConnectionPreviewProps) {
  if (!connections || connections.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20', className)}>
        <Users className="w-10 h-10 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No connections yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Share stories to discover connections</p>
      </div>
    )
  }

  // Sort by connection strength and limit
  const topConnections = [...connections]
    .sort((a, b) => b.connection_strength - a.connection_strength)
    .slice(0, maxDisplay)

  const getConnectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      narrative_similarity: 'Similar Stories',
      geographic: 'Geographic',
      thematic: 'Shared Themes',
      cultural: 'Cultural',
      professional: 'Professional',
      generational: 'Generational',
      experiential: 'Life Experience',
      collaborative: 'Collaborator'
    }
    return labels[type] || type
  }

  const getConnectionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      narrative_similarity: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      geographic: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      thematic: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      cultural: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      professional: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400',
      generational: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
      experiential: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
      collaborative: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
    }
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-green-500'
    if (strength >= 0.6) return 'bg-blue-500'
    if (strength >= 0.4) return 'bg-amber-500'
    return 'bg-gray-400'
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Top Connections</h3>
        </div>
        {connections.length > maxDisplay && onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all {connections.length}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Connection cards */}
      <div className="space-y-2">
        {topConnections.map((connection) => (
          <div
            key={connection.id}
            onClick={() => onConnectionClick && onConnectionClick(connection)}
            className="group relative bg-background border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
          >
            {/* Strength indicator */}
            {showStrength && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[0.25, 0.5, 0.75, 1].map((threshold) => (
                      <div
                        key={threshold}
                        className={cn(
                          'w-1 h-4 rounded-full',
                          connection.connection_strength >= threshold
                            ? getStrengthColor(connection.connection_strength)
                            : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground ml-1">
                    {Math.round(connection.connection_strength * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Avatar and info */}
            <div className="flex items-start gap-3 pr-20">
              <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                <AvatarImage src={connection.avatar_url} alt={connection.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                  {getInitials(connection.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {connection.display_name}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className={cn('text-xs', getConnectionTypeColor(connection.connection_type))}>
                    {getConnectionTypeLabel(connection.connection_type)}
                  </Badge>
                </div>

                {/* Shared themes */}
                {connection.shared_themes && connection.shared_themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Sparkles className="w-3 h-3 text-muted-foreground mt-0.5" />
                    {connection.shared_themes.slice(0, 2).map((theme, index) => (
                      <span key={index} className="text-xs text-muted-foreground">
                        {theme}{index < Math.min(connection.shared_themes!.length - 1, 1) ? ',' : ''}
                      </span>
                    ))}
                    {connection.shared_themes.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{connection.shared_themes.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Shared location */}
                {connection.shared_locations && connection.shared_locations.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {connection.shared_locations[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover tooltip for collaboration areas */}
            {connection.potential_collaboration_areas && connection.potential_collaboration_areas.length > 0 && (
              <div className="absolute left-0 right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-background border border-border rounded-lg shadow-xl p-3 mx-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Collaboration Opportunities</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {connection.potential_collaboration_areas.map((area, index) => (
                      <li key={index}>• {area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ConnectionPreviewCompact - Ultra-compact connection display
 */
export function ConnectionPreviewCompact({
  connections,
  maxDisplay = 5,
  className
}: Pick<ConnectionPreviewProps, 'connections' | 'maxDisplay' | 'className'>) {
  if (!connections || connections.length === 0) return null

  const topConnections = connections
    .sort((a, b) => b.connection_strength - a.connection_strength)
    .slice(0, maxDisplay)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Users className="w-4 h-4 text-muted-foreground" />
      <div className="flex -space-x-2">
        {topConnections.map((connection) => (
          <Avatar key={connection.id} className="w-8 h-8 border-2 border-background shadow-sm">
            <AvatarImage src={connection.avatar_url} alt={connection.display_name} />
            <AvatarFallback className="text-xs">
              {connection.display_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {connections.length} connection{connections.length !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

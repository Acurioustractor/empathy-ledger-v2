'use client'

// REAL-TIME INDIGENOUS IMPACT NOTIFICATIONS
// Shows live updates when new community insights are processed

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useImpactEvents } from '@/lib/hooks/useImpactEvents'
import { ImpactEvent } from '@/lib/websocket/impact-events'
import { X, Users, User, Globe, Sparkles } from 'lucide-react'

interface NotificationProps {
  organizationId?: string
  storytellerId?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxNotifications?: number
}

export function RealTimeImpactNotifications({
  organizationId,
  storytellerId,
  position = 'top-right',
  maxNotifications = 5
}: NotificationProps) {
  const { lastEvent, eventCounts } = useImpactEvents({ organizationId, storytellerId })
  const [visibleNotifications, setVisibleNotifications] = useState<ImpactEvent[]>([])

  useEffect(() => {
    if (lastEvent) {
      setVisibleNotifications(prev => {
        const newNotifications = [lastEvent, ...prev].slice(0, maxNotifications)
        return newNotifications
      })

      // Auto-remove notification after 8 seconds
      setTimeout(() => {
        setVisibleNotifications(prev => prev.filter(n => n !== lastEvent))
      }, 8000)
    }
  }, [lastEvent, maxNotifications])

  const removeNotification = (event: ImpactEvent) => {
    setVisibleNotifications(prev => prev.filter(n => n !== event))
  }

  const getPositionClasses = () => {
    const base = 'fixed z-50 space-y-3'
    switch (position) {
      case 'top-right':
        return `${base} top-4 right-4`
      case 'top-left':
        return `${base} top-4 left-4`
      case 'bottom-right':
        return `${base} bottom-4 right-4`
      case 'bottom-left':
        return `${base} bottom-4 left-4`
      default:
        return `${base} top-4 right-4`
    }
  }

  return (
    <div className={getPositionClasses()}>
      <AnimatePresence>
        {visibleNotifications.map((event, index) => (
          <NotificationCard
            key={`${event.timestamp}-${index}`}
            event={event}
            onRemove={() => removeNotification(event)}
          />
        ))}
      </AnimatePresence>

      {/* Event counts indicator */}
      {Object.values(eventCounts).some(count => count > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>
              {eventCounts.impact_insight_created + eventCounts.profile_metrics_updated +
               eventCounts.organization_metrics_updated + eventCounts.site_metrics_updated} live updates
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function NotificationCard({ event, onRemove }: { event: ImpactEvent; onRemove: () => void }) {
  const getEventIcon = () => {
    switch (event.type) {
      case 'impact_insight_created':
        return <Sparkles className="w-5 h-5 text-green-600" />
      case 'profile_metrics_updated':
        return <User className="w-5 h-5 text-blue-600" />
      case 'organization_metrics_updated':
        return <Users className="w-5 h-5 text-purple-600" />
      case 'site_metrics_updated':
        return <Globe className="w-5 h-5 text-orange-600" />
    }
  }

  const getEventTitle = () => {
    switch (event.type) {
      case 'impact_insight_created':
        return 'New Indigenous Impact Insight'
      case 'profile_metrics_updated':
        return 'Storyteller Impact Updated'
      case 'organization_metrics_updated':
        return 'Organization Impact Updated'
      case 'site_metrics_updated':
        return 'Global Impact Metrics Updated'
    }
  }

  const getEventMessage = () => {
    switch (event.type) {
      case 'impact_insight_created':
        return `${event.data.impactType} insight detected from ${event.data.storytellerName}`

      case 'profile_metrics_updated':
        const metrics = event.data.metrics
        return `${metrics.totalInsights} total insights • ${metrics.primaryImpactType} focus`

      case 'organization_metrics_updated':
        const orgMetrics = event.data.metrics
        return `${orgMetrics.totalInsights} insights • ${orgMetrics.uniqueStorytellers} storytellers`

      case 'site_metrics_updated':
        const globalMetrics = event.data.globalMetrics
        return `${globalMetrics.totalInsights} global insights • ${globalMetrics.totalStorytellers} storytellers`
    }
  }

  const getEventColor = () => {
    switch (event.type) {
      case 'impact_insight_created':
        return 'border-green-200 bg-green-50'
      case 'profile_metrics_updated':
        return 'border-blue-200 bg-blue-50'
      case 'organization_metrics_updated':
        return 'border-purple-200 bg-purple-50'
      case 'site_metrics_updated':
        return 'border-orange-200 bg-orange-50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`
        w-80 p-4 rounded-lg shadow-lg border-2 ${getEventColor()}
        backdrop-blur-sm bg-opacity-95
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getEventIcon()}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-grey-900 text-sm">
              {getEventTitle()}
            </h4>

            <p className="text-grey-700 text-xs mt-1 line-clamp-2">
              {getEventMessage()}
            </p>

            {/* Show confidence score for insights */}
            {event.type === 'impact_insight_created' && event.data.insight.confidence && (
              <div className="mt-2 flex items-center gap-2">
                <div className="bg-white px-2 py-1 rounded text-xs font-medium">
                  {Math.round(event.data.insight.confidence * 100)}% confidence
                </div>
                {event.data.insight.culturalSensitivity === 'high' && (
                  <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                    High Cultural Sensitivity
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-grey-500 mt-2">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="text-grey-400 hover:text-grey-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Specialized notification components
export function StorytellerImpactNotifications({ storytellerId }: { storytellerId: string }) {
  return (
    <RealTimeImpactNotifications
      storytellerId={storytellerId}
      position="top-right"
      maxNotifications={3}
    />
  )
}

export function OrganizationImpactNotifications({ organizationId }: { organizationId: string }) {
  return (
    <RealTimeImpactNotifications
      organizationId={organizationId}
      position="top-right"
      maxNotifications={4}
    />
  )
}

export function GlobalImpactNotifications() {
  return (
    <RealTimeImpactNotifications
      position="bottom-right"
      maxNotifications={3}
    />
  )
}
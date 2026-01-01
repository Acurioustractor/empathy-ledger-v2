// REACT HOOK FOR REAL-TIME INDIGENOUS IMPACT UPDATES
// Allows dashboard components to receive live updates when insights are processed

import { useEffect, useState, useCallback } from 'react'
import { ImpactEvent, impactEvents } from '@/lib/websocket/impact-events'

interface UseImpactEventsOptions {
  eventTypes?: ImpactEvent['type'][]
  organizationId?: string
  storytellerId?: string
}

interface ImpactEventsState {
  lastEvent: ImpactEvent | null
  events: ImpactEvent[]
  isConnected: boolean
  eventCounts: Record<ImpactEvent['type'], number>
}

export function useImpactEvents(options: UseImpactEventsOptions = {}) {
  const [state, setState] = useState<ImpactEventsState>({
    lastEvent: null,
    events: [],
    isConnected: true,
    eventCounts: {
      'impact_insight_created': 0,
      'profile_metrics_updated': 0,
      'organization_metrics_updated': 0,
      'site_metrics_updated': 0
    }
  })

  const handleEvent = useCallback((event: ImpactEvent) => {
    // Filter by organisation if specified
    if (options.organizationId) {
      const orgId = getOrganizationIdFromEvent(event)
      if (orgId && orgId !== options.organizationId) {
        return
      }
    }

    // Filter by storyteller if specified
    if (options.storytellerId) {
      const storytellerId = getStorytellerIdFromEvent(event)
      if (storytellerId && storytellerId !== options.storytellerId) {
        return
      }
    }

    setState(prev => ({
      ...prev,
      lastEvent: event,
      events: [event, ...prev.events].slice(0, 50), // Keep last 50 events
      eventCounts: {
        ...prev.eventCounts,
        [event.type]: prev.eventCounts[event.type] + 1
      }
    }))
  }, [options.organizationId, options.storytellerId])

  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = []

    if (options.eventTypes && options.eventTypes.length > 0) {
      // Subscribe to specific event types
      options.eventTypes.forEach(eventType => {
        const unsubscribe = impactEvents.subscribe(eventType, handleEvent)
        unsubscribeFunctions.push(unsubscribe)
      })
    } else {
      // Subscribe to all events
      const unsubscribe = impactEvents.subscribeToAll(handleEvent)
      unsubscribeFunctions.push(unsubscribe)
    }

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub())
    }
  }, [handleEvent, options.eventTypes])

  // Convenience methods for specific event types
  const getLatestInsightEvents = useCallback(() => {
    return state.events.filter(e => e.type === 'impact_insight_created')
  }, [state.events])

  const getLatestProfileUpdates = useCallback(() => {
    return state.events.filter(e => e.type === 'profile_metrics_updated')
  }, [state.events])

  const getLatestOrganizationUpdates = useCallback(() => {
    return state.events.filter(e => e.type === 'organization_metrics_updated')
  }, [state.events])

  const clearEvents = useCallback(() => {
    setState(prev => ({
      ...prev,
      events: [],
      eventCounts: {
        'impact_insight_created': 0,
        'profile_metrics_updated': 0,
        'organization_metrics_updated': 0,
        'site_metrics_updated': 0
      }
    }))
  }, [])

  return {
    ...state,
    getLatestInsightEvents,
    getLatestProfileUpdates,
    getLatestOrganizationUpdates,
    clearEvents
  }
}

// Specialized hooks for specific use cases
export function useStorytellerImpactEvents(storytellerId: string) {
  return useImpactEvents({
    storytellerId,
    eventTypes: ['impact_insight_created', 'profile_metrics_updated']
  })
}

export function useOrganizationImpactEvents(organizationId: string) {
  return useImpactEvents({
    organizationId,
    eventTypes: ['impact_insight_created', 'profile_metrics_updated', 'organization_metrics_updated']
  })
}

export function useSiteWideImpactEvents() {
  return useImpactEvents({
    eventTypes: ['site_metrics_updated']
  })
}

// Helper functions to extract IDs from events
function getOrganizationIdFromEvent(event: ImpactEvent): string | null {
  switch (event.type) {
    case 'impact_insight_created':
      return event.data.organizationId
    case 'profile_metrics_updated':
      return event.data.organizationId
    case 'organization_metrics_updated':
      return event.data.organizationId
    default:
      return null
  }
}

function getStorytellerIdFromEvent(event: ImpactEvent): string | null {
  switch (event.type) {
    case 'impact_insight_created':
      return event.data.storytellerId
    case 'profile_metrics_updated':
      return event.data.storytellerId
    default:
      return null
  }
}
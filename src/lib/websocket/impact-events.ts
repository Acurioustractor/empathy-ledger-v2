// REAL-TIME INDIGENOUS IMPACT EVENTS SYSTEM
// Pushes live updates to dashboards when new insights are processed

export interface ImpactEvent {
  type: 'impact_insight_created' | 'profile_metrics_updated' | 'organization_metrics_updated' | 'site_metrics_updated'
  timestamp: string
  data: any
}

export interface ImpactInsightCreatedEvent extends ImpactEvent {
  type: 'impact_insight_created'
  data: {
    transcriptId: string
    storytellerId: string
    organizationId: string | null
    insight: {
      impactType: string
      quote: string
      confidence: number
      culturalSensitivity: string
    }
    storytellerName: string
    organizationName: string | null
  }
}

export interface ProfileMetricsUpdatedEvent extends ImpactEvent {
  type: 'profile_metrics_updated'
  data: {
    storytellerId: string
    storytellerName: string
    organizationId: string | null
    metrics: {
      totalInsights: number
      primaryImpactType: string
      confidenceScore: number
      newBadges: string[]
      rankingChange: number | null
    }
  }
}

export interface OrganizationMetricsUpdatedEvent extends ImpactEvent {
  type: 'organization_metrics_updated'
  data: {
    organizationId: string
    organizationName: string
    metrics: {
      totalInsights: number
      uniqueStorytellers: number
      topImpactAreas: string[]
      avgConfidenceScore: number
      rankingChange: number | null
    }
  }
}

export interface SiteMetricsUpdatedEvent extends ImpactEvent {
  type: 'site_metrics_updated'
  data: {
    globalMetrics: {
      totalInsights: number
      totalStorytellers: number
      totalOrganizations: number
      topTrendingImpactTypes: string[]
      averageConfidence: number
    }
  }
}

export class ImpactEventsManager {
  private static instance: ImpactEventsManager
  private subscribers: Map<string, Set<(event: ImpactEvent) => void>> = new Map()

  private constructor() {}

  static getInstance(): ImpactEventsManager {
    if (!ImpactEventsManager.instance) {
      ImpactEventsManager.instance = new ImpactEventsManager()
    }
    return ImpactEventsManager.instance
  }

  // Subscribe to specific event types
  subscribe(eventType: ImpactEvent['type'], callback: (event: ImpactEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }

    const callbacks = this.subscribers.get(eventType)!
    callbacks.add(callback)

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.subscribers.delete(eventType)
      }
    }
  }

  // Subscribe to all events
  subscribeToAll(callback: (event: ImpactEvent) => void): () => void {
    const unsubscribeFunctions = [
      'impact_insight_created',
      'profile_metrics_updated',
      'organization_metrics_updated',
      'site_metrics_updated'
    ].map(eventType =>
      this.subscribe(eventType as ImpactEvent['type'], callback)
    )

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub())
    }
  }

  // Emit events to subscribers
  emit(event: ImpactEvent): void {
    const callbacks = this.subscribers.get(event.type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('Error in impact event callback:', error)
        }
      })
    }

    // Also emit to global subscribers
    const allCallbacks = this.subscribers.get('*' as any)
    if (allCallbacks) {
      allCallbacks.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('Error in global impact event callback:', error)
        }
      })
    }
  }

  // Convenience methods for emitting specific event types
  emitInsightCreated(data: ImpactInsightCreatedEvent['data']): void {
    this.emit({
      type: 'impact_insight_created',
      timestamp: new Date().toISOString(),
      data
    })
  }

  emitProfileMetricsUpdated(data: ProfileMetricsUpdatedEvent['data']): void {
    this.emit({
      type: 'profile_metrics_updated',
      timestamp: new Date().toISOString(),
      data
    })
  }

  emitOrganizationMetricsUpdated(data: OrganizationMetricsUpdatedEvent['data']): void {
    this.emit({
      type: 'organization_metrics_updated',
      timestamp: new Date().toISOString(),
      data
    })
  }

  emitSiteMetricsUpdated(data: SiteMetricsUpdatedEvent['data']): void {
    this.emit({
      type: 'site_metrics_updated',
      timestamp: new Date().toISOString(),
      data
    })
  }
}

// Export singleton instance
export const impactEvents = ImpactEventsManager.getInstance()
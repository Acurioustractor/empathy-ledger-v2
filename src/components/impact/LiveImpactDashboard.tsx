'use client'

// LIVE INDIGENOUS IMPACT DASHBOARD
// Demonstrates real-time updates when transcripts are processed

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useImpactEvents } from '@/lib/hooks/useImpactEvents'
import { RealTimeImpactNotifications } from './RealTimeImpactNotifications'
import { Activity, TrendingUp, Users, Globe } from 'lucide-react'

interface LiveImpactDashboardProps {
  organizationId?: string
  storytellerId?: string
  showGlobalMetrics?: boolean
}

export function LiveImpactDashboard({
  organizationId,
  storytellerId,
  showGlobalMetrics = false
}: LiveImpactDashboardProps) {
  const { eventCounts, getLatestInsightEvents } = useImpactEvents({
    organizationId,
    storytellerId
  })

  const recentInsights = getLatestInsightEvents().slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Real-time Notifications */}
      {organizationId ? (
        <RealTimeImpactNotifications organizationId={organizationId} />
      ) : storytellerId ? (
        <RealTimeImpactNotifications storytellerId={storytellerId} />
      ) : (
        <RealTimeImpactNotifications />
      )}

      {/* Live Activity Header */}
      <div className="bg-gradient-to-r from-sage-600 to-clay-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6" />
          <h2 className="text-xl font-bold">Live Indigenous Impact Analysis</h2>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Updates Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LiveMetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="New Insights"
            value={eventCounts.impact_insight_created}
            colour="bg-green-500"
          />
          <LiveMetricCard
            icon={<Users className="w-5 h-5" />}
            label="Profile Updates"
            value={eventCounts.profile_metrics_updated}
            colour="bg-sage-500"
          />
          <LiveMetricCard
            icon={<Users className="w-5 h-5" />}
            label="Org Updates"
            value={eventCounts.organization_metrics_updated}
            colour="bg-clay-500"
          />
          <LiveMetricCard
            icon={<Globe className="w-5 h-5" />}
            label="Global Updates"
            value={eventCounts.site_metrics_updated}
            colour="bg-orange-500"
          />
        </div>
      </div>

      {/* Recent Insights Stream */}
      {recentInsights.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sage-600" />
            Live Community Insights Stream
          </h3>

          <div className="space-y-3">
            {recentInsights.map((event, index) => (
              <motion.div
                key={event.timestamp}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border-l-4 border-green-500"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-stone-900">
                      {event.data.storytellerName}
                    </span>
                    {event.data.organizationName && (
                      <span className="text-sm text-stone-600">
                        • {event.data.organizationName}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-sage-100 text-sage-800 text-xs font-medium rounded">
                      {event.data.insight.impactType.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-stone-700 mb-2">
                    {event.data.insight.quote}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-500">
                    <span>
                      {Math.round(event.data.insight.confidence * 100)}% confidence
                    </span>
                    <span>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Live Processing Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Real-Time Processing Status</h3>

        <div className="space-y-3">
          <StatusIndicator
            label="Indigenous Impact Analysis"
            status="active"
            description="AI system analysing community stories for impact insights"
          />

          <StatusIndicator
            label="Multi-Level Aggregation"
            status="active"
            description="Rolling up insights from individual → organisation → global metrics"
          />

          <StatusIndicator
            label="Dashboard Updates"
            status="active"
            description="Pushing live updates to connected dashboards"
          />
        </div>
      </div>
    </div>
  )
}

function LiveMetricCard({ icon, label, value, colour }: {
  icon: React.ReactNode
  label: string
  value: number
  colour: string
}) {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 ${colour} rounded-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{label}</div>
        </div>
      </div>
    </div>
  )
}

function StatusIndicator({ label, status, description }: {
  label: string
  status: 'active' | 'inactive' | 'processing'
  description: string
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'processing':
        return 'bg-yellow-500'
      case 'inactive':
        return 'bg-stone-400'
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className={`w-3 h-3 ${getStatusColor()} rounded-full mt-2 ${status === 'active' ? 'animate-pulse' : ''}`}></div>
      <div>
        <div className="font-medium text-stone-900">{label}</div>
        <div className="text-sm text-stone-600">{description}</div>
      </div>
    </div>
  )
}
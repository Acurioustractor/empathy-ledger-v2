'use client'

import { Users, BookOpen, FolderOpen, Target, Share2 } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import type { EnhancedMetrics } from '@/lib/services/organization-dashboard.service'

interface EnhancedOrganizationMetricsProps {
  metrics: EnhancedMetrics
  organizationId: string
}

export function EnhancedOrganizationMetrics({
  metrics,
  organizationId
}: EnhancedOrganizationMetricsProps) {
  return (
    <>
      {/* Members */}
      <MetricCard
        variant="storytellers"
        title="Members"
        value={metrics.members.total}
        subtitle={`${metrics.members.storytellers} storytellers, ${metrics.members.elders} elders`}
        icon={Users}
        trend={metrics.members.trend > 0 ? 'up' : metrics.members.trend < 0 ? 'down' : 'neutral'}
        trendValue={`${metrics.members.trend > 0 ? '+' : ''}${metrics.members.trend}%`}
        trendLabel="vs last month"
        description={metrics.members.newThisMonth > 0 ? `${metrics.members.newThisMonth} new this month` : undefined}
        onClick={() => window.location.href = `/organisations/${organizationId}/members`}
      />

      {/* Stories */}
      <MetricCard
        variant="stories"
        title="Stories"
        value={metrics.stories.total}
        subtitle={`${metrics.stories.published} published`}
        icon={BookOpen}
        trend={metrics.stories.trend > 0 ? 'up' : metrics.stories.trend < 0 ? 'down' : 'neutral'}
        trendValue={`${metrics.stories.trend > 0 ? '+' : ''}${metrics.stories.trend}%`}
        trendLabel="vs last month"
        description={metrics.stories.newThisWeek > 0 ? `${metrics.stories.newThisWeek} new this week` : undefined}
        onClick={() => window.location.href = `/organisations/${organizationId}/stories`}
      />

      {/* Projects */}
      <MetricCard
        variant="community"
        title="Projects"
        value={metrics.projects.total}
        subtitle={`${metrics.projects.active} active`}
        icon={FolderOpen}
        trend={metrics.projects.newThisMonth > 0 ? 'up' : 'neutral'}
        trendValue={metrics.projects.newThisMonth > 0 ? `+${metrics.projects.newThisMonth}` : '—'}
        trendLabel="new this month"
        description={`${metrics.projects.completed} completed`}
        onClick={() => window.location.href = `/organisations/${organizationId}/projects`}
      />

      {/* Community Impact */}
      <MetricCard
        variant="featured"
        title="Impact Score"
        value={metrics.impact.score}
        subtitle="Community impact rating"
        icon={Target}
        description={metrics.impact.topAreas.length > 0
          ? `Top areas: ${metrics.impact.topAreas.join(', ')}`
          : undefined}
        onClick={() => window.location.href = `/organisations/${organizationId}/impact-analytics`}
      />

      {/* Syndication */}
      <MetricCard
        variant="engagement"
        title="Syndication"
        value={metrics.syndication.storiesShared}
        subtitle="Stories shared externally"
        icon={Share2}
        description={metrics.syndication.appsConnected > 0
          ? `${metrics.syndication.appsConnected} apps, ${metrics.syndication.totalViews} views`
          : 'No external apps connected'}
      />
    </>
  )
}

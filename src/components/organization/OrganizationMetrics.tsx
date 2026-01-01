'use client'

import { Users, BookOpen, FolderOpen, Activity, BarChart3 } from 'lucide-react'

interface MetricsProps {
  metrics: {
    memberCount: number
    storyCount: number
    analyticsCount: number
    projectCount: number
  }
}

function SimpleMetricCard({
  title,
  value,
  subtitle,
  icon: Icon
}: {
  title: string
  value: number | string
  subtitle: string
  icon: any
}) {
  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-grey-600">{title}</p>
          <p className="text-2xl font-bold text-grey-900">{value}</p>
          <p className="text-sm text-grey-500">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-grey-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-grey-600" />
        </div>
      </div>
    </div>
  )
}

export function OrganizationMetrics({ metrics }: MetricsProps) {
  const engagementRate = metrics.memberCount > 0
    ? Math.round((metrics.analyticsCount / metrics.memberCount) * 100)
    : 0

  return (
    <>
      <SimpleMetricCard
        title="Members"
        value={metrics.memberCount}
        subtitle="Active community members"
        icon={Users}
      />

      <SimpleMetricCard
        title="Stories"
        value={metrics.storyCount}
        subtitle="Stories preserved"
        icon={BookOpen}
      />

      <SimpleMetricCard
        title="Projects"
        value={metrics.projectCount}
        subtitle="Active initiatives"
        icon={FolderOpen}
      />

      <SimpleMetricCard
        title="Engagement"
        value={`${engagementRate}%`}
        subtitle="Member participation"
        icon={Activity}
      />

      <SimpleMetricCard
        title="Analytics"
        value={metrics.analyticsCount}
        subtitle="Insights generated"
        icon={BarChart3}
      />
    </>
  )
}
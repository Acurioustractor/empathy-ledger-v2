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

const metricConfigs = [
  {
    key: 'members',
    title: 'Members',
    subtitle: 'Active community members',
    icon: Users,
    bgGradient: 'from-sage-50 to-sage-100/50',
    iconBg: 'bg-sage-100',
    iconColor: 'text-sage-600',
    borderColor: 'border-sage-200'
  },
  {
    key: 'stories',
    title: 'Stories',
    subtitle: 'Stories preserved',
    icon: BookOpen,
    bgGradient: 'from-earth-50 to-earth-100/50',
    iconBg: 'bg-earth-100',
    iconColor: 'text-earth-600',
    borderColor: 'border-earth-200'
  },
  {
    key: 'projects',
    title: 'Projects',
    subtitle: 'Active initiatives',
    icon: FolderOpen,
    bgGradient: 'from-clay-50 to-clay-100/50',
    iconBg: 'bg-clay-100',
    iconColor: 'text-clay-600',
    borderColor: 'border-clay-200'
  },
  {
    key: 'engagement',
    title: 'Engagement',
    subtitle: 'Member participation',
    icon: Activity,
    bgGradient: 'from-amber-50 to-amber-100/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200'
  },
  {
    key: 'analytics',
    title: 'Analytics',
    subtitle: 'Insights generated',
    icon: BarChart3,
    bgGradient: 'from-stone-50 to-stone-100/50',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
    borderColor: 'border-stone-200'
  }
]

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  borderColor,
  bgGradient
}: {
  title: string
  value: number | string
  subtitle: string
  icon: any
  iconBg: string
  iconColor: string
  borderColor: string
  bgGradient: string
}) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-5 border ${borderColor} shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-body-sm font-medium text-stone-600">{title}</p>
          <p className="text-display-sm font-bold text-stone-900">{value}</p>
          <p className="text-body-xs text-stone-500">{subtitle}</p>
        </div>
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

export function OrganizationMetrics({ metrics }: MetricsProps) {
  const engagementRate = metrics.memberCount > 0
    ? Math.round((metrics.analyticsCount / metrics.memberCount) * 100)
    : 0

  const values: Record<string, number | string> = {
    members: metrics.memberCount,
    stories: metrics.storyCount,
    projects: metrics.projectCount,
    engagement: `${engagementRate}%`,
    analytics: metrics.analyticsCount
  }

  return (
    <>
      {metricConfigs.map((config) => (
        <MetricCard
          key={config.key}
          title={config.title}
          value={values[config.key]}
          subtitle={config.subtitle}
          icon={config.icon}
          iconBg={config.iconBg}
          iconColor={config.iconColor}
          borderColor={config.borderColor}
          bgGradient={config.bgGradient}
        />
      ))}
    </>
  )
}
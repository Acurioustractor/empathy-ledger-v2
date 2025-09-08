'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  TrendingUp,
  Activity,
  Target,
  FolderOpen
} from 'lucide-react'

interface MetricsProps {
  metrics: {
    memberCount: number
    storyCount: number
    analyticsCount: number
    projectCount: number
  }
}

export function OrganizationMetrics({ metrics }: MetricsProps) {
  const engagementRate = metrics.memberCount > 0 
    ? Math.round((metrics.analyticsCount / metrics.memberCount) * 100) 
    : 0

  const metricsData = [
    {
      title: 'Community Members',
      value: metrics.memberCount,
      description: 'Active community members',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Stories Shared',
      value: metrics.storyCount,
      description: 'Total stories in collection',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Active Projects',
      value: metrics.projectCount,
      description: 'Community initiatives',
      icon: FolderOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      title: 'Analytics Generated',
      value: metrics.analyticsCount,
      description: 'Members with insights',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Engagement Rate',
      value: engagementRate,
      suffix: '%',
      description: 'Members with analytics',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  ]

  return (
    <>
      {metricsData.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric.value.toLocaleString()}{metric.suffix || ''}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
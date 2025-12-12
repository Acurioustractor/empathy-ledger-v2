'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileEdit, Eye, CheckCircle, ArrowRight } from 'lucide-react'
import type { PipelineData } from '@/lib/services/organization-dashboard.service'

interface StoryPipelineWidgetProps {
  pipeline: PipelineData
  organizationId: string
}

export function StoryPipelineWidget({ pipeline, organizationId }: StoryPipelineWidgetProps) {
  const total = pipeline.draft + pipeline.inReview + pipeline.published

  const stages = [
    {
      name: 'Draft',
      count: pipeline.draft,
      icon: FileEdit,
      color: 'bg-stone-100 text-stone-600',
      barColor: 'bg-stone-400',
      href: `/organisations/${organizationId}/stories?status=draft`
    },
    {
      name: 'In Review',
      count: pipeline.inReview,
      icon: Eye,
      color: 'bg-amber-100 text-amber-700',
      barColor: 'bg-amber-400',
      href: `/organisations/${organizationId}/stories?status=in_review`
    },
    {
      name: 'Published',
      count: pipeline.published,
      icon: CheckCircle,
      color: 'bg-sage-100 text-sage-700',
      barColor: 'bg-sage-500',
      href: `/organisations/${organizationId}/stories?status=published`
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Story Pipeline</span>
          <span className="text-sm font-normal text-stone-500">{total} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pipeline visualization */}
        <div className="flex items-center justify-between mb-6">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center">
              <a
                href={stage.href}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`p-3 rounded-full ${stage.color} transition-transform group-hover:scale-110`}>
                  <stage.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-earth-800 mt-2">{stage.count}</span>
                <span className="text-xs text-stone-500">{stage.name}</span>
              </a>
              {index < stages.length - 1 && (
                <ArrowRight className="w-5 h-5 text-stone-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          {stages.map((stage) => {
            const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0
            return (
              <div key={stage.name} className="space-y-1">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>{stage.name}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.barColor} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

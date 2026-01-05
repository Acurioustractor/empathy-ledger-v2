'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Circle } from 'lucide-react'

interface ImpactTimelineProps {
  organizationId: string
  period: string
}

export function ImpactTimeline({ organizationId, period }: ImpactTimelineProps) {
  const mockEvents = [
    { date: '2026-01-05', title: 'Project Launched', type: 'milestone' },
    { date: '2026-01-10', title: '5 Stories Published', type: 'story' },
    { date: '2026-01-15', title: '10 Storytellers Recruited', type: 'storyteller' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Impact Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEvents.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <Circle className="h-4 w-4 text-amber-500 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

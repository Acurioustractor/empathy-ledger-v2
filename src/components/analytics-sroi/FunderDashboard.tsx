'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp } from 'lucide-react'

interface FunderDashboardProps {
  organizationId: string
  funderId?: string
}

export function FunderDashboard({ organizationId, funderId }: FunderDashboardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Grant Objectives Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Stories Collected</span>
                <span className="text-sm text-gray-600">25 / 50</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

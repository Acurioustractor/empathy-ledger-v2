'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface SemanticShiftDetectorProps {
  theme: { theme_name: string; id: string }
  timeRange: string
}

export function SemanticShiftDetector({ theme, timeRange }: SemanticShiftDetectorProps) {
  // Placeholder - in production, analyze semantic shifts using embeddings
  const shifts = []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Semantic Shifts</CardTitle>
        <CardDescription>
          How the meaning or usage of "{theme.theme_name}" has evolved
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No significant semantic shifts detected during this period
            </p>
            <p className="text-xs text-gray-400 mt-2">
              The theme meaning has remained consistent
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift: any, i: number) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="font-medium text-sm mb-1">{shift.title}</div>
                <p className="text-xs text-gray-600">{shift.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

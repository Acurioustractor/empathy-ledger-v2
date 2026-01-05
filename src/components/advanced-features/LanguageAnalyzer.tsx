'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Languages } from 'lucide-react'

interface LanguageAnalyzerProps {
  organizationId: string
  storyId?: string
}

export function LanguageAnalyzer({ organizationId, storyId }: LanguageAnalyzerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-amber-500" />
          Language Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          Language detection results will appear here
        </div>
      </CardContent>
    </Card>
  )
}

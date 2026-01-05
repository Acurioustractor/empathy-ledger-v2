'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface SentimentAnalysisProps {
  organizationId: string
  storyId?: string
}

export function SentimentAnalysis({ organizationId, storyId }: SentimentAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          Sentiment analysis results will appear here
        </div>
      </CardContent>
    </Card>
  )
}

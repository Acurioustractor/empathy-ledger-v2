'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquareQuote, Star, Share2 } from 'lucide-react'

interface QuoteHighlighterProps {
  organizationId: string
  storyId?: string
}

export function QuoteHighlighter({ organizationId, storyId }: QuoteHighlighterProps) {
  const mockQuotes = [
    {
      id: '1',
      text: 'Our stories are our power, our connection to the land and to each other.',
      significance_score: 0.95,
      sentiment: 'healing',
      featured: false
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-purple-500" />
          Significant Quotes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockQuotes.map(quote => (
            <div key={quote.id} className="p-4 rounded-lg border border-gray-200 bg-purple-50">
              <p className="text-lg text-gray-900 italic mb-3">"{quote.text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>Significance: {Math.round(quote.significance_score * 100)}%</Badge>
                  <Badge className="bg-green-100 text-green-800">{quote.sentiment}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><Star className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline"><Share2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

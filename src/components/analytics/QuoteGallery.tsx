'use client'

import React from 'react'
import { useStorytellerQuotes } from '@/lib/hooks/useStorytellerAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Quote,
  Share2,
  Heart,
  Copy,
  BookmarkPlus,
  Star,
  TrendingUp,
  MessageCircle
} from 'lucide-react'

interface QuoteGalleryProps {
  storytellerId: string
  limit?: number
  className?: string
  showActions?: boolean
}

export function QuoteGallery({
  storytellerId,
  limit = 6,
  className,
  showActions = true
}: QuoteGalleryProps) {
  const { quotes, loading, error } = useStorytellerQuotes(storytellerId, limit)

  const handleCopyQuote = async (quoteText: string) => {
    try {
      await navigator.clipboard.writeText(`"${quoteText}"`)
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy quote:', err)
    }
  }

  const handleShareQuote = (quote: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'Powerful Quote',
        text: `"${quote.text}" - ${quote.sourceTitle}`
      })
    } else {
      handleCopyQuote(quote.text)
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-grey-200 rounded w-full"></div>
                <div className="h-4 bg-grey-200 rounded w-3/4"></div>
                <div className="h-3 bg-grey-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-grey-500">
            <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <Typography variant="body">Unable to load quotes</Typography>
            <Typography variant="small" className="text-grey-400">
              {error}
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quotes || quotes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Powerful Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-grey-500 py-8">
            <Quote className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <Typography variant="h3" className="mb-2">
              No quotes discovered yet
            </Typography>
            <Typography variant="body" className="text-grey-400 max-w-sm mx-auto">
              Our AI will automatically extract powerful moments from your stories and transcripts
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {quotes.map((quote, index) => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          index={index}
          showActions={showActions}
          onCopy={() => handleCopyQuote(quote.text)}
          onShare={() => handleShareQuote(quote)}
        />
      ))}
    </div>
  )
}

interface QuoteCardProps {
  quote: {
    id: string
    text: string
    impactScore: number
    themes: string[]
    citationCount: number
    sourceTitle: string
  }
  index: number
  showActions: boolean
  onCopy: () => void
  onShare: () => void
}

function QuoteCard({ quote, index, showActions, onCopy, onShare }: QuoteCardProps) {
  const getImpactColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 bg-red-100'
    if (score >= 0.6) return 'text-orange-600 bg-orange-100'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-grey-600 bg-grey-100'
  }

  const getImpactLevel = (score: number) => {
    if (score >= 0.8) return 'Very High'
    if (score >= 0.6) return 'High'
    if (score >= 0.4) return 'Medium'
    return 'Growing'
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Quote Text */}
          <blockquote className="text-lg text-grey-800 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
            "{quote.text}"
          </blockquote>

          {/* Quote Metadata */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {/* Source */}
              <Typography variant="small" className="text-grey-600 flex items-center gap-1">
                <BookmarkPlus className="h-3 w-3" />
                From: {quote.sourceTitle}
              </Typography>

              {/* Themes */}
              {quote.themes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {quote.themes.slice(0, 3).map(theme => (
                    <Badge key={theme} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                  {quote.themes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{quote.themes.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className={`h-3 w-3 ${getImpactColor(quote.impactScore)}`} />
                  <span className="text-grey-600">
                    {getImpactLevel(quote.impactScore)} Impact
                  </span>
                </div>

                {quote.citationCount > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-grey-600">
                      {quote.citationCount} citation{quote.citationCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Score Indicator */}
            <div className="ml-4">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(quote.impactScore)}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {Math.round(quote.impactScore * 100)}%
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2 pt-2 border-t border-grey-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="flex items-center gap-1 text-grey-600 hover:text-grey-800"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="flex items-center gap-1 text-grey-600 hover:text-grey-800"
              >
                <Share2 className="h-3 w-3" />
                Share
              </Button>

              <div className="flex-1" />

              <Typography variant="small" className="text-grey-400">
                #{index + 1}
              </Typography>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for use in other components
export function QuoteGalleryCompact({
  storytellerId,
  limit = 3,
  className
}: Pick<QuoteGalleryProps, 'storytellerId' | 'limit' | 'className'>) {
  const { quotes, loading } = useStorytellerQuotes(storytellerId, limit)

  if (loading || !quotes || quotes.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {quotes.map((quote) => (
        <div key={quote.id} className="border-l-4 border-blue-500 pl-4 py-2">
          <blockquote className="text-sm text-grey-700 italic mb-1">
            "{quote.text.length > 100
              ? `${quote.text.substring(0, 100)}...`
              : quote.text}"
          </blockquote>
          <Typography variant="small" className="text-grey-500">
            From: {quote.sourceTitle}
          </Typography>
        </div>
      ))}
    </div>
  )
}
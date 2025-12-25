'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Share2, Heart, Sparkles, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface QuoteData {
  id: string
  quote_text: string
  context_before?: string
  context_after?: string
  source_type?: 'transcript' | 'story' | 'interview' | 'media'
  source_id?: string
  emotional_impact_score: number
  wisdom_score: number
  quotability_score: number
  inspiration_score: number
  themes?: string[]
  sentiment_score?: number
  quote_category?: string
  created_at: string
}

export interface QuoteCarouselProps {
  quotes: QuoteData[]
  sortBy?: 'impact' | 'wisdom' | 'quotability' | 'inspiration'
  maxQuotes?: number
  showScores?: boolean
  showActions?: boolean
  onQuoteClick?: (quote: QuoteData) => void
  onShareClick?: (quote: QuoteData) => void
  className?: string
}

/**
 * QuoteCarousel - Swipeable carousel of impactful quotes with scoring
 *
 * Features:
 * - Swipeable/arrow navigation
 * - Impact scoring visualization (wisdom, quotability, inspiration)
 * - Theme tags
 * - Share and copy actions
 * - Responsive design
 * - Cultural color palette
 *
 * Usage:
 * <QuoteCarousel
 *   quotes={storytellerQuotes}
 *   sortBy="wisdom"
 *   showScores={true}
 * />
 */
export function QuoteCarousel({
  quotes,
  sortBy = 'impact',
  maxQuotes = 5,
  showScores = true,
  showActions = true,
  onQuoteClick,
  onShareClick,
  className
}: QuoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!quotes || quotes.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20', className)}>
        <Quote className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No quotes available</p>
      </div>
    )
  }

  // Sort quotes
  const sortedQuotes = [...quotes]
    .sort((a, b) => {
      switch (sortBy) {
        case 'wisdom':
          return b.wisdom_score - a.wisdom_score
        case 'quotability':
          return b.quotability_score - a.quotability_score
        case 'inspiration':
          return b.inspiration_score - a.inspiration_score
        case 'impact':
        default:
          return b.emotional_impact_score - a.emotional_impact_score
      }
    })
    .slice(0, maxQuotes)

  const currentQuote = sortedQuotes[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedQuotes.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedQuotes.length - 1 ? 0 : prev + 1))
  }

  const handleCopy = async (quote: QuoteData) => {
    try {
      await navigator.clipboard.writeText(`"${quote.quote_text}"`)
      setCopiedId(quote.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy quote:', err)
    }
  }

  const handleShare = (quote: QuoteData) => {
    if (onShareClick) {
      onShareClick(quote)
    }
  }

  // Score badge component
  const ScoreBadge = ({ label, score, icon: Icon }: { label: string, score: number, icon: React.ElementType }) => {
    const percentage = Math.round(score * 100)
    const getColor = () => {
      if (percentage >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
      if (percentage >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
      if (percentage >= 40) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30'
    }

    return (
      <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', getColor())}>
        <Icon className="w-3 h-3" />
        <span>{label}: {percentage}%</span>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Main quote card */}
      <div className="bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border shadow-lg">
        {/* Quote icon */}
        <div className="mb-4">
          <Quote className="w-8 h-8 text-primary/40" />
        </div>

        {/* Quote text */}
        <blockquote
          className="text-lg font-medium leading-relaxed text-foreground mb-4 cursor-pointer hover:text-primary transition-colors"
          onClick={() => onQuoteClick && onQuoteClick(currentQuote)}
        >
          "{currentQuote.quote_text}"
        </blockquote>

        {/* Source & category */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          {currentQuote.source_type && (
            <Badge variant="outline" className="capitalize">
              {currentQuote.source_type}
            </Badge>
          )}
          {currentQuote.quote_category && (
            <Badge variant="secondary">
              {currentQuote.quote_category}
            </Badge>
          )}
        </div>

        {/* Scores */}
        {showScores && (
          <div className="flex flex-wrap gap-2 mb-4">
            <ScoreBadge label="Impact" score={currentQuote.emotional_impact_score} icon={Heart} />
            <ScoreBadge label="Wisdom" score={currentQuote.wisdom_score} icon={Sparkles} />
            <ScoreBadge label="Quotable" score={currentQuote.quotability_score} icon={Quote} />
          </div>
        )}

        {/* Themes */}
        {currentQuote.themes && currentQuote.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {currentQuote.themes.slice(0, 3).map((theme, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {theme}
              </Badge>
            ))}
            {currentQuote.themes.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{currentQuote.themes.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(currentQuote)}
                className="text-xs"
              >
                {copiedId === currentQuote.id ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(currentQuote)}
                className="text-xs"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>

            {/* Pagination dots */}
            <div className="flex gap-1.5">
              {sortedQuotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {sortedQuotes.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-2 rounded-full bg-background border border-border shadow-lg hover:bg-accent transition-colors"
            aria-label="Previous quote"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-2 rounded-full bg-background border border-border shadow-lg hover:bg-accent transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
        {currentIndex + 1} / {sortedQuotes.length}
      </div>
    </div>
  )
}

/**
 * QuoteCarouselCompact - Minimal quote display without carousel
 */
export function QuoteCarouselCompact({
  quotes,
  maxDisplay = 3,
  className
}: { quotes: QuoteData[], maxDisplay?: number, className?: string }) {
  const topQuotes = quotes
    .sort((a, b) => b.emotional_impact_score - a.emotional_impact_score)
    .slice(0, maxDisplay)

  if (topQuotes.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {topQuotes.map((quote) => (
        <div key={quote.id} className="bg-muted/20 rounded-lg p-3 border border-border/50">
          <blockquote className="text-sm text-foreground mb-2 italic">
            "{quote.quote_text.length > 120 ? quote.quote_text.substring(0, 120) + '...' : quote.quote_text}"
          </blockquote>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              {Math.round(quote.wisdom_score * 100)}% wisdom
            </div>
            {quote.themes && quote.themes.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {quote.themes[0]}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Quote, Copy, Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmpathyCard, CardFooter } from '../core/Card'
import { EmpathyBadge } from '../core/Badge'

export interface QuoteCardProps {
  quote: string
  author?: string
  source?: string
  themes?: string[]
  context?: string
  wisdom_score?: number
  quotability_score?: number
  inspiration_score?: number
  variant?: 'default' | 'featured' | 'minimal'
  showScores?: boolean
  showActions?: boolean
  onShare?: () => void
  className?: string
}

/**
 * QuoteCard - Display meaningful quotes with Empathy Ledger warmth
 *
 * Design Philosophy:
 * - Quotes are precious - display with reverence
 * - Like highlighted passages in a treasured book
 * - Warm, inviting typography
 * - Generous spacing for contemplation
 * - Optional impact scores with gentle visualization
 *
 * Features:
 * - Multiple display variants
 * - Theme badges with cultural colors
 * - Impact scores (wisdom, quotability, inspiration)
 * - Copy and share actions
 * - Expandable context
 * - Opening quotation mark accent
 *
 * Usage:
 * <QuoteCard
 *   quote="The land remembers everything"
 *   author="Elder Sarah"
 *   themes={["Land & Territory", "Knowledge & Wisdom"]}
 *   wisdom_score={0.92}
 * />
 */
export function QuoteCard({
  quote,
  author,
  source,
  themes,
  context,
  wisdom_score,
  quotability_score,
  inspiration_score,
  variant = 'default',
  showScores = true,
  showActions = true,
  onShare,
  className
}: QuoteCardProps) {
  const [copied, setCopied] = useState(false)
  const [showContext, setShowContext] = useState(false)

  const handleCopy = async () => {
    const text = `"${quote}"${author ? ` — ${author}` : ''}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('relative', className)}>
        <Quote className="absolute -left-2 -top-2 w-8 h-8 text-primary-300 opacity-50" />
        <blockquote className="pl-6 text-lg italic text-foreground leading-relaxed font-editorial">
          {quote}
        </blockquote>
        {author && (
          <p className="mt-2 pl-6 text-sm text-muted-foreground">
            — {author}
          </p>
        )}
      </div>
    )
  }

  // Featured variant - extra prominence
  if (variant === 'featured') {
    return (
      <EmpathyCard
        elevation="focused"
        variant="warmth"
        className={cn('relative overflow-hidden', className)}
      >
        {/* Decorative quote mark */}
        <Quote className="absolute -right-4 -top-4 w-32 h-32 text-primary-200/30 dark:text-primary-800/20" />

        <div className="relative z-10">
          {/* Quote text - large and prominent */}
          <blockquote className="text-2xl font-editorial italic text-foreground leading-loose mb-6">
            "{quote}"
          </blockquote>

          {/* Attribution */}
          {(author || source) && (
            <div className="mb-4">
              {author && (
                <p className="text-base font-semibold text-primary-700 dark:text-primary-400">
                  — {author}
                </p>
              )}
              {source && (
                <p className="text-sm text-muted-foreground mt-1">
                  {source}
                </p>
              )}
            </div>
          )}

          {/* Themes */}
          {themes && themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {themes.map((theme, index) => (
                <EmpathyBadge key={index} variant="cultural" theme={theme} size="sm">
                  {theme}
                </EmpathyBadge>
              ))}
            </div>
          )}

          {/* Impact scores */}
          {showScores && (wisdom_score || quotability_score || inspiration_score) && (
            <div className="flex gap-4 mb-4">
              {wisdom_score !== undefined && (
                <ScorePill label="Wisdom" score={wisdom_score} />
              )}
              {quotability_score !== undefined && (
                <ScorePill label="Quotability" score={quotability_score} />
              )}
              {inspiration_score !== undefined && (
                <ScorePill label="Inspiration" score={inspiration_score} />
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <CardFooter variant="subtle" alignment="left">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {onShare && (
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}

              {context && (
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:text-primary-700 transition-colors rounded-lg hover:bg-primary-50"
                >
                  {showContext ? 'Hide' : 'Show'} Context
                </button>
              )}
            </CardFooter>
          )}

          {/* Expandable context */}
          {context && showContext && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {context}
              </p>
            </motion.div>
          )}
        </div>
      </EmpathyCard>
    )
  }

  // Default variant
  return (
    <EmpathyCard
      elevation="lifted"
      variant="warmth"
      className={cn('relative', className)}
    >
      {/* Decorative quote mark */}
      <Quote className="absolute -right-2 -top-2 w-16 h-16 text-primary-200/40 dark:text-primary-800/20" />

      <div className="relative z-10">
        {/* Quote text */}
        <blockquote className="text-lg font-editorial italic text-foreground leading-relaxed mb-4">
          "{quote}"
        </blockquote>

        {/* Attribution */}
        {(author || source) && (
          <div className="mb-3">
            {author && (
              <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                — {author}
              </p>
            )}
            {source && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {source}
              </p>
            )}
          </div>
        )}

        {/* Themes */}
        {themes && themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {themes.slice(0, 3).map((theme, index) => (
              <EmpathyBadge key={index} variant="cultural" theme={theme} size="sm">
                {theme}
              </EmpathyBadge>
            ))}
            {themes.length > 3 && (
              <EmpathyBadge variant="default" size="sm">
                +{themes.length - 3}
              </EmpathyBadge>
            )}
          </div>
        )}

        {/* Impact scores */}
        {showScores && (wisdom_score || quotability_score || inspiration_score) && (
          <div className="flex gap-3 mb-3">
            {wisdom_score !== undefined && (
              <ScorePill label="Wisdom" score={wisdom_score} size="sm" />
            )}
            {quotability_score !== undefined && (
              <ScorePill label="Quotability" score={quotability_score} size="sm" />
            )}
            {inspiration_score !== undefined && (
              <ScorePill label="Inspiration" score={inspiration_score} size="sm" />
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            )}

            {context && (
              <button
                onClick={() => setShowContext(!showContext)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-primary hover:text-primary-700 transition-colors rounded hover:bg-primary-50"
              >
                {showContext ? 'Hide' : 'View'} Context
              </button>
            )}
          </div>
        )}

        {/* Expandable context */}
        {context && showContext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border/50"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              {context}
            </p>
          </motion.div>
        )}
      </div>
    </EmpathyCard>
  )
}

/**
 * ScorePill - Display impact scores with color coding
 */
interface ScorePillProps {
  label: string
  score: number
  size?: 'sm' | 'md'
}

function ScorePill({ label, score, size = 'md' }: ScorePillProps) {
  const percentage = Math.round(score * 100)

  const getColor = () => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getBgColor = () => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-950/30'
    if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-950/30'
    if (percentage >= 40) return 'bg-amber-100 dark:bg-amber-950/30'
    return 'bg-gray-100 dark:bg-gray-950/30'
  }

  return (
    <div className={cn(
      'flex items-center gap-1.5 rounded-full px-2 py-1',
      getBgColor(),
      size === 'sm' && 'text-xs',
      size === 'md' && 'text-sm'
    )}>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-bold', getColor())}>
        {percentage}%
      </span>
    </div>
  )
}

/**
 * QuoteGallery - Display multiple quotes in a flowing layout
 */
export interface QuoteGalleryProps {
  quotes: Array<{
    quote: string
    author?: string
    source?: string
    themes?: string[]
    wisdom_score?: number
  }>
  columns?: 1 | 2 | 3
  className?: string
}

export function QuoteGallery({
  quotes,
  columns = 2,
  className
}: QuoteGalleryProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {quotes.map((quote, index) => (
        <QuoteCard
          key={index}
          {...quote}
          variant="default"
          showActions={false}
        />
      ))}
    </div>
  )
}

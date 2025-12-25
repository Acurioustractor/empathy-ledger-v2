'use client'

import React, { useState } from 'react'
import { Sparkles, Check, X, ChevronDown, ChevronUp, Info, TrendingUp, Users, Tag, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface AIRecommendation {
  id: string
  type: 'theme' | 'connection' | 'tag' | 'profile_field' | 'quote' | 'expertise' | 'collaboration' | 'content' | 'impact'
  title: string
  suggested_value: string
  confidence_score: number
  reasoning: string
  evidence: {
    type: 'quote' | 'story' | 'theme' | 'pattern'
    text: string
    source?: string
    score?: number
  }[]
  impact_prediction?: string
  status?: 'pending' | 'accepted' | 'dismissed'
  created_at: string
}

export interface AIInsightPanelProps {
  recommendations: AIRecommendation[]
  storytellerId?: string
  onAccept?: (recommendation: AIRecommendation) => Promise<void>
  onDismiss?: (recommendationId: string) => void
  onViewAll?: () => void
  className?: string
  maxDisplay?: number
}

/**
 * AIInsightPanel - Display AI-generated suggestions with confidence scores and evidence
 *
 * Features:
 * - Confidence score visualization
 * - Evidence display with sources
 * - Accept/dismiss actions
 * - Expandable evidence panels
 * - Impact predictions
 * - Type-based icons and colors
 *
 * Usage:
 * <AIInsightPanel
 *   recommendations={aiSuggestions}
 *   onAccept={handleAccept}
 *   onDismiss={handleDismiss}
 * />
 */
export function AIInsightPanel({
  recommendations,
  storytellerId,
  onAccept,
  onDismiss,
  onViewAll,
  className,
  maxDisplay = 3
}: AIInsightPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Filter to pending recommendations only
  const pendingRecommendations = recommendations
    .filter(r => !r.status || r.status === 'pending')
    .slice(0, maxDisplay)

  if (pendingRecommendations.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20', className)}>
        <Sparkles className="w-10 h-10 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No AI suggestions at this time</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Check back as you add more stories</p>
      </div>
    )
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const handleAccept = async (recommendation: AIRecommendation) => {
    if (!onAccept) return

    setProcessingIds(prev => new Set(prev).add(recommendation.id))
    try {
      await onAccept(recommendation)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(recommendation.id)
        return next
      })
    }
  }

  const handleDismiss = (recommendationId: string) => {
    if (onDismiss) {
      onDismiss(recommendationId)
    }
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      theme: <Tag className="w-4 h-4" />,
      connection: <Users className="w-4 h-4" />,
      tag: <Tag className="w-4 h-4" />,
      profile_field: <User className="w-4 h-4" />,
      expertise: <Sparkles className="w-4 h-4" />,
      collaboration: <Users className="w-4 h-4" />,
      impact: <TrendingUp className="w-4 h-4" />,
      quote: <Sparkles className="w-4 h-4" />,
      content: <Info className="w-4 h-4" />
    }
    return icons[type] || <Info className="w-4 h-4" />
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      theme: 'Theme Suggestion',
      connection: 'Connection Suggestion',
      tag: 'Tag Suggestion',
      profile_field: 'Profile Enhancement',
      expertise: 'Expertise Area',
      collaboration: 'Collaboration Opportunity',
      impact: 'Impact Enhancement',
      quote: 'Notable Quote',
      content: 'Content Suggestion'
    }
    return labels[type] || 'AI Suggestion'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      theme: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      connection: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      tag: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400',
      profile_field: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      expertise: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      collaboration: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
      impact: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      quote: 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
      content: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
    }
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400'
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400'
    if (score >= 0.4) return 'text-amber-600 dark:text-amber-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'Very High'
    if (score >= 0.8) return 'High'
    if (score >= 0.6) return 'Medium'
    if (score >= 0.4) return 'Moderate'
    return 'Low'
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
          {pendingRecommendations.length > 0 && (
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {pendingRecommendations.length}
            </Badge>
          )}
        </div>
        {recommendations.length > maxDisplay && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-primary hover:underline"
          >
            View all {recommendations.length}
          </button>
        )}
      </div>

      {/* Suggestion cards */}
      <div className="space-y-2">
        {pendingRecommendations.map((recommendation) => {
          const isExpanded = expandedIds.has(recommendation.id)
          const isProcessing = processingIds.has(recommendation.id)

          return (
            <div
              key={recommendation.id}
              className="group relative bg-gradient-to-br from-accent/5 to-background border border-accent/20 rounded-lg p-3 hover:border-accent/40 hover:shadow-md transition-all"
            >
              {/* Type badge and confidence */}
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className={cn('text-xs', getTypeColor(recommendation.type))}>
                  {getTypeIcon(recommendation.type)}
                  <span className="ml-1">{getTypeLabel(recommendation.type)}</span>
                </Badge>

                {/* Confidence score */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className={cn('text-xs font-bold', getConfidenceColor(recommendation.confidence_score))}>
                      {Math.round(recommendation.confidence_score * 100)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getConfidenceLabel(recommendation.confidence_score)}
                    </span>
                  </div>
                  {/* Confidence bar */}
                  <div className="flex flex-col gap-0.5">
                    {[0.75, 0.5, 0.25].map((threshold) => (
                      <div
                        key={threshold}
                        className={cn(
                          'w-6 h-1 rounded-full',
                          recommendation.confidence_score >= threshold
                            ? recommendation.confidence_score >= 0.8
                              ? 'bg-green-500'
                              : recommendation.confidence_score >= 0.6
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                            : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestion title */}
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {recommendation.title}
              </h4>

              {/* Suggested value */}
              <div className="bg-accent/10 border border-accent/20 rounded px-2 py-1.5 mb-2">
                <p className="text-sm text-foreground font-medium">
                  {recommendation.suggested_value}
                </p>
              </div>

              {/* Reasoning */}
              <p className="text-xs text-muted-foreground mb-2">
                {recommendation.reasoning}
              </p>

              {/* Impact prediction */}
              {recommendation.impact_prediction && (
                <div className="flex items-start gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {recommendation.impact_prediction}
                  </p>
                </div>
              )}

              {/* Evidence toggle */}
              {recommendation.evidence.length > 0 && (
                <button
                  onClick={() => toggleExpanded(recommendation.id)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mb-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Hide evidence
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Show evidence ({recommendation.evidence.length})
                    </>
                  )}
                </button>
              )}

              {/* Evidence panel */}
              {isExpanded && recommendation.evidence.length > 0 && (
                <div className="bg-background/50 border border-border rounded-lg p-3 mb-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground mb-2">Supporting Evidence:</p>
                  {recommendation.evidence.map((evidence, index) => (
                    <div key={index} className="bg-background border border-border rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {evidence.type}
                        </Badge>
                        {evidence.score !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            Score: {Math.round(evidence.score * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground italic">"{evidence.text}"</p>
                      {evidence.source && (
                        <p className="text-xs text-muted-foreground mt-1">
                          — {evidence.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleAccept(recommendation)}
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Apply
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDismiss(recommendation.id)}
                  disabled={isProcessing}
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                >
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * AIInsightBadge - Compact badge showing AI suggestion count
 */
export function AIInsightBadge({
  count,
  onClick,
  className
}: {
  count: number
  onClick?: () => void
  className?: string
}) {
  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors',
        className
      )}
    >
      <Sparkles className="w-3 h-3 text-accent" />
      <span className="text-xs font-semibold text-accent">{count} AI insights</span>
    </button>
  )
}

/**
 * ConfidenceScore - Standalone confidence visualization
 */
export function ConfidenceScore({
  score,
  showLabel = true,
  className
}: {
  score: number
  showLabel?: boolean
  className?: string
}) {
  const getColor = () => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400'
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400'
    if (score >= 0.4) return 'text-amber-600 dark:text-amber-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getBarColor = () => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.6) return 'bg-blue-500'
    return 'bg-amber-500'
  }

  const getLabel = () => {
    if (score >= 0.9) return 'Very High'
    if (score >= 0.8) return 'High'
    if (score >= 0.6) return 'Medium'
    if (score >= 0.4) return 'Moderate'
    return 'Low'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-sm font-bold', getColor())}>
        {Math.round(score * 100)}%
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{getLabel()}</span>
      )}
      <div className="flex gap-0.5">
        {[0.25, 0.5, 0.75, 1].map((threshold) => (
          <div
            key={threshold}
            className={cn(
              'w-1.5 h-4 rounded-full',
              score >= threshold ? getBarColor() : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}

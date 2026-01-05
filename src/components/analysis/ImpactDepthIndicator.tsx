'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'

type DepthLevel = 'mention' | 'description' | 'demonstration' | 'transformation'

interface ImpactDepthIndicatorProps {
  dimension: string
  score: number
  depth: DepthLevel
  evidence?: {
    quotes: string[]
    context: string
  }
  reasoning?: string
  confidence?: number
  showEvidence?: boolean
  compact?: boolean
}

const DEPTH_CONFIG: Record<DepthLevel, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  description: string
  score: number
}> = {
  mention: {
    label: 'Mention',
    color: 'text-gray-700',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-300',
    description: 'Brief mention or reference',
    score: 25
  },
  description: {
    label: 'Description',
    color: 'text-blue-700',
    bgColor: 'bg-blue-200',
    borderColor: 'border-blue-300',
    description: 'Detailed description or explanation',
    score: 50
  },
  demonstration: {
    label: 'Demonstration',
    color: 'text-green-700',
    bgColor: 'bg-green-200',
    borderColor: 'border-green-300',
    description: 'Active demonstration with evidence',
    score: 75
  },
  transformation: {
    label: 'Transformation',
    color: 'text-purple-700',
    bgColor: 'bg-purple-200',
    borderColor: 'border-purple-300',
    description: 'Transformative impact with lasting change',
    score: 100
  }
}

const DIMENSION_LABELS: Record<string, string> = {
  relationship_strengthening: 'Relationship Strengthening',
  cultural_continuity: 'Cultural Continuity',
  community_empowerment: 'Community Empowerment',
  system_transformation: 'System Transformation'
}

export function ImpactDepthIndicator({
  dimension,
  score,
  depth,
  evidence,
  reasoning,
  confidence,
  showEvidence = true,
  compact = false
}: ImpactDepthIndicatorProps) {
  const [expanded, setExpanded] = useState(false)

  const depthConfig = DEPTH_CONFIG[depth]
  const dimensionLabel = DIMENSION_LABELS[dimension] || dimension

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">{dimensionLabel}</span>
            <div className="flex items-center gap-2">
              <Badge className={`${depthConfig.bgColor} ${depthConfig.color} text-xs`}>
                {depthConfig.label}
              </Badge>
              <span className="text-sm font-semibold text-gray-900">{score}/100</span>
            </div>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${depthConfig.bgColor.replace('200', '400')} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{dimensionLabel}</h3>
            <p className="text-sm text-gray-600">{depthConfig.description}</p>
          </div>
          {confidence !== undefined && (
            <Badge variant="secondary" className="ml-3">
              {Math.round(confidence)}% confidence
            </Badge>
          )}
        </div>

        {/* Score Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={`${depthConfig.bgColor} ${depthConfig.color}`}>
              {depthConfig.label}
            </Badge>
            <span className="text-lg font-bold text-gray-900">{score}/100</span>
          </div>

          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${depthConfig.bgColor.replace('200', '400')} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Depth Progression Indicator */}
        <div className="mt-4 flex items-center justify-between">
          {Object.entries(DEPTH_CONFIG).map(([level, config], index) => {
            const isActive = DEPTH_CONFIG[depth].score >= config.score
            const isCurrent = level === depth

            return (
              <div key={level} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent
                      ? `${config.bgColor} ${config.borderColor} ${config.color}`
                      : isActive
                      ? 'bg-gray-200 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCurrent ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold' : 'text-gray-500'}`}>
                  {config.label}
                </span>
                {index < 3 && (
                  <div
                    className={`h-0.5 w-full mt-5 -ml-full ${
                      isActive ? 'bg-gray-300' : 'bg-gray-200'
                    }`}
                    style={{ position: 'absolute', left: '50%', width: 'calc(100% / 4)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Evidence & Reasoning */}
      {showEvidence && (evidence || reasoning) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-200"
          >
            <span className="text-sm font-medium text-gray-900">
              {expanded ? 'Hide' : 'Show'} Evidence & Reasoning
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {expanded && (
            <div className="p-6 pt-4 space-y-4 bg-gray-50 border-t border-gray-200">
              {/* Reasoning */}
              {reasoning && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-sky-600" />
                    <h4 className="text-sm font-medium text-gray-900">Analysis Reasoning</h4>
                  </div>
                  <p className="text-sm text-gray-700 pl-6">{reasoning}</p>
                </div>
              )}

              {/* Context */}
              {evidence?.context && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    <h4 className="text-sm font-medium text-gray-900">Context</h4>
                  </div>
                  <p className="text-sm text-gray-700 pl-6">{evidence.context}</p>
                </div>
              )}

              {/* Quotes */}
              {evidence?.quotes && evidence.quotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Supporting Evidence</h4>
                  <div className="space-y-2">
                    {evidence.quotes.map((quote, index) => (
                      <div
                        key={index}
                        className="pl-6 pr-4 py-2 border-l-2 border-clay-300 bg-white rounded-r"
                      >
                        <p className="text-sm text-gray-700 italic">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

// Compact multi-indicator view
interface ImpactDepthOverviewProps {
  assessments: Array<{
    dimension: string
    score: number
    depth: DepthLevel
    confidence?: number
  }>
  onDimensionClick?: (dimension: string) => void
}

export function ImpactDepthOverview({ assessments, onDimensionClick }: ImpactDepthOverviewProps) {
  const avgScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length
  const avgConfidence = assessments.reduce((sum, a) => sum + (a.confidence || 0), 0) / assessments.length

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Impact Assessment Overview</h3>
          <p className="text-sm text-gray-600 mt-1">
            {assessments.length} dimensions analyzed
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(avgScore)}/100</div>
          <div className="text-xs text-gray-500">Average Score</div>
        </div>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment, index) => (
          <button
            key={index}
            onClick={() => onDimensionClick?.(assessment.dimension)}
            className={`w-full ${onDimensionClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'} transition-colors`}
            disabled={!onDimensionClick}
          >
            <ImpactDepthIndicator
              dimension={assessment.dimension}
              score={assessment.score}
              depth={assessment.depth}
              confidence={assessment.confidence}
              compact
            />
          </button>
        ))}
      </div>

      {avgConfidence > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Average Confidence</span>
            <span className="font-semibold text-gray-900">{Math.round(avgConfidence)}%</span>
          </div>
        </div>
      )}
    </Card>
  )
}

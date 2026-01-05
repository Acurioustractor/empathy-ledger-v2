'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  MessageSquare,
  TrendingUp,
  Info,
  Download,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface TranscriptAnalysisViewProps {
  transcriptId: string
  analysis: {
    id: string
    analyzer_version: string
    themes: Array<{
      name: string
      confidence: number
      category?: string
      sdg_mappings?: number[]
      usage_frequency?: number
    }>
    quotes: Array<{
      quote: string
      quality_score?: number
      themes?: string[]
      impact_category?: string
      cultural_context?: string
    }>
    impact_assessment?: {
      assessments: Array<{
        dimension: string
        score: number
        evidence: {
          quotes: string[]
          context: string
          depth: 'mention' | 'description' | 'demonstration' | 'transformation'
        }
        reasoning: string
        confidence: number
      }>
      overall_summary?: string
      key_strengths?: string[]
    }
    cultural_flags?: {
      community_voice_centered?: boolean
      depth_based_scoring?: boolean
      requires_elder_review?: boolean
      sacred_content?: boolean
    }
    quality_metrics?: {
      avg_confidence?: number
      accuracy?: number
    }
    processing_cost?: number
    processing_time_ms?: number
    created_at: string
  }
  testMode?: boolean
}

export function TranscriptAnalysisView({
  transcriptId,
  analysis,
  testMode = false
}: TranscriptAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState('themes')

  const handleExport = () => {
    if (testMode) {
      console.log('Export analysis (test mode)')
      return
    }

    const exportData = {
      transcriptId,
      analysis,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-analysis-${transcriptId}.json`
    a.click()
  }

  const depthColor = (depth: string) => {
    switch (depth) {
      case 'mention': return 'bg-gray-200 text-gray-700'
      case 'description': return 'bg-blue-200 text-blue-700'
      case 'demonstration': return 'bg-green-200 text-green-700'
      case 'transformation': return 'bg-purple-200 text-purple-700'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  const impactDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      relationship_strengthening: 'Relationship Strengthening',
      cultural_continuity: 'Cultural Continuity',
      community_empowerment: 'Community Empowerment',
      system_transformation: 'System Transformation'
    }
    return labels[dimension] || dimension
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Analyzer: {analysis.analyzer_version}
            {analysis.created_at && (
              <span className="ml-3">
                Analyzed: {new Date(analysis.created_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Processing Time */}
        {analysis.processing_time_ms !== undefined && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-sky-600" />
              <div>
                <p className="text-sm text-gray-600">Processing Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(analysis.processing_time_ms / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Processing Cost */}
        {analysis.processing_cost !== undefined && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${analysis.processing_cost.toFixed(4)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quality Score */}
        {analysis.quality_metrics?.avg_confidence !== undefined && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round(analysis.quality_metrics.avg_confidence)}%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Cultural Flags */}
        {analysis.cultural_flags && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              {analysis.cultural_flags.requires_elder_review ? (
                <AlertTriangle className="w-5 h-5 text-ember-600" />
              ) : (
                <Info className="w-5 h-5 text-sky-600" />
              )}
              <div>
                <p className="text-sm text-gray-600">Cultural Safety</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analysis.cultural_flags.requires_elder_review && 'Elder review required'}
                  {analysis.cultural_flags.sacred_content && 'Sacred content'}
                  {analysis.cultural_flags.community_voice_centered && 'Community-centered'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">
            <Brain className="w-4 h-4 mr-2" />
            Themes ({analysis.themes.length})
          </TabsTrigger>
          <TabsTrigger value="quotes">
            <MessageSquare className="w-4 h-4 mr-2" />
            Quotes ({analysis.quotes.length})
          </TabsTrigger>
          <TabsTrigger value="impact">
            <TrendingUp className="w-4 h-4 mr-2" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Info className="w-4 h-4 mr-2" />
            Metadata
          </TabsTrigger>
        </TabsList>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.themes.map((theme, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                  {theme.confidence !== undefined && (
                    <Badge variant="secondary">
                      {Math.round(theme.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>

                {theme.category && (
                  <p className="text-sm text-gray-600 mb-2">
                    Category: {theme.category}
                  </p>
                )}

                {theme.sdg_mappings && theme.sdg_mappings.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {theme.sdg_mappings.map((sdg) => (
                      <Badge key={sdg} variant="outline" className="text-xs">
                        SDG {sdg}
                      </Badge>
                    ))}
                  </div>
                )}

                {theme.usage_frequency !== undefined && (
                  <p className="text-xs text-gray-500 mt-2">
                    Mentioned {theme.usage_frequency} times
                  </p>
                )}
              </Card>
            ))}
          </div>

          {analysis.themes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No themes identified</p>
            </div>
          )}
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-4 mt-6">
          {analysis.quotes.map((quote, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <blockquote className="text-gray-900 italic flex-1">
                  "{quote.quote}"
                </blockquote>
                {quote.quality_score !== undefined && (
                  <Badge variant="secondary" className="ml-3">
                    {Math.round(quote.quality_score * 100)}% quality
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {quote.themes?.map((theme) => (
                  <Badge key={theme} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
                {quote.impact_category && (
                  <Badge variant="default" className="text-xs bg-clay-600">
                    {quote.impact_category}
                  </Badge>
                )}
              </div>

              {quote.cultural_context && (
                <p className="text-sm text-gray-600 mt-3">
                  <span className="font-medium">Cultural context:</span> {quote.cultural_context}
                </p>
              )}
            </Card>
          ))}

          {analysis.quotes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quotes extracted</p>
            </div>
          )}
        </TabsContent>

        {/* Impact Tab */}
        <TabsContent value="impact" className="space-y-6 mt-6">
          {analysis.impact_assessment?.overall_summary && (
            <Card className="p-6 bg-clay-50 border-clay-200">
              <h3 className="font-semibold text-gray-900 mb-2">Overall Impact Summary</h3>
              <p className="text-gray-700">{analysis.impact_assessment.overall_summary}</p>
            </Card>
          )}

          {analysis.impact_assessment?.key_strengths &&
           analysis.impact_assessment.key_strengths.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Key Strengths</h3>
              <ul className="space-y-2">
                {analysis.impact_assessment.key_strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {analysis.impact_assessment?.assessments?.map((assessment, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {impactDimensionLabel(assessment.dimension)}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-clay-600 h-2 rounded-full"
                        style={{ width: `${assessment.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {assessment.score}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Badge className={depthColor(assessment.evidence.depth)}>
                    {assessment.evidence.depth}
                  </Badge>
                  {assessment.confidence !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(assessment.confidence)}% confidence
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-700">
                  <span className="font-medium">Context:</span> {assessment.evidence.context}
                </p>

                {assessment.reasoning && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Reasoning:</span> {assessment.reasoning}
                  </p>
                )}

                {assessment.evidence.quotes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Evidence:</p>
                    <ul className="space-y-2">
                      {assessment.evidence.quotes.map((quote, qIndex) => (
                        <li key={qIndex} className="text-sm text-gray-600 italic pl-4 border-l-2 border-clay-300">
                          "{quote}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {!analysis.impact_assessment?.assessments?.length && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No impact assessment available</p>
            </div>
          )}
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Analysis Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-600">Analyzer Version</dt>
                <dd className="text-sm text-gray-900">{analysis.analyzer_version}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-600">Analysis ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{analysis.id}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-600">Transcript ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{transcriptId}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-600">Analyzed At</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(analysis.created_at).toLocaleString()}
                </dd>
              </div>

              {analysis.processing_time_ms !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Processing Time</dt>
                  <dd className="text-sm text-gray-900">
                    {analysis.processing_time_ms}ms ({(analysis.processing_time_ms / 1000).toFixed(2)}s)
                  </dd>
                </div>
              )}

              {analysis.processing_cost !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Processing Cost</dt>
                  <dd className="text-sm text-gray-900">
                    ${analysis.processing_cost.toFixed(4)} USD
                  </dd>
                </div>
              )}

              {analysis.quality_metrics && (
                <>
                  {analysis.quality_metrics.avg_confidence !== undefined && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Average Confidence</dt>
                      <dd className="text-sm text-gray-900">
                        {Math.round(analysis.quality_metrics.avg_confidence)}%
                      </dd>
                    </div>
                  )}

                  {analysis.quality_metrics.accuracy !== undefined && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Accuracy</dt>
                      <dd className="text-sm text-gray-900">
                        {Math.round(analysis.quality_metrics.accuracy * 100)}%
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </Card>

          {analysis.cultural_flags && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Cultural Safety Flags</h3>
              <div className="space-y-2">
                {analysis.cultural_flags.community_voice_centered && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Community Voice Centered</span>
                  </div>
                )}
                {analysis.cultural_flags.depth_based_scoring && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Depth-Based Scoring</span>
                  </div>
                )}
                {analysis.cultural_flags.requires_elder_review && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-ember-600" />
                    <span className="text-sm text-gray-700">Requires Elder Review</span>
                  </div>
                )}
                {analysis.cultural_flags.sacred_content && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-ember-600" />
                    <span className="text-sm text-gray-700">Sacred Content Detected</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

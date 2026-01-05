'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TranscriptAnalysisView } from '@/components/analysis/TranscriptAnalysisView'
import { ThemeDistributionChart } from '@/components/analysis/ThemeDistributionChart'
import { ImpactDepthIndicator, ImpactDepthOverview } from '@/components/analysis/ImpactDepthIndicator'
import { TranscriptAnalyticsDashboard } from '@/components/analytics/TranscriptAnalyticsDashboard'
import { AnalysisQualityMetrics } from '@/components/analytics/AnalysisQualityMetrics'
import {
  Brain,
  BarChart,
  TrendingUp,
  PieChart,
  Target,
  CheckCircle,
  Zap,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock data for TranscriptAnalysisView
const mockAnalysis = {
  id: 'test-analysis-123',
  analyzer_version: 'v3-claude-sonnet-4.5',
  themes: [
    {
      name: 'Cultural Knowledge Transmission',
      confidence: 0.92,
      category: 'Knowledge Transmission',
      sdg_mappings: [4, 10],
      usage_frequency: 12
    },
    {
      name: 'Community Self-Determination',
      confidence: 0.88,
      category: 'Community Wellbeing',
      sdg_mappings: [10, 16],
      usage_frequency: 8
    },
    {
      name: 'Language Revitalization',
      confidence: 0.85,
      category: 'Language & Expression',
      sdg_mappings: [4, 10],
      usage_frequency: 6
    },
    {
      name: 'Traditional Land Stewardship',
      confidence: 0.90,
      category: 'Land & Environment',
      sdg_mappings: [13, 15],
      usage_frequency: 10
    },
    {
      name: 'Intergenerational Healing',
      confidence: 0.87,
      category: 'Community Wellbeing',
      sdg_mappings: [3, 10],
      usage_frequency: 7
    }
  ],
  quotes: [
    {
      quote: 'We teach our young people the old ways, ensuring our culture lives on for generations to come.',
      quality_score: 0.95,
      themes: ['Cultural Knowledge Transmission'],
      impact_category: 'Cultural Continuity',
      cultural_context: 'Intergenerational knowledge sharing in community setting'
    },
    {
      quote: 'When we speak our language, we connect with our ancestors and carry their wisdom forward.',
      quality_score: 0.92,
      themes: ['Language Revitalization'],
      impact_category: 'Cultural Continuity',
      cultural_context: 'Language as connection to ancestral knowledge'
    },
    {
      quote: 'The land teaches us everything we need to know. We are its caretakers, not its owners.',
      quality_score: 0.94,
      themes: ['Traditional Land Stewardship'],
      impact_category: 'System Transformation',
      cultural_context: 'Traditional ecological knowledge and relationship to land'
    },
    {
      quote: 'Our community makes decisions together. Every voice matters, especially our Elders.',
      quality_score: 0.89,
      themes: ['Community Self-Determination'],
      impact_category: 'Community Empowerment',
      cultural_context: 'Collective decision-making and Elder respect'
    }
  ],
  impact_assessment: {
    assessments: [
      {
        dimension: 'cultural_continuity',
        score: 85,
        evidence: {
          quotes: [
            'We teach our young people the old ways',
            'When we speak our language, we connect with our ancestors'
          ],
          context: 'Active intergenerational teaching program with language revitalization efforts',
          depth: 'demonstration'
        },
        reasoning: 'Strong evidence of cultural practice transmission through structured teaching and language use. Multiple quotes demonstrate active engagement in cultural continuity.',
        confidence: 90
      },
      {
        dimension: 'relationship_strengthening',
        score: 72,
        evidence: {
          quotes: [
            'Our community makes decisions together',
            'Every voice matters, especially our Elders'
          ],
          context: 'Community-based decision making with Elder involvement',
          depth: 'description'
        },
        reasoning: 'Clear description of relationship-building through collective decision-making and Elder respect.',
        confidence: 85
      },
      {
        dimension: 'community_empowerment',
        score: 78,
        evidence: {
          quotes: ['Our community makes decisions together'],
          context: 'Collective decision-making structures in place',
          depth: 'demonstration'
        },
        reasoning: 'Evidence of community agency in decision-making processes with inclusive practices.',
        confidence: 82
      },
      {
        dimension: 'system_transformation',
        score: 68,
        evidence: {
          quotes: ['The land teaches us everything we need to know'],
          context: 'Traditional ecological knowledge informing land management',
          depth: 'description'
        },
        reasoning: 'Traditional knowledge systems being applied, though structural transformation is still developing.',
        confidence: 75
      }
    ],
    overall_summary: 'Strong cultural continuity with active intergenerational knowledge transmission and language revitalization. Community demonstrates self-determination through collective decision-making and Elder respect. Traditional land stewardship practices are maintained.',
    key_strengths: [
      'Active Elder involvement in teaching and decision-making',
      'Youth engagement in cultural practices and language learning',
      'Living language use connecting generations',
      'Traditional ecological knowledge maintained and applied',
      'Collective community governance structures'
    ]
  },
  cultural_flags: {
    community_voice_centered: true,
    depth_based_scoring: true,
    requires_elder_review: false,
    sacred_content: false
  },
  quality_metrics: {
    avg_confidence: 0.89,
    accuracy: 0.92
  },
  processing_cost: 0.068,
  processing_time_ms: 12500,
  created_at: new Date().toISOString()
}

// Mock data for ThemeDistributionChart
const mockThemes = [
  { name: 'Cultural Knowledge Transmission', count: 45, category: 'Knowledge Transmission', confidence: 0.91 },
  { name: 'Community Self-Determination', count: 38, category: 'Community Wellbeing', confidence: 0.88 },
  { name: 'Language Revitalization', count: 32, category: 'Language & Expression', confidence: 0.85 },
  { name: 'Traditional Land Stewardship', count: 28, category: 'Land & Environment', confidence: 0.90 },
  { name: 'Intergenerational Healing', count: 24, category: 'Community Wellbeing', confidence: 0.87 },
  { name: 'Indigenous Rights Advocacy', count: 22, category: 'Justice & Rights', confidence: 0.84 },
  { name: 'Cultural Sovereignty', count: 20, category: 'Cultural Sovereignty', confidence: 0.92 },
  { name: 'Traditional Economic Practices', count: 18, category: 'Economic Development', confidence: 0.79 },
  { name: 'Community-Based Governance', count: 16, category: 'Governance', confidence: 0.86 },
  { name: 'Sacred Site Protection', count: 14, category: 'Land & Environment', confidence: 0.93 },
  { name: 'Youth Leadership Development', count: 12, category: 'Community Wellbeing', confidence: 0.81 },
  { name: 'Traditional Arts & Crafts', count: 10, category: 'Cultural Sovereignty', confidence: 0.88 }
]

// Mock data for TranscriptAnalyticsDashboard
const mockAnalytics = {
  totalTranscripts: 150,
  totalAnalyzed: 142,
  themeDistribution: mockThemes,
  quoteQuality: {
    average: 0.87,
    total: 456
  },
  culturalSensitivity: {
    sacred: 12,
    sensitive: 34,
    standard: 96
  },
  impactDepth: {
    mention: 28,
    description: 54,
    demonstration: 42,
    transformation: 18
  },
  processingCosts: {
    total: 9.66,
    average: 0.068
  },
  processingTime: {
    average: 12400,
    total: 1760800
  },
  dateRange: {
    start: '2025-12-01',
    end: '2026-01-06'
  }
}

// Mock data for AnalysisQualityMetrics
const mockQualityMetrics = {
  currentMetrics: {
    accuracy: 92.5,
    quoteVerificationRate: 88.3,
    themeNormalizationSuccess: 96.7,
    culturalFlagAccuracy: 97.2,
    avgCostPerTranscript: 0.068,
    avgProcessingTime: 12400
  },
  trends: [],
  analyzerVersion: 'v3-claude-sonnet-4.5',
  totalAnalyses: 142,
  testMode: true
}

export default function Sprint3TestPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // API Testing state
  const [transcriptId, setTranscriptId] = useState('')
  const [sampleTranscript, setSampleTranscript] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [apiResult, setApiResult] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleAnalyzeTranscript = async () => {
    if (!transcriptId && !sampleTranscript) {
      setApiError('Please provide either a transcript ID or sample text')
      return
    }

    setApiLoading(true)
    setApiError(null)
    setApiResult(null)

    try {
      if (transcriptId) {
        // Test analyze-indigenous-impact endpoint
        const response = await fetch('/api/ai/analyze-indigenous-impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcriptId })
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        setApiResult(data)
      } else {
        // For sample text, we'd need to create a transcript first
        setApiError('Sample text analysis not yet implemented. Please use an existing transcript ID.')
      }
    } catch (error: any) {
      setApiError(error.message || 'Failed to analyze transcript')
    } finally {
      setApiLoading(false)
    }
  }

  const handleLoadFromDatabase = async () => {
    setApiLoading(true)
    setApiError(null)
    setApiResult(null)

    try {
      // Fetch existing analysis results from database
      const response = await fetch(`/api/analysis/results?transcriptId=${transcriptId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      setApiResult(data)
    } catch (error: any) {
      setApiError(error.message || 'Failed to load analysis results')
    } finally {
      setApiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Sprint 3: Transcript Analysis & Impact
          </h1>
          <p className="text-lg text-gray-600">
            Test all 5 analysis and analytics components
          </p>
          <div className="flex justify-center gap-3">
            <Badge variant="default" className="bg-clay-600">
              Phase 1 & 2 Complete
            </Badge>
            <Badge variant="outline">
              5 Components
            </Badge>
            <Badge variant="outline">
              ~1,980 lines of code
            </Badge>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">9/10</div>
                <div className="text-sm text-green-700">Tasks Complete</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-clay-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">v3</div>
                <div className="text-sm text-gray-600">Analysis Stack</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-10 h-10 text-sky-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">92.5%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">$0.068</div>
                <div className="text-sm text-gray-600">Cost/Transcript</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Component Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-test">
              <Zap className="w-4 h-4 mr-2" />
              API Test
            </TabsTrigger>
            <TabsTrigger value="analysis-view">
              <Brain className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="theme-chart">
              <BarChart className="w-4 h-4 mr-2" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="impact">
              <TrendingUp className="w-4 h-4 mr-2" />
              Impact
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <PieChart className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="quality">
              <Target className="w-4 h-4 mr-2" />
              Quality
            </TabsTrigger>
          </TabsList>

          {/* API Test Tab */}
          <TabsContent value="api-test" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                API Testing - Live Analysis
              </h2>
              <p className="text-gray-700 mb-6">
                Test the Sprint 3 API endpoints with real transcripts and see the analysis pipeline in action.
              </p>

              <div className="space-y-6">
                {/* Transcript ID Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Transcript ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter existing transcript ID"
                      value={transcriptId}
                      onChange={(e) => setTranscriptId(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleLoadFromDatabase}
                      disabled={apiLoading || !transcriptId}
                      variant="outline"
                    >
                      {apiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load Existing'
                      )}
                    </Button>
                    <Button
                      onClick={handleAnalyzeTranscript}
                      disabled={apiLoading || !transcriptId}
                    >
                      {apiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Run New Analysis
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Load Existing:</strong> GET /api/analysis/results (GPT-4 data from Dec 2025) • <strong>Run New:</strong> POST /api/ai/analyze-indigenous-impact (v3 depth-based)
                  </p>
                </div>

                {/* Sample Transcript Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Or Test with Sample Text
                  </label>
                  <Textarea
                    placeholder="Paste transcript text here to analyze..."
                    value={sampleTranscript}
                    onChange={(e) => setSampleTranscript(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Sample text analysis requires creating a transcript first (not yet implemented)
                  </p>
                </div>

                {/* Error Display */}
                {apiError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{apiError}</AlertDescription>
                  </Alert>
                )}

                {/* Results Display */}
                {apiResult && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
                      <Badge variant="default" className="bg-green-600">
                        Success
                      </Badge>
                    </div>

                    {/* Display with TranscriptAnalysisView */}
                    {apiResult.analysis && (
                      <>
                        {/* Metadata badges */}
                        <div className="flex gap-2 mb-4">
                          <Badge variant="outline">
                            {apiResult.analysis.analyzer_version || apiResult.metadata?.aiModel || 'unknown'}
                          </Badge>
                          <Badge variant="outline">
                            {apiResult.metadata?.source || 'unknown source'}
                          </Badge>
                          {apiResult.metadata?.hasStorytellerQuotes && (
                            <Badge variant="outline" className="bg-green-50">
                              {apiResult.analysis.quotes?.length || 0} quotes
                            </Badge>
                          )}
                        </div>

                        <TranscriptAnalysisView
                          transcriptId={apiResult.transcriptId}
                          analysis={apiResult.analysis}
                        />
                      </>
                    )}

                    {/* Raw JSON Output */}
                    <Card className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Raw API Response</h4>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(apiResult, null, 2)}
                      </pre>
                    </Card>
                  </div>
                )}

                {/* Instructions */}
                {!apiResult && !apiError && !apiLoading && (
                  <Card className="p-4 bg-sky-50 border-sky-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">How to Test:</h4>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Option 1: Load Existing GPT-4 Analysis (125 transcripts available)</p>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-2">
                          <li>Get a transcript ID from database</li>
                          <li>Click "Load Existing" to fetch GPT-4 analysis from Dec 2025</li>
                          <li>View themes, quotes, and analysis in TranscriptAnalysisView component</li>
                        </ol>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Option 2: Run New v3 Analysis (depth-based impact scoring)</p>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-2">
                          <li>Enter transcript ID</li>
                          <li>Click "Run New Analysis" (uses Ollama/Claude AI)</li>
                          <li>Results stored in transcript_analysis_results table</li>
                          <li>View depth-based impact assessment</li>
                        </ol>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">Get transcript IDs:</p>
                      <code className="text-xs text-gray-600">
                        SELECT id, title, ai_model_version FROM transcripts WHERE ai_processing_status = 'deep_analyzed' LIMIT 10;
                      </code>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Sample IDs to try:</strong> b4a2572f-7b95-48c8-b3d8-7f2ca8bfc4df, 2bd2a5f4-f043-4b3d-9e8b-18f4789ae8d7
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sprint 3 Components Overview
              </h2>
              <p className="text-gray-700 mb-6">
                This test page demonstrates all 5 analysis and analytics components built in Sprint 3.
                Each component uses mock data and operates in test mode (no API calls required).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-clay-50 border-clay-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    1. TranscriptAnalysisView
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Comprehensive 4-tab interface for displaying transcript analysis results
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Themes Tab: Themes with confidence, categories, SDG mappings</li>
                    <li>• Quotes Tab: Extracted quotes with quality scores</li>
                    <li>• Impact Tab: Visual impact assessment with depth indicators</li>
                    <li>• Metadata Tab: Analysis version, costs, processing time</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-sage-50 border-sage-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2. ThemeDistributionChart
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Dual-view theme visualization with category color coding
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Chart View: Horizontal bars with category colors</li>
                    <li>• Table View: Sortable data table with rankings</li>
                    <li>• 8 category color coding</li>
                    <li>• Summary statistics and export</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-sky-50 border-sky-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    3. ImpactDepthIndicator
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    4-level depth progression visualization with evidence
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Mention → Description → Demonstration → Transformation</li>
                    <li>• Progress bars with color gradients</li>
                    <li>• Expandable evidence (quotes, reasoning, context)</li>
                    <li>• Compact mode for dashboards</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    4. TranscriptAnalyticsDashboard
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Aggregate metrics across all transcripts with filtering
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Key metrics: transcripts, themes, quotes, costs</li>
                    <li>• Cultural sensitivity breakdown</li>
                    <li>• Impact depth distribution</li>
                    <li>• Filters: date, org, project, storyteller</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    5. AnalysisQualityMetrics
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Performance tracking with 6 KPIs and recommendations
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 6 KPI cards with color-coded status</li>
                    <li>• Trend indicators (up/down arrows)</li>
                    <li>• Performance summary and recommendations</li>
                    <li>• AI investment ROI calculator</li>
                  </ul>
                </Card>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-clay-600 mb-2">~1,980</div>
                <div className="text-sm text-gray-600">Lines of Code</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-sage-600 mb-2">90%</div>
                <div className="text-sm text-gray-600">Sprint Complete</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-sky-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Test Mode</div>
              </Card>
            </div>
          </TabsContent>

          {/* TranscriptAnalysisView Tab */}
          <TabsContent value="analysis-view" className="mt-6">
            <TranscriptAnalysisView
              transcriptId="test-transcript-123"
              analysis={mockAnalysis}
              testMode
            />
          </TabsContent>

          {/* ThemeDistributionChart Tab */}
          <TabsContent value="theme-chart" className="mt-6">
            <ThemeDistributionChart
              themes={mockThemes}
              showCategories
              limit={10}
              testMode
            />
          </TabsContent>

          {/* ImpactDepthIndicator Tab */}
          <TabsContent value="impact" className="space-y-6 mt-6">
            {/* Overview */}
            <ImpactDepthOverview
              assessments={mockAnalysis.impact_assessment.assessments.map(a => ({
                dimension: a.dimension,
                score: a.score,
                depth: a.evidence.depth,
                confidence: a.confidence
              }))}
            />

            {/* Individual Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockAnalysis.impact_assessment.assessments.map((assessment, index) => (
                <ImpactDepthIndicator
                  key={index}
                  dimension={assessment.dimension}
                  score={assessment.score}
                  depth={assessment.evidence.depth}
                  evidence={assessment.evidence}
                  reasoning={assessment.reasoning}
                  confidence={assessment.confidence}
                  showEvidence
                />
              ))}
            </div>
          </TabsContent>

          {/* TranscriptAnalyticsDashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <TranscriptAnalyticsDashboard
              analytics={mockAnalytics}
              testMode
            />
          </TabsContent>

          {/* AnalysisQualityMetrics Tab */}
          <TabsContent value="quality" className="mt-6">
            <AnalysisQualityMetrics
              currentMetrics={mockQualityMetrics.currentMetrics}
              trends={mockQualityMetrics.trends}
              analyzerVersion={mockQualityMetrics.analyzerVersion}
              totalAnalyses={mockQualityMetrics.totalAnalyses}
              testMode
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="p-6 bg-gray-50 border-gray-200">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900">Sprint 3 Status</h3>
            <p className="text-sm text-gray-600">
              ✅ Phase 1 & 2 Complete • ⏳ Testing in Progress
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/test/sprint-1">Sprint 1 Tests</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/test/sprint-2">Sprint 2 Tests</a>
              </Button>
              <Button variant="default" size="sm" disabled>
                Sprint 3 Tests (Current)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

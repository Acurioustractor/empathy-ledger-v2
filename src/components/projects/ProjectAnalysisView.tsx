'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Heart, Users, Globe, Lightbulb, BookOpen, TreePine,
  Quote, TrendingUp, Network, MessageCircle, ArrowRight,
  Star, Eye, Compass, Building, Sprout
} from 'lucide-react'
import { ProjectOutcomesView } from './ProjectOutcomesView'

interface ProjectAnalysisViewProps {
  projectId: string
  organizationId: string
  projectName: string
  organizationName: string
}

interface AnalysisData {
  projectInfo: {
    id: string
    name: string
    description: string
    organizationName: string
    storytellerCount: number
    transcriptCount: number
  }
  storytellers: Array<{
    id: string
    displayName: string
    profileImageUrl?: string
    bio?: string
    culturalBackground?: string
    transcriptCount: number
    themes: string[]
    impactInsights: any[]
  }>
  aggregatedInsights: {
    overallThemes: Array<{ theme: string; frequency: number; storytellers: string[] }>
    impactFramework: {
      relationshipStrengthening: number
      culturalContinuity: number
      communityEmpowerment: number
      systemTransformation: number
      healingProgression: number
      knowledgePreservation: number
    }
    projectOutcomes?: {
      project_name: string
      outcomes: Array<{
        category: string
        description: string
        evidence_found: string[]
        storytellers_mentioning: string[]
        strength: 'not_mentioned' | 'mentioned' | 'described' | 'demonstrated'
        score: number
      }>
      overall_progress_summary: string
      key_wins: string[]
      gaps_or_opportunities: string[]
    }
    powerfulQuotes: Array<{
      quote: string
      speaker: string
      impactType: string
      confidence: number
    }>
    recommendations: {
      continuationSuggestions: string[]
      keyConnections: string[]
      systemChangeOpportunities: string[]
      communityEngagementStrategy: string[]
    }
  }
  humanStoryExtracts: {
    transformationMoments: string[]
    wisdomShared: string[]
    challengesOvercome: string[]
    communityImpact: string[]
  }
}

export function ProjectAnalysisView({ projectId, organizationId, projectName, organizationName }: ProjectAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadProjectAnalysis()
  }, [projectId])

  const loadProjectAnalysis = async () => {
    try {
      setLoading(true)
      // Use intelligent AI by default for professional-quality analysis
      const response = await fetch(`/api/projects/${projectId}/analysis?intelligent=true`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Handle intelligent AI response structure
      if (data.analysis_type === 'intelligent_ai') {
        setAnalysis(data.intelligentAnalysis)
      } else {
        setAnalysis(data.analysis)
      }
    } catch (err) {
      console.error('Error loading project analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-grey-600">Analyzing project impact and insights...</p>
          <p className="text-sm text-grey-500 mt-2">This may take a moment as we process all storyteller contributions</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadProjectAnalysis} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
          Try Again
        </Button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-grey-50 border border-grey-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-grey-800 mb-2">No Analysis Available</h3>
        <p className="text-grey-600">Unable to load project analysis data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">{analysis.projectInfo.storytellerCount}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-blue-800">Community Voices</p>
            <p className="text-xs text-blue-600 mt-1">Storytellers sharing their experiences</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-2xl font-bold text-green-700">{analysis.projectInfo.transcriptCount}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-green-800">Stories Captured</p>
            <p className="text-xs text-green-600 mt-1">Transcripts analysed for insights</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">{analysis.aggregatedInsights.overallThemes.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-purple-800">Key Themes</p>
            <p className="text-xs text-purple-600 mt-1">Patterns across all stories</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Quote className="w-6 h-6 text-amber-600" />
              <span className="text-2xl font-bold text-amber-700">{analysis.aggregatedInsights.powerfulQuotes.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-amber-800">Powerful Quotes</p>
            <p className="text-xs text-amber-600 mt-1">High-impact community voices</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {analysis?.aggregatedInsights?.projectOutcomes ? 'Project Outcomes' : 'Impact Framework'}
          </TabsTrigger>
          <TabsTrigger value="voices" className="flex items-center gap-2">
            <Quote className="w-4 h-4" />
            Community Voices
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Thematic Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Path Forward
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab analysis={analysis} />
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          {analysis?.aggregatedInsights?.projectOutcomes ? (
            <ProjectOutcomesView outcomes={analysis.aggregatedInsights.projectOutcomes} />
          ) : (
            <ImpactFrameworkTab analysis={analysis} />
          )}
        </TabsContent>

        <TabsContent value="voices" className="space-y-6">
          <CommunityVoicesTab analysis={analysis} />
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <ThematicAnalysisTab analysis={analysis} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsTab analysis={analysis} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OverviewTab({ analysis }: { analysis: AnalysisData }) {
  const impactColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1']

  const impactData = Object.entries(analysis.aggregatedInsights.impactFramework).map(([key, value], index) => ({
    name: key
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .trim() // Remove leading/trailing spaces
      .split(' ') // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join(' '), // Join back together
    value: Math.round(value * 100),
    colour: impactColors[index]
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Project Impact Radar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Impact Framework Overview
          </CardTitle>
          <CardDescription>
            Community-defined success indicators based on Indigenous frameworks and storyteller voices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={impactData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" className="text-sm" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} />
                <Radar
                  name="Impact Score"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Storytellers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Community Storytellers
          </CardTitle>
          <CardDescription>
            The voices that shape this project&apos;s narrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analysis.storytellers || []).slice(0, 5).map((storyteller) => (
              <div key={storyteller.id} className="flex items-start gap-3 p-3 bg-grey-50 rounded-lg">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage
                    src={storyteller.profileImageUrl}
                    alt={storyteller.displayName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                    {storyteller.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-grey-900">{storyteller.displayName}</p>
                  <p className="text-sm text-grey-600 truncate">
                    {storyteller.transcriptCount} story{storyteller.transcriptCount !== 1 ? 's' : ''} •
                    {storyteller.themes.length} themes
                  </p>
                  {storyteller.culturalBackground && (
                    <p className="text-xs text-grey-500 mt-1">{storyteller.culturalBackground}</p>
                  )}
                </div>
              </div>
            ))}
            {analysis.storytellers.length > 5 && (
              <p className="text-sm text-grey-500 text-center pt-2">
                And {analysis.storytellers.length - 5} more community voices...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            Dominant Themes
          </CardTitle>
          <CardDescription>
            Most frequent patterns across all community stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analysis.aggregatedInsights?.overallThemes || []).slice(0, 8).map((theme, index) => (
              <div key={theme.theme} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-grey-900">{theme.theme}</p>
                  <p className="text-sm text-grey-600">
                    {theme.frequency} mention{theme.frequency !== 1 ? 's' : ''} •
                    {theme.storytellers.length} storyteller{theme.storytellers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-12 h-2 bg-grey-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${(theme.frequency / analysis.aggregatedInsights.overallThemes[0].frequency) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ImpactFrameworkTab({ analysis }: { analysis: AnalysisData }) {
  const impactIcons = {
    'Relationship Strengthening': <Heart className="w-6 h-6" />,
    'Cultural Continuity': <TreePine className="w-6 h-6" />,
    'Community Empowerment': <Users className="w-6 h-6" />,
    'System Transformation': <Globe className="w-6 h-6" />,
    'Healing Progression': <Sprout className="w-6 h-6" />,
    'Knowledge Preservation': <BookOpen className="w-6 h-6" />
  }

  const impactDescriptions = {
    'Relationship Strengthening': 'Building trust, connections, and authentic partnerships across communities',
    'Cultural Continuity': 'Maintaining and revitalizing traditions, practices, and cultural identity',
    'Community Empowerment': 'Increasing collective power, self-determination, and community-led decision making',
    'System Transformation': 'Changing institutions and policies to be more responsive to community needs',
    'Healing Progression': 'Supporting individual and collective healing from historical and ongoing trauma',
    'Knowledge Preservation': 'Safeguarding and transmitting traditional knowledge and wisdom'
  }

  const impactData = Object.entries(analysis.aggregatedInsights.impactFramework).map(([key, value]) => ({
    name: key
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .trim() // Remove leading/trailing spaces
      .split(' ') // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join(' '), // Join back together
    value: Math.round(value), // Value is already 0-100, don't multiply by 100
    fullValue: value
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Indigenous Impact Framework Analysis
          </CardTitle>
          <CardDescription>
            Based on community-defined success indicators derived from actual storyteller voices and Indigenous methodologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactData.map((impact) => {
              const iconKey = impact.name as keyof typeof impactIcons
              const descKey = impact.name as keyof typeof impactDescriptions

              return (
                <Card key={impact.name} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                        {impactIcons[iconKey] || <Star className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-grey-900">{impact.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-grey-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${impact.value}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-grey-700">{impact.value}%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-grey-600">{impactDescriptions[descKey]}</p>
                    <div className="mt-3 p-2 bg-grey-50 rounded text-xs text-grey-500">
                      Impact Score: {impact.value} / 100
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What These Scores Mean</CardTitle>
          <CardDescription>Understanding our community-centred impact measurement approach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-grey-900">Scoring Methodology</h4>
              <ul className="space-y-2 text-sm text-grey-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Scores are derived from actual language patterns in community stories
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Higher scores indicate stronger evidence of that impact type
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Framework based on Indigenous success indicators, not colonial metrics
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Validated against real community experiences and outcomes
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-grey-900">Interpretation Guide</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-2 bg-red-200 rounded-full">
                    <div className="w-3/12 h-2 bg-red-500 rounded-full" />
                  </div>
                  <span className="text-sm text-grey-600">0-25%: Emerging</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-2 bg-yellow-200 rounded-full">
                    <div className="w-6/12 h-2 bg-yellow-500 rounded-full" />
                  </div>
                  <span className="text-sm text-grey-600">26-50%: Developing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-2 bg-blue-200 rounded-full">
                    <div className="w-9/12 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-sm text-grey-600">51-75%: Strong</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-2 bg-green-200 rounded-full">
                    <div className="w-full h-2 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-sm text-grey-600">76-100%: Transformative</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CommunityVoicesTab({ analysis }: { analysis: AnalysisData }) {
  return (
    <div className="space-y-6">
      {/* Powerful Quotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-blue-600" />
            Powerful Community Voices
          </CardTitle>
          <CardDescription>
            High-impact quotes that demonstrate the human story and transformational power of this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(analysis.aggregatedInsights?.powerfulQuotes || []).map((quote, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
                <CardContent className="p-6">
                  <blockquote className="text-grey-800 mb-4 leading-relaxed">
                    &ldquo;{quote.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-grey-900">— {quote.speaker}</p>
                      <p className="text-sm text-grey-600 capitalize">
                        {quote.impactType.replace(/_/g, ' ')} Impact
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{Math.round(quote.confidence * 100)}%</span>
                      </div>
                      <p className="text-xs text-grey-500">confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Human Story Extracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Transformation Moments
            </CardTitle>
            <CardDescription>Stories of change, growth, and breakthrough</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis.humanStoryExtracts?.transformationMoments || []).slice(0, 5).map((moment, index) => (
                <div key={index} className="p-3 bg-green-50 border-l-2 border-green-400 rounded-r">
                  <p className="text-sm text-grey-700">{moment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Wisdom Shared
            </CardTitle>
            <CardDescription>Knowledge and insights passed between generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis.humanStoryExtracts?.wisdomShared || []).slice(0, 5).map((wisdom, index) => (
                <div key={index} className="p-3 bg-purple-50 border-l-2 border-purple-400 rounded-r">
                  <p className="text-sm text-grey-700">{wisdom}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Challenges Overcome
            </CardTitle>
            <CardDescription>Stories of resilience and perseverance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis.humanStoryExtracts?.challengesOvercome || []).slice(0, 5).map((challenge, index) => (
                <div key={index} className="p-3 bg-blue-50 border-l-2 border-blue-400 rounded-r">
                  <p className="text-sm text-grey-700">{challenge}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Community Impact
            </CardTitle>
            <CardDescription>How individual stories create collective change</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis.humanStoryExtracts?.communityImpact || []).slice(0, 5).map((impact, index) => (
                <div key={index} className="p-3 bg-amber-50 border-l-2 border-amber-400 rounded-r">
                  <p className="text-sm text-grey-700">{impact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ThematicAnalysisTab({ analysis }: { analysis: AnalysisData }) {
  const themeColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5A2B', '#EC4899']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            Thematic Patterns Across Stories
          </CardTitle>
          <CardDescription>
            Common themes that emerge from community storytelling, showing shared experiences and values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.aggregatedInsights.overallThemes.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="theme" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-4 border border-grey-200 rounded-lg shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-600">Frequency: {data.frequency}</p>
                          <p className="text-grey-600">Storytellers: {data.storytellers.length}</p>
                          <div className="mt-2 text-xs text-grey-500">
                            Featured in: {data.storytellers.slice(0, 3).join(', ')}
                            {data.storytellers.length > 3 && ` +${data.storytellers.length - 3} more`}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="frequency" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(analysis.aggregatedInsights?.overallThemes || []).slice(0, 12).map((theme, index) => (
              <Card key={theme.theme} className="border-l-4" style={{ borderLeftColor: themeColors[index % themeColors.length] }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-grey-900">{theme.theme}</h4>
                    <Badge variant="outline">{theme.frequency}</Badge>
                  </div>
                  <p className="text-sm text-grey-600 mb-3">
                    Mentioned across {theme.storytellers.length} storyteller{theme.storytellers.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(theme.storytellers || []).slice(0, 3).map((storyteller, idx) => (
                      <span key={idx} className="text-xs bg-grey-100 px-2 py-1 rounded">
                        {storyteller}
                      </span>
                    ))}
                    {theme.storytellers.length > 3 && (
                      <span className="text-xs text-grey-500">+{theme.storytellers.length - 3} more</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storyteller Theme Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Storyteller Contributions</CardTitle>
          <CardDescription>How each community member contributes to the overall thematic landscape</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analysis.storytellers || []).map((storyteller, index) => (
              <div key={storyteller.id} className="p-4 border border-grey-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage
                        src={storyteller.profileImageUrl}
                        alt={storyteller.displayName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {storyteller.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-grey-900">{storyteller.displayName}</h4>
                      <p className="text-sm text-grey-600">
                        {storyteller.transcriptCount} transcript{storyteller.transcriptCount !== 1 ? 's' : ''} •
                        {storyteller.themes.length} theme{storyteller.themes.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {storyteller.impactInsights.length} insights
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(storyteller.themes || []).map((theme, themeIndex) => (
                    <Badge
                      key={themeIndex}
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${themeColors[themeIndex % themeColors.length]}20`,
                        colour: themeColors[themeIndex % themeColors.length]
                      }}
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecommendationsTab({ analysis }: { analysis: AnalysisData }) {
  const recommendations = analysis.aggregatedInsights?.recommendations || {}

  // Ensure all recommendation arrays exist
  const safeRecommendations = {
    continuationSuggestions: Array.isArray(recommendations.continuationSuggestions) ? recommendations.continuationSuggestions : [],
    keyConnections: Array.isArray(recommendations.keyConnections) ? recommendations.keyConnections : [],
    systemChangeOpportunities: Array.isArray(recommendations.systemChangeOpportunities) ? recommendations.systemChangeOpportunities : [],
    communityEngagementStrategy: Array.isArray(recommendations.communityEngagementStrategy) ? recommendations.communityEngagementStrategy : []
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Strategic Path Forward
          </CardTitle>
          <CardDescription>
            AI-generated recommendations based on community stories, impact patterns, and Indigenous development principles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-lg text-grey-700 font-medium">
              Building on the stories and wisdom shared by {analysis.projectInfo.storytellerCount} community members
            </p>
            <p className="text-grey-600 mt-2">
              These recommendations honour community voice and prioritize sustainable, relationship-based approaches
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ArrowRight className="w-5 h-5" />
              Continuation Strategies
            </CardTitle>
            <CardDescription>How to sustainably continue this project with community leadership</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeRecommendations.continuationSuggestions.length > 0 ? (
                safeRecommendations.continuationSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-grey-700">{suggestion}</span>
                  </li>
                ))
              ) : (
                <li className="text-grey-500 italic">No continuation suggestions available</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Network className="w-5 h-5" />
              Key Connections
            </CardTitle>
            <CardDescription>Who else should be involved in this journey</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeRecommendations.keyConnections.length > 0 ? (
                safeRecommendations.keyConnections.map((connection, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-grey-700">{connection}</span>
                  </li>
                ))
              ) : (
                <li className="text-grey-500 italic">No key connections available</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Globe className="w-5 h-5" />
              System Change Opportunities
            </CardTitle>
            <CardDescription>Where this project could influence broader systems</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeRecommendations.systemChangeOpportunities.length > 0 ? (
                safeRecommendations.systemChangeOpportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-grey-700">{opportunity}</span>
                  </li>
                ))
              ) : (
                <li className="text-grey-500 italic">No system change opportunities available</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Users className="w-5 h-5" />
              Community Engagement
            </CardTitle>
            <CardDescription>How to deepen community ownership and participation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeRecommendations.communityEngagementStrategy.length > 0 ? (
                safeRecommendations.communityEngagementStrategy.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-grey-700">{strategy}</span>
                  </li>
                ))
              ) : (
                <li className="text-grey-500 italic">No community engagement strategies available</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Heart className="w-5 h-5" />
            The Human Connection
          </CardTitle>
          <CardDescription>
            What makes this project truly transformational
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-grey-700 leading-relaxed">
              The power of <strong>{analysis.projectInfo.name}</strong> lies not in its metrics or outcomes,
              but in the authentic human connections it has fostered. Through {analysis.projectInfo.storytellerCount} voices
              sharing their experiences across {analysis.projectInfo.transcriptCount} stories, we see a tapestry of
              resilience, wisdom, and transformation.
            </p>
            <p className="text-grey-700 leading-relaxed">
              Each story represents not just an individual journey, but a thread in the larger fabric of community
              healing and empowerment. The themes of {(analysis.aggregatedInsights?.overallThemes || []).slice(0, 3).map(t => t.theme).join(', ')}
              that emerge across multiple voices show shared experiences that, when acknowledged and honoured,
              become the foundation for systemic change.
            </p>
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium mb-2">Key Insight:</p>
              <p className="text-grey-700 italic">
                &ldquo;Stories have the power to shift systems because they make the abstract personal,
                the systemic human, and the impossible possible. When we honour community voice and centre
                relationship, we create the conditions for transformation that goes far beyond any single project.&rdquo;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
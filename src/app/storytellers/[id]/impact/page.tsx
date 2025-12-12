'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { 
  ArrowLeft,
  Star,
  Trophy,
  Users,
  Target,
  Clock,
  Briefcase,
  FileText,
  Award,
  Heart,
  Sparkles,
  Eye,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Globe,
  BookOpen,
  MessageSquare
} from 'lucide-react'

interface ImpactStory {
  title: string;
  description: string;
  measurable_outcomes: string[];
  beneficiaries: string[];
  timeframe: string;
  cultural_significance: string;
  suitable_for: ('resume' | 'grant_application' | 'interview' | 'portfolio')[];
}

interface StorytellerProfile {
  id: string;
  display_name: string;
  bio: string | null;
  cultural_background: string | null;
}

export default function StorytellerImpactPage() {
  const params = useParams()
  const storytellerId = params.id as string

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [impactStories, setImpactStories] = useState<ImpactStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStory, setSelectedStory] = useState<ImpactStory | null>(null)
  const [exportFormat, setExportFormat] = useState<'resume' | 'grant_application' | 'interview' | 'portfolio'>('resume')

  useEffect(() => {
    if (storytellerId) {
      loadStorytellerData()
      loadImpactStories()
    }
  }, [storytellerId])

  const loadStorytellerData = async () => {
    try {
      const response = await fetch(`/api/storytellers/${storytellerId}`)
      if (response.ok) {
        const data = await response.json()
        setStoryteller(data)
      }
    } catch (err) {
      console.error('Error loading storyteller:', err)
    }
  }

  const loadImpactStories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/storytellers/${storytellerId}/impact-metrics`)
      
      if (response.ok) {
        const data = await response.json()
        setImpactStories(data.impactStories || [])
      } else {
        // Try to get from full analysis
        const analysisResponse = await fetch(`/api/storytellers/${storytellerId}/transcript-analysis`)
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          setImpactStories(analysisData.insights?.impact_stories || [])
        } else {
          throw new Error('Failed to load impact stories')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading impact stories')
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for charts
  const usageData = impactStories.reduce((acc, story) => {
    story.suitable_for.forEach(use => {
      const key = use.replace('_', ' ')
      acc[key] = (acc[key] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(usageData).map(([usage, count], index) => ({
    name: usage,
    value: count,
    colour: `hsl(${index * 45}, 70%, 60%)`
  }))

  const timeframeData = impactStories.reduce((acc, story) => {
    acc[story.timeframe] = (acc[story.timeframe] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const timeframeChartData = Object.entries(timeframeData).map(([timeframe, count]) => ({
    timeframe,
    count
  }))

  const getUsageIcon = (usage: string) => {
    switch (usage) {
      case 'resume': return <FileText className="h-4 w-4" />
      case 'grant_application': return <Award className="h-4 w-4" />
      case 'interview': return <MessageSquare className="h-4 w-4" />
      case 'portfolio': return <BookOpen className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const formatStoryForExport = (story: ImpactStory, format: string) => {
    switch (format) {
      case 'resume':
        return `${story.title}
${story.timeframe}
• ${story.description}
• Key Achievements: ${story.measurable_outcomes.join('; ')}
• Impact: Benefited ${story.beneficiaries.join(', ')}`

      case 'grant_application':
        return `Project: ${story.title}
Duration: ${story.timeframe}

Project Description:
${story.description}

Measurable Outcomes:
${story.measurable_outcomes.map((outcome, i) => `${i + 1}. ${outcome}`).join('\n')}

Beneficiaries:
${story.beneficiaries.join(', ')}

Cultural Significance:
${story.cultural_significance}`

      case 'interview':
        return `STAR Method Response:

Situation: ${story.title}
Task: ${story.description}
Action: [Based on your story - describe the specific actions you took]
Result: ${story.measurable_outcomes.join('. ')}

Timeframe: ${story.timeframe}
Impact: Benefited ${story.beneficiaries.join(', ')}`

      case 'portfolio':
        return `${story.title}

Overview:
${story.description}

Key Results:
${story.measurable_outcomes.map((outcome, i) => `• ${outcome}`).join('\n')}

Duration: ${story.timeframe}
Community Impact: ${story.beneficiaries.join(', ')}
Cultural Context: ${story.cultural_significance}`

      default:
        return story.description
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold text-grey-900 mb-2">Loading Impact Stories...</h2>
              <p className="text-grey-600">Analyzing your achievements and community contributions</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || impactStories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Impact Stories Unavailable</CardTitle>
              <CardDescription>
                {error || 'No impact stories found. Generate a complete analysis first to discover your achievement stories.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/storytellers/${storytellerId}/analytics`}>
                <Button className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  Generate Impact Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/storytellers/${storytellerId}`} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-grey-900 mb-2">
                Impact & Achievement Stories
              </h1>
              <p className="text-grey-600">
                Professional-ready stories from {storyteller?.display_name}'s experiences
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/storytellers/${storytellerId}/opportunities`}>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Find Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Impact Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{impactStories.length}</div>
              <p className="text-xs text-muted-foreground">Achievement stories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resume Ready</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {impactStories.filter(story => story.suitable_for.includes('resume')).length}
              </div>
              <p className="text-xs text-muted-foreground">Professional stories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grant Applications</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {impactStories.filter(story => story.suitable_for.includes('grant_application')).length}
              </div>
              <p className="text-xs text-muted-foreground">Funding stories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(impactStories.flatMap(story => story.beneficiaries)).size}
              </div>
              <p className="text-xs text-muted-foreground">Groups helped</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stories" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stories">Impact Stories</TabsTrigger>
            <TabsTrigger value="usage">Professional Use</TabsTrigger>
            <TabsTrigger value="export">Export & Format</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Impact Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {impactStories.map((story, index) => (
                <Card key={index} className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span>{story.title}</span>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {story.timeframe}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{story.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Measurable Outcomes */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          Key Achievements
                        </h4>
                        <ul className="space-y-1">
                          {story.measurable_outcomes.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-xs text-grey-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Beneficiaries */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Users className="h-3 w-3 text-blue-500" />
                          Who Benefited
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {story.beneficiaries.map((beneficiary, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {beneficiary}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Cultural Significance */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Globe className="h-3 w-3 text-purple-500" />
                          Cultural Significance
                        </h4>
                        <p className="text-xs text-grey-600 bg-purple-50 p-3 rounded border-l-2 border-purple-500">
                          {story.cultural_significance}
                        </p>
                      </div>

                      {/* Suitable Applications */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Target className="h-3 w-3 text-green-500" />
                          Best Used For
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {story.suitable_for.map((use, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded border">
                              {getUsageIcon(use)}
                              <span className="text-xs font-medium capitalize">
                                {use.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStory(story)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Format for Use
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Professional Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Professional Application Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.colour} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Timeline Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeframeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeframe" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['resume', 'grant_application', 'interview', 'portfolio'] as const).map((usage) => (
                <Card key={usage}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getUsageIcon(usage)}
                      {usage.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {impactStories.filter(story => story.suitable_for.includes(usage)).length}
                    </div>
                    <div className="space-y-1">
                      {impactStories
                        .filter(story => story.suitable_for.includes(usage))
                        .slice(0, 2)
                        .map((story, index) => (
                          <div key={index} className="text-xs text-grey-600 truncate">
                            {story.title}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Export & Format Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Export Stories for Professional Use
                </CardTitle>
                <CardDescription>
                  Select a story and format to get professional-ready text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Export Format:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['resume', 'grant_application', 'interview', 'portfolio'] as const).map((format) => (
                        <Button
                          key={format}
                          variant={exportFormat === format ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExportFormat(format)}
                          className="flex items-center gap-2"
                        >
                          {getUsageIcon(format)}
                          {format.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Story Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {impactStories
                      .filter(story => story.suitable_for.includes(exportFormat))
                      .map((story, index) => (
                        <Card key={index} className="cursor-pointer hover:bg-grey-50 transition-colours">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-sm mb-2">{story.title}</h4>
                            <p className="text-xs text-grey-600 mb-3">{story.description.substring(0, 100)}...</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(formatStoryForExport(story, exportFormat))}
                                className="flex-1"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setSelectedStory(story)}
                                className="flex-1"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Modal/Card */}
            {selectedStory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Preview: {selectedStory.title}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(formatStoryForExport(selectedStory, exportFormat))}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Text
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStory(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Formatted for {exportFormat.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-grey-50 p-4 rounded text-sm whitespace-pre-wrap font-mono">
                    {formatStoryForExport(selectedStory, exportFormat)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    Impact Strength Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stories with Measurable Outcomes</span>
                      <Badge className="bg-green-600 text-white">
                        {impactStories.length}/{impactStories.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Outcomes per Story</span>
                      <Badge variant="outline">
                        {impactStories.length > 0 
                          ? Math.round(impactStories.reduce((sum, story) => sum + story.measurable_outcomes.length, 0) / impactStories.length)
                          : 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Community Groups Impacted</span>
                      <Badge variant="outline">
                        {new Set(impactStories.flatMap(story => story.beneficiaries)).size}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Multi-Purpose Stories</span>
                      <Badge variant="outline">
                        {impactStories.filter(story => story.suitable_for.length >= 3).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Cultural Impact Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(
                      impactStories
                        .flatMap(story => story.cultural_significance.split('.')[0])
                        .filter(theme => theme.length > 10)
                    )).slice(0, 5).map((theme, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded border-l-2 border-red-500">
                        <p className="text-xs text-grey-700">{theme}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Professional Readiness Score
                </CardTitle>
                <CardDescription>
                  Assessment of how well your stories are prepared for professional use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Resume Readiness</span>
                      <span className="text-sm text-grey-500">
                        {Math.round((impactStories.filter(s => s.suitable_for.includes('resume')).length / impactStories.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-grey-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(impactStories.filter(s => s.suitable_for.includes('resume')).length / impactStories.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Grant Application Readiness</span>
                      <span className="text-sm text-grey-500">
                        {Math.round((impactStories.filter(s => s.suitable_for.includes('grant_application')).length / impactStories.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-grey-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(impactStories.filter(s => s.suitable_for.includes('grant_application')).length / impactStories.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Interview Preparedness</span>
                      <span className="text-sm text-grey-500">
                        {Math.round((impactStories.filter(s => s.suitable_for.includes('interview')).length / impactStories.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-grey-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(impactStories.filter(s => s.suitable_for.includes('interview')).length / impactStories.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Portfolio Quality</span>
                      <span className="text-sm text-grey-500">
                        {Math.round((impactStories.filter(s => s.suitable_for.includes('portfolio')).length / impactStories.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-grey-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${(impactStories.filter(s => s.suitable_for.includes('portfolio')).length / impactStories.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/storytellers/${storytellerId}/opportunities`} className="flex-1">
            <Button className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Find Matching Opportunities
            </Button>
          </Link>
          <Link href={`/storytellers/${storytellerId}/skills`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Award className="h-4 w-4 mr-2" />
              Skills Analysis
            </Button>
          </Link>
          <Link href={`/storytellers/${storytellerId}/insights`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Personal Insights
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
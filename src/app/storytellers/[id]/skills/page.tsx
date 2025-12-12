'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
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
  Award,
  TrendingUp,
  Lightbulb,
  Star,
  Target,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  ExternalLink
} from 'lucide-react'

interface ProfessionalCompetency {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence: string[];
  development_recommendations: string[];
  market_value: number;
  related_opportunities: string[];
}

interface StorytellerProfile {
  id: string;
  display_name: string;
  bio: string | null;
  cultural_background: string | null;
}

export default function StorytellerSkillsPage() {
  const params = useParams()
  const storytellerId = params.id as string

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [competencies, setCompetencies] = useState<ProfessionalCompetency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (storytellerId) {
      loadStorytellerData()
      loadSkills()
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

  const loadSkills = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/storytellers/${storytellerId}/skills-extraction`)
      
      if (response.ok) {
        const data = await response.json()
        setCompetencies(data.competencies)
      } else {
        // Try to get from full analysis
        const analysisResponse = await fetch(`/api/storytellers/${storytellerId}/transcript-analysis`)
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          setCompetencies(analysisData.insights.professional_competencies || [])
        } else {
          throw new Error('Failed to load skills data')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading skills')
    } finally {
      setLoading(false)
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return '#10B981'
      case 'advanced': return '#3B82F6'
      case 'intermediate': return '#F59E0B'
      case 'beginner': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getSkillLevelNumber = (level: string) => {
    switch (level) {
      case 'expert': return 4
      case 'advanced': return 3
      case 'intermediate': return 2
      case 'beginner': return 1
      default: return 0
    }
  }

  // Prepare radar chart data
  const radarData = competencies.slice(0, 8).map(comp => ({
    skill: comp.skill.length > 15 ? comp.skill.substring(0, 15) + '...' : comp.skill,
    level: getSkillLevelNumber(comp.level),
    marketValue: comp.market_value
  }))

  // Prepare bar chart data for market value
  const marketValueData = competencies.map(comp => ({
    skill: comp.skill.length > 20 ? comp.skill.substring(0, 20) + '...' : comp.skill,
    value: comp.market_value,
    level: comp.level
  }))

  // Group skills by level
  const skillsByLevel = competencies.reduce((acc, skill) => {
    if (!acc[skill.level]) acc[skill.level] = []
    acc[skill.level].push(skill)
    return acc
  }, {} as Record<string, ProfessionalCompetency[]>)

  // Calculate skill portfolio stats
  const portfolioStats = {
    totalSkills: competencies.length,
    expertSkills: skillsByLevel.expert?.length || 0,
    advancedSkills: skillsByLevel.advanced?.length || 0,
    averageMarketValue: competencies.length > 0 
      ? Math.round(competencies.reduce((sum, comp) => sum + comp.market_value, 0) / competencies.length)
      : 0,
    topMarketValue: competencies.length > 0 
      ? Math.max(...competencies.map(comp => comp.market_value))
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold text-grey-900 mb-2">Analyzing Skills...</h2>
              <p className="text-grey-600">Extracting professional competencies from your stories</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || competencies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Skills Analysis Unavailable</CardTitle>
              <CardDescription>
                {error || 'No skills data found. Please generate a full analysis first.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/storytellers/${storytellerId}/analytics`}>
                <Button className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Generate Skills Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/storytellers/${storytellerId}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-grey-900 mb-2">
                Professional Skills Analysis
              </h1>
              <p className="text-grey-600">
                Competencies extracted from {storyteller?.display_name}'s life stories
              </p>
            </div>
            
            <Link href={`/storytellers/${storytellerId}/opportunities`}>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Find Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {/* Skills Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Identified competencies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expert Level</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.expertSkills}</div>
              <p className="text-xs text-muted-foreground">Advanced+ skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Market Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.averageMarketValue}/10</div>
              <p className="text-xs text-muted-foreground">Professional value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Skill Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.topMarketValue}/10</div>
              <p className="text-xs text-muted-foreground">Highest rated skill</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="development">Development Path</TabsTrigger>
            <TabsTrigger value="market">Market Value</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Skills Portfolio Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={0} domain={[0, 4]} tick={{ fontSize: 8 }} />
                        <Radar
                          name="Skill Level"
                          dataKey="level"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Market Value Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Market Value Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketValueData.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="skill" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills by Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(['expert', 'advanced', 'intermediate', 'beginner'] as const).map(level => (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle 
                      className="text-sm flex items-center gap-2"
                      style={{ colour: getSkillLevelColor(level) }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getSkillLevelColor(level) }}
                      ></div>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {skillsByLevel[level]?.length || 0}
                    </div>
                    <div className="space-y-1">
                      {(skillsByLevel[level] || []).slice(0, 3).map((skill, index) => (
                        <div key={index} className="text-xs text-grey-600 truncate">
                          {skill.skill}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Detailed Analysis Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competencies.map((competency, index) => (
                <Card key={index} className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{competency.skill}</CardTitle>
                      <Badge 
                        style={{ backgroundColor: getSkillLevelColor(competency.level) }}
                        className="text-white"
                      >
                        {competency.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-grey-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Market Value: {competency.market_value}/10
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Progress value={competency.market_value * 10} className="h-2 mb-2" />
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Evidence from Stories
                        </h4>
                        <div className="space-y-2">
                          {competency.evidence.slice(0, 2).map((evidence, i) => (
                            <p key={i} className="text-xs text-grey-600 bg-green-50 p-2 rounded border-l-2 border-green-500">
                              {evidence}
                            </p>
                          ))}
                          {competency.evidence.length > 2 && (
                            <p className="text-xs text-grey-500">
                              +{competency.evidence.length - 2} more examples
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          Development Recommendations
                        </h4>
                        <div className="space-y-1">
                          {competency.development_recommendations.slice(0, 3).map((rec, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-xs text-grey-600">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {competency.related_opportunities.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Target className="h-3 w-3 text-blue-500" />
                            Related Opportunities
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {competency.related_opportunities.slice(0, 3).map((opp, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {opp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Development Path Tab */}
          <TabsContent value="development" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Skill Development Roadmap
                </CardTitle>
                <CardDescription>
                  Recommended paths for advancing your professional competencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {competencies
                    .filter(comp => comp.level !== 'expert')
                    .slice(0, 9)
                    .map((competency, index) => {
                      const nextLevel = competency.level === 'beginner' ? 'intermediate' : 
                                       competency.level === 'intermediate' ? 'advanced' : 'expert'
                      
                      return (
                        <div key={index} className="p-4 border rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">{competency.skill}</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                style={{ backgroundColor: getSkillLevelColor(competency.level) }}
                                className="text-white text-xs"
                              >
                                {competency.level}
                              </Badge>
                              <span className="text-xs text-grey-400">→</span>
                              <Badge 
                                style={{ backgroundColor: getSkillLevelColor(nextLevel) }}
                                className="text-white text-xs"
                              >
                                {nextLevel}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-grey-500">
                              <Clock className="h-3 w-3" />
                              6-12 months
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium mb-1">Top Recommendation:</p>
                              <p className="text-xs text-grey-600 bg-blue-50 p-2 rounded">
                                {competency.development_recommendations[0]}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-grey-500">Market Value Impact</span>
                              <span className="font-medium text-green-600">
                                +{Math.min(2, 10 - competency.market_value)} points
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Learning Priorities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competencies
                      .filter(comp => comp.market_value >= 7 && comp.level !== 'expert')
                      .slice(0, 5)
                      .map((competency, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-sm">{competency.skill}</h4>
                            <p className="text-xs text-grey-600">High market value</p>
                          </div>
                          <Badge variant="outline" className="text-green-700 border-green-700">
                            Priority
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Collaboration Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competencies
                      .filter(comp => comp.level === 'expert' || comp.level === 'advanced')
                      .slice(0, 5)
                      .map((competency, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-sm">{competency.skill}</h4>
                            <p className="text-xs text-grey-600">Share knowledge</p>
                          </div>
                          <Badge variant="outline" className="text-purple-700 border-purple-700">
                            Mentor
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Value Tab */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Market Value Analysis
                </CardTitle>
                <CardDescription>
                  Understanding the professional value of your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="skill" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">High Value Skills</CardTitle>
                  <CardDescription>Market value 8-10</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {competencies
                      .filter(comp => comp.market_value >= 8)
                      .map((competency, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">{competency.skill}</span>
                          <Badge className="bg-green-600 text-white">
                            {competency.market_value}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Medium Value Skills</CardTitle>
                  <CardDescription>Market value 5-7</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {competencies
                      .filter(comp => comp.market_value >= 5 && comp.market_value < 8)
                      .map((competency, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm font-medium">{competency.skill}</span>
                          <Badge className="bg-blue-600 text-white">
                            {competency.market_value}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Developing Skills</CardTitle>
                  <CardDescription>Market value 1-4</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {competencies
                      .filter(comp => comp.market_value < 5)
                      .map((competency, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm font-medium">{competency.skill}</span>
                          <Badge className="bg-yellow-600 text-white">
                            {competency.market_value}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
          <Link href={`/storytellers/${storytellerId}/impact`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Star className="h-4 w-4 mr-2" />
              View Impact Stories
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
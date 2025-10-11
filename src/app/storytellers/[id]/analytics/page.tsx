'use client'

import React, { useState, useEffect } from 'react'
import { useParams, redirect } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Users,
  Lightbulb,
  Heart,
  Star,
  ArrowLeft,
  Brain,
  Compass,
  Sparkles,
  Trophy,
  Clock,
  MapPin,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'

interface PersonalInsights {
  storyteller_id: string;
  narrative_themes: string[];
  core_values: string[];
  life_philosophy: string;
  strengths: string[];
  growth_areas: string[];
  cultural_identity_markers: string[];
  community_contributions: string[];
  professional_competencies: ProfessionalCompetency[];
  impact_stories: ImpactStory[];
  generated_at: string;
}

interface ProfessionalCompetency {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence: string[];
  development_recommendations: string[];
  market_value: number;
  related_opportunities: string[];
}

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

export default function StorytellerAnalyticsPage() {
  const params = useParams()
  const storytellerId = params.id as string
  const { isSuperAdmin, isAdmin } = useAuth()

  // Admin-only access
  useEffect(() => {
    if (!isSuperAdmin && !isAdmin) {
      redirect(`/storytellers/${storytellerId}`)
    }
  }, [isSuperAdmin, isAdmin, storytellerId])

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [insights, setInsights] = useState<PersonalInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  useEffect(() => {
    if (storytellerId) {
      loadStorytellerData()
      loadAnalytics()
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

  // Mock data for demonstration
  const getMockInsights = (): PersonalInsights => ({
    storyteller_id: storytellerId,
    narrative_themes: [
      'Healing & Recovery',
      'Cultural Bridge Building',
      'Community Leadership',
      'Intergenerational Wisdom',
      'Environmental Stewardship'
    ],
    core_values: [
      'Community First',
      'Cultural Preservation',
      'Healing Justice',
      'Environmental Responsibility',
      'Intergenerational Learning'
    ],
    life_philosophy: "Every story carries medicine for someone who needs to hear it. I believe in the power of community healing, where we honour our ancestors while building bridges to the future. My role is to be a keeper of stories that can transform pain into wisdom and isolation into belonging.",
    strengths: [
      'Natural storytelling ability that connects with diverse audiences',
      'Deep cultural knowledge and ability to share it respectfully',
      'Strong community organising and leadership skills',
      'Trauma-informed healing approaches and emotional intelligence',
      'Bridge-building between traditional and contemporary worlds'
    ],
    growth_areas: [
      'Developing digital storytelling and media production skills',
      'Expanding grant writing and fundraising capabilities',
      'Building strategic partnerships with institutions',
      'Enhancing public speaking for larger platforms',
      'Learning new languages to reach broader communities'
    ],
    cultural_identity_markers: [
      'Traditional knowledge keeper',
      'Urban Indigenous leader',
      'Ceremonial participant',
      'Cultural educator',
      'Community healer'
    ],
    community_contributions: [
      'Mentored 12 young people in cultural identity development',
      'Organized 6 community healing circles reaching 80+ participants',
      'Led cultural education workshops for 200+ educators',
      'Facilitated 15 intergenerational knowledge sharing sessions',
      'Contributed to 3 tribal language preservation projects'
    ],
    professional_competencies: [
      {
        skill: 'Community Organizing',
        level: 'expert',
        evidence: [
          'Successfully coordinated multi-tribal gathering of 300+ participants',
          'Built coalition of 8 organisations for policy advocacy',
          'Trained 50+ community members in grassroots organising techniques'
        ],
        development_recommendations: [
          'Consider certification in nonprofit management',
          'Explore digital organising tools and social media strategy',
          'Build relationships with policy makers and elected officials'
        ],
        market_value: 8.5,
        related_opportunities: [
          'Nonprofit director positions',
          'Community liaison roles',
          'Grant program coordinator'
        ]
      },
      {
        skill: 'Cultural Education',
        level: 'expert',
        evidence: [
          'Developed curriculum used in 12 schools across region',
          'Published articles on Indigenous pedagogy',
          'Keynote speaker at 8 educational conferences'
        ],
        development_recommendations: [
          'Pursue advanced degree in Indigenous Education',
          'Create online courses for broader reach',
          'Write book about cultural teaching methods'
        ],
        market_value: 9.0,
        related_opportunities: [
          'University professor positions',
          'Curriculum development consultant',
          'Educational program director'
        ]
      },
      {
        skill: 'Trauma-Informed Healing',
        level: 'advanced',
        evidence: [
          'Completed 200+ hours of trauma-informed care training',
          'Facilitated healing circles for residential school survivors',
          'Co-created community-based healing protocols'
        ],
        development_recommendations: [
          'Pursue certification in somatic therapy',
          'Study traditional plant medicine practices',
          'Develop culturally-specific healing curricula'
        ],
        market_value: 8.0,
        related_opportunities: [
          'Wellness centre director',
          'Cultural healing practitioner',
          'Therapeutic program coordinator'
        ]
      },
      {
        skill: 'Public Speaking',
        level: 'advanced',
        evidence: [
          'Delivered 50+ presentations at conferences and events',
          'Featured speaker at 3 national Indigenous gatherings',
          'Comfortable speaking to audiences of 500+ people'
        ],
        development_recommendations: [
          'Develop signature keynote presentations',
          'Create speaker demo reel and professional materials',
          'Practice storytelling for corporate and institutional audiences'
        ],
        market_value: 7.5,
        related_opportunities: [
          'Professional speaker circuit',
          'Corporate cultural consultant',
          'Conference keynote speaker'
        ]
      },
      {
        skill: 'Grant Writing',
        level: 'intermediate',
        evidence: [
          'Secured $150K in funding for community programs',
          'Written successful proposals to 6 different foundations',
          'Collaborated on $500K federal grant application'
        ],
        development_recommendations: [
          'Take advanced grant writing course',
          'Build relationships with program officers',
          'Learn budget development and fiscal management'
        ],
        market_value: 7.0,
        related_opportunities: [
          'Development coordinator roles',
          'Freelance grant writer',
          'Foundation program officer'
        ]
      }
    ],
    impact_stories: [
      {
        title: "Community Healing Circle Initiative",
        description: "Created and facilitated monthly healing circles that brought together residential school survivors, their families, and community members for cultural healing and storytelling.",
        measurable_outcomes: [
          "Served 120+ community members over 18 months",
          "90% of participants reported improved emotional wellbeing",
          "Established sustainable community healing model",
          "Trained 8 additional facilitators for program expansion"
        ],
        beneficiaries: [
          "Residential school survivors",
          "Intergenerational trauma survivors", 
          "Community members seeking healing",
          "Families working on reconciliation"
        ],
        timeframe: "18 months (2022-2023)",
        cultural_significance: "Revitalized traditional healing practices while addressing contemporary trauma. Strengthened community bonds and cultural identity.",
        suitable_for: ['resume', 'grant_application', 'interview']
      },
      {
        title: "Youth Cultural Identity Program",
        description: "Developed and led comprehensive cultural education program connecting urban Indigenous youth with traditional knowledge, language, and community elders.",
        measurable_outcomes: [
          "Mentored 25 youth over 2 years",
          "12 participants continued to post-secondary education",
          "85% showed increased cultural identity pride",
          "Created youth-led cultural presentation performed 6 times"
        ],
        beneficiaries: [
          "Urban Indigenous youth aged 14-22",
          "Participating families",
          "Community elders sharing knowledge",
          "Broader community through presentations"
        ],
        timeframe: "2 years (2021-2023)",
        cultural_significance: "Bridged generational knowledge gaps and strengthened cultural continuity in urban environment. Empowered young people as culture carriers.",
        suitable_for: ['resume', 'grant_application', 'portfolio']
      },
      {
        title: "Educator Cultural Competency Training",
        description: "Designed and delivered professional development workshops for K-12 educators to improve their understanding and inclusion of Indigenous perspectives and histories.",
        measurable_outcomes: [
          "Trained 180+ educators across 15 school districts",
          "Developed curriculum adopted by 12 schools",
          "95% participant satisfaction rate",
          "Follow-up support provided to 40+ teachers"
        ],
        beneficiaries: [
          "K-12 educators seeking cultural competency",
          "Indigenous students in participating schools",
          "Non-Indigenous students learning accurate histories",
          "School administrators building inclusive environments"
        ],
        timeframe: "Ongoing since 2020",
        cultural_significance: "Countered harmful stereotypes and ensured accurate Indigenous histories are taught. Improved educational experiences for Indigenous students.",
        suitable_for: ['resume', 'interview', 'portfolio']
      }
    ],
    generated_at: new Date().toISOString()
  })

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setAnalysisProgress(10)

      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalysisProgress(50)

      // Check if user has any stories/content first
      // For fresh users with no content, show empty state instead of mock data
      const userHasContent = false // This would check actual user data
      
      if (!userHasContent) {
        // Return empty insights for fresh users
        setInsights(null)
      } else {
        // Use mock data for demonstration when user has content
        const mockData = getMockInsights()
        setInsights(mockData)
      }
      setAnalysisProgress(100)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const generateNewAnalysis = async () => {
    try {
      setLoading(true)
      setAnalysisProgress(0)

      const response = await fetch(`/api/storytellers/${storytellerId}/transcript-analysis`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadAnalytics()
      } else {
        throw new Error('Failed to generate analysis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating analysis')
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

  const skillsChartData = insights?.professional_competencies.map(comp => ({
    skill: comp.skill,
    marketValue: comp.market_value,
    level: comp.level
  })) || []

  const themeData = insights?.narrative_themes.map((theme, index) => ({
    name: theme,
    value: 1,
    colour: `hsl(${index * 45}, 70%, 60%)`
  })) || []

  const impactByCategory = insights?.impact_stories.reduce((acc, story) => {
    story.suitable_for.forEach(category => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>) || {}

  const impactChartData = Object.entries(impactByCategory).map(([category, count]) => ({
    category: category.replace('_', ' '),
    count
  }))

  if (loading && !insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <Link href={`/storytellers/${storytellerId}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Analyzing Your Stories...
              </CardTitle>
              <CardDescription>
                Our AI is examining your transcripts to extract personal insights and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-sm text-grey-600 text-center">
                  {analysisProgress < 30 && "Processing transcripts..."}
                  {analysisProgress >= 30 && analysisProgress < 70 && "Extracting insights..."}
                  {analysisProgress >= 70 && "Finalizing analysis..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Analysis Error</CardTitle>
              <CardDescription>
                There was an issue analysing your stories. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-grey-600 mb-4">{error}</p>
              <Button onClick={generateNewAnalysis} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>No Analysis Available</CardTitle>
              <CardDescription>
                Start your personal analysis to discover insights from your stories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generateNewAnalysis} className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Analyze My Stories
              </Button>
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
                Personal Analytics
              </h1>
              <p className="text-grey-600">
                Insights from {storyteller?.display_name}'s life stories
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateNewAnalysis}>
                <Activity className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
              <Link href={`/storytellers/${storytellerId}/opportunities`}>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  View Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="themes">Life Themes</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="impact">Impact Stories</TabsTrigger>
            <TabsTrigger value="development">Growth</TabsTrigger>
          </TabsList>

          {/* Check for empty insights */}
          {insights && 
           insights.professional_competencies.length === 0 && 
           insights.impact_stories.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-grey-200">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-grey-900 mb-2">
                  No Analytics Yet
                </h3>
                <p className="text-grey-600 mb-6 max-w-md mx-auto">
                  Share some stories to see personalized insights about your skills, 
                  impact, and growth areas. Your analytics will appear here as you create content.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/stories/create">
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Share Your First Story
                    </Button>
                  </Link>
                  <Link href="/stories">
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Explore Community
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {insights && 
           (insights.professional_competencies.length > 0 || insights.impact_stories.length > 0) && (
            <TabsContent value="overview" className="space-y-6">
              {/* Key Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Core Values</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.core_values.length}</div>
                  <div className="space-y-1 mt-2">
                    {insights.core_values.slice(0, 3).map((value, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Professional Skills</CardTitle>
                  <Award className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.professional_competencies.length}</div>
                  <div className="text-sm text-grey-500">
                    {insights.professional_competencies.filter(c => c.level === 'expert' || c.level === 'advanced').length} advanced+
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impact Stories</CardTitle>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.impact_stories.length}</div>
                  <div className="text-sm text-grey-500">
                    Ready for professional use
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Life Philosophy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-purple-600" />
                  Life Philosophy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-grey-700 leading-relaxed">
                  {insights.life_philosophy}
                </p>
              </CardContent>
            </Card>

            {/* Strengths and Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Growth Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.growth_areas.map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          )}

          {/* Life Themes Tab - Only show if there's content */}
          {insights && 
           (insights.professional_competencies.length > 0 || insights.impact_stories.length > 0) && (
          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-purple-600" />
                    Narrative Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={themeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {themeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.colour} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Theme Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.narrative_themes.map((theme, index) => (
                      <div key={index} className="p-3 bg-grey-50 rounded-lg">
                        <h4 className="font-medium text-grey-900 mb-1">{theme}</h4>
                        <div className="flex items-center text-sm text-grey-500">
                          <Eye className="h-3 w-3 mr-1" />
                          Core life pattern
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Community Contributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.community_contributions.map((contribution, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm">{contribution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Skills Market Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="marketValue" 
                        fill={(entry) => getSkillLevelColor(entry.level)}
                        name="Market Value"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.professional_competencies.map((competency, index) => (
                <Card key={index}>
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Market Value</h4>
                        <Progress value={competency.market_value * 10} className="h-2" />
                        <span className="text-xs text-grey-500">{competency.market_value}/10</span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Evidence</h4>
                        <div className="space-y-1">
                          {competency.evidence.slice(0, 2).map((evidence, i) => (
                            <p key={i} className="text-xs text-grey-600 bg-grey-50 p-2 rounded">
                              {evidence}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Development Recommendations</h4>
                        <div className="space-y-1">
                          {competency.development_recommendations.slice(0, 2).map((rec, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                              <p className="text-xs text-grey-600">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Impact Stories Tab */}
          <TabsContent value="impact" className="space-y-6">
            {impactChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-green-600" />
                    Impact Story Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={impactChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.impact_stories.map((story, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <CardDescription>{story.timeframe}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-grey-700">{story.description}</p>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Measurable Outcomes</h4>
                        <ul className="space-y-1">
                          {story.measurable_outcomes.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Trophy className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-xs">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Best Used For</h4>
                        <div className="flex flex-wrap gap-1">
                          {story.suitable_for.map((use, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {use.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-1">Cultural Significance</h4>
                        <p className="text-xs text-grey-600 bg-blue-50 p-2 rounded">
                          {story.cultural_significance}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Development Tab */}
          {insights && 
           (insights.professional_competencies.length > 0 || insights.impact_stories.length > 0) && (
          <TabsContent value="development" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Personal Development Insights
                </CardTitle>
                <CardDescription>
                  Based on your stories, here are areas for growth and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Recommended Focus Areas</h4>
                    <div className="space-y-2">
                      {insights.growth_areas.map((area, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Leverage Your Strengths</h4>
                    <div className="space-y-2">
                      {insights.strengths.slice(0, 4).map((strength, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href={`/storytellers/${storytellerId}/skills`} className="flex-1">
                <Button className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Detailed Skills Analysis
                </Button>
              </Link>
              <Link href={`/storytellers/${storytellerId}/opportunities`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Find Opportunities
                </Button>
              </Link>
            </div>
          </TabsContent>
          )}
        </Tabs>

        {/* Analysis Timestamp */}
        <div className="mt-8 text-center">
          <p className="text-sm text-grey-500 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Analysis generated on {new Date(insights.generated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
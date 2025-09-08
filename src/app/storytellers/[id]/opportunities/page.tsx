'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft,
  Target,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Globe,
  Award,
  GraduationCap,
  Clock,
  MapPin,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Heart
} from 'lucide-react'

interface CareerRecommendation {
  title: string;
  organization: string;
  match_score: number;
  required_skills: string[];
  storyteller_skills: string[];
  gap_analysis: string[];
  application_strategy: string;
  cultural_fit: string;
  salary_range?: string;
  application_deadline?: string;
  url?: string;
}

interface GrantOpportunity {
  title: string;
  organization: string;
  funding_amount: string;
  match_score: number;
  required_criteria: string[];
  storyteller_qualifications: string[];
  suggested_project: string;
  cultural_focus: boolean;
  community_impact_potential: string;
  application_deadline?: string;
  url?: string;
}

interface StorytellerProfile {
  id: string;
  display_name: string;
  bio: string | null;
  cultural_background: string | null;
}

export default function StorytellerOpportunitiesPage() {
  const params = useParams()
  const storytellerId = params.id as string

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [careerRecommendations, setCareerRecommendations] = useState<CareerRecommendation[]>([])
  const [grantOpportunities, setGrantOpportunities] = useState<GrantOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (storytellerId) {
      loadStorytellerData()
      loadOpportunities()
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

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      
      // Check if user has created any stories or content first
      const storiesResponse = await fetch(`/api/storytellers/${storytellerId}/stories`)
      const storiesData = storiesResponse.ok ? await storiesResponse.json() : []
      
      // If no content exists, show empty state instead of trying to generate opportunities
      if (!storiesData || storiesData.length === 0) {
        setCareerRecommendations([])
        setGrantOpportunities([])
        setError(null)
        return
      }

      // Try to get opportunities from analysis endpoint
      const response = await fetch(`/api/storytellers/${storytellerId}/recommendations`)
      
      if (response.ok) {
        const data = await response.json()
        setCareerRecommendations(data.careerRecommendations || [])
        setGrantOpportunities(data.grantOpportunities || [])
      } else {
        // For users with content but no analysis yet, show empty state
        setCareerRecommendations([])
        setGrantOpportunities([])
        setError(null)
      }
    } catch (err) {
      console.error('Error loading opportunities:', err)
      // Don't show error for new users, just show empty state
      setCareerRecommendations([])
      setGrantOpportunities([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Developing Match'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Opportunities...</h2>
              <p className="text-gray-600">Matching your skills with career and grant opportunities</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Opportunities Unavailable</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/storytellers/${storytellerId}/analytics`}>
                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Generate Full Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (careerRecommendations.length === 0 && grantOpportunities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <Link href={`/storytellers/${storytellerId}/dashboard`} className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Career & Grant Opportunities
              </CardTitle>
              <CardDescription>
                Discover personalized career and funding opportunities based on your stories and experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Discover Opportunities?</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start by sharing your story or uploading a transcript. Our AI will analyze your experiences 
                  to find matching career opportunities and grant funding.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/stories/create">
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Share Your First Story
                    </Button>
                  </Link>
                  <Link href="/stories/create-ai">
                    <Button variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      AI Story Creator
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">What you'll discover:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Personalized career recommendations based on your skills and experiences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Grant opportunities matching your cultural background and interests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Skills gap analysis with development recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Cultural alignment assessment for meaningful work connections</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/storytellers/${storytellerId}`} className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Career & Grant Opportunities
              </h1>
              <p className="text-gray-600">
                Personalized recommendations for {storyteller?.display_name}
              </p>
            </div>
            
            <Link href={`/storytellers/${storytellerId}/skills`}>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                View Skills Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Opportunities Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Career Opportunities</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{careerRecommendations.length}</div>
              <p className="text-xs text-muted-foreground">Job matches found</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grant Opportunities</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grantOpportunities.length}</div>
              <p className="text-xs text-muted-foreground">Funding options</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Match Rate</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...careerRecommendations, ...grantOpportunities].filter(opp => opp.match_score >= 80).length}
              </div>
              <p className="text-xs text-muted-foreground">80%+ match</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cultural Focus</CardTitle>
              <Heart className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {grantOpportunities.filter(grant => grant.cultural_focus).length}
              </div>
              <p className="text-xs text-muted-foreground">Culture-focused</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="careers" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="careers">Career Opportunities</TabsTrigger>
            <TabsTrigger value="grants">Grant Funding</TabsTrigger>
            <TabsTrigger value="development">Development Path</TabsTrigger>
          </TabsList>

          {/* Career Opportunities Tab */}
          <TabsContent value="careers" className="space-y-6">
            {careerRecommendations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Career Recommendations Yet</h3>
                    <p className="text-gray-600 mb-4">Generate a full analysis to discover career opportunities.</p>
                    <Link href={`/storytellers/${storytellerId}/analytics`}>
                      <Button>Generate Analysis</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {careerRecommendations
                  .sort((a, b) => b.match_score - a.match_score)
                  .map((career, index) => (
                    <Card key={index} className="h-fit">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">{career.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {career.organization}
                            </CardDescription>
                          </div>
                          <Badge className={`${getMatchScoreColor(career.match_score)} font-bold`}>
                            {career.match_score}% Match
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Match Score Breakdown */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Match Quality</span>
                              <span className="text-sm text-gray-500">
                                {getMatchScoreLabel(career.match_score)}
                              </span>
                            </div>
                            <Progress value={career.match_score} className="h-2" />
                          </div>

                          {/* Skills Match */}
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Your Matching Skills ({career.storyteller_skills.length})
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {career.storyteller_skills.slice(0, 6).map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-green-700 border-green-700">
                                  {skill}
                                </Badge>
                              ))}
                              {career.storyteller_skills.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{career.storyteller_skills.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Skills Gap */}
                          {career.gap_analysis.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                Skills to Develop
                              </h4>
                              <div className="space-y-1">
                                {career.gap_analysis.slice(0, 3).map((gap, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">{gap}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Application Strategy */}
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Target className="h-3 w-3 text-blue-500" />
                              Application Strategy
                            </h4>
                            <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded border-l-2 border-blue-500">
                              {career.application_strategy}
                            </p>
                          </div>

                          {/* Cultural Fit */}
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Heart className="h-3 w-3 text-purple-500" />
                              Cultural Alignment
                            </h4>
                            <p className="text-xs text-gray-600 bg-purple-50 p-3 rounded border-l-2 border-purple-500">
                              {career.cultural_fit}
                            </p>
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {career.salary_range && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {career.salary_range}
                                </div>
                              )}
                              {career.application_deadline && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {career.application_deadline}
                                </div>
                              )}
                            </div>
                            {career.url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={career.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Apply
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Grant Opportunities Tab */}
          <TabsContent value="grants" className="space-y-6">
            {grantOpportunities.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grant Opportunities Yet</h3>
                    <p className="text-gray-600 mb-4">Generate a full analysis to discover funding opportunities.</p>
                    <Link href={`/storytellers/${storytellerId}/analytics`}>
                      <Button>Generate Analysis</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {grantOpportunities
                  .sort((a, b) => b.match_score - a.match_score)
                  .map((grant, index) => (
                    <Card key={index} className="h-fit">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">{grant.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              {grant.organization}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`${getMatchScoreColor(grant.match_score)} font-bold`}>
                              {grant.match_score}% Match
                            </Badge>
                            {grant.cultural_focus && (
                              <Badge variant="outline" className="text-purple-700 border-purple-700">
                                Cultural Focus
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Funding Amount */}
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-800">{grant.funding_amount}</span>
                            <span className="text-sm text-green-600">Available Funding</span>
                          </div>

                          {/* Match Score */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Qualification Match</span>
                              <span className="text-sm text-gray-500">
                                {getMatchScoreLabel(grant.match_score)}
                              </span>
                            </div>
                            <Progress value={grant.match_score} className="h-2" />
                          </div>

                          {/* Your Qualifications */}
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Your Qualifications ({grant.storyteller_qualifications.length})
                            </h4>
                            <div className="space-y-1">
                              {grant.storyteller_qualifications.slice(0, 3).map((qual, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-xs text-gray-700">{qual}</span>
                                </div>
                              ))}
                              {grant.storyteller_qualifications.length > 3 && (
                                <p className="text-xs text-gray-500 pl-3">
                                  +{grant.storyteller_qualifications.length - 3} more qualifications
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Suggested Project */}
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="h-3 w-3 text-blue-500" />
                              Suggested Project Approach
                            </h4>
                            <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded border-l-2 border-blue-500">
                              {grant.suggested_project}
                            </p>
                          </div>

                          {/* Community Impact */}
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Users className="h-3 w-3 text-purple-500" />
                              Community Impact Potential
                            </h4>
                            <p className="text-xs text-gray-600 bg-purple-50 p-3 rounded border-l-2 border-purple-500">
                              {grant.community_impact_potential}
                            </p>
                          </div>

                          {/* Application Info */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            {grant.application_deadline && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                Deadline: {grant.application_deadline}
                              </div>
                            )}
                            {grant.url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={grant.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Learn More
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Development Path Tab */}
          <TabsContent value="development" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Opportunity Development Strategy
                </CardTitle>
                <CardDescription>
                  Actionable steps to maximize your career and funding potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Career Development */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      Career Development Focus
                    </h3>
                    <div className="space-y-3">
                      {/* Most common skills gaps */}
                      {careerRecommendations.length > 0 && (
                        <>
                          <div className="p-3 bg-yellow-50 rounded-lg border-l-2 border-yellow-500">
                            <h4 className="font-medium text-sm mb-2">Priority Skills to Develop</h4>
                            <div className="space-y-1">
                              {Array.from(new Set(
                                careerRecommendations
                                  .flatMap(career => career.gap_analysis)
                                  .slice(0, 4)
                              )).map((skill, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Target className="h-3 w-3 text-yellow-600" />
                                  <span className="text-xs">{skill}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-green-50 rounded-lg border-l-2 border-green-500">
                            <h4 className="font-medium text-sm mb-2">Leverage Your Strengths</h4>
                            <div className="space-y-1">
                              {Array.from(new Set(
                                careerRecommendations
                                  .flatMap(career => career.storyteller_skills)
                                  .slice(0, 4)
                              )).map((skill, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Star className="h-3 w-3 text-green-600" />
                                  <span className="text-xs">{skill}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Grant Development */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Funding Readiness Focus
                    </h3>
                    <div className="space-y-3">
                      {grantOpportunities.length > 0 && (
                        <>
                          <div className="p-3 bg-blue-50 rounded-lg border-l-2 border-blue-500">
                            <h4 className="font-medium text-sm mb-2">Strengthen Your Applications</h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-blue-600" />
                                <span className="text-xs">Document measurable community impact</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-blue-600" />
                                <span className="text-xs">Build community partnership letters</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="h-3 w-3 text-blue-600" />
                                <span className="text-xs">Create project portfolio with outcomes</span>
                              </div>
                            </div>
                          </div>

                          {grantOpportunities.some(g => g.cultural_focus) && (
                            <div className="p-3 bg-purple-50 rounded-lg border-l-2 border-purple-500">
                              <h4 className="font-medium text-sm mb-2">Cultural Projects Advantage</h4>
                              <p className="text-xs text-gray-600">
                                {grantOpportunities.filter(g => g.cultural_focus).length} grants 
                                specifically focus on cultural work - this aligns with your background.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/storytellers/${storytellerId}/skills`}>
                <Button className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Award className="h-6 w-6" />
                  <span>Analyze Skills</span>
                </Button>
              </Link>
              <Link href={`/storytellers/${storytellerId}/impact`}>
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Star className="h-6 w-6" />
                  <span>Impact Stories</span>
                </Button>
              </Link>
              <Link href={`/storytellers/${storytellerId}/analytics`}>
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Full Analytics</span>
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
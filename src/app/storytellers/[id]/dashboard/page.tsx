'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import HelpWidget from '@/components/support/HelpWidget'
import { 
  User, 
  Edit, 
  FileText, 
  Camera, 
  Video, 
  BarChart3, 
  Trophy, 
  Target, 
  BookOpen, 
  MessageCircle,
  Settings,
  HelpCircle,
  Brain,
  Sparkles,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Crown,
  Shield,
  Mic,
  Image as ImageIcon,
  Download,
  Upload,
  Globe,
  Building2,
  Zap,
  Tag,
  FileText,
  Loader,
  Check,
  AlertTriangle,
  RefreshCw,
  Lightbulb
} from 'lucide-react'

interface StorytellerDashboardData {
  profile: {
    id: string
    display_name: string
    bio: string
    avatar_url?: string
    cultural_background: string
    location: string
    specialties: string[]
    is_elder: boolean
    verification_status: any
  }
  analytics: {
    stories_count: number
    transcripts_count: number
    media_count: number
    total_views: number
    engagement_score: number
    skills_identified: number
    opportunities_matched: number
  }
  recent_activity: any[]
  insights: any
  media_usage: any[]
}

export default function StorytellerDashboard() {
  const { id } = useParams()
  const [data, setData] = useState<StorytellerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // AI Insights state
  const [transcriptText, setTranscriptText] = useState('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch actual profile data
      const profileResponse = await fetch(`/api/storytellers/${id}`)
      const profileData = profileResponse.ok ? await profileResponse.json() : null

      // Fetch actual stats
      const statsResponse = await fetch(`/api/storytellers/${id}/stats`)
      const statsData = statsResponse.ok ? await statsResponse.json() : {
        totalStories: 0,
        publishedStories: 0,
        totalViews: 0,
        engagementScore: 0,
        mediaAssets: 0
      }

      setData({
        profile: {
          id: id as string,
          display_name: profileData?.display_name || null,
          bio: profileData?.bio || null,
          avatar_url: profileData?.profile_image_url || '/api/placeholder/150/150',
          cultural_background: profileData?.cultural_background || null,
          location: profileData?.location_data || null,
          specialties: [],
          is_elder: false,
          verification_status: { cultural: false, identity: false, email: true }
        },
        analytics: {
          stories_count: statsData.totalStories || 0,
          transcripts_count: 0, // Not implemented yet
          media_count: statsData.mediaAssets || 0,
          total_views: statsData.totalViews || 0,
          engagement_score: statsData.engagementScore || 0,
          skills_identified: 0, // Will come from AI analysis
          opportunities_matched: 0 // Will come from AI analysis
        },
        recent_activity: [],
        insights: {},
        media_usage: []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set empty data on error
      setData({
        profile: {
          id: id as string,
          display_name: null,
          bio: null,
          avatar_url: '/api/placeholder/150/150',
          cultural_background: null,
          location: null,
          specialties: [],
          is_elder: false,
          verification_status: { cultural: false, identity: false, email: true }
        },
        analytics: {
          stories_count: 0,
          transcripts_count: 0,
          media_count: 0,
          total_views: 0,
          engagement_score: 0,
          skills_identified: 0,
          opportunities_matched: 0
        },
        recent_activity: [],
        insights: {},
        media_usage: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTranscriptAnalysis = async () => {
    if (!transcriptText.trim()) return
    
    try {
      setAnalysisLoading(true)
      setAnalysisError(null)
      
      const response = await fetch(`/api/storytellers/${id}/transcript-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText
        })
      })
      
      if (response.ok) {
        const results = await response.json()
        setAnalysisResults(results)
        // Clear the input after successful analysis
        setTranscriptText('')
      } else {
        throw new Error('Failed to analyze transcript')
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const clearAnalysis = () => {
    setAnalysisResults(null)
    setAnalysisError(null)
    setTranscriptText('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p>Loading your storyteller dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-clay-50/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 ring-4 ring-orange-200">
                <AvatarImage src={data.profile.avatar_url} />
                <AvatarFallback className="text-2xl bg-orange-100">{data.profile.display_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back, {data.profile.display_name}!</h1>
                  {data.profile.is_elder && <Badge variant="sage-soft" className="gap-1"><Crown className="w-3 h-3" />Elder</Badge>}
                  {data.profile.verification_status?.cultural && <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600"><Shield className="w-3 h-3" />Verified</Badge>}
                </div>
                <p className="text-gray-600 max-w-2xl">{data.profile.bio}</p>
              </div>
            </div>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href={`/storytellers/${id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-blue-900">{data.analytics.stories_count}</p>
                  <p className="text-blue-700">Stories Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mic className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-green-900">{data.analytics.transcripts_count}</p>
                  <p className="text-green-700">Transcripts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <ImageIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-purple-900">{data.analytics.media_count}</p>
                  <p className="text-purple-700">Media Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-orange-900">{data.analytics.total_views.toLocaleString()}</p>
                  <p className="text-orange-700">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">My Content</TabsTrigger>
            <TabsTrigger value="media">Media Hub</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="opportunities">Growth</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/stories/create-ai">
                      <Brain className="w-4 h-4 mr-3" />
                      AI Story Creator
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href={`/storytellers/${id}/analytics`}>
                      <BarChart3 className="w-4 h-4 mr-3" />
                      View Analytics
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href={`/storytellers/${id}/media-hub`}>
                      <Camera className="w-4 h-4 mr-3" />
                      Media Control Center
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href={`/storytellers/${id}/opportunities`}>
                      <Target className="w-4 h-4 mr-3" />
                      Explore Opportunities
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* AI Insights Preview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Your AI Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized insights from your transcript analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Skills Identified</span>
                      <Badge variant="outline">{data.analytics.skills_identified} skills</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Opportunities Matched</span>
                      <Badge variant="outline">{data.analytics.opportunities_matched} matches</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Engagement Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={data.analytics.engagement_score} className="w-20" />
                        <span className="text-sm font-medium">{data.analytics.engagement_score}%</span>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link href={`/storytellers/${id}/insights`}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        View Full Insights
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest platform interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity to show</p>
                  <p className="text-sm">Start creating content to see your activity here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    My Stories
                  </CardTitle>
                  <CardDescription>{data.analytics.stories_count} stories published</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full mb-4">
                    <Link href="/stories/create-ai">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Story Creator
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/storytellers/${id}/stories`}>
                      View All Stories
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Transcripts
                  </CardTitle>
                  <CardDescription>{data.analytics.transcripts_count} transcripts available</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full mb-4">
                    <Link href="/transcripts/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Transcript
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/transcripts">
                      View All Transcripts
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Upload */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Quick Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <ImageIcon className="w-4 h-4 mr-3" />
                    Upload Photos
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Video className="w-4 h-4 mr-3" />
                    Upload Videos
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mic className="w-4 h-4 mr-3" />
                    Record Audio
                  </Button>
                  <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <Link href={`/storytellers/${id}/media-hub`}>
                      <Camera className="w-4 h-4 mr-3" />
                      Full Media Hub
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Media Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                    Your Media Library
                  </CardTitle>
                  <CardDescription>
                    Overview of your uploaded photos, videos, and documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{data.analytics.media_count}</p>
                        <p className="text-sm text-gray-600">Total Files</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">0</p>
                        <p className="text-sm text-gray-600">Photos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">0</p>
                        <p className="text-sm text-gray-600">Videos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">0 MB</p>
                        <p className="text-sm text-gray-600">Storage</p>
                      </div>
                    </div>

                    {/* Recent Media Placeholder */}
                    <div className="border rounded-lg p-6">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 mb-2">No media uploaded yet</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload photos and videos to enhance your stories and create rich multimedia experiences.
                        </p>
                        <Button asChild size="sm">
                          <Link href={`/storytellers/${id}/media-hub`}>
                            <Upload className="w-4 h-4 mr-2" />
                            Start Uploading
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Media Usage Analytics */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Media Usage Insights</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Used in Stories</span>
                          <span className="font-medium">0 files</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Used in Galleries</span>
                          <span className="font-medium">0 files</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Views</span>
                          <span className="font-medium">0 views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Media Organization Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Media Organization</CardTitle>
                <CardDescription>Tools to manage and organize your media library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Smart Tagging</h4>
                    </div>
                    <p className="text-sm text-gray-600">Automatically tag photos with cultural significance, people, and locations.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                        <Eye className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-medium">Privacy Controls</h4>
                    </div>
                    <p className="text-sm text-gray-600">Set visibility levels for sensitive cultural content and personal photos.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-50 rounded flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <h4 className="font-medium">Usage Analytics</h4>
                    </div>
                    <p className="text-sm text-gray-600">Track how your media is being used across stories and community interactions.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {!analysisResults ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transcript Upload */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Story Analysis
                    </CardTitle>
                    <CardDescription>
                      Upload a transcript or story for AI analysis to discover insights about your experiences, skills, and cultural identity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                        Paste your transcript or story text
                      </label>
                      <Textarea
                        id="transcript"
                        placeholder="Paste your interview transcript, story, or any text you'd like analyzed for personal insights..."
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum 100 words recommended for best analysis results
                      </p>
                    </div>

                    {analysisError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700">{analysisError}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleTranscriptAnalysis}
                        disabled={!transcriptText.trim() || analysisLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {analysisLoading ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Analyze Content
                          </>
                        )}
                      </Button>
                      
                      {transcriptText && (
                        <Button 
                          variant="outline" 
                          onClick={() => setTranscriptText('')}
                          disabled={analysisLoading}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Info */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      What You'll Discover
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Professional Skills</h4>
                          <p className="text-xs text-gray-600">Identify transferable skills and competencies</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Cultural Identity</h4>
                          <p className="text-xs text-gray-600">Cultural themes and identity markers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Growth Areas</h4>
                          <p className="text-xs text-gray-600">Development opportunities and strengths</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Impact Stories</h4>
                          <p className="text-xs text-gray-600">Measurable contributions for applications</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Analysis Results */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Analysis Complete</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearAnalysis}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Analysis
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/storytellers/${id}/analytics`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Full Analytics
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Results Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Insights Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Professional Skills</span>
                          <Badge variant="outline">{analysisResults?.skills?.length || 0} identified</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cultural Themes</span>
                          <Badge variant="outline">{analysisResults?.cultural_themes?.length || 0} themes</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Impact Stories</span>
                          <Badge variant="outline">{analysisResults?.impact_stories?.length || 0} stories</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Growth Areas</span>
                          <Badge variant="outline">{analysisResults?.growth_opportunities?.length || 0} areas</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Link href={`/storytellers/${id}/analytics`}>
                          <Button className="w-full justify-start" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-3" />
                            View Detailed Analytics
                          </Button>
                        </Link>
                        <Link href={`/storytellers/${id}/opportunities`}>
                          <Button className="w-full justify-start" variant="outline">
                            <Target className="w-4 h-4 mr-3" />
                            Discover Opportunities
                          </Button>
                        </Link>
                        <Link href={`/storytellers/${id}/skills`}>
                          <Button className="w-full justify-start" variant="outline">
                            <Award className="w-4 h-4 mr-3" />
                            Skills Assessment
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Opportunities</CardTitle>
                  <CardDescription>Personalized career and development recommendations based on your profile and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Career Development</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-green-700 mb-2">🚀 Leadership Opportunities</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Based on your storytelling experience, consider leadership roles in cultural organizations or community initiatives.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Explore Roles</Button>
                            <Button variant="outline" size="sm">Connect with Organizations</Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-blue-700 mb-2">📚 Speaking Engagements</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Your narrative skills make you an excellent candidate for conferences, workshops, and educational events.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Find Events</Button>
                            <Button variant="outline" size="sm">Speaker Kit</Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-purple-700 mb-2">✍️ Content Creation</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Expand your reach through blogging, podcasting, or writing opportunities in your area of expertise.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Writing Opportunities</Button>
                            <Button variant="outline" size="sm">Media Partnerships</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Skill Development</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-orange-700 mb-2">🎥 Digital Storytelling</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Enhance your impact with video production, podcast creation, and multimedia storytelling techniques.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Course Recommendations</Button>
                            <Button variant="outline" size="sm">Tool Resources</Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-teal-700 mb-2">🌐 Community Building</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Learn strategies for building and engaging communities around shared cultural experiences and values.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Workshops</Button>
                            <Button variant="outline" size="sm">Mentorship Programs</Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-indigo-700 mb-2">📊 Impact Measurement</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Develop skills in measuring and communicating the social impact of your storytelling work.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Analytics Training</Button>
                            <Button variant="outline" size="sm">Impact Frameworks</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Networking & Connections</CardTitle>
                  <CardDescription>Build meaningful relationships in your field</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">🤝</div>
                      <h4 className="font-medium mb-2">Professional Networks</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Connect with other storytellers, cultural advocates, and community leaders.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Find Networks</Button>
                    </div>

                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">👥</div>
                      <h4 className="font-medium mb-2">Mentorship</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Both seek mentors and become a mentor to emerging storytellers.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Join Program</Button>
                    </div>

                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">🌟</div>
                      <h4 className="font-medium mb-2">Collaboration</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Find opportunities to collaborate on projects and initiatives.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Browse Projects</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funding & Resources</CardTitle>
                  <CardDescription>Financial support and resources for your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium">Grants & Funding</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Cultural Heritage Grants</p>
                            <p className="text-sm text-gray-600">Up to $10,000 for cultural documentation projects</p>
                          </div>
                          <Button variant="outline" size="sm">Learn More</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Storytelling Fellowships</p>
                            <p className="text-sm text-gray-600">6-month funded programs for narrative development</p>
                          </div>
                          <Button variant="outline" size="sm">Apply</Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Tools & Resources</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Recording Equipment Library</p>
                            <p className="text-sm text-gray-600">Access professional audio/video equipment</p>
                          </div>
                          <Button variant="outline" size="sm">Reserve</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Editing Software Licenses</p>
                            <p className="text-sm text-gray-600">Free access to professional editing tools</p>
                          </div>
                          <Button variant="outline" size="sm">Access</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Recommended actions based on your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <div>
                        <h4 className="font-medium">Complete Your Profile</h4>
                        <p className="text-sm text-gray-600 mt-1">Add more details about your cultural background and experiences to unlock personalized recommendations.</p>
                        <Button variant="outline" size="sm" className="mt-2">Update Profile</Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <div>
                        <h4 className="font-medium">Upload Your First Story</h4>
                        <p className="text-sm text-gray-600 mt-1">Share a story or transcript to activate AI-powered insights and opportunity matching.</p>
                        <Button variant="outline" size="sm" className="mt-2">Add Story</Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <div>
                        <h4 className="font-medium">Connect with the Community</h4>
                        <p className="text-sm text-gray-600 mt-1">Join our storytelling community to find collaboration opportunities and receive feedback.</p>
                        <Button variant="outline" size="sm" className="mt-2">Join Community</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about your stories and opportunities</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Privacy Settings</h4>
                        <p className="text-sm text-gray-600">Control who can see your profile and stories</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Export</h4>
                        <p className="text-sm text-gray-600">Download all your stories and data</p>
                      </div>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-gray-600">Permanently remove your account and all data</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Preferences</CardTitle>
                  <CardDescription>Customize how your profile appears and functions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Public Profile</h4>
                        <p className="text-sm text-gray-600">Make your profile discoverable by other users</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Story Visibility</h4>
                        <p className="text-sm text-gray-600">Default visibility setting for new stories</p>
                      </div>
                      <Button variant="outline" size="sm">Set Default</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">AI Analysis</h4>
                        <p className="text-sm text-gray-600">Allow AI to analyze your content for insights</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Language Preferences</h4>
                        <p className="text-sm text-gray-600">Set your preferred language for the platform</p>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                  <CardDescription>Get assistance and learn more about the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-xl">📖</div>
                        <h4 className="font-medium">User Guide</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Comprehensive guide to using all platform features
                      </p>
                      <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-xl">🎥</div>
                        <h4 className="font-medium">Video Tutorials</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Step-by-step video tutorials for key features
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Watch Videos</Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-xl">❓</div>
                        <h4 className="font-medium">FAQ</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Answers to frequently asked questions
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Browse FAQ</Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-xl">💬</div>
                        <h4 className="font-medium">Contact Support</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Get help from our support team
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Contact Us</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Guidelines</CardTitle>
                  <CardDescription>Important information about using our platform respectfully</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Cultural Respect</h4>
                      <p className="text-sm text-gray-600">
                        We are committed to honoring all cultural traditions and stories with respect and authenticity. Please share your stories thoughtfully and respect others' cultural heritage.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Content Guidelines</h4>
                      <p className="text-sm text-gray-600">
                        Share content that is truthful, respectful, and adds value to our community. Avoid harmful, offensive, or inappropriate material.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium mb-2">Privacy & Consent</h4>
                      <p className="text-sm text-gray-600">
                        Always obtain proper consent before sharing stories involving others. Respect privacy and be mindful of sensitive cultural information.
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">Full Guidelines</Button>
                      <Button variant="outline" size="sm">Report Content</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Information</CardTitle>
                  <CardDescription>Learn more about our mission and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium">About This Platform</h4>
                      <p className="text-sm text-gray-600">
                        Our cultural storytelling platform is designed to preserve, share, and celebrate diverse stories and experiences from communities around the world.
                      </p>
                      <Button variant="outline" size="sm">Learn More</Button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Recent Updates</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>New AI analysis features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Enhanced media management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Growth opportunities system</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Changelog</Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Platform Version: 2.1.0</p>
                        <p className="text-sm text-gray-600">Last Updated: September 2025</p>
                      </div>
                      <Button variant="outline" size="sm">Check for Updates</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback</CardTitle>
                  <CardDescription>Help us improve the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Share Your Thoughts</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Your feedback helps us build a better platform for everyone. Let us know what's working well and what could be improved.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Send Feedback</Button>
                        <Button variant="outline" size="sm">Feature Request</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Join Our Community</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Connect with other storytellers and stay updated on platform developments.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Community Forum</Button>
                        <Button variant="outline" size="sm">Newsletter</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Widget */}
        <HelpWidget />
      </div>

      <Footer />
    </div>
  )
}
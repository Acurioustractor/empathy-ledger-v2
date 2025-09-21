'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ElegantStorytellerCard, transformToElegantCard } from '@/components/storyteller/elegant-storyteller-card'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'
import {
  Crown,
  User,
  MapPin,
  BookOpen,
  Calendar,
  Star,
  MessageCircle,
  ArrowLeft,
  Users,
  Award,
  Globe,
  Heart,
  Share2,
  Camera,
  Mic,
  Video,
  FileText,
  Languages,
  CheckCircle,
  ExternalLink,
  Edit,
  Target,
  Building2,
  Clock,
  TrendingUp,
  Sparkles,
  Headphones,
  Play,
  Eye,
  ThumbsUp
} from 'lucide-react'

interface StorytellerProfile {
  id: string
  display_name: string
  bio: string | null
  cultural_background: string | null
  specialties: string[] | null
  years_of_experience: number | null
  preferred_topics: string[] | null
  story_count: number
  featured: boolean
  status: 'active' | 'inactive' | 'pending'
  elder_status: boolean
  storytelling_style: string[] | null
  profile?: {
    avatar_url?: string
    cultural_affiliations?: string[]
    pronouns?: string
    display_name?: string
    bio?: string
    languages_spoken?: string[]
    interests?: string[]
    occupation?: string
  }
  organisations?: Array<{
    id: string
    name: string
    role: string
  }>
  projects?: Array<{
    id: string
    name: string
    role: string
  }>
  location?: string
}

interface Story {
  id: string
  title: string
  content: string
  status: 'draft' | 'review' | 'published' | 'archived'
  featured: boolean
  story_type: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
  views_count: number
  likes_count: number
  reading_time_minutes: number | null
  tags: string[] | null
  created_at: string
}

interface Transcript {
  id: string
  title: string
  duration: number
  word_count: number
  status: string
  created_at: string
}

export default function EnhancedStorytellerProfilePage() {
  const params = useParams()
  const storytellerId = params.id as string

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [relatedStorytellers, setRelatedStorytellers] = useState<StorytellerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchStorytellerData()
  }, [storytellerId])

  const fetchStorytellerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch storyteller profile
      const storytellerResponse = await fetch(`/api/storytellers/${storytellerId}`)
      const storytellerData = await storytellerResponse.json()

      if (!storytellerResponse.ok) {
        throw new Error(storytellerData.error || 'Failed to fetch storyteller')
      }

      // API returns storyteller data directly, not wrapped in storyteller property
      setStoryteller(storytellerData)

      // Fetch stories by this storyteller
      const storiesResponse = await fetch(`/api/stories?storyteller_id=${storytellerId}&status=published&limit=10`)
      const storiesData = await storiesResponse.json()
      if (storiesResponse.ok) {
        setStories(storiesData.stories || [])
      }

      // Fetch related storytellers (AI recommendations)
      try {
        const relatedResponse = await fetch(`/api/ai/recommendations?user_id=${storytellerId}&type=similar_storytellers&max_results=6`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          setRelatedStorytellers(relatedData.recommendations || [])
        }
      } catch (error) {
        console.log('AI recommendations not available yet')
        setRelatedStorytellers([])
      }

      // Fetch transcripts (skip if API doesn't exist yet)
      try {
        const transcriptsResponse = await fetch(`/api/admin/storytellers/${storytellerId}/transcripts`)
        if (transcriptsResponse.ok) {
          const transcriptsData = await transcriptsResponse.json()
          setTranscripts(transcriptsData.transcripts || [])
        }
      } catch (error) {
        console.log('Transcripts API not available yet')
        setTranscripts([])
      }

    } catch (error) {
      console.error('Error fetching storyteller data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-grey-200 rounded-xl"></div>
            <div className="h-8 bg-grey-200 rounded w-1/3"></div>
            <div className="h-4 bg-grey-200 rounded w-full"></div>
            <div className="h-4 bg-grey-200 rounded w-2/3"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !storyteller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error: {error || 'Storyteller not found'}</p>
              <Button onClick={fetchStorytellerData} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link href={`/storytellers/${storytellerId}`}>
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Button>
            </Link>

            {/* Profile View Toggle */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/storytellers/${storytellerId}`}>
                  Standard View
                </Link>
              </Button>
              <Button variant="default" size="sm" disabled>
                Enhanced View
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/storytellers/${storytellerId}/immersive`}>
                  Immersive View
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8">
          <Card className="overflow-hidden bg-gradient-to-br from-earth-50 via-sage-50 to-clay-50">
            <CardContent className="p-0">
              <div className="relative h-64 bg-gradient-to-br from-earth-100 to-sage-100">
                {storyteller.profile?.avatar_url ? (
                  <img
                    src={storyteller.profile.avatar_url}
                    alt={storyteller.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar className="w-32 h-32 ring-4 ring-white shadow-xl">
                      <AvatarImage src={storyteller.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 text-4xl font-bold">
                        {getInitials(storyteller.display_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {/* Status Overlays */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  {storyteller.featured && (
                    <Badge className="bg-white/90 backdrop-blur-sm text-amber-700 border-amber-200 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {storyteller.elder_status && (
                    <Badge className="bg-white/90 backdrop-blur-sm text-purple-700 border-purple-200 shadow-lg">
                      <Crown className="w-3 h-3 mr-1" />
                      Elder
                    </Badge>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Name and Location Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <Typography variant="h1" className="text-white font-bold text-3xl mb-2 drop-shadow-lg">
                    {storyteller.display_name}
                  </Typography>
                  {storyteller.location && (
                    <div className="flex items-center text-white/90 text-lg drop-shadow">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{storyteller.location}</span>
                    </div>
                  )}
                  {storyteller.profile?.pronouns && (
                    <div className="text-white/80 text-sm mt-1">
                      {storyteller.profile.pronouns}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Stories</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{storyteller.story_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <Mic className="w-4 h-4" />
                <span className="text-sm">Transcripts</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{transcripts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Experience</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">
                {storyteller.years_of_experience || '-'}
                {storyteller.years_of_experience && <span className="text-sm font-normal">y</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Projects</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{storyteller.projects?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bio and Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body" className="text-grey-700 leading-relaxed">
                      {storyteller.bio || storyteller.profile?.bio || 'No biography available.'}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Specialties and Topics */}
                {(storyteller.specialties || storyteller.preferred_topics) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Expertise & Interests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {storyteller.specialties && storyteller.specialties.length > 0 && (
                        <div>
                          <Typography variant="h4" className="text-sm font-semibold text-grey-700 mb-2">
                            Specialties
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {storyteller.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="bg-earth-50 text-earth-700 border-earth-200">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {storyteller.preferred_topics && storyteller.preferred_topics.length > 0 && (
                        <div>
                          <Typography variant="h4" className="text-sm font-semibold text-grey-700 mb-2">
                            Preferred Topics
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {storyteller.preferred_topics.map((topic, index) => (
                              <Badge key={index} variant="outline" className="bg-sage-50 text-sage-700 border-sage-200">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cultural Background */}
                {storyteller.cultural_background && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cultural Background</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Typography variant="body" className="text-grey-700">
                        {storyteller.cultural_background}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Organizations */}
                {storyteller.organisations && storyteller.organisations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Organizations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {storyteller.organisations.map((org, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-grey-500" />
                          <div>
                            <div className="font-medium text-grey-900">{org.name}</div>
                            <div className="text-sm text-grey-500">{org.role}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Projects */}
                {storyteller.projects && storyteller.projects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {storyteller.projects.map((project, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-grey-500" />
                          <div>
                            <div className="font-medium text-grey-900">{project.name}</div>
                            <div className="text-sm text-grey-500">{project.role}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Languages */}
                {storyteller.profile?.languages_spoken && storyteller.profile.languages_spoken.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {storyteller.profile.languages_spoken.map((language, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Languages className="w-3 h-3 mr-1" />
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Stories</CardTitle>
                <CardDescription>
                  Stories shared by {storyteller.display_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stories.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-grey-400 mx-auto mb-4" />
                    <Typography variant="h3" className="text-grey-600 mb-2">
                      No Published Stories
                    </Typography>
                    <Typography variant="body" className="text-grey-500">
                      {storyteller.display_name} hasn't published any stories yet.
                    </Typography>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stories.map((story) => (
                      <Card key={story.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <Typography variant="h3" className="font-semibold text-grey-900 line-clamp-2">
                              {story.title}
                            </Typography>
                            {story.featured && (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          <Typography variant="body" className="text-grey-600 mb-4 line-clamp-3">
                            {story.content.substring(0, 150)}...
                          </Typography>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-grey-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {story.views_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {story.likes_count}
                              </div>
                              {story.reading_time_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {story.reading_time_minutes}m
                                </div>
                              )}
                            </div>

                            <Link href={`/stories/${story.id}`}>
                              <Button variant="outline" size="sm">
                                Read Story
                              </Button>
                            </Link>
                          </div>

                          {story.tags && story.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {story.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Related Storytellers</CardTitle>
                <CardDescription>
                  Storytellers with similar backgrounds and expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedStorytellers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-grey-400 mx-auto mb-4" />
                    <Typography variant="h3" className="text-grey-600 mb-2">
                      No Related Storytellers
                    </Typography>
                    <Typography variant="body" className="text-grey-500">
                      We'll find related storytellers as the community grows.
                    </Typography>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedStorytellers.map((relatedStoryteller) => {
                      const elegantData = transformToElegantCard(relatedStoryteller)
                      return (
                        <ElegantStorytellerCard
                          key={relatedStoryteller.id}
                          storyteller={elegantData}
                          variant="compact"
                        />
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Transcripts</CardTitle>
                <CardDescription>
                  Recorded conversations and oral histories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transcripts.length === 0 ? (
                  <div className="text-center py-8">
                    <Headphones className="w-12 h-12 text-grey-400 mx-auto mb-4" />
                    <Typography variant="h3" className="text-grey-600 mb-2">
                      No Transcripts Available
                    </Typography>
                    <Typography variant="body" className="text-grey-500">
                      No audio recordings have been transcribed yet.
                    </Typography>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcripts.map((transcript) => (
                      <Card key={transcript.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mic className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <Typography variant="h4" className="font-medium text-grey-900">
                                  {transcript.title || 'Untitled Recording'}
                                </Typography>
                                <div className="flex items-center gap-4 text-sm text-grey-500">
                                  <span>{formatDuration(transcript.duration)}</span>
                                  <span>{transcript.word_count.toLocaleString()} words</span>
                                  <span>{formatDate(transcript.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Listen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoryCard } from '@/components/story/story-card'
import { Card } from '@/components/ui/card'
import { EditableSummary } from '@/components/storyteller/EditableSummary'
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
  Globe2,
  Phone,
  Mail,
  Clock,
  Heart,
  Share2,
  Languages,
  Shield,
  CheckCircle,
  ExternalLink,
  Edit,
  TrendingUp,
  Target,
  Sparkles,
  Quote,
  Landmark,
  HandHeart,
  Route,
  Palette
} from 'lucide-react'
import type { StorytellerProfile, Story } from '@/types/storyteller'
import {
  getExperienceLevel,
  getStorytellingStyleIcon,
  extractStoryThemes,
  createJourneySteps
} from '@/lib/storyteller-utils.tsx'

export default function StorytellerProfilePage() {
  const params = useParams()
  const storytellerId = params.id as string
  const { isAuthenticated, isSuperAdmin, isAdmin } = useAuth()

  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const handleSummaryUpdate = (newSummary: string) => {
    if (storyteller) {
      setStoryteller({
        ...storyteller,
        profile: {
          ...storyteller.profile,
          bio: newSummary
        }
      })
    }
  }

  useEffect(() => {
    async function fetchStoryteller() {
      try {
        setLoading(true)
        const response = await fetch(`/api/storytellers/${storytellerId}`)
        if (!response.ok) {
          throw new Error('Storyteller not found')
        }
        const data = await response.json()
        setStoryteller(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    async function fetchStories() {
      try {
        const response = await fetch(`/api/stories?storyteller_id=${storytellerId}&status=published&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setStories(data.stories || [])
        }
      } catch (err) {
        console.error('Failed to fetch stories:', err)
      }
    }

    if (storytellerId) {
      fetchStoryteller()
      fetchStories()
    }
  }, [storytellerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-earth-200 rounded w-64 mb-4"></div>
            <div className="h-64 bg-earth-200 rounded mb-8"></div>
            <div className="h-96 bg-earth-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !storyteller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Typography variant="h2" className="text-red-600 mb-4">
              Storyteller Not Found
            </Typography>
            <Typography variant="body" className="text-grey-600 mb-6">
              {error || "The storyteller you're looking for doesn't exist or may have been removed."}
            </Typography>
            <Button asChild>
              <Link href="/storytellers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Storytellers
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const experienceLevel = getExperienceLevel(storyteller.years_of_experience)
  const isFeatured = storyteller.featured
  const isElder = storyteller.elder_status
  const isActive = storyteller.status === 'active'

  // Extract story themes and journey for enhanced storytelling
  const storyThemes = extractStoryThemes(storyteller.bio)
  const journeySteps = createJourneySteps(storyteller)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link href="/storytellers">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Storytellers
              </Button>
            </Link>

            {/* Admin Actions - Only visible to super admins */}
            <div className="flex items-center gap-2">
              {(isSuperAdmin || isAdmin) && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/storytellers/${storytellerId}/enhanced`}>
                      Enhanced View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/storytellers/${storytellerId}/analytics`}>
                      Analytics
                    </Link>
                  </Button>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Shield className="w-3 h-3 mr-1" />
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage
                      src={storyteller.profile?.avatar_url}
                      alt={storyteller.display_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-grey-100 text-grey-600 text-3xl font-bold">
                      {getInitials(storyteller.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:w-48">
                    <div className="text-center p-4 bg-grey-50 rounded-lg">
                      <BookOpen className="w-6 h-6 text-grey-600 mx-auto mb-2" />
                      <Typography variant="h3" className="text-grey-800">
                        {storyteller.story_count}
                      </Typography>
                      <Typography variant="small" className="text-grey-600">
                        {storyteller.story_count === 1 ? 'Story' : 'Stories'}
                      </Typography>
                    </div>

                    <div className="text-center p-4 bg-grey-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-grey-600 mx-auto mb-2" />
                      <Typography variant="h3" className="text-grey-800">
                        {storyteller.years_of_experience || 'New'}
                      </Typography>
                      <Typography variant="small" className="text-grey-600">
                        {storyteller.years_of_experience ?
                          (storyteller.years_of_experience === 1 ? 'Year' : 'Years') :
                          'Member'
                        }
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Main Profile Info */}
                <div className="flex-1">
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Typography
                        variant="h1"
                        className="text-slate-800"
                        role="heading"
                        aria-level={1}
                      >
                        {storyteller.display_name}
                      </Typography>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2" role="list" aria-label="Storyteller status badges">
                        {isFeatured && (
                          <Badge
                            className="bg-amber-100 text-amber-800"
                            role="listitem"
                            aria-label="Featured storyteller"
                          >
                            <Star className="w-3 h-3 mr-1" aria-hidden="true" />
                            Featured
                          </Badge>
                        )}
                        {isElder && (
                          <Badge
                            className="bg-purple-100 text-purple-800"
                            role="listitem"
                            aria-label="Recognized Elder"
                          >
                            <Crown className="w-3 h-3 mr-1" aria-hidden="true" />
                            Elder Storyteller
                          </Badge>
                        )}
                        <Badge
                          className={cn('text-xs', experienceLevel.colour)}
                          role="listitem"
                          aria-label={`Experience level: ${experienceLevel.label}`}
                        >
                          <Award className="w-3 h-3 mr-1" aria-hidden="true" />
                          {experienceLevel.label}
                        </Badge>
                      </div>
                    </div>

                    {storyteller.profile?.pronouns && (
                      <Typography variant="body" className="text-grey-600 mb-3">
                        {storyteller.profile.pronouns}
                      </Typography>
                    )}

                    {/* Enhanced Location & Cultural Context */}
                    <div className="mb-4 space-y-2">
                      {(storyteller as any).location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-earth-500 flex-shrink-0" aria-hidden="true" />
                          <Typography variant="body" className="text-grey-700">
                            {(storyteller as any).location}
                          </Typography>
                          {(storyteller as any).geographic_scope && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              {(storyteller as any).geographic_scope}
                            </Badge>
                          )}
                        </div>
                      )}

                      {(storyteller as any).traditional_territory && (
                        <div className="flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                          <Typography variant="body" className="text-grey-600 italic text-sm">
                            {(storyteller as any).traditional_territory}
                          </Typography>
                        </div>
                      )}

                      {storyteller.cultural_background && (
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-sage-500 flex-shrink-0" aria-hidden="true" />
                          <Typography variant="body" className="text-grey-700">
                            {storyteller.cultural_background}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {/* Cultural Markers */}
                    {(storyteller.profile?.languages_spoken?.length ||
                      (storyteller as any).traditional_knowledge_keeper ||
                      storyteller.profile?.cultural_affiliations?.length) && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {storyteller.profile?.languages_spoken && storyteller.profile.languages_spoken.length > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5"
                          >
                            <Languages className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{storyteller.profile.languages_spoken.slice(0, 2).join(', ')}</span>
                            {storyteller.profile.languages_spoken.length > 2 && (
                              <span>+{storyteller.profile.languages_spoken.length - 2}</span>
                            )}
                          </Badge>
                        )}

                        {(storyteller as any).traditional_knowledge_keeper && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5"
                          >
                            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Knowledge Keeper</span>
                          </Badge>
                        )}

                        {storyteller.profile?.cultural_affiliations && storyteller.profile.cultural_affiliations.length > 0 && (
                          storyteller.profile.cultural_affiliations.slice(0, 2).map((affiliation, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-earth-50 text-earth-700 border-earth-200"
                            >
                              {affiliation}
                            </Badge>
                          ))
                        )}
                      </div>
                    )}

                    {storyteller.bio && (
                      <Typography variant="body" className="text-grey-700 leading-relaxed">
                        {storyteller.bio}
                      </Typography>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Storyteller
                    </Button>

                    {storyteller.story_count > 0 && (
                      <Button variant="outline" onClick={() => setActiveTab('stories')}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Stories ({storyteller.story_count})
                      </Button>
                    )}

                    {/* Admin Actions - Only visible to super admins */}
                    {(isSuperAdmin || isAdmin) && (
                      <>
                        <Button variant="outline" asChild>
                          <Link href={`/admin/storytellers/${storyteller.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Link>
                        </Button>

                        <Button variant="outline" asChild>
                          <Link href={`/admin/storytellers`}>
                            <Users className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>
                      </>
                    )}

                    <Button variant="ghost">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                  </div>
                </div>
              </div>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="expertise">Expertise</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Editable Summary Section - Only show for authenticated users viewing their own profile */}
            {isAuthenticated && (
              <EditableSummary
                storytellerId={storytellerId}
                currentSummary={storyteller.profile?.bio || ''}
                displayName={storyteller.display_name}
                onSummaryUpdate={handleSummaryUpdate}
              />
            )}

            {/* Story Themes */}
            {storyThemes.length > 0 && (
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-amber-600" />
                  Story Themes
                </Typography>
                <Typography variant="body" className="text-grey-600 mb-4">
                  The key themes that emerge from {storyteller.display_name}'s story
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storyThemes.map((theme, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border">
                      <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm border">
                        {theme.icon}
                      </div>
                      <div className="flex-1">
                        <Typography variant="h4" className="font-semibold text-slate-800 mb-1">
                          {theme.theme}
                        </Typography>
                        <Typography variant="small" className="text-grey-600">
                          {theme.description}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Journey Timeline */}
            {journeySteps.length > 0 && (
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Route className="w-5 h-5 mr-2 text-blue-600" />
                  Story Journey
                </Typography>
                <Typography variant="body" className="text-grey-600 mb-6">
                  The path that led {storyteller.display_name} to where they are today
                </Typography>
                <div className="space-y-4">
                  {journeySteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full border-2 border-blue-200">
                          {step.icon}
                        </div>
                        {index < journeySteps.length - 1 && (
                          <div className="w-0.5 h-12 bg-blue-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-2">
                          <Typography variant="h4" className="font-semibold text-slate-800">
                            {step.title}
                          </Typography>
                          {step.timeframe && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {step.timeframe}
                            </Badge>
                          )}
                        </div>
                        <Typography variant="body" className="text-grey-600">
                          {step.description}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Highlighted Quote from Bio */}
            {storyteller.bio && storyteller.bio.length > 100 && (
              <Card className="p-6 bg-grey-50">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 text-grey-600 flex-shrink-0 mt-1" />
                  <div>
                    <Typography variant="body" className="text-grey-700 italic text-lg leading-relaxed mb-3">
                      "{storyteller.bio.split('.')[0]}..."
                    </Typography>
                    <Typography variant="small" className="text-grey-600 font-medium">
                      — {storyteller.display_name}
                    </Typography>
                  </div>
                </div>
              </Card>
            )}

            {/* Impact Highlights */}
            <Card className="p-6">
              <Typography variant="h3" className="mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Community Impact
              </Typography>
              <Typography variant="body" className="text-grey-600 mb-6">
                {storyteller.display_name}'s contributions through storytelling
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <HandHeart className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <Typography variant="h3" className="text-green-800 font-bold">
                    {storyteller.story_count || '0'}
                  </Typography>
                  <Typography variant="small" className="text-green-700">
                    {storyteller.story_count === 1 ? 'Story Shared' : 'Stories Shared'}
                  </Typography>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <Typography variant="h3" className="text-blue-800 font-bold">
                    {storyteller.organisations && storyteller.organisations.length > 0
                      ? storyteller.organisations[0].role || 'Member'
                      : 'Independent'}
                  </Typography>
                  <Typography variant="small" className="text-blue-700">
                    {storyteller.organisations && storyteller.organisations.length > 0
                      ? storyteller.organisations[0].name
                      : 'Community Member'}
                  </Typography>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <Typography variant="h3" className="text-purple-800 font-bold">
                    {storyteller.specialties && storyteller.specialties.length > 0
                      ? storyteller.specialties.length
                      : 'Various'}
                  </Typography>
                  <Typography variant="small" className="text-purple-700">
                    {storyteller.specialties && storyteller.specialties.length > 0
                      ? (storyteller.specialties.length === 1 ? 'Specialty Area' : 'Specialty Areas')
                      : 'Interests'}
                  </Typography>
                </div>
              </div>

              {/* Additional Impact Details */}
              {storyteller.bio && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                  <Typography variant="h4" className="font-semibold text-slate-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    About {storyteller.display_name}
                  </Typography>
                  <Typography variant="body" className="text-slate-700">
                    {storyteller.bio.length > 200
                      ? `${storyteller.bio.substring(0, 200)}...`
                      : storyteller.bio}
                  </Typography>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cultural Background */}
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-slate-600" />
                  Cultural Background
                </Typography>
                
                {storyteller.cultural_background && (
                  <div className="mb-4">
                    <Badge variant="outline" className="bg-sage-50 text-sage-700 mb-2">
                      {storyteller.cultural_background}
                    </Badge>
                  </div>
                )}

                {storyteller.profile?.cultural_affiliations && (
                  <div>
                    <Typography variant="small" className="text-grey-700 mb-2 font-medium">
                      Affiliations
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                      {storyteller.profile.cultural_affiliations.map((affiliation, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {affiliation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Storytelling Styles */}
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-earth-600" />
                  Storytelling Style
                </Typography>
                
                {storyteller.storytelling_style ? (
                  <div className="space-y-2">
                    {storyteller.storytelling_style.map((style, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {getStorytellingStyleIcon(style)}
                        <Typography variant="small">{style}</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="body" className="text-grey-500">
                    No styles listed
                  </Typography>
                )}
              </Card>

              {/* Languages */}
              {storyteller.profile?.languages_spoken && (
                <Card className="p-6">
                  <Typography variant="h3" className="mb-4 flex items-center">
                    <Languages className="w-5 h-5 mr-2 text-earth-600" />
                    Languages
                  </Typography>
                  
                  <div className="flex flex-wrap gap-2">
                    {storyteller.profile.languages_spoken.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Specialties */}
            {storyteller.specialties && storyteller.specialties.length > 0 && (
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-earth-600" />
                  Specialties & Expertise
                </Typography>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {storyteller.specialties.map((specialty, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="justify-center py-2 bg-earth-100 text-earth-800"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Preferred Topics */}
            {storyteller.preferred_topics && storyteller.preferred_topics.length > 0 && (
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-earth-600" />
                  Preferred Topics
                </Typography>
                
                <div className="flex flex-wrap gap-2">
                  {storyteller.preferred_topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <div className="flex justify-between items-center">
              <Typography variant="h2">Stories by {storyteller.display_name}</Typography>
              {stories.length > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/stories?storyteller=${storyteller.id}`}>
                    View All Stories
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>

            {stories.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-grey-300 mx-auto mb-4" />
                <Typography variant="h3" className="text-grey-600 mb-2">
                  No Published Stories Yet
                </Typography>
                <Typography variant="body" className="text-grey-500">
                  {storyteller.display_name} hasn't published any stories yet. Check back soon!
                </Typography>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={{
                      ...story,
                      storyteller: {
                        id: storyteller.id,
                        display_name: storyteller.display_name,
                        bio: storyteller.bio,
                        cultural_background: storyteller.cultural_background,
                        elder_status: storyteller.elder_status,
                        profile: storyteller.profile
                      },
                      author_id: storyteller.id
                    }}
                    variant="compact"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expertise Tab */}
          <TabsContent value="expertise" className="space-y-6">
            <Typography variant="h2">Expertise & Recognition</Typography>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Experience Level */}
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-earth-600" />
                  Experience Level
                </Typography>
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={experienceLevel.colour}>
                    {experienceLevel.label}
                  </Badge>
                  {storyteller.years_of_experience && (
                    <Typography variant="body" className="text-grey-600">
                      {storyteller.years_of_experience} years of storytelling
                    </Typography>
                  )}
                </div>

                {isElder && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-purple-600" />
                      <Typography variant="h4" className="text-purple-800">
                        Elder Recognition
                      </Typography>
                    </div>
                    <Typography variant="small" className="text-purple-700">
                      Recognized as an Elder within the community, carrying traditional knowledge 
                      and cultural wisdom.
                    </Typography>
                  </div>
                )}
              </Card>

              {/* Community Recognition */}
              {storyteller.community_recognition && (
                <Card className="p-6">
                  <Typography variant="h3" className="mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-earth-600" />
                    Community Recognition
                  </Typography>
                  
                  <Typography variant="body" className="text-grey-600">
                    {JSON.stringify(storyteller.community_recognition)}
                  </Typography>
                </Card>
              )}

              {/* Cultural Protocols */}
              {storyteller.cultural_protocols && (
                <Card className="p-6">
                  <Typography variant="h3" className="mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-earth-600" />
                    Cultural Protocols
                  </Typography>
                  
                  <Typography variant="body" className="text-grey-600">
                    This storyteller follows specific cultural protocols and practices in their storytelling.
                  </Typography>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Typography variant="h2">Contact Information</Typography>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-earth-600" />
                  Get in Touch
                </Typography>
                
                {storyteller.profile?.preferred_communication && (
                  <div className="mb-4">
                    <Typography variant="small" className="text-grey-700 mb-2 font-medium">
                      Preferred Communication
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {storyteller.profile.preferred_communication.map((method, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {storyteller.profile?.timezone && (
                  <div className="mb-4">
                    <Typography variant="small" className="text-grey-700 mb-1 font-medium">
                      Timezone
                    </Typography>
                    <Typography variant="body" className="text-grey-600">
                      {storyteller.profile.timezone}
                    </Typography>
                  </div>
                )}

                <Button className="w-full" disabled={!isActive}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </Card>

              {/* Availability */}
              {storyteller.availability && (
                <Card className="p-6">
                  <Typography variant="h3" className="mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-earth-600" />
                    Availability
                  </Typography>
                  
                  <Typography variant="body" className="text-grey-600 mb-4">
                    Information about storytelling availability and booking.
                  </Typography>
                  
                  <Button variant="outline" className="w-full">
                    Request Booking
                  </Button>
                </Card>
              )}
            </div>

            {/* Professional Info */}
            {storyteller.profile?.occupation && (
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-earth-600" />
                  Professional Background
                </Typography>
                
                <Typography variant="body" className="text-grey-600">
                  {storyteller.profile.occupation}
                </Typography>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
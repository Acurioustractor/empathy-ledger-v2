'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoryCard } from '@/components/story/story-card'
import { Card } from '@/components/ui/card'
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
  Phone,
  Mail,
  Clock,
  Heart,
  Share2,
  Camera,
  Mic,
  Video,
  FileText,
  Music,
  Palette,
  Languages,
  Shield,
  CheckCircle,
  ExternalLink
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
  availability: any | null
  cultural_protocols: any | null
  community_recognition: any | null
  performance_preferences: any | null
  compensation_preferences: any | null
  travel_availability: any | null
  technical_requirements: any | null
  profile?: {
    avatar_url?: string
    cultural_affiliations?: string[]
    pronouns?: string
    display_name?: string
    bio?: string
    phone?: string
    social_links?: any
    languages_spoken?: string[]
    interests?: string[]
    preferred_communication?: string[]
    occupation?: string
    timezone?: string
  }
}

interface Story {
  id: string
  title: string
  content: string
  status: 'draft' | 'review' | 'published' | 'archived'
  featured: boolean
  story_type: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
  audience: 'children' | 'youth' | 'adults' | 'elders' | 'all'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  elder_approval: boolean | null
  cultural_review_status: 'pending' | 'approved' | 'rejected' | 'needs_changes'
  views_count: number
  likes_count: number
  shares_count: number
  reading_time_minutes: number | null
  tags: string[] | null
  location: string | null
  created_at: string
}

const getExperienceLevel = (years: number | null) => {
  if (!years) return { label: 'New Storyteller', color: 'bg-blue-100 text-blue-800' }
  if (years < 2) return { label: 'New Storyteller', color: 'bg-blue-100 text-blue-800' }
  if (years < 5) return { label: 'Emerging Voice', color: 'bg-green-100 text-green-800' }
  if (years < 10) return { label: 'Experienced Storyteller', color: 'bg-purple-100 text-purple-800' }
  if (years < 20) return { label: 'Veteran Storyteller', color: 'bg-orange-100 text-orange-800' }
  return { label: 'Master Storyteller', color: 'bg-amber-100 text-amber-800' }
}

const storytellingStyleIcons: { [key: string]: React.ReactNode } = {
  'Oral Tradition': <Mic className="w-4 h-4" />,
  'Digital Storytelling': <Video className="w-4 h-4" />,
  'Performance': <Users className="w-4 h-4" />,
  'Written Narrative': <FileText className="w-4 h-4" />,
  'Visual Storytelling': <Camera className="w-4 h-4" />,
  'Song & Music': <Music className="w-4 h-4" />,
  'Dance & Movement': <User className="w-4 h-4" />,
  'Interactive': <Palette className="w-4 h-4" />
}

export default function StorytellerProfilePage() {
  const params = useParams()
  const storytellerId = params.id as string
  
  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

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
            <Typography variant="body" className="text-gray-600 mb-6">
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/storytellers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Storytellers
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-earth-100 to-sage-100 opacity-50"></div>
            
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={storyteller.profile?.avatar_url} 
                        alt={storyteller.display_name}
                      />
                      <AvatarFallback className="bg-earth-200 text-earth-700 text-3xl">
                        {getInitials(storyteller.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Status Indicators */}
                    <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                      {isFeatured && (
                        <div className="bg-amber-400 rounded-full p-2 shadow-lg">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {isElder && (
                        <div className="bg-purple-500 rounded-full p-2 shadow-lg">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:w-48">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <BookOpen className="w-6 h-6 text-earth-600 mx-auto mb-2" />
                      <Typography variant="h3" className="text-earth-800">
                        {storyteller.story_count}
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        {storyteller.story_count === 1 ? 'Story' : 'Stories'}
                      </Typography>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <Calendar className="w-6 h-6 text-earth-600 mx-auto mb-2" />
                      <Typography variant="h3" className="text-earth-800">
                        {storyteller.years_of_experience || 'New'}
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
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
                      <Typography variant="h1" className="text-earth-800">
                        {storyteller.display_name}
                      </Typography>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {isFeatured && (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {isElder && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Elder Storyteller
                          </Badge>
                        )}
                        <Badge className={cn('text-xs', experienceLevel.color)}>
                          <Award className="w-3 h-3 mr-1" />
                          {experienceLevel.label}
                        </Badge>
                      </div>
                    </div>

                    {storyteller.profile?.pronouns && (
                      <Typography variant="body" className="text-gray-600 mb-2">
                        {storyteller.profile.pronouns}
                      </Typography>
                    )}

                    {storyteller.cultural_background && (
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <Typography variant="body" className="text-gray-600">
                          {storyteller.cultural_background}
                        </Typography>
                      </div>
                    )}

                    {storyteller.bio && (
                      <Typography variant="body" className="text-gray-700 leading-relaxed">
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
                    
                    <Button variant="ghost">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                  </div>
                </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cultural Background */}
              <Card className="p-6">
                <Typography variant="h3" className="mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-earth-600" />
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
                    <Typography variant="small" className="text-gray-700 mb-2 font-medium">
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
                        {storytellingStyleIcons[style] || <User className="w-4 h-4" />}
                        <Typography variant="small">{style}</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="body" className="text-gray-500">
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
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <Typography variant="h3" className="text-gray-600 mb-2">
                  No Published Stories Yet
                </Typography>
                <Typography variant="body" className="text-gray-500">
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
                  <Badge className={experienceLevel.color}>
                    {experienceLevel.label}
                  </Badge>
                  {storyteller.years_of_experience && (
                    <Typography variant="body" className="text-gray-600">
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
                  
                  <Typography variant="body" className="text-gray-600">
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
                  
                  <Typography variant="body" className="text-gray-600">
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
                    <Typography variant="small" className="text-gray-700 mb-2 font-medium">
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
                    <Typography variant="small" className="text-gray-700 mb-1 font-medium">
                      Timezone
                    </Typography>
                    <Typography variant="body" className="text-gray-600">
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
                  
                  <Typography variant="body" className="text-gray-600 mb-4">
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
                
                <Typography variant="body" className="text-gray-600">
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
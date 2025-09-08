'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Story } from '@/types/database'
import { cn } from '@/lib/utils'
import { 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  User, 
  MapPin, 
  Shield,
  Crown,
  CheckCircle,
  Calendar,
  BookOpen,
  ArrowLeft,
  Flag,
  Download,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface StoryWithRelations extends Story {
  storyteller?: {
    id: string
    display_name: string
    bio?: string
    cultural_background?: string
    elder_status: boolean
    specialties?: string[]
    years_of_experience?: number
    storytelling_style?: string[]
    profile?: {
      avatar_url?: string
      cultural_affiliations?: string[]
      pronouns?: string
    }
  }
  author?: {
    id: string
    display_name: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    bio?: string
    cultural_affiliations?: string[]
  }
}

const culturalColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

const storyTypeColors = {
  traditional: 'bg-purple-100 text-purple-800',
  personal: 'bg-blue-100 text-blue-800',
  historical: 'bg-indigo-100 text-indigo-800',
  educational: 'bg-emerald-100 text-emerald-800',
  healing: 'bg-rose-100 text-rose-800'
}

export default function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [story, setStory] = useState<StoryWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [storyId, setStoryId] = useState<string>('')

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setStoryId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!storyId) return
    
    const fetchStory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/stories/${storyId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
            return
          }
          throw new Error('Failed to fetch story')
        }

        const data: StoryWithRelations = await response.json()
        setStory(data)
      } catch (error) {
        console.error('Error fetching story:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [storyId])

  const handleLike = async () => {
    if (!story) return
    
    try {
      // In a real app, you'd send this to an API endpoint
      setLiked(!liked)
      // Update local state optimistically
      setStory({
        ...story,
        likes_count: liked ? story.likes_count - 1 : story.likes_count + 1
      })
    } catch (error) {
      console.error('Error liking story:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title,
          text: `Check out this story: ${story?.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share canceled or failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'ST'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!story) {
    return notFound()
  }

  const isPublished = story.status === 'published'
  const isFeatured = story.featured
  const hasElderApproval = story.elder_approval
  const isCulturallyReviewed = story.cultural_review_status === 'approved'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-earth-600 hover:text-earth-700">
            <Link href="/stories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stories
            </Link>
          </Button>
        </div>

        {/* Story Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isFeatured && (
                  <Badge className="bg-amber-100 text-amber-800">
                    Featured Story
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(storyTypeColors[story.story_type])}
                >
                  {story.story_type.charAt(0).toUpperCase() + story.story_type.slice(1)}
                </Badge>
                <Badge 
                  className={cn('border', culturalColors[story.cultural_sensitivity_level])}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {story.cultural_sensitivity_level} sensitivity
                </Badge>
              </div>
              
              <Typography variant="h1" className="mb-4">
                {story.title}
              </Typography>

              {/* Metadata */}
              <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                {story.reading_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{story.reading_time_minutes} min read</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{story.audience}</span>
                </div>
                
                {story.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{story.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(story.created_at)}</span>
                </div>
              </div>

              {/* Cultural Approval Indicators */}
              {(hasElderApproval || isCulturallyReviewed) && (
                <div className="flex gap-4 mb-6">
                  {hasElderApproval && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Elder Approved</span>
                    </div>
                  )}
                  {isCulturallyReviewed && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Culturally Reviewed</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-6">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                <span>{story.likes_count}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{story.shares_count}</span>
              </Button>
              
              <Button variant="outline" size="sm">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{story.views_count} views</span>
            </div>
            <span>•</span>
            <span>Published {formatDate(story.publication_date || story.created_at)}</span>
          </div>
        </div>

        {/* Story Content */}
        <Card className="p-8 mb-8">
          <div className="prose prose-earth max-w-none">
            <Typography variant="body" className="leading-relaxed whitespace-pre-wrap">
              {story.content}
            </Typography>
          </div>
        </Card>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <Card className="p-6 mb-8">
            <Typography variant="h4" className="mb-4">
              Story Themes
            </Typography>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Storyteller/Author Info */}
        <Card className="p-6 mb-8">
          <Typography variant="h4" className="mb-4">
            {story.storyteller ? 'About the Storyteller' : 'About the Author'}
          </Typography>
          
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={story.storyteller?.profile?.avatar_url || story.author?.avatar_url} 
                alt={story.storyteller?.display_name || story.author?.display_name}
              />
              <AvatarFallback className="bg-earth-200 text-earth-700 text-lg">
                {getInitials(story.storyteller?.display_name || story.author?.display_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h5">
                  {story.storyteller?.display_name || `${story.author?.first_name} ${story.author?.last_name}`.trim() || story.author?.display_name}
                </Typography>
                {story.storyteller?.elder_status && (
                  <Crown className="w-5 h-5 text-amber-500" />
                )}
                {story.storyteller?.profile?.pronouns && (
                  <Typography variant="small" className="text-gray-500">
                    ({story.storyteller.profile.pronouns})
                  </Typography>
                )}
              </div>
              
              {story.storyteller?.cultural_background && (
                <Typography variant="body" className="text-gray-600 mb-2">
                  {story.storyteller.cultural_background}
                </Typography>
              )}
              
              {story.storyteller?.bio && (
                <Typography variant="body" className="text-gray-700 mb-4">
                  {story.storyteller.bio}
                </Typography>
              )}
              
              {story.storyteller?.specialties && story.storyteller.specialties.length > 0 && (
                <div className="mb-4">
                  <Typography variant="small" className="font-medium text-gray-700 mb-2">
                    Specialties:
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {story.storyteller.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {story.storyteller && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/storytellers/${story.storyteller.id}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Cultural Context */}
        {story.cultural_context && (
          <Card className="p-6 mb-8 bg-earth-50 border-earth-200">
            <Typography variant="h4" className="mb-4 text-earth-800">
              Cultural Context
            </Typography>
            <div className="prose prose-earth text-earth-700">
              {/* This would need proper JSON parsing if cultural_context is structured */}
              <Typography variant="body">
                {typeof story.cultural_context === 'string' 
                  ? story.cultural_context 
                  : JSON.stringify(story.cultural_context, null, 2)}
              </Typography>
            </div>
          </Card>
        )}

        {/* Actions Footer */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4">
              <Button
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                {liked ? 'Liked' : 'Like Story'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
            
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Flag className="w-4 h-4 mr-2" />
              Report
            </Button>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
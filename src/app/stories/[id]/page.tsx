'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Clock,
  Eye,
  Heart,
  Share2,
  MapPin,
  Crown,
  CheckCircle,
  Calendar,
  ArrowLeft,
  Bookmark,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  created_at: string
  updated_at: string
  status: 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
  visibility: 'public' | 'community' | 'organisation' | 'private'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  story_type?: string
  themes?: string[]
  tags?: string[]
  location?: string
  reading_time_minutes?: number
  storyteller_id?: string
  author_id?: string
  featured?: boolean
  elder_approval?: boolean
  views_count?: number
  likes_count?: number
  shares_count?: number
  publication_date?: string
  storyteller?: {
    id: string
    display_name: string
    bio?: string
    cultural_background?: string
    is_elder?: boolean
    profile_image_url?: string
  }
  author?: {
    id: string
    display_name: string
    profile_image_url?: string
    cultural_background?: string
  }
}

const culturalSensitivityColors = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-purple-100 text-purple-800 border-purple-200'
}

export default function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
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

        const data: Story = await response.json()
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
    setLiked(!liked)
    setStory({
      ...story,
      likes_count: liked ? (story.likes_count || 0) - 1 : (story.likes_count || 0) + 1
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title,
          text: story?.excerpt || `Read "${story?.title}" on Empathy Ledger`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'ST'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format content with proper paragraphs
  const formatContent = (content: string) => {
    // Split by double newlines or single newlines
    const paragraphs = content.split(/\n\n+|\n/).filter(p => p.trim())
    return paragraphs
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!story) {
    return notFound()
  }

  const narrator = story.storyteller || story.author
  const isElder = story.storyteller?.is_elder || false

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Back Button */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/stories"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Link>
        </div>
      </div>

      {/* Story Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Title and Badges */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {story.featured && (
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
                Featured Story
              </Badge>
            )}
            {story.story_type && (
              <Badge variant="secondary" className="capitalize">
                {story.story_type}
              </Badge>
            )}
            {story.cultural_sensitivity_level && (
              <Badge
                variant="outline"
                className={cn('capitalize', culturalSensitivityColors[story.cultural_sensitivity_level])}
              >
                {story.cultural_sensitivity_level} sensitivity
              </Badge>
            )}
            {story.elder_approval && (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Elder Approved
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {story.title}
          </h1>

          {story.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {story.excerpt}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {story.reading_time_minutes && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{story.reading_time_minutes} min read</span>
              </div>
            )}

            {story.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{story.location}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(story.publication_date || story.created_at)}</span>
            </div>

            {story.views_count !== undefined && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{story.views_count.toLocaleString()} views</span>
              </div>
            )}
          </div>
        </header>

        {/* Storyteller Card */}
        {narrator && (
          <div className="mb-12 p-6 rounded-xl border border-border bg-card/50">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                <AvatarImage
                  src={narrator.profile_image_url}
                  alt={narrator.display_name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                  {getInitials(narrator.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {narrator.display_name}
                  </h3>
                  {isElder && (
                    <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                </div>

                {narrator.cultural_background && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {narrator.cultural_background}
                  </p>
                )}

                {story.storyteller?.bio && (
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {story.storyteller.bio}
                  </p>
                )}

                {story.storyteller && (
                  <Link
                    href={`/storytellers/${story.storyteller.id}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                  >
                    View all stories by {narrator.display_name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Story Content */}
        <div className="prose prose-lg prose-stone dark:prose-invert max-w-none mb-12">
          {formatContent(story.content).map((paragraph, index) => (
            <p key={index} className="mb-6 leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags/Themes */}
        {((story.tags && story.tags.length > 0) || (story.themes && story.themes.length > 0)) && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-foreground mb-3">Story Themes</h3>
            <div className="flex flex-wrap gap-2">
              {(story.tags || story.themes || []).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Bar */}
        <div className="flex items-center justify-between py-6 border-y border-border">
          <div className="flex items-center gap-3">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              <span>{story.likes_count || 0}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          <Button
            variant={saved ? "default" : "outline"}
            size="sm"
            onClick={() => setSaved(!saved)}
            className="flex items-center gap-2"
          >
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </Button>
        </div>

        {/* About the Storyteller - Expanded */}
        {story.storyteller && (
          <div className="mt-12 p-8 rounded-xl bg-muted/30 border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              About the Storyteller
            </h3>

            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={story.storyteller.profile_image_url}
                  alt={story.storyteller.display_name}
                />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-semibold">
                  {getInitials(story.storyteller.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-xl font-semibold text-foreground">
                    {story.storyteller.display_name}
                  </h4>
                  {isElder && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Elder</span>
                    </div>
                  )}
                </div>

                {story.storyteller.cultural_background && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{story.storyteller.cultural_background}</span>
                  </div>
                )}

                {story.storyteller.bio && (
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    {story.storyteller.bio}
                  </p>
                )}

                <Link href={`/storytellers/${story.storyteller.id}`}>
                  <Button variant="default">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </article>

      <Footer />
    </div>
  )
}

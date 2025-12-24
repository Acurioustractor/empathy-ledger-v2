'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, MapPin, Crown, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryViewProps {
  story: {
    id: string
    title: string
    content: string
    status: string
    featured: boolean
    created_at: string
    updated_at?: string
    cultural_sensitivity?: 'low' | 'medium' | 'high'
    story_type?: string
    storyteller?: {
      id: string
      display_name: string
      profile_image_url?: string
      cultural_background?: string
      pronouns?: string
      is_elder?: boolean
    }
    project?: {
      id: string
      name: string
      description?: string
    }
  }
  className?: string
}

export default function StoryView({ story, className }: StoryViewProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'ST'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const culturalColors = {
    low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    medium:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  }

  return (
    <article className={cn('container mx-auto px-4 py-12 max-w-4xl', className)}>
      {/* Header */}
      <header className="mb-8 space-y-6">
        {/* Storyteller Info */}
        {story.storyteller && (
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-background shadow-md">
              <AvatarImage
                src={story.storyteller.profile_image_url}
                alt={story.storyteller.display_name}
              />
              <AvatarFallback className="text-lg">
                {getInitials(story.storyteller.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {story.storyteller.display_name}
                </h2>
                {story.storyteller.is_elder && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Elder
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                {story.storyteller.cultural_background && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{story.storyteller.cultural_background}</span>
                  </div>
                )}
                {story.storyteller.pronouns && (
                  <span className="text-xs">({story.storyteller.pronouns})</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 leading-tight">
            {story.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formatDate(story.created_at)}</span>
            </div>

            {story.project && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">·</span>
                <span>Project: {story.project.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {story.featured && (
            <Badge variant="default" className="bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}

          {story.story_type && (
            <Badge variant="secondary" className="capitalize">
              {story.story_type}
            </Badge>
          )}

          {story.cultural_sensitivity && story.cultural_sensitivity !== 'low' && (
            <Badge
              variant="outline"
              className={culturalColors[story.cultural_sensitivity]}
            >
              <Shield className="w-3 h-3 mr-1" />
              Cultural Sensitivity: {story.cultural_sensitivity}
            </Badge>
          )}
        </div>
      </header>

      {/* Story Content */}
      <Card className="p-8 bg-card shadow-sm">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-foreground leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground text-center">
          <p>
            This story is shared with respect for the storyteller's cultural
            background and experiences.
          </p>
          <p className="mt-2">
            The storyteller maintains full control and can withdraw this story
            at any time.
          </p>
        </div>
      </footer>
    </article>
  )
}

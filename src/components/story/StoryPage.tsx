'use client'

import React, { useState, useEffect } from 'react'
import { StoryHeader } from './StoryHeader'
import { CulturalContextPanel } from './CulturalContextPanel'
import { StorytellerSidebar } from './StorytellerSidebar'
import { StoryGallery } from './StoryGallery'
import { SacredContentWarning } from './SacredContentWarning'
import { TriggerWarning } from './TriggerWarning'
import { ShareButton } from './ShareButton'
import { RelatedStories } from './RelatedStories'
import { Loader2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryPageProps {
  storyId: string
  className?: string
}

export function StoryPage({ storyId, className }: StoryPageProps) {
  const [story, setStory] = useState<any>(null)
  const [relatedStories, setRelatedStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sacredAcknowledged, setSacredAcknowledged] = useState(false)

  useEffect(() => {
    async function fetchStory() {
      try {
        setLoading(true)

        // Fetch story
        const storyResponse = await fetch(`/api/stories/${storyId}/public`)
        if (!storyResponse.ok) throw new Error('Story not found')

        const storyData = await storyResponse.json()
        setStory(storyData.story)

        // Fetch related stories
        const relatedResponse = await fetch(`/api/stories/${storyId}/related`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          setRelatedStories(relatedData.stories || [])
        }

        // Track view
        await fetch(`/api/stories/${storyId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (storyId) {
      fetchStory()
    }
  }, [storyId])

  // Show sacred content warning if needed
  const hasSacredContent = story?.cultural_sensitivity_level === 'sacred'
  const showWarning = hasSacredContent && !sacredAcknowledged

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#D97757] animate-spin mx-auto" />
          <p className="text-lg text-[#2C2C2C]/60">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-[#2C2C2C]/20 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
            Story Not Found
          </h2>
          <p className="text-[#2C2C2C]/60">
            {error || 'This story may have been removed or is not publicly available.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Sacred Content Warning Modal */}
      {showWarning && (
        <SacredContentWarning
          protocols={story.cultural_protocols || [
            'This content contains sacred cultural knowledge',
            'Please engage with respect and reverence',
            'Do not share without explicit permission',
            'Honor the traditional knowledge shared here'
          ]}
          onAcknowledge={() => setSacredAcknowledged(true)}
        />
      )}

      {/* Main Content */}
      <div className={cn("min-h-screen bg-[#F8F6F1]", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_320px] gap-12">
              {/* Main Column */}
              <main className="space-y-8">
                {/* Header */}
                <StoryHeader
                  title={story.title}
                  storyteller={{
                    id: story.storyteller?.id,
                    display_name: story.storyteller?.display_name || 'Anonymous',
                    cultural_background: story.storyteller?.cultural_background,
                    avatar_url: story.storyteller?.avatar_url
                  }}
                  publishedDate={story.published_at || story.created_at}
                  readingTime={story.reading_time_minutes}
                  culturalTags={story.cultural_tags}
                  location={story.location}
                  storyType={story.story_type}
                />

                {/* Trigger Warning */}
                {story.trigger_warnings && story.trigger_warnings.length > 0 && (
                  <TriggerWarning warnings={story.trigger_warnings} />
                )}

                {/* Featured Image */}
                {story.featured_image_url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
                    <img
                      src={story.featured_image_url}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Story Content */}
                <div className="prose prose-lg max-w-none">
                  <div
                    className="text-[#2C2C2C] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: story.content }}
                  />
                </div>

                {/* Media Gallery */}
                {story.media && story.media.length > 0 && (
                  <StoryGallery media={story.media} />
                )}

                {/* Cultural Context */}
                {(story.cultural_background || story.cultural_context || story.cultural_protocols) && (
                  <CulturalContextPanel
                    culturalBackground={story.cultural_background}
                    territory={story.territory}
                    historicalContext={story.historical_context}
                    significance={story.cultural_significance}
                    protocols={story.cultural_protocols}
                  />
                )}

                {/* Share Button */}
                <div className="flex justify-between items-center pt-8 border-t border-[#2C2C2C]/10">
                  <div className="text-sm text-[#2C2C2C]/60">
                    {story.views_count || 0} views
                  </div>
                  <ShareButton
                    storyId={story.id}
                    storyTitle={story.title}
                    allowSharing={story.allow_sharing !== false}
                  />
                </div>

                {/* Related Stories */}
                {relatedStories.length > 0 && (
                  <div className="pt-12 border-t border-[#2C2C2C]/10">
                    <RelatedStories stories={relatedStories} />
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="space-y-6">
                {story.storyteller && (
                  <StorytellerSidebar
                    storyteller={{
                      id: story.storyteller.id,
                      display_name: story.storyteller.display_name,
                      cultural_background: story.storyteller.cultural_background,
                      cultural_affiliations: story.storyteller.cultural_affiliations,
                      bio: story.storyteller.bio,
                      avatar_url: story.storyteller.avatar_url,
                      story_count: story.storyteller.story_count || 1,
                      elder_status: story.storyteller.elder_status
                    }}
                  />
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

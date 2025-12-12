'use client'

import { User, Calendar, Tag, Shield, ExternalLink } from 'lucide-react'
import { EmpathyLedgerBadge } from './EmpathyLedgerBadge'
import type { ConsentedStory, CulturalRestriction } from '@/lib/services/consent-proxy.service'

interface StoryEmbedCardProps {
  story: ConsentedStory
  theme?: 'light' | 'dark' | 'earth'
  compact?: boolean
  showMedia?: boolean
}

/**
 * Embeddable story card that respects consent settings.
 * Designed to be displayed in iframes on external sites.
 */
export function StoryEmbedCard({
  story,
  theme = 'light',
  compact = false,
  showMedia = true
}: StoryEmbedCardProps) {
  const themeClasses = {
    light: 'bg-white text-stone-900',
    dark: 'bg-stone-900 text-stone-100',
    earth: 'bg-amber-50 text-stone-900'
  }

  const accentClasses = {
    light: 'text-amber-700',
    dark: 'text-amber-400',
    earth: 'text-amber-800'
  }

  const mutedClasses = {
    light: 'text-stone-500',
    dark: 'text-stone-400',
    earth: 'text-stone-600'
  }

  const borderClasses = {
    light: 'border-stone-200',
    dark: 'border-stone-700',
    earth: 'border-amber-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <article
      className={`h-full flex flex-col ${themeClasses[theme]} font-sans`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <header className={`p-4 border-b ${borderClasses[theme]}`}>
        <h1 className="font-semibold text-lg leading-tight mb-2">
          {story.title}
        </h1>

        <div className={`flex flex-wrap items-center gap-3 text-sm ${mutedClasses[theme]}`}>
          {/* Author */}
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {story.storytellerName}
          </span>

          {/* Date */}
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(story.storyDate)}
          </span>
        </div>

        {/* Cultural restrictions warning */}
        {story.culturalRestrictions.length > 0 && (
          <div className={`mt-3 p-2 rounded-md ${theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-50'} border ${theme === 'dark' ? 'border-amber-800' : 'border-amber-200'}`}>
            <div className="flex items-start gap-2">
              <Shield className={`w-4 h-4 mt-0.5 ${accentClasses[theme]}`} />
              <div className="text-xs">
                <p className={`font-medium ${accentClasses[theme]}`}>Cultural Notice</p>
                {story.culturalRestrictions.map((restriction, idx) => (
                  <p key={idx} className={mutedClasses[theme]}>
                    {restriction.description}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <div className={`flex-1 p-4 overflow-auto ${compact ? 'text-sm' : ''}`}>
        {/* Media (if allowed and available) */}
        {showMedia && story.media && story.media.length > 0 && (
          <div className="mb-4">
            <img
              src={story.media[0]}
              alt=""
              className="w-full h-32 object-cover rounded-md"
              loading="lazy"
            />
          </div>
        )}

        {/* Story content */}
        {story.content ? (
          <div
            className="prose prose-sm max-w-none prose-stone"
            style={{ lineHeight: 1.6 }}
          >
            {story.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className={`italic ${mutedClasses[theme]}`}>
            Full story available on Empathy Ledger
          </p>
        )}

        {/* Themes/Tags */}
        {story.themes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {story.themes.slice(0, 5).map((theme, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                  theme === 'dark'
                    ? 'bg-stone-800 text-stone-300'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Tag className="w-3 h-3" />
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`p-3 border-t ${borderClasses[theme]} flex items-center justify-between`}>
        <EmpathyLedgerBadge variant={theme === 'dark' ? 'dark' : 'default'} />

        <a
          href={`https://empathyledger.com/stories/${story.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-xs ${accentClasses[theme]} hover:underline`}
        >
          Read full story
          <ExternalLink className="w-3 h-3" />
        </a>
      </footer>
    </article>
  )
}

export default StoryEmbedCard

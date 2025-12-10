'use client'

/**
 * Story Card Components for Partner Websites
 *
 * These components are designed to be used by partner organizations
 * (like act.place) to display stories from Empathy Ledger on their
 * own websites with consistent, customizable styling.
 */

import { ExternalLink, MapPin, User, Calendar, Eye } from 'lucide-react'

// ============================================
// TYPES
// ============================================

export interface Story {
  id: string
  title: string
  summary: string | null
  content?: string | null
  featured_image: string | null
  themes: string[]
  created_at: string
  location?: string
  storyteller: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
  attribution: {
    text: string
    link: string
    badge_url: string
  }
  tracking_pixel_url: string
  share_level: 'full' | 'summary' | 'title_only'
}

export type CardTheme = 'light' | 'dark' | 'sage' | 'earth' | 'custom'
export type CardVariant = 'standard' | 'compact' | 'featured' | 'minimal'

interface CardProps {
  story: Story
  variant?: CardVariant
  theme?: CardTheme
  showImage?: boolean
  showStoryteller?: boolean
  showThemes?: boolean
  showDate?: boolean
  showLocation?: boolean
  className?: string
  onClick?: () => void
}

// ============================================
// THEME STYLES
// ============================================

const themeStyles: Record<CardTheme, {
  card: string
  title: string
  text: string
  muted: string
  badge: string
  border: string
  gradient: string
}> = {
  light: {
    card: 'bg-white',
    title: 'text-stone-900',
    text: 'text-stone-700',
    muted: 'text-stone-500',
    badge: 'bg-stone-100 text-stone-700',
    border: 'border-stone-200',
    gradient: 'from-stone-50 to-stone-100'
  },
  dark: {
    card: 'bg-stone-900',
    title: 'text-white',
    text: 'text-stone-300',
    muted: 'text-stone-400',
    badge: 'bg-stone-800 text-stone-300',
    border: 'border-stone-700',
    gradient: 'from-stone-800 to-stone-900'
  },
  sage: {
    card: 'bg-sage-50',
    title: 'text-sage-900',
    text: 'text-sage-700',
    muted: 'text-sage-600',
    badge: 'bg-sage-100 text-sage-700',
    border: 'border-sage-200',
    gradient: 'from-sage-100 to-sage-200'
  },
  earth: {
    card: 'bg-earth-50',
    title: 'text-earth-900',
    text: 'text-earth-700',
    muted: 'text-earth-600',
    badge: 'bg-earth-100 text-earth-700',
    border: 'border-earth-200',
    gradient: 'from-earth-100 to-earth-200'
  },
  custom: {
    card: '',
    title: '',
    text: '',
    muted: '',
    badge: '',
    border: '',
    gradient: ''
  }
}

// ============================================
// STANDARD CARD
// ============================================

export function StoryCardStandard({
  story,
  theme = 'light',
  showImage = true,
  showStoryteller = true,
  showThemes = true,
  showDate = false,
  showLocation = true,
  className = '',
  onClick
}: CardProps) {
  const styles = themeStyles[theme]
  const storyUrl = story.attribution.link

  return (
    <article
      className={`
        rounded-xl overflow-hidden border transition-all duration-200
        hover:shadow-lg hover:-translate-y-1
        ${styles.card} ${styles.border}
        ${className}
      `}
    >
      {/* Image */}
      {showImage && (
        <a href={storyUrl} target="_blank" rel="noopener noreferrer">
          <div className="aspect-video relative overflow-hidden">
            {story.featured_image ? (
              <img
                src={story.featured_image}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${styles.gradient}`} />
            )}
            {showLocation && story.location && (
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <MapPin className="h-3 w-3 text-stone-500" />
                <span className="text-stone-700">{story.location}</span>
              </div>
            )}
          </div>
        </a>
      )}

      <div className="p-5 space-y-4">
        {/* Themes */}
        {showThemes && story.themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.themes.slice(0, 3).map((theme) => (
              <span
                key={theme}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}
              >
                {theme}
              </span>
            ))}
            {story.themes.length > 3 && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                +{story.themes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <a href={storyUrl} target="_blank" rel="noopener noreferrer">
          <h3 className={`text-lg font-semibold leading-tight hover:underline ${styles.title}`}>
            {story.title}
          </h3>
        </a>

        {/* Summary */}
        {story.summary && story.share_level !== 'title_only' && (
          <p className={`text-sm leading-relaxed line-clamp-3 ${styles.text}`}>
            {story.summary}
          </p>
        )}

        {/* Meta */}
        <div className={`flex items-center justify-between pt-3 border-t ${styles.border}`}>
          {/* Storyteller */}
          {showStoryteller && story.storyteller && (
            <div className="flex items-center gap-2">
              {story.storyteller.avatar_url ? (
                <img
                  src={story.storyteller.avatar_url}
                  alt={story.storyteller.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${styles.badge}`}>
                  {story.storyteller.display_name[0]}
                </div>
              )}
              <div>
                <span className={`text-sm font-medium ${styles.title}`}>
                  {story.storyteller.display_name}
                </span>
                {showDate && (
                  <p className={`text-xs ${styles.muted}`}>
                    {new Date(story.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Attribution */}
          <a
            href={storyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs flex items-center gap-1 hover:underline ${styles.muted}`}
          >
            via Empathy Ledger
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Tracking Pixel */}
      <img
        src={story.tracking_pixel_url}
        alt=""
        width="1"
        height="1"
        className="absolute opacity-0"
      />
    </article>
  )
}

// ============================================
// COMPACT CARD
// ============================================

export function StoryCardCompact({
  story,
  theme = 'light',
  showImage = true,
  showStoryteller = true,
  showThemes = true,
  className = '',
  onClick
}: CardProps) {
  const styles = themeStyles[theme]
  const storyUrl = story.attribution.link

  return (
    <article
      className={`
        flex gap-4 p-4 rounded-lg border transition-colors
        hover:shadow-md
        ${styles.card} ${styles.border}
        ${className}
      `}
    >
      {/* Thumbnail */}
      {showImage && (
        <a href={storyUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            {story.featured_image ? (
              <img
                src={story.featured_image}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${styles.gradient}`} />
            )}
          </div>
        </a>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <a href={storyUrl} target="_blank" rel="noopener noreferrer">
            <h3 className={`font-semibold line-clamp-1 hover:underline ${styles.title}`}>
              {story.title}
            </h3>
          </a>
          {story.summary && story.share_level !== 'title_only' && (
            <p className={`text-sm line-clamp-2 mt-1 ${styles.text}`}>
              {story.summary}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {showStoryteller && story.storyteller && (
            <span className={`text-sm ${styles.muted}`}>
              by {story.storyteller.display_name}
            </span>
          )}
          {showThemes && story.themes.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
              {story.themes[0]}
            </span>
          )}
        </div>
      </div>

      {/* Tracking Pixel */}
      <img
        src={story.tracking_pixel_url}
        alt=""
        width="1"
        height="1"
        className="absolute opacity-0"
      />
    </article>
  )
}

// ============================================
// FEATURED CARD (Hero Style)
// ============================================

export function StoryCardFeatured({
  story,
  theme = 'light',
  showStoryteller = true,
  showThemes = true,
  className = '',
  onClick
}: CardProps) {
  const styles = themeStyles[theme]
  const storyUrl = story.attribution.link

  return (
    <article
      className={`
        relative rounded-2xl overflow-hidden
        ${className}
      `}
    >
      {/* Background Image */}
      <a href={storyUrl} target="_blank" rel="noopener noreferrer">
        <div className="aspect-[21/9] relative">
          {story.featured_image ? (
            <img
              src={story.featured_image}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${styles.gradient}`} />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      </a>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium mb-4">
          <Eye className="h-3.5 w-3.5" />
          FEATURED STORY
        </div>

        {/* Title */}
        <a href={storyUrl} target="_blank" rel="noopener noreferrer">
          <h2 className="text-3xl font-bold leading-tight mb-3 hover:underline">
            {story.title}
          </h2>
        </a>

        {/* Summary */}
        {story.summary && story.share_level !== 'title_only' && (
          <p className="text-lg text-white/90 line-clamp-2 mb-4 max-w-3xl">
            {story.summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 flex-wrap">
          {showStoryteller && story.storyteller && (
            <div className="flex items-center gap-2">
              {story.storyteller.avatar_url ? (
                <img
                  src={story.storyteller.avatar_url}
                  alt={story.storyteller.display_name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                  {story.storyteller.display_name[0]}
                </div>
              )}
              <span className="font-medium">{story.storyteller.display_name}</span>
            </div>
          )}
          {showThemes && story.themes.length > 0 && (
            <div className="flex gap-2">
              {story.themes.slice(0, 3).map((theme) => (
                <span
                  key={theme}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
          <a
            href={storyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 hover:text-white flex items-center gap-1 ml-auto"
          >
            via Empathy Ledger
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Tracking Pixel */}
      <img
        src={story.tracking_pixel_url}
        alt=""
        width="1"
        height="1"
        className="absolute opacity-0"
      />
    </article>
  )
}

// ============================================
// MINIMAL CARD (Text Only)
// ============================================

export function StoryCardMinimal({
  story,
  theme = 'light',
  showStoryteller = true,
  showThemes = true,
  showDate = true,
  className = '',
  onClick
}: CardProps) {
  const styles = themeStyles[theme]
  const storyUrl = story.attribution.link

  return (
    <article className={`py-4 border-b ${styles.border} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Themes */}
          {showThemes && story.themes.length > 0 && (
            <div className="flex gap-2 mb-2">
              {story.themes.slice(0, 2).map((theme) => (
                <span
                  key={theme}
                  className={`text-xs font-medium ${styles.muted}`}
                >
                  #{theme}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <a href={storyUrl} target="_blank" rel="noopener noreferrer">
            <h3 className={`font-semibold hover:underline ${styles.title}`}>
              {story.title}
            </h3>
          </a>

          {/* Meta */}
          <div className={`flex items-center gap-3 mt-2 text-sm ${styles.muted}`}>
            {showStoryteller && story.storyteller && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {story.storyteller.display_name}
              </span>
            )}
            {showDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(story.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>

        <a
          href={storyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sage-600 hover:text-sage-700`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Tracking Pixel */}
      <img
        src={story.tracking_pixel_url}
        alt=""
        width="1"
        height="1"
        className="absolute opacity-0"
      />
    </article>
  )
}

// ============================================
// STORY CARD (Auto-selects variant)
// ============================================

export function StoryCard(props: CardProps) {
  const { variant = 'standard', ...rest } = props

  switch (variant) {
    case 'compact':
      return <StoryCardCompact {...rest} />
    case 'featured':
      return <StoryCardFeatured {...rest} />
    case 'minimal':
      return <StoryCardMinimal {...rest} />
    default:
      return <StoryCardStandard {...rest} />
  }
}

export default StoryCard

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Story } from '@/lib/empathy-ledger'
import { TrackingPixel } from './TrackingPixel'

interface StoryCardProps {
  story: Story
  variant?: 'default' | 'compact' | 'featured'
}

export function StoryCard({ story, variant = 'default' }: StoryCardProps) {
  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  return (
    <Link
      href={`/stories/${story.id}`}
      className={`
        group block bg-white rounded-2xl overflow-hidden shadow-sm
        hover:shadow-lg transition-all duration-300
        border border-stone-100 hover:border-stone-200
        ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}
      `}
    >
      {/* Image */}
      {story.featured_image && (
        <div className={`
          relative overflow-hidden bg-gradient-to-br from-sage-100 to-earth-100
          ${isFeatured ? 'aspect-[16/9]' : isCompact ? 'aspect-[4/3]' : 'aspect-video'}
        `}>
          <Image
            src={story.featured_image}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={isFeatured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Placeholder if no image */}
      {!story.featured_image && (
        <div className={`
          bg-gradient-to-br from-sage-200 to-earth-200 flex items-center justify-center
          ${isFeatured ? 'aspect-[16/9]' : isCompact ? 'aspect-[4/3]' : 'aspect-video'}
        `}>
          <span className="text-4xl opacity-50">📖</span>
        </div>
      )}

      {/* Content */}
      <div className={`p-${isCompact ? '3' : '5'} space-y-3`}>
        {/* Themes */}
        {story.themes && story.themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.themes.slice(0, 2).map((theme) => (
              <span
                key={theme}
                className="px-2 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className={`
          font-semibold text-stone-900 group-hover:text-sage-700 transition-colors
          ${isFeatured ? 'text-2xl' : isCompact ? 'text-base' : 'text-lg'}
          line-clamp-2
        `}>
          {story.title}
        </h3>

        {/* Summary */}
        {story.summary && !isCompact && (
          <p className={`
            text-stone-600 line-clamp-${isFeatured ? '3' : '2'}
            ${isFeatured ? 'text-base' : 'text-sm'}
          `}>
            {story.summary}
          </p>
        )}

        {/* Storyteller */}
        {story.storyteller && (
          <div className="flex items-center gap-3 pt-2">
            {story.storyteller.avatar_url ? (
              <Image
                src={story.storyteller.avatar_url}
                alt={story.storyteller.display_name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center">
                <span className="text-sm font-medium text-earth-700">
                  {story.storyteller.display_name[0]}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-stone-700">
                {story.storyteller.display_name}
              </p>
              <p className="text-xs text-stone-400">
                {new Date(story.created_at).toLocaleDateString('en-AU', {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tracking pixel - invisible */}
      <TrackingPixel storyId={story.id} />
    </Link>
  )
}

export default StoryCard

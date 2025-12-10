import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { fetchStory } from '@/lib/empathy-ledger'
import { DetailPageTracking } from '@/components/TrackingPixel'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params
  const story = await fetchStory(id)

  if (!story) {
    notFound()
  }

  return (
    <>
      {/* Engagement tracking */}
      <DetailPageTracking storyId={story.id} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sage-600 hover:text-sage-700 mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Stories
        </Link>

        {/* Featured image */}
        {story.featured_image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <Image
              src={story.featured_image}
              alt={story.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Themes */}
        {story.themes && story.themes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.themes.map((theme) => (
              <Link
                key={theme}
                href={`/?theme=${encodeURIComponent(theme)}`}
                className="px-3 py-1 text-sm font-medium bg-sage-50 text-sage-700 rounded-full hover:bg-sage-100 transition-colors"
              >
                {theme}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
          {story.title}
        </h1>

        {/* Storyteller info */}
        {story.storyteller && (
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-stone-200">
            {story.storyteller.avatar_url ? (
              <Image
                src={story.storyteller.avatar_url}
                alt={story.storyteller.display_name}
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-earth-100 flex items-center justify-center">
                <span className="text-xl font-medium text-earth-700">
                  {story.storyteller.display_name[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-stone-900">
                {story.storyteller.display_name}
              </p>
              <p className="text-sm text-stone-500">
                {new Date(story.created_at).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {story.content ? (
          <div
            className="prose prose-lg prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        ) : story.summary ? (
          <div className="prose prose-lg prose-stone max-w-none">
            <p>{story.summary}</p>
          </div>
        ) : (
          <p className="text-stone-500 italic">
            Full story content is not available.
          </p>
        )}

        {/* Attribution footer */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="bg-stone-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-sage-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-900 mb-1">
                  This story is managed by its storyteller
                </p>
                <p className="text-sm text-stone-600 mb-3">
                  Shared with consent via Empathy Ledger. The storyteller controls
                  where this story appears and can withdraw consent at any time.
                </p>
                <a
                  href={story.attribution.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sage-600 hover:text-sage-700 text-sm font-medium"
                >
                  View on Empathy Ledger
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-8 flex items-center gap-4">
          <span className="text-sm text-stone-500">Share this story:</span>
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(story.attribution.link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              aria-label="Share on Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(story.attribution.link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(story.attribution.link)}&title=${encodeURIComponent(story.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    </>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const story = await fetchStory(id)

  if (!story) {
    return { title: 'Story Not Found' }
  }

  return {
    title: `${story.title} | act.place`,
    description: story.summary || 'A story shared on act.place',
    openGraph: {
      title: story.title,
      description: story.summary || undefined,
      images: story.featured_image ? [story.featured_image] : undefined,
    },
  }
}

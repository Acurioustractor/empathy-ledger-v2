import { Metadata } from 'next'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

/**
 * Layout for story detail pages.
 * Adds oEmbed auto-discovery meta tags for embedding on external platforms.
 */
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createSupabaseServiceClient()

  // Fetch basic story info for metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: story } = await (supabase as any)
    .from('stories')
    .select(`
      id,
      title,
      excerpt,
      content,
      visibility,
      status,
      storyteller_id,
      profiles:storyteller_id (
        display_name
      )
    `)
    .eq('id', id)
    .single()

  if (!story) {
    return {
      title: 'Story Not Found | Empathy Ledger'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
  const storyUrl = `${baseUrl}/stories/${id}`
  const oembedUrl = `${baseUrl}/api/oembed?url=${encodeURIComponent(storyUrl)}`

  const description = story.excerpt || story.content?.slice(0, 160) || ''
  const authorName = story.profiles?.display_name || 'Anonymous Storyteller'

  return {
    title: `${story.title} | Empathy Ledger`,
    description,
    authors: [{ name: authorName }],

    // Open Graph
    openGraph: {
      title: story.title,
      description,
      type: 'article',
      url: storyUrl,
      siteName: 'Empathy Ledger'
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description
    },

    // oEmbed discovery - this is the key for embedding support
    alternates: {
      types: {
        'application/json+oembed': oembedUrl,
        'text/xml+oembed': `${oembedUrl}&format=xml`
      }
    },

    // Additional meta tags
    other: {
      'oembed': oembedUrl,
      'empathy-ledger:story-id': id,
      'empathy-ledger:visibility': story.visibility || 'private'
    }
  }
}

export default function StoryLayout({ children }: LayoutProps) {
  return children
}

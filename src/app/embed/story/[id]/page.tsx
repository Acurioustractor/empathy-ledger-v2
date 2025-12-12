export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { consentProxy } from '@/lib/services/consent-proxy.service'
import { StoryEmbedCard } from '@/components/embed/StoryEmbedCard'
import { WithdrawnStoryEmbed } from '@/components/embed/WithdrawnStoryEmbed'
import './embed.css'

interface EmbedPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    theme?: 'light' | 'dark' | 'earth'
    compact?: string
    showMedia?: string
  }>
}

/**
 * Embeddable Story Page
 *
 * Lightweight page designed to be displayed in iframes on external sites.
 * Always checks consent before displaying - withdrawn stories show placeholder.
 *
 * URL Parameters:
 *   - theme: light | dark | earth (default: light)
 *   - compact: true | false (default: false)
 *   - showMedia: true | false (default: true)
 *
 * Example:
 *   /embed/story/abc123?theme=dark&compact=true
 */
export default async function EmbedStoryPage({ params, searchParams }: EmbedPageProps) {
  const { id } = await params
  const { theme = 'light', compact = 'false', showMedia = 'true' } = await searchParams

  // Validate theme parameter
  const validThemes = ['light', 'dark', 'earth'] as const
  const selectedTheme = validThemes.includes(theme as typeof validThemes[number])
    ? (theme as typeof validThemes[number])
    : 'light'

  // Check consent for embed access
  const consent = await consentProxy.checkConsent(id, { type: 'embed' })

  // If consent not granted, show withdrawn message
  if (!consent.allowed) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex, nofollow" />
          <title>Story Unavailable | Empathy Ledger</title>
          <style>{getEmbedStyles(selectedTheme)}</style>
        </head>
        <body className="embed-body">
          <WithdrawnStoryEmbed reason={consent.reason} />
        </body>
      </html>
    )
  }

  // Get story with consent applied
  const story = await consentProxy.getStoryWithConsent(id, { type: 'embed' })

  if (!story) {
    return notFound()
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="X-Empathy-Consent-Version" content={consent.consentVersion} />
        <title>{story.title} | Empathy Ledger</title>
        <style>{getEmbedStyles(selectedTheme)}</style>
      </head>
      <body className="embed-body">
        <StoryEmbedCard
          story={story}
          theme={selectedTheme}
          compact={compact === 'true'}
          showMedia={showMedia !== 'false' && consent.mediaAllowed}
        />
      </body>
    </html>
  )
}

/**
 * Generate metadata for the embed page
 */
export async function generateMetadata({ params }: EmbedPageProps) {
  const { id } = await params

  const story = await consentProxy.getStoryWithConsent(id, { type: 'embed' })

  if (!story) {
    return {
      title: 'Story | Empathy Ledger',
      robots: { index: false, follow: false }
    }
  }

  return {
    title: `${story.title} | Empathy Ledger`,
    description: story.excerpt || story.content?.slice(0, 160),
    robots: { index: false, follow: false },
    openGraph: {
      title: story.title,
      description: story.excerpt || story.content?.slice(0, 160),
      type: 'article'
    }
  }
}

/**
 * Inline styles for the embed (no external CSS needed)
 */
function getEmbedStyles(theme: 'light' | 'dark' | 'earth'): string {
  const baseStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      height: 100%;
      overflow: hidden;
    }

    .embed-body {
      height: 100%;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `

  const themeStyles = {
    light: `
      body { background: #ffffff; color: #1c1917; }
    `,
    dark: `
      body { background: #1c1917; color: #f5f5f4; }
    `,
    earth: `
      body { background: #fffbeb; color: #1c1917; }
    `
  }

  return baseStyles + themeStyles[theme]
}

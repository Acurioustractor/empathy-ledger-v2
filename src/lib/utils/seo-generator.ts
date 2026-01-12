/**
 * SEO Meta Tag Generator
 * Generates comprehensive SEO tags for stories including:
 * - Open Graph (Facebook, LinkedIn)
 * - Twitter Cards
 * - JSON-LD Structured Data
 * - Standard meta tags
 */

export interface StoryMetadata {
  id: string
  title: string
  meta_title?: string | null
  meta_description?: string | null
  summary?: string | null
  content: string
  article_type?: string | null
  slug?: string | null
  featured_image_url?: string | null
  author_name?: string
  published_at?: string | null
  updated_at?: string
  tags?: string[]
  themes?: string[]
  organization_name?: string
  storyteller_name?: string
}

export interface SEOTags {
  title: string
  description: string
  canonical: string
  openGraph: {
    title: string
    description: string
    type: string
    url: string
    image?: string
    siteName: string
    publishedTime?: string
    modifiedTime?: string
    author?: string
    tags?: string[]
  }
  twitter: {
    card: 'summary' | 'summary_large_image'
    title: string
    description: string
    image?: string
    creator?: string
  }
  jsonLd: any
}

/**
 * Generate comprehensive SEO tags for a story
 */
export function generateStoryMetaTags(
  story: StoryMetadata,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://empathyledger.org'
): SEOTags {
  // Title: Use meta_title if set, otherwise fall back to story title
  const title = story.meta_title || story.title
  const fullTitle = `${title} | Empathy Ledger`

  // Description: Use meta_description if set, otherwise use summary, otherwise excerpt from content
  const description =
    story.meta_description ||
    story.summary ||
    extractExcerpt(story.content, 160)

  // Canonical URL
  const slug = story.slug || story.id
  const canonical = `${baseUrl}/stories/${slug}`

  // Featured image with fallback
  const image = story.featured_image_url || `${baseUrl}/images/og-default.jpg`

  // Article type mapping to schema.org types
  const schemaType = getSchemaType(story.article_type)

  // Open Graph tags
  const openGraph = {
    title: title,
    description: description,
    type: 'article',
    url: canonical,
    image: image,
    siteName: 'Empathy Ledger',
    publishedTime: story.published_at || undefined,
    modifiedTime: story.updated_at,
    author: story.author_name || story.storyteller_name,
    tags: story.tags || []
  }

  // Twitter Card
  const twitter = {
    card: (story.featured_image_url ? 'summary_large_image' : 'summary') as 'summary' | 'summary_large_image',
    title: title,
    description: description,
    image: story.featured_image_url,
    creator: story.author_name || story.storyteller_name
  }

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: title,
    description: description,
    image: image,
    datePublished: story.published_at,
    dateModified: story.updated_at,
    author: story.author_name || story.storyteller_name ? {
      '@type': 'Person',
      name: story.author_name || story.storyteller_name
    } : undefined,
    publisher: story.organization_name ? {
      '@type': 'Organization',
      name: story.organization_name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    } : {
      '@type': 'Organization',
      name: 'Empathy Ledger',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    },
    keywords: [...(story.tags || []), ...(story.themes || [])].join(', '),
    articleBody: extractExcerpt(story.content, 500),
    url: canonical
  }

  return {
    title: fullTitle,
    description,
    canonical,
    openGraph,
    twitter,
    jsonLd
  }
}

/**
 * Extract plain text excerpt from HTML/markdown content
 */
function extractExcerpt(content: string, maxLength: number): string {
  // Strip HTML tags
  let text = content.replace(/<[^>]*>/g, '')

  // Strip markdown syntax
  text = text
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/`(.+?)`/g, '$1') // Code

  // Trim whitespace
  text = text.trim()

  // Truncate to max length
  if (text.length > maxLength) {
    text = text.substring(0, maxLength)
    // Find last complete word
    const lastSpace = text.lastIndexOf(' ')
    if (lastSpace > 0) {
      text = text.substring(0, lastSpace)
    }
    text += '...'
  }

  return text
}

/**
 * Map article types to schema.org types
 */
function getSchemaType(articleType?: string | null): string {
  const typeMap: Record<string, string> = {
    story_feature: 'Article',
    program_spotlight: 'Article',
    research_summary: 'ScholarlyArticle',
    community_news: 'NewsArticle',
    editorial: 'Article',
    impact_report: 'Report',
    project_update: 'Article',
    tutorial: 'HowTo',
    personal_story: 'CreativeWork',
    oral_history: 'CreativeWork'
  }

  return typeMap[articleType || ''] || 'Article'
}

/**
 * Generate Next.js metadata object for app router
 */
export function generateNextMetadata(story: StoryMetadata) {
  const tags = generateStoryMetaTags(story)

  return {
    title: tags.title,
    description: tags.description,
    openGraph: {
      title: tags.openGraph.title,
      description: tags.openGraph.description,
      type: 'article',
      url: tags.openGraph.url,
      images: tags.openGraph.image ? [
        {
          url: tags.openGraph.image,
          width: 1200,
          height: 630,
          alt: tags.openGraph.title
        }
      ] : undefined,
      siteName: tags.openGraph.siteName,
      publishedTime: tags.openGraph.publishedTime,
      modifiedTime: tags.openGraph.modifiedTime,
      authors: tags.openGraph.author ? [tags.openGraph.author] : undefined,
      tags: tags.openGraph.tags
    },
    twitter: {
      card: tags.twitter.card,
      title: tags.twitter.title,
      description: tags.twitter.description,
      images: tags.twitter.image ? [tags.twitter.image] : undefined,
      creator: tags.twitter.creator
    },
    alternates: {
      canonical: tags.canonical
    }
  }
}

/**
 * Generate meta tags as HTML strings for injection
 */
export function generateMetaTagsHTML(story: StoryMetadata): string {
  const tags = generateStoryMetaTags(story)

  const metaTags = [
    // Standard meta tags
    `<title>${tags.title}</title>`,
    `<meta name="description" content="${escapeHTML(tags.description)}" />`,
    `<link rel="canonical" href="${tags.canonical}" />`,

    // Open Graph
    `<meta property="og:title" content="${escapeHTML(tags.openGraph.title)}" />`,
    `<meta property="og:description" content="${escapeHTML(tags.openGraph.description)}" />`,
    `<meta property="og:type" content="${tags.openGraph.type}" />`,
    `<meta property="og:url" content="${tags.openGraph.url}" />`,
    `<meta property="og:site_name" content="${tags.openGraph.siteName}" />`,
    tags.openGraph.image ? `<meta property="og:image" content="${tags.openGraph.image}" />` : '',
    tags.openGraph.publishedTime ? `<meta property="article:published_time" content="${tags.openGraph.publishedTime}" />` : '',
    tags.openGraph.modifiedTime ? `<meta property="article:modified_time" content="${tags.openGraph.modifiedTime}" />` : '',
    tags.openGraph.author ? `<meta property="article:author" content="${escapeHTML(tags.openGraph.author)}" />` : '',
    ...(tags.openGraph.tags || []).map(tag => `<meta property="article:tag" content="${escapeHTML(tag)}" />`),

    // Twitter Card
    `<meta name="twitter:card" content="${tags.twitter.card}" />`,
    `<meta name="twitter:title" content="${escapeHTML(tags.twitter.title)}" />`,
    `<meta name="twitter:description" content="${escapeHTML(tags.twitter.description)}" />`,
    tags.twitter.image ? `<meta name="twitter:image" content="${tags.twitter.image}" />` : '',
    tags.twitter.creator ? `<meta name="twitter:creator" content="${escapeHTML(tags.twitter.creator)}" />` : '',

    // JSON-LD
    `<script type="application/ld+json">${JSON.stringify(tags.jsonLd)}</script>`
  ]

  return metaTags.filter(Boolean).join('\n')
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Preview SEO tags for admin/editor
 */
export function previewSEOTags(story: StoryMetadata) {
  const tags = generateStoryMetaTags(story)

  return {
    googlePreview: {
      title: tags.title,
      url: tags.canonical,
      description: tags.description
    },
    facebookPreview: {
      title: tags.openGraph.title,
      description: tags.openGraph.description,
      image: tags.openGraph.image,
      siteName: tags.openGraph.siteName
    },
    twitterPreview: {
      title: tags.twitter.title,
      description: tags.twitter.description,
      image: tags.twitter.image,
      card: tags.twitter.card
    }
  }
}

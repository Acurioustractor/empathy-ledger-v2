export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { consentProxy } from '@/lib/services/consent-proxy.service'

/**
 * oEmbed Endpoint
 *
 * Implements the oEmbed specification (https://oembed.com/) to allow
 * rich embedding of Empathy Ledger stories on external platforms.
 *
 * Supported by: WordPress, Medium, Slack, Notion, and many others.
 *
 * Usage:
 *   GET /api/oembed?url=https://empathyledger.com/stories/abc123
 *   GET /api/oembed?url=https://empathyledger.com/stories/abc123&format=json
 *   GET /api/oembed?url=https://empathyledger.com/stories/abc123&maxwidth=600
 *
 * Response:
 *   {
 *     "type": "rich",
 *     "version": "1.0",
 *     "title": "Story Title",
 *     "author_name": "Storyteller Name",
 *     "provider_name": "Empathy Ledger",
 *     "html": "<iframe src='...'></iframe>",
 *     ...
 *   }
 */

interface OEmbedResponse {
  type: 'rich' | 'video' | 'photo' | 'link'
  version: '1.0'
  title?: string
  author_name?: string
  author_url?: string
  provider_name: string
  provider_url: string
  cache_age?: number
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
  html?: string
  width?: number
  height?: number
}

interface OEmbedError {
  error: string
  error_code: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Get parameters
  const url = searchParams.get('url')
  const format = searchParams.get('format') || 'json'
  const maxWidth = parseInt(searchParams.get('maxwidth') || '600')
  const maxHeight = parseInt(searchParams.get('maxheight') || '400')

  // Validate format
  if (format !== 'json' && format !== 'xml') {
    return createErrorResponse('Invalid format. Use json or xml.', 501, format)
  }

  // Validate URL
  if (!url) {
    return createErrorResponse('Missing required url parameter', 400, format)
  }

  // Extract story ID from URL
  const storyId = extractStoryId(url)
  if (!storyId) {
    return createErrorResponse('Invalid URL format. Expected: /stories/{id}', 404, format)
  }

  // Check consent for public/embed access
  const consent = await consentProxy.checkConsent(storyId, {
    type: 'oembed',
    domain: extractDomain(request.headers.get('referer'))
  })

  if (!consent.allowed) {
    return createErrorResponse(
      consent.reason || 'Story not available for embedding',
      404,
      format
    )
  }

  // Get story with consent applied
  const story = await consentProxy.getStoryWithConsent(storyId, {
    type: 'oembed',
    domain: extractDomain(request.headers.get('referer'))
  })

  if (!story) {
    return createErrorResponse('Story not found', 404, format)
  }

  // Calculate dimensions (responsive, but respect max)
  const width = Math.min(maxWidth, 600)
  const height = Math.min(maxHeight, 400)

  // Build the embed URL
  const baseUrl = getBaseUrl(request)
  const embedUrl = `${baseUrl}/embed/story/${storyId}`

  // Build oEmbed response
  const oembedResponse: OEmbedResponse = {
    type: 'rich',
    version: '1.0',
    title: story.title,
    author_name: story.storytellerName,
    author_url: story.storytellerId ? `${baseUrl}/storytellers/${story.storytellerId}` : undefined,
    provider_name: 'Empathy Ledger',
    provider_url: baseUrl,
    // Short cache - allows consent changes to propagate quickly
    cache_age: 300, // 5 minutes
    html: buildEmbedHtml(embedUrl, story.title, width, height),
    width,
    height
  }

  // Add thumbnail if media is allowed and available
  if (consent.mediaAllowed && story.media && story.media.length > 0) {
    oembedResponse.thumbnail_url = story.media[0]
    oembedResponse.thumbnail_width = 200
    oembedResponse.thumbnail_height = 200
  }

  // Return response with consent headers
  const headers = {
    ...consentProxy.getConsentHeaders(consent),
    'Content-Type': format === 'json' ? 'application/json' : 'text/xml'
  }

  if (format === 'xml') {
    return new NextResponse(buildXmlResponse(oembedResponse), { headers })
  }

  return NextResponse.json(oembedResponse, { headers })
}

/**
 * Extract story ID from various URL formats
 */
function extractStoryId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // Handle /stories/{id} format
    const storiesMatch = urlObj.pathname.match(/\/stories\/([a-zA-Z0-9-]+)/)
    if (storiesMatch) {
      return storiesMatch[1]
    }

    // Handle /embed/story/{id} format
    const embedMatch = urlObj.pathname.match(/\/embed\/story\/([a-zA-Z0-9-]+)/)
    if (embedMatch) {
      return embedMatch[1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract domain from referer URL
 */
function extractDomain(referer: string | null): string | undefined {
  if (!referer) return undefined
  try {
    return new URL(referer).hostname
  } catch {
    return undefined
  }
}

/**
 * Get base URL from request
 */
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'empathyledger.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

/**
 * Build the iframe embed HTML
 */
function buildEmbedHtml(embedUrl: string, title: string, width: number, height: number): string {
  // Sanitize title for attribute
  const safeTitle = title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allow="fullscreen" loading="lazy" title="${safeTitle}" style="border: 1px solid #e5e7eb; border-radius: 8px;"></iframe>`
}

/**
 * Build XML response for oEmbed
 */
function buildXmlResponse(response: OEmbedResponse): string {
  const escape = (str: string | undefined) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  let xml = '<?xml version="1.0" encoding="utf-8"?>\n<oembed>\n'

  Object.entries(response).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      xml += `  <${key}>${escape(String(value))}</${key}>\n`
    }
  })

  xml += '</oembed>'
  return xml
}

/**
 * Create error response in appropriate format
 */
function createErrorResponse(message: string, status: number, format: string): NextResponse {
  const error: OEmbedError = {
    error: message,
    error_code: status
  }

  if (format === 'xml') {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<oembed>
  <error>${message}</error>
  <error_code>${status}</error_code>
</oembed>`
    return new NextResponse(xml, {
      status,
      headers: { 'Content-Type': 'text/xml' }
    })
  }

  return NextResponse.json(error, { status })
}

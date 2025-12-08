import { NextRequest, NextResponse } from 'next/server'
import { getEmbedService } from '@/lib/services/embed.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/embed/stories/[id]
 *
 * Public endpoint to retrieve embeddable story content.
 * Validates embed token, checks consent, and enforces domain restrictions.
 *
 * Query params:
 * - token: Embed token (required unless story is public)
 *
 * Headers:
 * - Origin: Used for domain validation
 * - X-Embed-Token: Alternative way to pass token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const embedService = getEmbedService()

    // Get token from query params or headers
    const token = request.nextUrl.searchParams.get('token') ||
                  request.headers.get('x-embed-token')

    // Get origin for domain validation
    const origin = request.headers.get('origin') ||
                   request.headers.get('referer') ||
                   ''

    // Extract domain from origin
    let domain = ''
    try {
      const url = new URL(origin)
      domain = url.hostname
    } catch {
      domain = origin
    }

    // If no token provided, check if story is publicly embeddable
    if (!token) {
      return NextResponse.json(
        {
          error: 'Embed token required',
          code: 'TOKEN_REQUIRED',
          message: 'Please provide an embed token to access this story'
        },
        { status: 401 }
      )
    }

    // Validate the token
    const validation = await embedService.validateEmbedAccess(token, domain)

    if (!validation.valid) {
      // Return appropriate error based on validation failure
      const statusCode = validation.error?.includes('expired') ? 410 :
                        validation.error?.includes('revoked') ? 410 :
                        validation.error?.includes('Domain') ? 403 : 401

      return NextResponse.json(
        {
          error: validation.error,
          code: validation.error?.includes('expired') ? 'TOKEN_EXPIRED' :
                validation.error?.includes('revoked') ? 'TOKEN_REVOKED' :
                validation.error?.includes('Domain') ? 'DOMAIN_NOT_ALLOWED' : 'INVALID_TOKEN'
        },
        { status: statusCode }
      )
    }

    // Fetch the embeddable story
    const story = await embedService.getEmbeddableStory(validation.storyId!)

    if (!story) {
      return NextResponse.json(
        {
          error: 'Story not available for embedding',
          code: 'STORY_UNAVAILABLE',
          message: 'This story is not available for embedding. It may have been archived, withdrawn, or consent may not be verified.'
        },
        { status: 404 }
      )
    }

    // Track the view (fire and forget)
    embedService.trackEmbedView(
      validation.tokenId!,
      null, // distribution ID would be fetched separately
      {
        domain,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        referrer: request.headers.get('referer') || undefined
      }
    ).catch(err => console.error('Failed to track embed view:', err))

    // Return the story with CORS headers for embedding
    const response = NextResponse.json({
      success: true,
      story
    })

    // Set CORS headers to allow embedding
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'X-Embed-Token, Content-Type')
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300')

    return response

  } catch (error) {
    console.error('Embed API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/embed/stories/[id]
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Embed-Token, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}

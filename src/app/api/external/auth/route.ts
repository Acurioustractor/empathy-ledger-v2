export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, generateAppToken } from '@/lib/external/auth'

/**
 * POST /api/external/auth
 *
 * Authenticate an external application and receive a JWT token.
 *
 * Request Body:
 * {
 *   "api_key": "your_app_api_key"
 * }
 *
 * Response:
 * {
 *   "token": "jwt_token_string",
 *   "expires_in": 3600,
 *   "app": {
 *     "name": "justicehub",
 *     "display_name": "JusticeHub",
 *     "allowed_story_types": ["testimony", "case_study"]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { api_key } = body

    if (!api_key || typeof api_key !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid api_key' },
        { status: 400 }
      )
    }

    // Validate API key and get app info
    const app = await validateApiKey(api_key)

    if (!app) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await generateAppToken(app)

    return NextResponse.json({
      token,
      expires_in: 3600, // 1 hour in seconds
      app: {
        name: app.app_name,
        display_name: app.app_display_name,
        allowed_story_types: app.allowed_story_types
      }
    })
  } catch (error) {
    console.error('External auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

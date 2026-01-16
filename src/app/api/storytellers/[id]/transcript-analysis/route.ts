// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { individualAnalyticsService } from '@/lib/services/individual-analytics.service'
import { getAuthenticatedUser, canAccessStoryteller } from '@/lib/auth/api-auth'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    // Authentication check
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Authorization check
    const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: reason || 'Forbidden' },
        { status: 403 }
      )
    }

    // Get existing analysis
    const analysis = await individualAnalyticsService.getStorytellerAnalysis(storytellerId)

    return NextResponse.json({
      success: true,
      ...analysis
    })
  } catch (error) {
    console.error('Error fetching transcript analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const body = await request.json()

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    // Authentication check
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Authorization check
    const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: reason || 'Forbidden' },
        { status: 403 }
      )
    }

    const { transcript } = body
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript text is required (minimum 50 characters)' },
        { status: 400 }
      )
    }

    // Generate analysis from the provided transcript
    const analysis = await individualAnalyticsService.analyzeTranscript(storytellerId, transcript)

    return NextResponse.json({
      success: true,
      message: 'Analysis generated successfully',
      ...analysis
    })
  } catch (error) {
    console.error('Error generating transcript analysis:', error)
    
    // Check if it's a specific error we can handle
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please contact support.' },
          { status: 503 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is temporarily busy. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate analysis. Please try again later.' },
      { status: 500 }
    )
  }
}
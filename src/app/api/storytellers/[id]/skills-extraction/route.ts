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

    // Get professional competencies
    const competencies = await individualAnalyticsService.extractProfessionalCompetencies(storytellerId)

    return NextResponse.json({
      success: true,
      competencies,
      count: competencies.length,
      skillsBreakdown: {
        expert: competencies.filter(c => c.level === 'expert').length,
        advanced: competencies.filter(c => c.level === 'advanced').length,
        intermediate: competencies.filter(c => c.level === 'intermediate').length,
        beginner: competencies.filter(c => c.level === 'beginner').length,
      },
      averageMarketValue: competencies.length > 0 
        ? Math.round(competencies.reduce((sum, comp) => sum + comp.market_value, 0) / competencies.length)
        : 0
    })
  } catch (error) {
    console.error('Error extracting skills:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('No transcripts found')) {
        return NextResponse.json(
          { error: 'No transcripts found for skills analysis. Please upload transcripts first.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to extract skills' },
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

    // Force regeneration of skills analysis
    const competencies = await individualAnalyticsService.extractProfessionalCompetencies(storytellerId)

    return NextResponse.json({
      success: true,
      message: 'Skills analysis regenerated successfully',
      competencies,
      count: competencies.length,
      skillsBreakdown: {
        expert: competencies.filter(c => c.level === 'expert').length,
        advanced: competencies.filter(c => c.level === 'advanced').length,
        intermediate: competencies.filter(c => c.level === 'intermediate').length,
        beginner: competencies.filter(c => c.level === 'beginner').length,
      },
      averageMarketValue: competencies.length > 0 
        ? Math.round(competencies.reduce((sum, comp) => sum + comp.market_value, 0) / competencies.length)
        : 0
    })
  } catch (error) {
    console.error('Error regenerating skills analysis:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate skills analysis' },
      { status: 500 }
    )
  }
}
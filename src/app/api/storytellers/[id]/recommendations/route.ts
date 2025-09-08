import { NextRequest, NextResponse } from 'next/server'
import { individualAnalyticsService } from '@/lib/services/individual-analytics.service'

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

    // Get comprehensive analysis which includes recommendations
    const analysis = await individualAnalyticsService.getStorytellerAnalysis(storytellerId)

    return NextResponse.json({
      success: true,
      careerRecommendations: analysis.careerRecommendations,
      grantOpportunities: analysis.grantOpportunities,
      developmentPlan: analysis.developmentPlan,
      stats: {
        totalCareerOpportunities: analysis.careerRecommendations.length,
        totalGrantOpportunities: analysis.grantOpportunities.length,
        highMatchCareerOpportunities: analysis.careerRecommendations.filter(rec => rec.match_score >= 80).length,
        highMatchGrantOpportunities: analysis.grantOpportunities.filter(grant => grant.match_score >= 80).length,
        culturalFocusGrants: analysis.grantOpportunities.filter(grant => grant.cultural_focus).length,
      }
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('No transcripts found')) {
        return NextResponse.json(
          { error: 'No transcripts available for generating recommendations. Please upload transcripts first.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
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
    
    const { 
      includeCareer = true, 
      includeGrants = true, 
      focusAreas = [],
      locationPreference,
      salaryRange 
    } = body

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    // Get current competencies and impact stories
    const competencies = await individualAnalyticsService.extractProfessionalCompetencies(storytellerId)
    const impactStories = await individualAnalyticsService.extractImpactStories(storytellerId)

    let careerRecommendations = []
    let grantOpportunities = []

    // Generate career recommendations if requested
    if (includeCareer) {
      careerRecommendations = await individualAnalyticsService.generateCareerRecommendations(
        storytellerId, 
        competencies
      )
      
      // Filter by preferences if provided
      if (locationPreference) {
        careerRecommendations = careerRecommendations.filter(rec => 
          rec.organization.toLowerCase().includes(locationPreference.toLowerCase()) ||
          rec.title.toLowerCase().includes(locationPreference.toLowerCase())
        )
      }
      
      if (salaryRange) {
        careerRecommendations = careerRecommendations.filter(rec => 
          rec.salary_range && rec.salary_range.includes(salaryRange)
        )
      }
    }

    // Generate grant opportunities if requested
    if (includeGrants) {
      grantOpportunities = await individualAnalyticsService.findGrantOpportunities(
        storytellerId, 
        impactStories
      )
      
      // Filter by focus areas if provided
      if (focusAreas.length > 0) {
        grantOpportunities = grantOpportunities.filter(grant =>
          focusAreas.some(focus => 
            grant.title.toLowerCase().includes(focus.toLowerCase()) ||
            grant.required_criteria.some(criteria => 
              criteria.toLowerCase().includes(focus.toLowerCase())
            )
          )
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendations generated successfully',
      careerRecommendations,
      grantOpportunities,
      filters: {
        includeCareer,
        includeGrants,
        focusAreas,
        locationPreference,
        salaryRange
      },
      stats: {
        totalCareerOpportunities: careerRecommendations.length,
        totalGrantOpportunities: grantOpportunities.length,
        highMatchCareerOpportunities: careerRecommendations.filter(rec => rec.match_score >= 80).length,
        highMatchGrantOpportunities: grantOpportunities.filter(grant => grant.match_score >= 80).length,
        culturalFocusGrants: grantOpportunities.filter(grant => grant.cultural_focus).length,
      }
    })
  } catch (error) {
    console.error('Error generating custom recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom recommendations' },
      { status: 500 }
    )
  }
}
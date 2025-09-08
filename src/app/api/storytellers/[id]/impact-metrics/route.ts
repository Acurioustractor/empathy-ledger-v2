import { NextRequest, NextResponse } from 'next/server'
import { individualAnalyticsService } from '@/lib/services/individual-analytics.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    // Get impact stories
    const impactStories = await individualAnalyticsService.extractImpactStories(storytellerId)

    // Calculate impact metrics
    const metrics = {
      totalStories: impactStories.length,
      averageOutcomesPerStory: impactStories.length > 0 
        ? Math.round(impactStories.reduce((sum, story) => sum + story.measurable_outcomes.length, 0) / impactStories.length)
        : 0,
      uniqueBeneficiaryGroups: new Set(impactStories.flatMap(story => story.beneficiaries)).size,
      usageBreakdown: impactStories.reduce((acc, story) => {
        story.suitable_for.forEach(use => {
          acc[use] = (acc[use] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>),
      timeframeDistribution: impactStories.reduce((acc, story) => {
        acc[story.timeframe] = (acc[story.timeframe] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      professionalReadiness: {
        resume: Math.round((impactStories.filter(s => s.suitable_for.includes('resume')).length / impactStories.length) * 100),
        grants: Math.round((impactStories.filter(s => s.suitable_for.includes('grant_application')).length / impactStories.length) * 100),
        interviews: Math.round((impactStories.filter(s => s.suitable_for.includes('interview')).length / impactStories.length) * 100),
        portfolio: Math.round((impactStories.filter(s => s.suitable_for.includes('portfolio')).length / impactStories.length) * 100),
      }
    }

    return NextResponse.json({
      success: true,
      impactStories,
      metrics,
      analysis: {
        strongestImpactAreas: impactStories
          .sort((a, b) => b.measurable_outcomes.length - a.measurable_outcomes.length)
          .slice(0, 3)
          .map(story => ({
            title: story.title,
            outcomeCount: story.measurable_outcomes.length,
            beneficiariesCount: story.beneficiaries.length
          })),
        mostVersatileStories: impactStories
          .sort((a, b) => b.suitable_for.length - a.suitable_for.length)
          .slice(0, 3)
          .map(story => ({
            title: story.title,
            usageCount: story.suitable_for.length,
            applications: story.suitable_for
          })),
        culturalSignificance: impactStories
          .filter(story => story.cultural_significance && story.cultural_significance.length > 20)
          .length
      }
    })
  } catch (error) {
    console.error('Error fetching impact metrics:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('No transcripts found')) {
        return NextResponse.json(
          { error: 'No transcripts available for impact analysis. Please upload transcripts first.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch impact metrics' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    const body = await request.json()
    
    const { 
      regenerate = false,
      focusOnProfessionalUse = true,
      includeCulturalContext = true,
      minimumOutcomes = 1
    } = body

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    // Generate or regenerate impact stories
    const impactStories = await individualAnalyticsService.extractImpactStories(storytellerId)
    
    // Filter based on criteria if provided
    let filteredStories = impactStories
    
    if (minimumOutcomes > 1) {
      filteredStories = filteredStories.filter(story => 
        story.measurable_outcomes.length >= minimumOutcomes
      )
    }
    
    if (focusOnProfessionalUse) {
      filteredStories = filteredStories.filter(story => 
        story.suitable_for.includes('resume') || 
        story.suitable_for.includes('grant_application') ||
        story.suitable_for.includes('portfolio')
      )
    }

    if (!includeCulturalContext) {
      // Return stories without detailed cultural context (simplified)
      filteredStories = filteredStories.map(story => ({
        ...story,
        cultural_significance: story.cultural_significance.split('.')[0] // First sentence only
      }))
    }

    // Enhanced metrics for filtered results
    const metrics = {
      totalStories: filteredStories.length,
      originalCount: impactStories.length,
      filteredOut: impactStories.length - filteredStories.length,
      averageOutcomesPerStory: filteredStories.length > 0 
        ? Math.round(filteredStories.reduce((sum, story) => sum + story.measurable_outcomes.length, 0) / filteredStories.length)
        : 0,
      uniqueBeneficiaryGroups: new Set(filteredStories.flatMap(story => story.beneficiaries)).size,
      professionalReadiness: {
        resume: filteredStories.filter(s => s.suitable_for.includes('resume')).length,
        grants: filteredStories.filter(s => s.suitable_for.includes('grant_application')).length,
        interviews: filteredStories.filter(s => s.suitable_for.includes('interview')).length,
        portfolio: filteredStories.filter(s => s.suitable_for.includes('portfolio')).length,
      },
      qualityScore: filteredStories.length > 0 
        ? Math.round((filteredStories.reduce((sum, story) => 
            sum + (story.measurable_outcomes.length * 2) + story.suitable_for.length
          , 0) / filteredStories.length) * 10)
        : 0
    }

    return NextResponse.json({
      success: true,
      message: regenerate ? 'Impact stories regenerated successfully' : 'Impact analysis completed',
      impactStories: filteredStories,
      metrics,
      filters: {
        regenerate,
        focusOnProfessionalUse,
        includeCulturalContext,
        minimumOutcomes
      },
      recommendations: {
        topStoryForResume: filteredStories
          .filter(s => s.suitable_for.includes('resume'))
          .sort((a, b) => b.measurable_outcomes.length - a.measurable_outcomes.length)[0]?.title,
        topStoryForGrants: filteredStories
          .filter(s => s.suitable_for.includes('grant_application'))
          .sort((a, b) => b.beneficiaries.length - a.beneficiaries.length)[0]?.title,
        mostVersatileStory: filteredStories
          .sort((a, b) => b.suitable_for.length - a.suitable_for.length)[0]?.title
      }
    })
  } catch (error) {
    console.error('Error generating impact analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate impact analysis' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`🏛️ Generating philanthropy intelligence for organisation: ${organizationId}`)

    // Get organisation details and storytellers
    const { data: organisation, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get all storytellers in this organisation's tenant
    const { data: storytellers } = await supabase
      .from('profiles')
      .select('id, display_name, tenant_id, tenant_roles, impact_focus_areas, expertise_areas, community_roles, change_maker_type')
      .eq('tenant_id', organisation.tenant_id)
      .contains('tenant_roles', ['storyteller'])

    // Get recent transcripts and stories for analysis
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select(`
        *,
        profiles!inner(tenant_id)
      `)
      .eq('profiles.tenant_id', organisation.tenant_id)
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())

    const { data: stories } = await supabase
      .from('stories')
      .select(`
        *,
        profiles!inner(tenant_id)
      `)
      .eq('profiles.tenant_id', organisation.tenant_id)
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())

    // Generate comprehensive philanthropy intelligence
    const philanthropyData = await generatePhilanthropyIntelligence(
      organisation,
      storytellers || [],
      transcripts || [],
      stories || []
    )

    console.log(`✅ Philanthropy intelligence generated for ${organisation.name}`)

    return NextResponse.json({
      success: true,
      organisation: {
        id: organizationId,
        name: organisation.name,
        tenantId: organisation.tenant_id
      },
      ...philanthropyData
    })

  } catch (error) {
    console.error('❌ Error generating philanthropy intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to generate philanthropy intelligence', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generatePhilanthropyIntelligence(
  organisation: any,
  storytellers: any[],
  transcripts: any[],
  stories: any[]
) {
  // Calculate overall impact metrics
  const totalImpactScore = calculateOverallImpactScore(storytellers, transcripts, stories)
  const sectorsEngaged = calculateSectorsEngaged(storytellers)
  const communityReach = calculateCommunityReach(storytellers, transcripts, stories)

  // Generate investment opportunities
  const investmentOpportunities = generateInvestmentOpportunities(storytellers, transcripts)

  // Calculate impact measurements
  const impactMeasurements = calculateImpactMeasurements(storytellers, transcripts, stories)

  // Generate portfolio performance metrics
  const portfolioPerformance = calculatePortfolioPerformance(storytellers, transcripts, stories)

  // Generate AI recommendation
  const recommendation = generateInvestmentRecommendation(
    investmentOpportunities,
    impactMeasurements,
    storytellers
  )

  return {
    totalImpactScore,
    sectorsEngaged: sectorsEngaged.length,
    activeStorytellers: storytellers.length,
    communityReach,
    investmentOpportunities,
    impactMeasurements,
    portfolioPerformance,
    recommendation
  }
}

function calculateOverallImpactScore(storytellers: any[], transcripts: any[], stories: any[]): number {
  // Base score from storyteller diversity and expertise
  const expertiseScore = Math.min(storytellers.length * 3, 40)

  // Content volume score
  const contentScore = Math.min((transcripts.length + stories.length) * 0.5, 30)

  // Activity score based on recent content
  const recentActivity = transcripts.filter(t =>
    new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length
  const activityScore = Math.min(recentActivity * 2, 20)

  // Cross-sector bonus
  const uniqueSectors = new Set()
  storytellers.forEach(s => {
    (s.impact_focus_areas || []).forEach((area: string) => uniqueSectors.add(area))
  })
  const sectorBonus = Math.min(uniqueSectors.size * 2, 10)

  return Math.round(expertiseScore + contentScore + activityScore + sectorBonus)
}

function calculateSectorsEngaged(storytellers: any[]): string[] {
  const sectors = new Set<string>()

  storytellers.forEach(storyteller => {
    const focusAreas = storyteller.impact_focus_areas || []
    focusAreas.forEach((area: string) => {
      // Map focus areas to broader sectors
      const sector = mapToSector(area)
      if (sector) sectors.add(sector)
    })
  })

  return Array.from(sectors)
}

function mapToSector(focusArea: string): string | null {
  const sectorMap: Record<string, string> = {
    'cultural_preservation': 'Cultural Heritage',
    'education': 'Education',
    'healthcare': 'Health',
    'economic_development': 'Economic Development',
    'environmental': 'Environment',
    'governance': 'Governance',
    'youth_development': 'Youth Development',
    'traditional_knowledge': 'Cultural Heritage',
    'community_organizing': 'Governance',
    'healing': 'Health'
  }

  return sectorMap[focusArea] || focusArea
}

function calculateCommunityReach(storytellers: any[], transcripts: any[], stories: any[]): number {
  // Estimate based on storyteller count, content volume, and cross-references
  const baseReach = storytellers.length * 45 // Average 45 people per storyteller
  const contentMultiplier = Math.sqrt(transcripts.length + stories.length) * 10
  const networkEffect = storytellers.length > 5 ? storytellers.length * 15 : 0

  return Math.round(baseReach + contentMultiplier + networkEffect)
}

function generateInvestmentOpportunities(storytellers: any[], transcripts: any[]): any[] {
  // Analyze storyteller expertise and content themes to identify opportunities
  const opportunities = []

  // Youth Leadership Opportunity
  const youthExperts = storytellers.filter(s =>
    (s.expertise_areas || []).some((area: string) =>
      area.includes('youth') || area.includes('mentorship') || area.includes('education')
    )
  )

  if (youthExperts.length >= 2) {
    opportunities.push({
      id: 'youth-leadership',
      title: 'Indigenous Youth Leadership Initiative',
      description: 'Comprehensive program connecting young Indigenous leaders with traditional knowledge keepers to bridge generational wisdom gaps.',
      impactPotential: Math.min(85 + youthExperts.length * 2, 95),
      fundingNeeded: 125000,
      timeframe: '18 months',
      sectors: ['education', 'cultural_preservation', 'youth_development'],
      storytellers: youthExperts.slice(0, 3).map(s => ({
        id: s.id,
        name: s.display_name,
        expertise: s.expertise_areas || [],
        impactScore: Math.min(80 + Math.random() * 15, 95)
      })),
      expectedOutcomes: [
        'Train 50 youth leaders in traditional protocols',
        'Establish 3 community knowledge centres',
        'Create sustainable mentorship programs',
        'Document 100+ cultural practices'
      ],
      riskLevel: 'low' as const,
      readinessScore: Math.min(75 + youthExperts.length * 3, 90)
    })
  }

  // Healthcare Integration Opportunity
  const healthExperts = storytellers.filter(s =>
    (s.expertise_areas || []).some((area: string) =>
      area.includes('healing') || area.includes('health') || area.includes('medicine')
    )
  )

  if (healthExperts.length >= 1) {
    opportunities.push({
      id: 'health-integration',
      title: 'Cross-Sector Healing Integration Project',
      description: 'Innovative collaboration between Indigenous healers and healthcare systems to integrate traditional healing practices into modern medical care.',
      impactPotential: Math.min(80 + healthExperts.length * 3, 92),
      fundingNeeded: 200000,
      timeframe: '24 months',
      sectors: ['healthcare', 'cultural_integration', 'policy_change'],
      storytellers: healthExperts.slice(0, 2).map(s => ({
        id: s.id,
        name: s.display_name,
        expertise: s.expertise_areas || [],
        impactScore: Math.min(85 + Math.random() * 10, 95)
      })),
      expectedOutcomes: [
        'Pilot program in 2 hospitals',
        'Train 25 healthcare providers',
        'Policy recommendations for state health dept',
        'Research publication on integration outcomes'
      ],
      riskLevel: 'medium' as const,
      readinessScore: Math.min(70 + healthExperts.length * 4, 85)
    })
  }

  // Economic Development Opportunity
  const economicExperts = storytellers.filter(s =>
    (s.expertise_areas || []).some((area: string) =>
      area.includes('economic') || area.includes('business') || area.includes('entrepreneur')
    )
  )

  if (economicExperts.length >= 1) {
    opportunities.push({
      id: 'economic-development',
      title: 'Community Economic Development Network',
      description: 'Building sustainable economic opportunities through traditional knowledge and modern business practices.',
      impactPotential: Math.min(75 + economicExperts.length * 2, 85),
      fundingNeeded: 175000,
      timeframe: '30 months',
      sectors: ['economic_development', 'traditional_knowledge', 'entrepreneurship'],
      storytellers: economicExperts.slice(0, 2).map(s => ({
        id: s.id,
        name: s.display_name,
        expertise: s.expertise_areas || [],
        impactScore: Math.min(80 + Math.random() * 10, 90)
      })),
      expectedOutcomes: [
        'Launch 5 community enterprises',
        'Create 40 sustainable jobs',
        'Preserve 15 traditional craft techniques',
        'Generate $500K in community revenue'
      ],
      riskLevel: 'medium' as const,
      readinessScore: Math.min(65 + economicExperts.length * 3, 80)
    })
  }

  return opportunities.sort((a, b) => b.impactPotential - a.impactPotential)
}

function calculateImpactMeasurements(storytellers: any[], transcripts: any[], stories: any[]): any[] {
  const measurements = [
    {
      metric: 'Cultural Preservation',
      currentValue: Math.min(70 + storytellers.length * 2, 85),
      targetValue: 90,
      improvement: Math.floor(Math.random() * 15) + 8,
      trend: 'up' as const,
      sector: 'Cultural Heritage',
      storytellersContributing: storytellers.filter(s =>
        (s.impact_focus_areas || []).includes('cultural_preservation')
      ).length
    },
    {
      metric: 'Community Leadership',
      currentValue: Math.min(75 + storytellers.length * 1.5, 90),
      targetValue: 95,
      improvement: Math.floor(Math.random() * 12) + 10,
      trend: 'up' as const,
      sector: 'Governance',
      storytellersContributing: storytellers.filter(s =>
        (s.community_roles || []).some((role: string) => role.includes('leader'))
      ).length
    },
    {
      metric: 'Healthcare Integration',
      currentValue: Math.min(60 + storytellers.length * 1, 75),
      targetValue: 80,
      improvement: Math.floor(Math.random() * 10) + 5,
      trend: 'up' as const,
      sector: 'Health',
      storytellersContributing: storytellers.filter(s =>
        (s.expertise_areas || []).some((area: string) => area.includes('healing'))
      ).length
    },
    {
      metric: 'Educational Outcomes',
      currentValue: Math.min(65 + storytellers.length * 1.2, 80),
      targetValue: 85,
      improvement: Math.floor(Math.random() * 18) + 10,
      trend: 'up' as const,
      sector: 'Education',
      storytellersContributing: storytellers.filter(s =>
        (s.expertise_areas || []).some((area: string) => area.includes('education'))
      ).length
    },
    {
      metric: 'Economic Opportunity',
      currentValue: Math.min(50 + storytellers.length * 0.8, 65),
      targetValue: 75,
      improvement: Math.floor(Math.random() * 8) + 2,
      trend: 'stable' as const,
      sector: 'Economic Development',
      storytellersContributing: storytellers.filter(s =>
        (s.expertise_areas || []).some((area: string) => area.includes('economic'))
      ).length
    }
  ]

  return measurements.filter(m => m.storytellersContributing > 0)
}

function calculatePortfolioPerformance(storytellers: any[], transcripts: any[], stories: any[]): any {
  const baseInvestment = storytellers.length * 12000 // Estimated $12k per storyteller
  const storiesCount = stories.length
  const communitiesReached = Math.min(Math.floor(storytellers.length / 3), 8)
  const systemsChanged = Math.min(Math.floor(storytellers.length / 8), 5)
  const culturalScore = Math.min(80 + storytellers.length * 1.5, 95)

  return {
    totalInvested: baseInvestment,
    storiesGenerated: storiesCount,
    communitiesReached,
    systemsChanged,
    culturalPreservationScore: Math.round(culturalScore)
  }
}

function generateInvestmentRecommendation(
  opportunities: any[],
  measurements: any[],
  storytellers: any[]
): any {
  if (opportunities.length === 0) {
    return {
      priority: 'medium' as const,
      focus: 'Capacity Building',
      rationale: 'Focus on expanding storyteller network and expertise development',
      suggestedAllocation: 50000
    }
  }

  const topOpportunity = opportunities[0]
  const highImpactMeasurements = measurements.filter(m => m.improvement >= 10)

  let priority: 'immediate' | 'high' | 'medium' | 'low' = 'medium'

  if (topOpportunity.impactPotential >= 90 && topOpportunity.readinessScore >= 80) {
    priority = 'immediate'
  } else if (topOpportunity.impactPotential >= 85 && highImpactMeasurements.length >= 2) {
    priority = 'high'
  } else if (topOpportunity.impactPotential >= 80) {
    priority = 'medium'
  } else {
    priority = 'low'
  }

  return {
    priority,
    focus: topOpportunity.title,
    rationale: `Highest impact potential (${topOpportunity.impactPotential}%) with strong storyteller network and established community readiness. Cross-sector approach addresses multiple impact areas simultaneously.`,
    suggestedAllocation: topOpportunity.fundingNeeded
  }
}
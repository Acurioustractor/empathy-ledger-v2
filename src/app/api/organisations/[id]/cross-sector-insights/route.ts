// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    console.log(`🔍 Analyzing cross-sector insights for organisation: ${organizationId}`)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get organisation details
    const { data: organisation, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Simplified demo data for now
    const storytellers = [
      {
        id: '1',
        display_name: 'Benjamin Knight',
        impact_focus_areas: ['Indigenous Rights', 'Community Leadership'],
        expertise_areas: ['Community Organizing', 'Traditional Knowledge'],
        community_roles: ['Elder Advisor', 'Cultural Keeper'],
        change_maker_type: 'community_organizer',
        geographic_scope: 'regional'
      },
      {
        id: '2',
        display_name: 'Dr Boe Remenyi',
        impact_focus_areas: ['Climate Change', 'Environmental Justice'],
        expertise_areas: ['Climate Science', 'Research'],
        community_roles: ['Researcher', 'Climate Activist'],
        change_maker_type: 'innovator',
        geographic_scope: 'international'
      }
    ]

    const transcripts = [
      {
        storyteller_id: '1',
        metadata: {
          analysis: {
            themes: ['Indigenous Heritage', 'Community Connection', 'Traditional Knowledge']
          }
        }
      },
      {
        storyteller_id: '2',
        metadata: {
          analysis: {
            themes: ['Climate Action', 'Environmental Justice', 'Research Methods']
          }
        }
      }
    ]

    // Analyze cross-sector connections
    const crossSectorAnalysis = analyzeCrossSectorConnections(storytellers, transcripts)

    // Generate sector impact map
    const sectorImpactMap = generateSectorImpactMap(storytellers, transcripts)

    // Identify collaboration opportunities
    const collaborationOpportunities = identifyCollaborationOpportunities(storytellers, transcripts)

    // Calculate policy change potential
    const policyChangePotential = calculatePolicyChangePotential(storytellers, transcripts)

    // Generate investment insights
    const investmentInsights = generateInvestmentInsights(storytellers, transcripts)

    console.log(`✅ Cross-sector analysis completed for ${organisation.name}`)

    return NextResponse.json({
      success: true,
      organisation: {
        id: organizationId,
        name: organisation.name,
        tenantId: organisation.tenant_id
      },
      analysis: {
        totalStorytellers: storytellers?.length || 0,
        totalAnalyzedContent: transcripts?.length || 0,
        crossSectorConnections: crossSectorAnalysis,
        sectorImpactMap,
        collaborationOpportunities,
        policyChangePotential,
        investmentInsights
      }
    })

  } catch (error) {
    console.error('❌ Error analysing cross-sector insights:', error)
    return NextResponse.json(
      { error: 'Failed to analyse cross-sector insights' },
      { status: 500 }
    )
  }
}

// Analyze how storytellers connect across different sectors
function analyzeCrossSectorConnections(storytellers: any[], transcripts: any[]) {
  const sectorMap = new Map<string, Set<string>>() // sector -> storyteller ids
  const connectionMatrix = new Map<string, Map<string, number>>() // sector1 -> sector2 -> strength

  // Map storytellers to sectors based on their focus areas
  storytellers.forEach(storyteller => {
    const sectors = extractSectors(storyteller.impact_focus_areas || [])
    sectors.forEach(sector => {
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, new Set())
      }
      sectorMap.get(sector)!.add(storyteller.id)
    })
  })

  // Calculate cross-sector connection strength through shared themes
  const storytellerThemes = new Map<string, Set<string>>()

  transcripts.forEach(transcript => {
    if (transcript.metadata?.analysis?.themes) {
      const themes = new Set(transcript.metadata.analysis.themes.map((t: string) => t.toLowerCase()))
      storytellerThemes.set(transcript.storyteller_id, themes)
    }
  })

  // Build connection matrix
  Array.from(sectorMap.keys()).forEach(sector1 => {
    connectionMatrix.set(sector1, new Map())
    Array.from(sectorMap.keys()).forEach(sector2 => {
      if (sector1 !== sector2) {
        const strength = calculateSectorConnectionStrength(
          sector1, sector2, sectorMap, storytellerThemes
        )
        connectionMatrix.get(sector1)!.set(sector2, strength)
      }
    })
  })

  // Convert to array format
  const connections = []
  for (const [sector1, connections1] of connectionMatrix) {
    for (const [sector2, strength] of connections1) {
      if (strength > 0) {
        const sharedStorytellers = Array.from(sectorMap.get(sector1) || [])
          .filter(id => sectorMap.get(sector2)?.has(id))

        connections.push({
          sectors: [sector1, sector2],
          connectionStrength: strength,
          sharedStorytellers: sharedStorytellers.length,
          storytellerIds: sharedStorytellers
        })
      }
    }
  }

  return connections.sort((a, b) => b.connectionStrength - a.connectionStrength).slice(0, 10)
}

// Generate sector impact map showing storyteller distribution
function generateSectorImpactMap(storytellers: any[], transcripts: any[]) {
  const sectorData = new Map<string, {
    storytellerCount: number
    storytellers: string[]
    avgContentPerStoryteller: number
    topThemes: string[]
    changeMakerTypes: string[]
    geographicReach: string[]
  }>()

  storytellers.forEach(storyteller => {
    const sectors = extractSectors(storyteller.impact_focus_areas || [])

    sectors.forEach(sector => {
      if (!sectorData.has(sector)) {
        sectorData.set(sector, {
          storytellerCount: 0,
          storytellers: [],
          avgContentPerStoryteller: 0,
          topThemes: [],
          changeMakerTypes: [],
          geographicReach: []
        })
      }

      const data = sectorData.get(sector)!
      data.storytellerCount++
      data.storytellers.push(storyteller.display_name)

      if (storyteller.change_maker_type) {
        data.changeMakerTypes.push(storyteller.change_maker_type)
      }

      if (storyteller.geographic_scope) {
        data.geographicReach.push(storyteller.geographic_scope)
      }
    })
  })

  // Calculate content metrics
  transcripts.forEach(transcript => {
    if (transcript.metadata?.analysis?.themes) {
      const storyteller = storytellers.find(s => s.id === transcript.storyteller_id)
      if (storyteller) {
        const sectors = extractSectors(storyteller.impact_focus_areas || [])

        sectors.forEach(sector => {
          const data = sectorData.get(sector)
          if (data) {
            data.topThemes.push(...transcript.metadata.analysis.themes)
          }
        })
      }
    }
  })

  // Process and return sector map
  return Array.from(sectorData.entries()).map(([sector, data]) => ({
    sector,
    storytellerCount: data.storytellerCount,
    avgContentPerStoryteller: data.storytellerCount > 0 ?
      transcripts.filter(t => {
        const storyteller = storytellers.find(s => s.id === t.storyteller_id)
        return storyteller && extractSectors(storyteller.impact_focus_areas || []).includes(sector)
      }).length / data.storytellerCount : 0,
    topThemes: getTopItems(data.topThemes, 3),
    dominantChangeMakerTypes: getTopItems(data.changeMakerTypes, 2),
    geographicReach: [...new Set(data.geographicReach)],
    impactPotential: calculateSectorImpactPotential(data.storytellerCount, data.topThemes.length)
  })).sort((a, b) => b.storytellerCount - a.storytellerCount)
}

// Identify collaboration opportunities between sectors
function identifyCollaborationOpportunities(storytellers: any[], transcripts: any[]) {
  const opportunities = []

  // Find storytellers who work across multiple sectors
  const multisectorStorytellers = storytellers.filter(s =>
    extractSectors(s.impact_focus_areas || []).length > 1
  )

  multisectorStorytellers.forEach(storyteller => {
    const sectors = extractSectors(storyteller.impact_focus_areas || [])
    const storytellerTranscripts = transcripts.filter(t => t.storyteller_id === storyteller.id)

    if (storytellerTranscripts.length > 0 && sectors.length > 1) {
      const themes = storytellerTranscripts.flatMap(t =>
        t.metadata?.analysis?.themes || []
      )

      for (let i = 0; i < sectors.length; i++) {
        for (let j = i + 1; j < sectors.length; j++) {
          opportunities.push({
            sectors: [sectors[i], sectors[j]],
            storyteller: storyteller.display_name,
            storytellerId: storyteller.id,
            sharedThemes: getTopItems(themes, 3),
            collaborationType: determineCollaborationType(sectors[i], sectors[j]),
            potential: 'high',
            evidence: `${storyteller.display_name} actively works in both ${sectors[i]} and ${sectors[j]}`
          })
        }
      }
    }
  })

  return opportunities.slice(0, 8)
}

// Calculate policy change potential based on storyteller activities
function calculatePolicyChangePotential(storytellers: any[], transcripts: any[]) {
  const policyAreas = []

  // Identify storytellers with policy-relevant themes
  const policyKeywords = ['policy', 'government', 'legislation', 'advocacy', 'system change', 'reform']

  transcripts.forEach(transcript => {
    if (transcript.metadata?.analysis?.themes) {
      const policyThemes = transcript.metadata.analysis.themes.filter((theme: string) =>
        policyKeywords.some(keyword => theme.toLowerCase().includes(keyword))
      )

      if (policyThemes.length > 0) {
        const storyteller = storytellers.find(s => s.id === transcript.storyteller_id)
        if (storyteller) {
          const sectors = extractSectors(storyteller.impact_focus_areas || [])

          sectors.forEach(sector => {
            policyAreas.push({
              sector,
              themes: policyThemes,
              storyteller: storyteller.display_name,
              changeType: determineChangeType(policyThemes),
              urgency: determineUrgency(policyThemes),
              stakeholders: extractStakeholders(storyteller.community_roles || [])
            })
          })
        }
      }
    }
  })

  // Group by sector and calculate potential
  const sectorPolicyMap = new Map()
  policyAreas.forEach(area => {
    if (!sectorPolicyMap.has(area.sector)) {
      sectorPolicyMap.set(area.sector, {
        sector: area.sector,
        storytellerCount: new Set(),
        themes: [],
        urgencyLevels: [],
        changeTypes: [],
        stakeholders: []
      })
    }

    const data = sectorPolicyMap.get(area.sector)
    data.storytellerCount.add(area.storyteller)
    data.themes.push(...area.themes)
    data.urgencyLevels.push(area.urgency)
    data.changeTypes.push(area.changeType)
    data.stakeholders.push(...area.stakeholders)
  })

  return Array.from(sectorPolicyMap.values()).map(data => ({
    sector: data.sector,
    storytellerCount: data.storytellerCount.size,
    topThemes: getTopItems(data.themes, 3),
    urgency: getTopItems(data.urgencyLevels, 1)[0] || 'medium',
    changeType: getTopItems(data.changeTypes, 1)[0] || 'practice',
    stakeholders: [...new Set(data.stakeholders)],
    potential: data.storytellerCount.size > 2 ? 'high' : 'medium'
  })).sort((a, b) => b.storytellerCount - a.storytellerCount)
}

// Generate investment insights for philanthropists
function generateInvestmentInsights(storytellers: any[], transcripts: any[]) {
  const insights = {
    highImpactSectors: [],
    emergingOpportunities: [],
    readyForInvestment: [],
    systemChangeLevers: []
  }

  // Analyze sector readiness and impact potential
  const sectorAnalysis = new Map()

  storytellers.forEach(storyteller => {
    const sectors = extractSectors(storyteller.impact_focus_areas || [])

    sectors.forEach(sector => {
      if (!sectorAnalysis.has(sector)) {
        sectorAnalysis.set(sector, {
          storytellers: [],
          changeMakerTypes: [],
          geographicScopes: [],
          contentVolume: 0,
          leadershipCapacity: 0
        })
      }

      const analysis = sectorAnalysis.get(sector)
      analysis.storytellers.push(storyteller)
      analysis.changeMakerTypes.push(storyteller.change_maker_type)
      analysis.geographicScopes.push(storyteller.geographic_scope)

      // Calculate leadership capacity
      if (storyteller.community_roles?.length > 0) {
        analysis.leadershipCapacity += storyteller.community_roles.length
      }
    })
  })

  // Calculate content volume per sector
  transcripts.forEach(transcript => {
    const storyteller = storytellers.find(s => s.id === transcript.storyteller_id)
    if (storyteller) {
      const sectors = extractSectors(storyteller.impact_focus_areas || [])
      sectors.forEach(sector => {
        const analysis = sectorAnalysis.get(sector)
        if (analysis) {
          analysis.contentVolume++
        }
      })
    }
  })

  // Generate insights
  Array.from(sectorAnalysis.entries()).forEach(([sector, analysis]) => {
    const readinessScore = calculateReadinessScore(analysis)
    const impactPotential = calculateSectorImpactPotential(analysis.storytellers.length, analysis.contentVolume)

    if (impactPotential > 70) {
      insights.highImpactSectors.push({
        sector,
        impactPotential,
        storytellerCount: analysis.storytellers.length,
        evidence: `${analysis.storytellers.length} active storytellers with ${analysis.contentVolume} pieces of analysed content`
      })
    }

    if (readinessScore > 60) {
      insights.readyForInvestment.push({
        sector,
        readinessScore,
        leadershipCapacity: analysis.leadershipCapacity,
        requiredInvestment: determineInvestmentSize(analysis.storytellers.length),
        timeToImpact: 'medium'
      })
    }
  })

  return insights
}

// Helper functions
function extractSectors(focusAreas: string[]): string[] {
  const sectorKeywords = {
    'Education': ['education', 'learning', 'teaching', 'school'],
    'Health': ['health', 'healthcare', 'medical', 'wellness', 'healing'],
    'Justice': ['justice', 'legal', 'criminal justice', 'law'],
    'Environment': ['environment', 'climate', 'conservation', 'sustainability'],
    'Housing': ['housing', 'shelter', 'homelessness'],
    'Economic Development': ['economic', 'employment', 'jobs', 'business'],
    'Cultural Preservation': ['cultural', 'heritage', 'traditional', 'indigenous'],
    'Social Services': ['social services', 'community services', 'support']
  }

  const sectors = new Set<string>()

  focusAreas.forEach(area => {
    const areaLower = area.toLowerCase()
    Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
      if (keywords.some(keyword => areaLower.includes(keyword))) {
        sectors.add(sector)
      }
    })
  })

  return Array.from(sectors)
}

function calculateSectorConnectionStrength(
  sector1: string,
  sector2: string,
  sectorMap: Map<string, Set<string>>,
  storytellerThemes: Map<string, Set<string>>
): number {
  const storytellers1 = sectorMap.get(sector1) || new Set()
  const storytellers2 = sectorMap.get(sector2) || new Set()

  let sharedThemeCount = 0
  let totalComparisons = 0

  storytellers1.forEach(id1 => {
    storytellers2.forEach(id2 => {
      if (id1 !== id2) {
        const themes1 = storytellerThemes.get(id1) || new Set()
        const themes2 = storytellerThemes.get(id2) || new Set()

        const intersection = new Set([...themes1].filter(x => themes2.has(x)))
        sharedThemeCount += intersection.size
        totalComparisons++
      }
    })
  })

  return totalComparisons > 0 ? Math.round((sharedThemeCount / totalComparisons) * 100) : 0
}

function getTopItems(items: string[], count: number): string[] {
  const frequency = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, count)
    .map(([item]) => item)
}

function calculateSectorImpactPotential(storytellerCount: number, contentVolume: number): number {
  return Math.min((storytellerCount * 20) + (contentVolume * 2), 100)
}

function determineCollaborationType(sector1: string, sector2: string): string {
  const types = ['policy_advocacy', 'service_integration', 'resource_sharing', 'joint_programming']
  return types[Math.floor(Math.random() * types.length)]
}

function determineChangeType(themes: string[]): string {
  if (themes.some(t => t.includes('policy'))) return 'policy'
  if (themes.some(t => t.includes('practice'))) return 'practice'
  if (themes.some(t => t.includes('funding'))) return 'funding'
  return 'culture'
}

function determineUrgency(themes: string[]): string {
  if (themes.some(t => t.includes('crisis') || t.includes('urgent'))) return 'critical'
  if (themes.some(t => t.includes('immediate'))) return 'high'
  return 'medium'
}

function extractStakeholders(roles: string[]): string[] {
  return roles.map(role => role.replace(/[^a-zA-Z\s]/g, '').trim()).filter(Boolean)
}

function calculateReadinessScore(analysis: any): number {
  const storytellerScore = Math.min(analysis.storytellers.length * 20, 60)
  const leadershipScore = Math.min(analysis.leadershipCapacity * 10, 30)
  const contentScore = Math.min(analysis.contentVolume * 2, 10)

  return storytellerScore + leadershipScore + contentScore
}

function determineInvestmentSize(storytellerCount: number): string {
  if (storytellerCount > 5) return 'large'
  if (storytellerCount > 2) return 'medium'
  return 'small'
}
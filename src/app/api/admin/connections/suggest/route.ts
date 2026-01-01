// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



/**
 * EMPATHY LEDGER - INTELLIGENT CONNECTION SUGGESTION ENGINE
 *
 * This API uses sophisticated algorithms to suggest meaningful connections
 * between storytellers and organisations/projects based on:
 * - Cultural alignment
 * - Geographical proximity
 * - Skill compatibility
 * - Elder wisdom networks
 * - Community needs
 */

interface ConnectionSuggestion {
  targetId: string
  targetName: string
  targetType: 'organisation' | 'project'
  matchScore: number
  matchReasons: string[]
  suggestedRole: string
  culturalAlignment: boolean
  geographicalProximity: boolean
  skillMatch: boolean
  priorityLevel: 'high' | 'medium' | 'low'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')

    if (!storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID required' }, { status: 400 })
    }

    console.log('🧠 Generating intelligent connection suggestions for:', storytellerId)

    // Get storyteller profile with full context
    const { data: storyteller, error: storytellerError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_locations!left(
          location:locations(name, city, state, country)
        ),
        profile_organizations!left(
          organisation:organizations(id, name)
        ),
        profile_projects!left(
          project:projects(id, name)
        )
      `)
      .eq('id', storytellerId)
      .single()

    if (storytellerError || !storyteller) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 })
    }

    // Get all available organisations and projects
    const [organisations, projects] = await Promise.all([
      supabase
        .from('organizations')
        .select(`
          id,
          name,
          type,
          location,
          cultural_significance,
          description,
          tenant_id
        `),

      supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          description,
          organization_id,
          organisation:organizations(name, type, cultural_significance)
        `)
        .eq('status', 'active')
    ])

    if (organisations.error || projects.error) {
      throw new Error('Failed to fetch organisations or projects')
    }

    // Generate intelligent suggestions
    const orgSuggestions = await generateOrganizationSuggestions(
      storyteller,
      organisations.data || []
    )

    const projectSuggestions = await generateProjectSuggestions(
      storyteller,
      projects.data || []
    )

    // Combine and rank all suggestions
    const allSuggestions = [...orgSuggestions, ...projectSuggestions]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10) // Top 10 suggestions

    return NextResponse.json({
      storyteller: {
        id: storyteller.id,
        name: storyteller.display_name,
        cultural_background: storyteller.cultural_background,
        location: extractLocationString(storyteller.profile_locations)
      },
      suggestions: allSuggestions,
      summary: {
        total_suggestions: allSuggestions.length,
        high_priority: allSuggestions.filter(s => s.priorityLevel === 'high').length,
        cultural_matches: allSuggestions.filter(s => s.culturalAlignment).length,
        geographical_matches: allSuggestions.filter(s => s.geographicalProximity).length
      },
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Suggestion generation failed:', error)
    return NextResponse.json({
      error: 'Failed to generate suggestions',
      code: 'SUGGESTION_FAILED'
    }, { status: 500 })
  }
}

async function generateOrganizationSuggestions(
  storyteller: any,
  organisations: any[]
): Promise<ConnectionSuggestion[]> {

  // Get existing organisation connections to avoid duplicates
  const existingOrgIds = (storyteller.profile_organizations || [])
    .map((conn: any) => conn.organisation?.id)
    .filter(Boolean)

  return organisations
    .filter(org => !existingOrgIds.includes(org.id))
    .map(org => {
      const matchData = calculateOrganizationMatch(storyteller, org)

      return {
        targetId: org.id,
        targetName: org.name,
        targetType: 'organisation' as const,
        matchScore: matchData.score,
        matchReasons: matchData.reasons,
        suggestedRole: matchData.suggestedRole,
        culturalAlignment: matchData.culturalAlignment,
        geographicalProximity: matchData.geographicalProximity,
        skillMatch: matchData.skillMatch,
        priorityLevel: (matchData.score >= 80 ? 'high' :
                      matchData.score >= 60 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }
    })
    .filter(suggestion => suggestion.matchScore > 30) // Only meaningful matches
}

async function generateProjectSuggestions(
  storyteller: any,
  projects: any[]
): Promise<ConnectionSuggestion[]> {

  // Get existing project connections to avoid duplicates
  const existingProjectIds = (storyteller.profile_projects || [])
    .map((conn: any) => conn.project?.id)
    .filter(Boolean)

  return projects
    .filter(project => !existingProjectIds.includes(project.id))
    .map(project => {
      const matchData = calculateProjectMatch(storyteller, project)

      return {
        targetId: project.id,
        targetName: project.name,
        targetType: 'project' as const,
        matchScore: matchData.score,
        matchReasons: matchData.reasons,
        suggestedRole: matchData.suggestedRole,
        culturalAlignment: matchData.culturalAlignment,
        geographicalProximity: matchData.geographicalProximity,
        skillMatch: matchData.skillMatch,
        priorityLevel: (matchData.score >= 80 ? 'high' :
                      matchData.score >= 60 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }
    })
    .filter(suggestion => suggestion.matchScore > 30)
}

function calculateOrganizationMatch(storyteller: any, organisation: any) {
  let score = 0
  const reasons: string[] = []
  let culturalAlignment = false
  let geographicalProximity = false
  let skillMatch = false

  // Cultural alignment (high weight)
  if (storyteller.cultural_background && organisation.cultural_significance) {
    const storytellerCulture = storyteller.cultural_background.toLowerCase()
    const orgCulture = organisation.cultural_significance.toLowerCase()

    if (storytellerCulture.includes(orgCulture) || orgCulture.includes(storytellerCulture)) {
      score += 40
      reasons.push('Strong cultural alignment')
      culturalAlignment = true
    }
  }

  // Geographical proximity
  const storytellerLocation = extractLocationString(storyteller.profile_locations)
  if (storytellerLocation && organisation.location) {
    if (isGeographicallyClose(storytellerLocation, organisation.location)) {
      score += 25
      reasons.push('Geographical proximity')
      geographicalProximity = true
    }
  }

  // Elder wisdom recognition
  if (storyteller.is_elder && organisation.type === 'community') {
    score += 30
    reasons.push('Elder wisdom valuable to community organisation')
  }

  // Organization type matching
  if (storyteller.cultural_background) {
    if (organisation.type === 'community' || organisation.type === 'cultural_center') {
      score += 15
      reasons.push('Community-focused organisation aligns with cultural background')
    }
  }

  // Determine suggested role
  let suggestedRole = 'member'
  if (storyteller.is_elder) {
    suggestedRole = 'elder'
  } else if (culturalAlignment && score > 60) {
    suggestedRole = 'cultural_advisor'
  } else if (geographicalProximity && score > 50) {
    suggestedRole = 'collaborator'
  }

  return {
    score: Math.min(100, score),
    reasons,
    suggestedRole,
    culturalAlignment,
    geographicalProximity,
    skillMatch: false // Can be enhanced with skills data
  }
}

function calculateProjectMatch(storyteller: any, project: any) {
  let score = 0
  const reasons: string[] = []
  let culturalAlignment = false
  let geographicalProximity = false
  let skillMatch = false

  // Project name and description analysis
  const projectText = `${project.name} ${project.description || ''}`.toLowerCase()
  const storytellerCulture = (storyteller.cultural_background || '').toLowerCase()

  // Cultural project matching
  if (storytellerCulture && projectText.includes('cultural') ||
      projectText.includes('traditional') || projectText.includes('heritage')) {
    score += 35
    reasons.push('Cultural preservation project aligns with background')
    culturalAlignment = true
  }

  // Story/narrative projects
  if (projectText.includes('story') || projectText.includes('voice') ||
      projectText.includes('narrative') || projectText.includes('archive')) {
    score += 30
    reasons.push('Storytelling project matches storyteller role')
    skillMatch = true
  }

  // Community projects
  if (projectText.includes('community') || projectText.includes('healing') ||
      projectText.includes('support')) {
    score += 20
    reasons.push('Community-focused project')
  }

  // Elder involvement in wisdom projects
  if (storyteller.is_elder && (projectText.includes('traditional') ||
      projectText.includes('wisdom') || projectText.includes('elder'))) {
    score += 35
    reasons.push('Elder wisdom crucial for traditional knowledge project')
  }

  // Determine suggested role
  let suggestedRole = 'participant'
  if (storyteller.is_elder && culturalAlignment) {
    suggestedRole = 'cultural_guide'
  } else if (skillMatch && score > 60) {
    suggestedRole = 'storyteller'
  } else if (culturalAlignment) {
    suggestedRole = 'contributor'
  }

  return {
    score: Math.min(100, score),
    reasons,
    suggestedRole,
    culturalAlignment,
    geographicalProximity: false, // Projects are less location-dependent
    skillMatch
  }
}

function extractLocationString(profileLocations: any[]): string | null {
  if (!profileLocations || profileLocations.length === 0) return null

  const primaryLocation = profileLocations.find(l => l.is_primary) || profileLocations[0]
  if (!primaryLocation?.location) return null

  const loc = primaryLocation.location
  return `${loc.name || ''} ${loc.city || ''} ${loc.state || ''} ${loc.country || ''}`.trim()
}

function isGeographicallyClose(location1: string, location2: string): boolean {
  // Simple geographical matching - can be enhanced with proper geolocation
  const loc1 = location1.toLowerCase()
  const loc2 = location2.toLowerCase()

  // Check for state/territory matches
  const states = ['nt', 'northern territory', 'qld', 'queensland', 'nsw', 'new south wales',
                  'vic', 'victoria', 'wa', 'western australia', 'sa', 'south australia',
                  'tas', 'tasmania', 'act']

  for (const state of states) {
    if (loc1.includes(state) && loc2.includes(state)) {
      return true
    }
  }

  return false
}
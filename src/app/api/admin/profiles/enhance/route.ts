import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { ProfileEnhancementAnalyzer } from '@/lib/ai/profile-enhancement-analyzer'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { storytellerId, bulkMode = false, tenantId } = await request.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`🔍 AI Profile Enhancement Analysis - ${bulkMode ? 'Bulk Mode' : 'Single Profile'}`)

    if (bulkMode && tenantId) {
      // Bulk analysis for organisation
      return await performBulkAnalysis(supabase, tenantId)
    } else if (storytellerId) {
      // Single profile analysis
      return await performSingleAnalysis(supabase, storytellerId)
    } else {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error in profile enhancement:', error)
    return NextResponse.json(
      { error: 'Failed to analyse profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function performSingleAnalysis(supabase: any, storytellerId: string) {
  console.log(`🧠 Analyzing single profile: ${storytellerId}`)

  // Get storyteller profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', storytellerId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Storyteller not found' },
      { status: 404 }
    )
  }

  // Get storyteller's content
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('*')
    .eq('storyteller_id', storytellerId)
    .limit(10)

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('storyteller_id', storytellerId)
    .limit(10)

  // Perform AI analysis
  const analysis = await ProfileEnhancementAnalyzer.analyzeProfile(
    profile,
    transcripts || [],
    stories || []
  )

  console.log(`✅ Analysis complete for ${profile.display_name}: ${analysis.completenessScore}% complete`)

  return NextResponse.json({
    success: true,
    analysis,
    storyteller: {
      id: storytellerId,
      name: profile.display_name,
      currentCompleteness: analysis.completenessScore
    }
  })
}

async function performBulkAnalysis(supabase: any, tenantId: string) {
  console.log(`🏢 Performing bulk analysis for tenant: ${tenantId}`)

  // Get all storytellers in the tenant
  const { data: storytellers, error: storytellersError } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .contains('tenant_roles', ['storyteller'])
    .limit(20) // Limit for performance

  if (storytellersError || !storytellers) {
    return NextResponse.json(
      { error: 'Failed to fetch storytellers' },
      { status: 500 }
    )
  }

  console.log(`👥 Found ${storytellers.length} storytellers to analyse`)

  // Generate bulk suggestions
  const bulkSuggestions = await ProfileEnhancementAnalyzer.generateBulkSuggestions(storytellers)

  // Calculate summary statistics
  const totalSuggestions = bulkSuggestions.reduce(
    (total, result) => total + result.suggestions.length, 0
  )

  const avgCompleteness = Math.round(
    storytellers.reduce((total: number, storyteller: any) => {
      const missingFields = countMissingFields(storyteller)
      return total + ((10 - missingFields) / 10 * 100)
    }, 0) / storytellers.length
  )

  const priorityProfiles = bulkSuggestions
    .filter(result => result.suggestions.length >= 3)
    .sort((a, b) => b.suggestions.length - a.suggestions.length)
    .slice(0, 10)

  console.log(`✅ Bulk analysis complete: ${totalSuggestions} suggestions for ${storytellers.length} storytellers`)

  return NextResponse.json({
    success: true,
    summary: {
      totalStorytellers: storytellers.length,
      totalSuggestions,
      avgCompleteness,
      priorityProfilesCount: priorityProfiles.length
    },
    bulkSuggestions,
    priorityProfiles: priorityProfiles.map(result => {
      const storyteller = storytellers.find((s: any) => s.id === result.storytellerId)
      return {
        storytellerId: result.storytellerId,
        name: storyteller?.display_name,
        suggestionsCount: result.suggestions.length,
        topSuggestions: result.suggestions.slice(0, 3)
      }
    })
  })
}

// Helper function to count missing profile fields
function countMissingFields(profile: any): number {
  const fields = [
    'cultural_background',
    'specialties',
    'expertise_areas',
    'preferred_topics',
    'storytelling_style',
    'community_roles',
    'impact_focus_areas',
    'languages',
    'years_of_experience',
    'cultural_affiliations'
  ]

  return fields.filter(field => {
    const value = profile[field]
    return !value ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'string' && value.trim().length === 0)
  }).length
}

// GET endpoint for fetching existing enhancement suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storytellerId')
    const tenantId = searchParams.get('tenantId')

    if (!storytellerId && !tenantId) {
      return NextResponse.json(
        { error: 'Missing storytellerId or tenantId parameter' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (storytellerId) {
      // Return single profile analysis
      return await performSingleAnalysis(supabase, storytellerId)
    } else if (tenantId) {
      // Return bulk analysis summary
      return await performBulkAnalysis(supabase, tenantId)
    }

  } catch (error) {
    console.error('❌ Error fetching enhancement suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
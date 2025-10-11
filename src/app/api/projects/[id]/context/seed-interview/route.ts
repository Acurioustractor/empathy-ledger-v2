import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractProjectProfile } from '@/lib/ai/project-profile-extractor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Process seed interview and extract project profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()

    const {
      interview_transcript,
      interview_audio_url,
      interviewed_by
    } = body

    if (!interview_transcript) {
      return NextResponse.json(
        { error: 'Interview transcript is required' },
        { status: 400 }
      )
    }

    // Get project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    console.log(`🎙️  Processing seed interview for project: ${project.name}`)

    // Step 1: Save raw interview
    const { data: interview, error: interviewError } = await supabase
      .from('project_seed_interviews')
      .upsert({
        project_id: projectId,
        interview_transcript,
        interview_audio_url,
        interviewed_by,
        interview_date: new Date().toISOString()
      }, {
        onConflict: 'project_id'
      })
      .select()
      .single()

    if (interviewError) {
      return NextResponse.json(
        { error: interviewError.message },
        { status: 500 }
      )
    }

    console.log('📝 Interview saved, extracting profile with AI...')

    // Step 2: Extract project profile using AI
    const profile = await extractProjectProfile(interview_transcript, project.name)

    console.log(`✅ Profile extracted (completeness: ${profile.completeness_score}/100)`)

    // Step 3: Save extracted profile
    const { data: savedProfile, error: profileError } = await supabase
      .from('project_profiles')
      .upsert({
        project_id: projectId,
        mission: profile.mission,
        primary_goals: profile.primary_goals,
        target_population: profile.target_population,
        origin_story: profile.origin_story,
        community_need: profile.community_need,
        who_initiated: profile.who_initiated,
        program_model: profile.program_model,
        key_activities: profile.key_activities,
        cultural_approaches: profile.cultural_approaches,
        cultural_protocols: profile.cultural_protocols,
        outcome_categories: profile.outcome_categories,
        short_term_outcomes: profile.short_term_outcomes,
        medium_term_outcomes: profile.medium_term_outcomes,
        long_term_outcomes: profile.long_term_outcomes,
        success_indicators: profile.success_indicators,
        positive_language: profile.positive_language,
        challenge_language: profile.challenge_language,
        transformation_markers: profile.transformation_markers,
        individual_impact: profile.individual_impact,
        family_impact: profile.family_impact,
        community_impact: profile.community_impact,
        systems_impact: profile.systems_impact,
        cultural_values: profile.cultural_values,
        cultural_considerations: profile.cultural_considerations,
        engagement_principles: profile.engagement_principles,
        sustainability_plan: profile.sustainability_plan,
        completeness_score: profile.completeness_score,
        last_reviewed_at: new Date().toISOString()
      }, {
        onConflict: 'project_id'
      })
      .select()
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    // Step 4: Update project context model
    await supabase
      .from('projects')
      .update({
        context_model: 'full',
        context_updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    console.log('💾 Project profile saved successfully')

    return NextResponse.json({
      success: true,
      message: 'Seed interview processed and profile extracted',
      interview,
      profile: savedProfile
    })
  } catch (error: any) {
    console.error('Error processing seed interview:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Retrieve seed interview and profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const { data: interview } = await supabase
      .from('project_seed_interviews')
      .select('*')
      .eq('project_id', projectId)
      .single()

    const { data: profile } = await supabase
      .from('project_profiles')
      .select('*')
      .eq('project_id', projectId)
      .single()

    return NextResponse.json({
      interview,
      profile
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update and re-extract profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()

    const { interview_transcript } = body

    // Get project name
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update interview
    await supabase
      .from('project_seed_interviews')
      .update({
        interview_transcript,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)

    // Re-extract profile
    const profile = await extractProjectProfile(interview_transcript, project.name)

    // Update profile
    const { data: savedProfile } = await supabase
      .from('project_profiles')
      .update({
        ...profile,
        last_reviewed_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: 'Interview and profile updated',
      profile: savedProfile
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

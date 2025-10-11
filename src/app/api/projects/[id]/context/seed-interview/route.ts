// Project Seed Interview API
// Processes seed interview responses and extracts structured context using AI

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createLLMClient } from '@/lib/ai/llm-client'

interface SeedInterviewResponse {
  question_id: string
  question: string
  answer: string
}

/**
 * GET /api/projects/[id]/context/seed-interview
 * Retrieve the seed interview template (14 questions)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Return the standard 14-question seed interview template
    return NextResponse.json({
      template_type: 'project_full_setup',
      questions: [
        {
          id: 'project_overview',
          text: 'What is this project trying to achieve? What are the main goals?',
          section: 'Overview',
          required: true,
          help_text: 'Describe the overall purpose and primary objectives of the project.'
        },
        {
          id: 'community_need',
          text: 'What community need or opportunity does this project address?',
          section: 'Context',
          required: true,
          help_text: 'Explain why this project exists and what gap it fills.'
        },
        {
          id: 'target_population',
          text: 'Who are you working with? Describe the communities and individuals involved.',
          section: 'Who',
          required: true,
          help_text: 'Be specific about the people, communities, or groups this project serves.'
        },
        {
          id: 'expected_outcomes',
          text: 'What specific outcomes do you expect to see? (e.g., "Improved sleep quality", "Stronger family connections")',
          section: 'Outcomes',
          required: true,
          help_text: 'List concrete, measurable outcomes you hope to achieve.'
        },
        {
          id: 'success_indicators',
          text: 'How will you know if the project is successful? What will you see or hear?',
          section: 'Success',
          required: true,
          help_text: 'Describe observable indicators that show the project is working.'
        },
        {
          id: 'timeframe',
          text: 'What is the timeframe for this project? When do you expect to see results?',
          section: 'Timeline',
          required: false,
          help_text: 'Include short-term (months), medium-term (1-2 years), and long-term (3+ years) outcomes if applicable.'
        },
        {
          id: 'program_model',
          text: 'How does the project work? What is your approach or methodology?',
          section: 'Approach',
          required: true,
          help_text: 'Describe the key activities, methods, or strategies you use.'
        },
        {
          id: 'cultural_approaches',
          text: 'Are there specific cultural practices, protocols, or approaches you use?',
          section: 'Cultural Context',
          required: false,
          help_text: 'Describe any cultural frameworks, ceremonies, or community protocols integral to the work.'
        },
        {
          id: 'key_activities',
          text: 'What are the main activities or services you provide?',
          section: 'Activities',
          required: true,
          help_text: 'List the core activities that make up this project.'
        },
        {
          id: 'community_involvement',
          text: 'How are community members involved in decision-making and leadership?',
          section: 'Community Voice',
          required: false,
          help_text: 'Describe how the community shapes and guides the project.'
        },
        {
          id: 'unique_aspects',
          text: 'What makes this project unique or different from other similar initiatives?',
          section: 'Uniqueness',
          required: false,
          help_text: 'Highlight what sets this project apart.'
        },
        {
          id: 'challenges',
          text: 'What are the main challenges or barriers you face?',
          section: 'Challenges',
          required: false,
          help_text: 'Describe obstacles that might affect project outcomes.'
        },
        {
          id: 'support_needed',
          text: 'What support or resources would help this project succeed?',
          section: 'Support',
          required: false,
          help_text: 'Identify gaps in funding, staffing, equipment, or other resources.'
        },
        {
          id: 'long_term_vision',
          text: 'What is your long-term vision? Where do you see this project in 5-10 years?',
          section: 'Vision',
          required: false,
          help_text: 'Describe your aspirational goals and the lasting change you hope to create.'
        }
      ]
    })
  } catch (error) {
    console.error('Error in GET /api/projects/[id]/context/seed-interview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/projects/[id]/context/seed-interview
 * Process seed interview responses and extract context
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Development mode bypass - skip all auth checks
    const isDevelopment = process.env.NODE_ENV === 'development'
    const devBypass = isDevelopment && process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL

    if (!devBypass) {
      // Production: require authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get project to check organization membership
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('organization_id, name')
        .eq('id', projectId)
        .single()

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      // Verify user is admin or project manager
      const { data: membership, error: memberError } = await supabase
        .from('profile_organizations')
        .select('role')
        .eq('profile_id', user.id)
        .eq('organization_id', project.organization_id)
        .eq('is_active', true)
        .single()

      if (memberError || !membership || !['admin', 'project_manager'].includes(membership.role)) {
        return NextResponse.json({ error: 'Must be admin or project manager' }, { status: 403 })
      }
    } else {
      console.log('🔓 DEV MODE: Bypassing auth checks for seed interview API')
    }

    // Get project info (needed regardless of auth mode)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id, name')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse request body
    const { responses } = await request.json() as { responses: SeedInterviewResponse[] }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Interview responses are required' }, { status: 400 })
    }

    // Format responses as text for AI
    const interviewText = responses.map(r =>
      `Q: ${r.question}\nA: ${r.answer}`
    ).join('\n\n')

    // Use AI to extract structured context
    const llm = createLLMClient()

    const systemPrompt = `You are an expert at analyzing project descriptions and extracting structured context.
Extract the following information from the seed interview responses:

1. Purpose: What the project is trying to achieve (1-2 sentences)
2. Context: Why the project exists - community need, opportunity (2-3 sentences)
3. Target Population: Who they're working with (1-2 sentences)
4. Expected Outcomes: JSONB array with structure:
   [
     {
       "category": "Sleep Quality",
       "description": "Improved sleep and dignity for families",
       "indicators": ["Fewer people sleeping on floors", "Reduced health issues"],
       "timeframe": "short_term" | "medium_term" | "long_term"
     }
   ]
5. Success Criteria: Array of strings - how they'll know they succeeded
6. Timeframe: Project duration/phases (string)
7. Program Model: How the project works (2-3 paragraphs)
8. Cultural Approaches: Array of cultural practices/protocols mentioned
9. Key Activities: Array of main activities/services

Be culturally sensitive and preserve Indigenous terminology exactly as stated.
Extract outcomes from Q2 (success definition) and Q5 (how you'll know) - these are CRITICAL for outcomes tracking.
Return ONLY valid JSON with these exact keys: purpose, context, target_population, expected_outcomes, success_criteria, timeframe, program_model, cultural_approaches, key_activities, extraction_quality_score (0-100 based on completeness)`

    const userPrompt = `Project Name: ${project.name}\n\nExtract structured context from this project seed interview:\n\n${interviewText}`

    console.log(`🧠 Extracting project context from seed interview for: ${project.name}`)

    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 3000,
      responseFormat: 'json'
    })

    const extracted = JSON.parse(response)

    // Store the context in database
    const contextData = {
      project_id: projectId,
      organization_id: project.organization_id,
      purpose: extracted.purpose,
      context: extracted.context,
      target_population: extracted.target_population,
      expected_outcomes: extracted.expected_outcomes,
      success_criteria: extracted.success_criteria,
      timeframe: extracted.timeframe,
      program_model: extracted.program_model,
      cultural_approaches: extracted.cultural_approaches,
      key_activities: extracted.key_activities,
      seed_interview_text: interviewText, // Store raw responses for reference
      context_type: 'full',
      ai_extracted: true,
      extraction_quality_score: extracted.extraction_quality_score,
      ai_model_used: process.env.LLM_PROVIDER === 'ollama' ? 'ollama-llama3.1:8b' : 'openai-gpt-4o-mini',
      created_by: user.id,
      last_updated_by: user.id
    }

    // Check if context already exists
    const { data: existing } = await supabase
      .from('project_contexts')
      .select('id')
      .eq('project_id', projectId)
      .single()

    let context
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('project_contexts')
        .update(contextData)
        .eq('project_id', projectId)
        .select()
        .single()

      if (error) {
        throw error
      }
      context = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('project_contexts')
        .insert(contextData)
        .select()
        .single()

      if (error) {
        throw error
      }
      context = data
    }

    return NextResponse.json({
      success: true,
      context,
      extracted,
      message: existing ? 'Context updated from seed interview' : 'Context created from seed interview'
    }, { status: existing ? 200 : 201 })

  } catch (error) {
    console.error('Error processing project seed interview:', error)
    return NextResponse.json({
      error: 'Failed to process seed interview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/projects/[id]/context/seed-interview/template
 * Get the default seed interview template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project to check organization membership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user is member
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', project.organization_id)
      .eq('is_active', true)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Get default project template
    const { data: template, error: templateError } = await supabase
      .from('seed_interview_templates')
      .select('*')
      .eq('template_type', 'project')
      .eq('is_default', true)
      .eq('is_active', true)
      .single()

    if (templateError) {
      console.error('Error fetching seed interview template:', templateError)
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({
      template
    })

  } catch (error) {
    console.error('Error in GET /api/projects/[id]/context/seed-interview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

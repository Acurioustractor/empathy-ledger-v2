// Organization Seed Interview API
// Processes seed interview responses and extracts structured context using AI

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

import { createLLMClient } from '@/lib/ai/llm-client'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


interface SeedInterviewResponse {
  question_id: string
  question: string
  answer: string
}

/**
 * POST /api/organizations/[id]/context/seed-interview
 * Process seed interview responses and extract context
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (memberError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Must be organization admin' }, { status: 403 })
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

    const systemPrompt = `You are an expert at analyzing organization descriptions and extracting structured context.
Extract the following information from the seed interview responses:

1. Mission: The organization's core purpose (1-2 sentences)
2. Vision: The world they're working toward (1-2 sentences)
3. Values: Array of core values (3-5 items)
4. Approach Description: How they work and what makes them unique (2-3 paragraphs)
5. Cultural Frameworks: Array of cultural practices/protocols mentioned (e.g., "Dadirri", "Two-way learning", "OCAP principles")
6. Key Principles: Array of operating principles
7. Impact Philosophy: Their theory of change (2-3 paragraphs)
8. Impact Domains: Object with keys for individual, family, community, systems - each with array of focus areas
9. Measurement Approach: How they know they're making a difference (1-2 paragraphs)

Be culturally sensitive and preserve Indigenous terminology and concepts exactly as stated.
Return ONLY valid JSON with these exact keys: mission, vision, values, approach_description, cultural_frameworks, key_principles, impact_philosophy, impact_domains, measurement_approach, extraction_quality_score (0-100 based on completeness)`

    const userPrompt = `Extract structured context from this organization seed interview:\n\n${interviewText}`

    console.log('🧠 Extracting organization context from seed interview...')

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
      organization_id: organizationId,
      mission: extracted.mission,
      vision: extracted.vision,
      values: extracted.values,
      approach_description: extracted.approach_description,
      cultural_frameworks: extracted.cultural_frameworks,
      key_principles: extracted.key_principles,
      impact_philosophy: extracted.impact_philosophy,
      impact_domains: extracted.impact_domains,
      measurement_approach: extracted.measurement_approach,
      seed_interview_responses: responses, // Store raw responses for reference
      context_type: 'seed_interview',
      extraction_quality_score: extracted.extraction_quality_score,
      ai_model_used: process.env.LLM_PROVIDER === 'ollama' ? 'ollama-llama3.1:8b' : 'openai-gpt-4o-mini',
      created_by: user.id,
      last_updated_by: user.id
    }

    // Check if context already exists
    const { data: existing } = await supabase
      .from('organization_contexts')
      .select('id')
      .eq('organization_id', organizationId)
      .single()

    let context
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('organization_contexts')
        .update(contextData)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) {
        throw error
      }
      context = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('organization_contexts')
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
    console.error('Error processing organization seed interview:', error)
    return NextResponse.json({
      error: 'Failed to process seed interview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/organizations/[id]/context/seed-interview/template
 * Get the default seed interview template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member
    const { data: membership, error: memberError } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('profile_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Get default organization template
    const { data: template, error: templateError } = await supabase
      .from('seed_interview_templates')
      .select('*')
      .eq('template_type', 'organization')
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
    console.error('Error in GET /api/organizations/[id]/context/seed-interview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

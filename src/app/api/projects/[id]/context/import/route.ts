// Project Context Import API
// Import context from existing documents (Project Plans, Logic Models, etc.)

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createLLMClient } from '@/lib/ai/llm-client'

/**
 * POST /api/projects/[id]/context/import
 * Import project context from existing document text
 */
export async function POST(
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

    // Parse request body
    const { document_text, document_type } = await request.json()

    if (!document_text || typeof document_text !== 'string') {
      return NextResponse.json({ error: 'Document text is required' }, { status: 400 })
    }

    if (document_text.length < 100) {
      return NextResponse.json({ error: 'Document text too short (minimum 100 characters)' }, { status: 400 })
    }

    if (document_text.length > 50000) {
      return NextResponse.json({ error: 'Document text too long (maximum 50,000 characters)' }, { status: 400 })
    }

    // Use AI to extract structured context from document
    const llm = createLLMClient()

    const systemPrompt = `You are an expert at analyzing project documents and extracting structured context.

The user will provide a project document (Logic Model, Theory of Change, Project Plan, etc.).
Extract the following information:

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

Guidelines:
- Only extract information that is explicitly stated or clearly implied
- Preserve Indigenous terminology exactly as written
- If a field cannot be determined, return null or empty array
- Be culturally sensitive and respectful
- Focus on EXPECTED outcomes (what they hope to achieve), not past achievements

Return ONLY valid JSON with these exact keys: purpose, context, target_population, expected_outcomes, success_criteria, timeframe, program_model, cultural_approaches, key_activities, extraction_quality_score (0-100 based on completeness and confidence)`

    const userPrompt = `Project Name: ${project.name}\nDocument Type: ${document_type || 'Unknown'}\n\nExtract structured context from this project document:\n\n${document_text}`

    console.log(`🧠 Extracting project context from ${document_type || 'document'} for: ${project.name}`)

    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Lower temperature for more faithful extraction
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
      existing_documents: document_text, // Store original for reference
      context_type: 'imported',
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
      message: existing ? 'Context updated from document import' : 'Context created from document import',
      warnings: extracted.extraction_quality_score < 60 ? ['Low extraction quality - please review and edit'] : []
    }, { status: existing ? 200 : 201 })

  } catch (error) {
    console.error('Error importing project context:', error)
    return NextResponse.json({
      error: 'Failed to import document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

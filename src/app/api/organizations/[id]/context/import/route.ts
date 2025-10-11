// Organization Context Import API
// Import context from existing documents (Theory of Change, Impact Reports, etc.)

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createLLMClient } from '@/lib/ai/llm-client'

/**
 * POST /api/organizations/[id]/context/import
 * Import organization context from existing document text
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createServerClient()

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

    const systemPrompt = `You are an expert at analyzing organizational documents and extracting structured context.

The user will provide a document (Theory of Change, Impact Report, Strategic Plan, etc.).
Extract the following information:

1. Mission: The organization's core purpose (1-2 sentences)
2. Vision: The world they're working toward (1-2 sentences, may not be explicitly stated)
3. Values: Array of core values (3-5 items)
4. Approach Description: How they work and what makes them unique (2-3 paragraphs)
5. Cultural Frameworks: Array of cultural practices/protocols mentioned (e.g., "Dadirri", "Two-way learning", "OCAP principles")
6. Key Principles: Array of operating principles
7. Impact Philosophy: Their theory of change (2-3 paragraphs)
8. Impact Domains: Object with keys for individual, family, community, systems - each with array of focus areas
9. Measurement Approach: How they measure impact (1-2 paragraphs)

Guidelines:
- Only extract information that is explicitly stated or clearly implied
- Preserve Indigenous terminology exactly as written
- If a field cannot be determined, return null or empty array
- Be culturally sensitive and respectful

Return ONLY valid JSON with these exact keys: mission, vision, values, approach_description, cultural_frameworks, key_principles, impact_philosophy, impact_domains, measurement_approach, extraction_quality_score (0-100 based on completeness and confidence)`

    const userPrompt = `Document Type: ${document_type || 'Unknown'}\n\nExtract structured context from this document:\n\n${document_text}`

    console.log(`🧠 Extracting organization context from ${document_type || 'document'}...`)

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
      imported_document_text: document_text, // Store original for reference
      context_type: 'imported',
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
      message: existing ? 'Context updated from document import' : 'Context created from document import',
      warnings: extracted.extraction_quality_score < 60 ? ['Low extraction quality - please review and edit'] : []
    }, { status: existing ? 200 : 201 })

  } catch (error) {
    console.error('Error importing organization context:', error)
    return NextResponse.json({
      error: 'Failed to import document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

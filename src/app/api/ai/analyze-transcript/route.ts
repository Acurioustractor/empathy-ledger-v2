import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

import OpenAI from 'openai'

import { z } from 'zod'

import {


  extractAndStoreThemes,
  extractAndStorePowerfulQuotes,
  updateStorytellerAnalytics
} from '@/lib/analytics/storyteller-analytics'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

// Create OpenAI client inside handlers, not at module level
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Request validation schema
const AnalyzeTranscriptSchema = z.object({
  transcriptId: z.string().uuid(),
  generateStory: z.boolean().default(true),
  includeThemes: z.boolean().default(true),
  culturalContext: z.string().optional(),
  targetAudience: z.enum(['all', 'children', 'youth', 'adults', 'elders']).default('all'),
  storyType: z.enum(['personal', 'family', 'community', 'cultural', 'professional', 'historical', 'educational', 'healing']).default('personal'),
  maxLength: z.number().min(500).max(10000).default(3000),
})

// Response type definitions
interface TranscriptAnalysis {
  id: string
  themes: string[]
  emotionalTone: string
  keyMoments: KeyMoment[]
  culturalElements: string[]
  suggestedTitle: string
  suggestedSummary: string
  storyStructure: StoryStructure
  mediaSuggestions: MediaSuggestion[]
}

interface KeyMoment {
  text: string
  timestamp?: number
  significance: string
  emotion: string
}

interface StoryStructure {
  introduction: string
  body: string[]
  conclusion: string
  callToAction?: string
}

interface MediaSuggestion {
  type: 'photo' | 'video' | 'audio'
  description: string
  placement: 'hero' | 'inline' | 'gallery'
  relatedTheme: string
}

interface GeneratedStory {
  title: string
  content: string
  summary: string
  themes: string[]
  culturalContext: any
  mediaSuggestions: MediaSuggestion[]
  metadata: {
    generatedAt: string
    model: string
    confidence: number
    wordCount: number
    readingTime: number
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 })
    }

    const supabase = createClient()

    // Set the auth token for this request
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    // Create OpenAI client after auth check
    const openai = getOpenAIClient()

    // Validate request body
    const body = await request.json()
    const validationResult = AnalyzeTranscriptSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const {
      transcriptId,
      generateStory,
      includeThemes,
      culturalContext,
      targetAudience,
      storyType,
      maxLength
    } = validationResult.data

    // Fetch transcript with related data
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select(`
        *,
        media_assets (
          id,
          filename,
          url,
          media_type,
          title,
          description
        )
      `)
      .eq('id', transcriptId)
      .single()

    if (transcriptError || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to analyse this transcript
    if (transcript.storyteller_id !== user.id && transcript.created_by !== user.id) {
      // Check if user has admin/org permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_roles')
        .eq('id', user.id)
        .single()
      
      if (!profile?.tenant_roles?.includes('admin')) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Prepare transcript text for analysis
    const transcriptText = transcript.text || transcript.transcript_content || transcript.formatted_text
    
    if (!transcriptText) {
      return NextResponse.json(
        { error: 'Transcript has no content to analyse' },
        { status: 400 }
      )
    }

    // Analyze transcript with OpenAI
    const analysis = await analyzeTranscript({
      text: transcriptText,
      segments: transcript.segments,
      culturalContext,
      includeThemes
    })

    let generatedStory: GeneratedStory | null = null

    // Generate story if requested
    if (generateStory) {
      generatedStory = await generateStoryFromTranscript({
        transcriptText,
        analysis,
        targetAudience,
        storyType,
        maxLength,
        culturalContext
      })

      // Save generated story as draft
      const { data: savedStory, error: saveError } = await supabase
        .from('stories')
        .insert({
          title: generatedStory.title,
          content: generatedStory.content,
          summary: generatedStory.summary,
          storyteller_id: transcript.storyteller_id,
          transcript_id: transcriptId,
          themes: generatedStory.themes,
          story_type: storyType,
          status: 'draft',
          ai_generated_summary: true,
          ai_processing_consent_verified: true,
          ai_confidence_scores: { generation: generatedStory.metadata.confidence },
          media_metadata: {
            suggestions: generatedStory.mediaSuggestions,
            source_transcript: transcriptId
          },
          cultural_sensitivity_level: determineSensitivityLevel(generatedStory.themes, culturalContext),
          requires_elder_approval: shouldRequireElderApproval(generatedStory.themes, culturalContext),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) {
        console.error('Error saving generated story:', saveError)
        // Don't fail the request, just log the error
      } else if (savedStory) {
        // Update the generated story with the saved ID
        generatedStory = {
          ...generatedStory,
          id: savedStory.id
        }
      }
    }

    // Update transcript with analysis results
    await supabase
      .from('transcripts')
      .update({
        ai_processing_date: new Date().toISOString(),
        ai_model_version: 'gpt-4-turbo-preview',
        ai_confidence_score: analysis.confidence || 0.95,
        metadata: {
          ...transcript.metadata,
          analysis: {
            themes: analysis.themes,
            emotionalTone: analysis.emotionalTone,
            keyMoments: analysis.keyMoments,
            culturalElements: analysis.culturalElements,
            analyzedAt: new Date().toISOString()
          }
        }
      })
      .eq('id', transcriptId)

    // 🌟 NEW: Populate storyteller analytics tables
    try {
      // Extract and store themes in analytics tables
      await extractAndStoreThemes(
        transcriptId,
        analysis.themes,
        transcript.storyteller_id,
        transcript.tenant_id
      )

      // Extract and store powerful quotes
      await extractAndStorePowerfulQuotes(
        transcriptId,
        analysis.keyMoments,
        transcript.storyteller_id,
        transcript.tenant_id,
        transcript.title || 'Untitled Transcript'
      )

      // Update storyteller analytics (increment transcript count)
      await updateStorytellerAnalytics(
        transcript.storyteller_id,
        generatedStory ? 1 : 0, // increment stories if story was generated
        1, // increment transcripts
        analysis.themes
      )

      console.log('✅ Storyteller analytics updated successfully')
    } catch (analyticsError) {
      console.error('⚠️ Analytics update failed (continuing):', analyticsError)
      // Don't fail the main request if analytics fails
    }

    return NextResponse.json({
      success: true,
      analysis,
      story: generatedStory,
      transcriptId,
      message: generatedStory 
        ? 'Story generated successfully and saved as draft'
        : 'Transcript analysed successfully'
    })

  } catch (error: any) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Analyze transcript for themes, emotions, and key moments
async function analyzeTranscript({
  text,
  segments,
  culturalContext,
  includeThemes
}: {
  text: string
  segments?: any[]
  culturalContext?: string
  includeThemes: boolean
}): Promise<TranscriptAnalysis> {
  
  const systemPrompt = `You are an expert storytelling analyst specialising in personal narratives and cultural stories. 
Your role is to analyse transcripts with deep respect for cultural context and personal experiences.
Focus on identifying meaningful themes, emotional resonance, and story potential while being culturally sensitive.`

  const userPrompt = `Analyze this transcript and extract the following:

1. Main themes and topics (identify 3-5 key themes)
2. Emotional tone and journey
3. Key moments that would make powerful story elements
4. Cultural elements or references that need respectful handling
5. A suggested title that captures the essence
6. A brief summary (2-3 sentences)
7. Story structure suggestions (introduction, body sections, conclusion)
8. Media placement suggestions (what types of visual/audio would enhance the story)

${culturalContext ? `Cultural Context: ${culturalContext}` : ''}

Transcript:
${text.substring(0, 8000)} ${text.length > 8000 ? '...[truncated]' : ''}

Return your analysis in JSON format with these exact keys:
{
  "themes": ["theme1", "theme2", ...],
  "emotionalTone": "description of emotional journey",
  "keyMoments": [{"text": "moment", "significance": "why important", "emotion": "feeling"}],
  "culturalElements": ["element1", "element2"],
  "suggestedTitle": "title",
  "suggestedSummary": "summary",
  "storyStructure": {
    "introduction": "intro text",
    "body": ["section1", "section2", "section3"],
    "conclusion": "conclusion text"
  },
  "mediaSuggestions": [
    {"type": "photo|video|audio", "description": "what to include", "placement": "hero|inline|gallery", "relatedTheme": "theme"}
  ],
  "confidence": 0.95
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    
    return {
      id: crypto.randomUUID(),
      themes: result.themes || [],
      emotionalTone: result.emotionalTone || '',
      keyMoments: result.keyMoments || [],
      culturalElements: result.culturalElements || [],
      suggestedTitle: result.suggestedTitle || 'Untitled Story',
      suggestedSummary: result.suggestedSummary || '',
      storyStructure: result.storyStructure || { introduction: '', body: [], conclusion: '' },
      mediaSuggestions: result.mediaSuggestions || [],
      confidence: result.confidence || 0.9
    }
  } catch (error: any) {
    console.error('OpenAI analysis error:', error)
    throw new Error('Failed to analyse transcript')
  }
}

// Generate a story from transcript and analysis
async function generateStoryFromTranscript({
  transcriptText,
  analysis,
  targetAudience,
  storyType,
  maxLength,
  culturalContext
}: {
  transcriptText: string
  analysis: TranscriptAnalysis
  targetAudience: string
  storyType: string
  maxLength: number
  culturalContext?: string
}): Promise<GeneratedStory> {
  
  const audienceGuidelines = {
    children: 'Use simple language, focus on wonder and learning, avoid complex or heavy themes',
    youth: 'Be relatable and engaging, include relevant challenges and aspirations',
    adults: 'Use mature themes and nuanced perspectives, include complexity',
    elders: 'Honor wisdom and experience, include reflective elements',
    all: 'Be inclusive and accessible to all ages, balance simplicity with depth'
  }

  const storyTypeGuidelines = {
    personal: 'Focus on individual journey, emotions, and personal growth',
    family: 'Emphasize relationships, heritage, and generational connections',
    community: 'Highlight collective experiences, shared values, and community bonds',
    cultural: 'Respect traditions, include cultural significance, use appropriate terminology',
    professional: 'Focus on career insights, challenges overcome, and lessons learned',
    historical: 'Provide context, accuracy, and connection to broader events',
    educational: 'Structure for learning, include clear takeaways and insights',
    healing: 'Handle with sensitivity, focus on resilience and recovery journey'
  }

  const systemPrompt = `You are a master storyteller who transforms personal transcripts into compelling narratives.
You specialise in ${storyType} stories for ${targetAudience} audiences.
Your stories are authentic, respectful, and emotionally resonant while maintaining the speaker's voice.`

  const userPrompt = `Transform this transcript into a compelling ${storyType} story.

Title: ${analysis.suggestedTitle}
Themes: ${analysis.themes.join(', ')}
Emotional Tone: ${analysis.emotionalTone}
Target Audience: ${targetAudience} - ${audienceGuidelines[targetAudience]}
Story Type: ${storyType} - ${storyTypeGuidelines[storyType]}
Maximum Length: ${maxLength} words
${culturalContext ? `Cultural Context: ${culturalContext}` : ''}

Key Moments to Include:
${analysis.keyMoments.map(m => `- ${m.text} (${m.significance})`).join('\n')}

Story Structure:
- Introduction: ${analysis.storyStructure.introduction}
- Body Sections: ${analysis.storyStructure.body.join(', ')}
- Conclusion: ${analysis.storyStructure.conclusion}

Original Transcript (for voice and authenticity):
${transcriptText.substring(0, 6000)} ${transcriptText.length > 6000 ? '...[truncated]' : ''}

Generate a story that:
1. Maintains the authentic voice of the speaker
2. Follows a clear narrative arc
3. Includes vivid details and emotions
4. Respects cultural elements: ${analysis.culturalElements.join(', ')}
5. Is appropriate for the target audience
6. Stays within ${maxLength} words

Format the story with:
- Clear paragraphs
- Natural flow and transitions
- A compelling opening and memorable closing
- Authentic dialogue where appropriate`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: Math.min(maxLength * 2, 4000) // Rough token estimate
    })

    const storyContent = completion.choices[0].message.content || ''
    const wordCount = storyContent.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200) // Average reading speed

    // Generate a concise summary
    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'Create a 2-3 sentence summary of this story that captures its essence and emotional core.' 
        },
        { role: 'user', content: storyContent }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    const summary = summaryCompletion.choices[0].message.content || analysis.suggestedSummary

    return {
      title: analysis.suggestedTitle,
      content: storyContent,
      summary,
      themes: analysis.themes,
      culturalContext: {
        elements: analysis.culturalElements,
        context: culturalContext,
        sensitivity: determineSensitivityLevel(analysis.themes, culturalContext)
      },
      mediaSuggestions: analysis.mediaSuggestions,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gpt-4-turbo-preview',
        confidence: 0.92,
        wordCount,
        readingTime
      }
    }
  } catch (error: any) {
    console.error('Story generation error:', error)
    throw new Error('Failed to generate story')
  }
}

// Determine cultural sensitivity level based on themes and context
function determineSensitivityLevel(themes: string[], culturalContext?: string): string {
  const highSensitivityKeywords = ['ceremony', 'sacred', 'elder', 'traditional', 'spiritual', 'ancestral']
  const mediumSensitivityKeywords = ['cultural', 'community', 'heritage', 'family', 'tradition']
  
  const allText = `${themes.join(' ')} ${culturalContext || ''}`.toLowerCase()
  
  if (highSensitivityKeywords.some(keyword => allText.includes(keyword))) {
    return 'high'
  }
  
  if (mediumSensitivityKeywords.some(keyword => allText.includes(keyword))) {
    return 'medium'
  }
  
  return 'low'
}

// Determine if elder approval is required
function shouldRequireElderApproval(themes: string[], culturalContext?: string): boolean {
  const requiresApprovalKeywords = ['sacred', 'ceremony', 'spiritual', 'traditional knowledge', 'elder wisdom']
  const allText = `${themes.join(' ')} ${culturalContext || ''}`.toLowerCase()
  
  return requiresApprovalKeywords.some(keyword => allText.includes(keyword))
}

// GET endpoint to check analysis status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const transcriptId = searchParams.get('transcriptId')
    
    if (!transcriptId) {
      return NextResponse.json(
        { error: 'Transcript ID required' },
        { status: 400 }
      )
    }

    // Get transcript with analysis metadata
    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('id, title, metadata, ai_processing_date, ai_confidence_score')
      .eq('id', transcriptId)
      .single()

    if (error || !transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // Check for existing generated stories
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, status, created_at')
      .eq('transcript_id', transcriptId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      transcript: {
        id: transcript.id,
        title: transcript.title,
        analysed: !!transcript.metadata?.analysis,
        analysisDate: transcript.ai_processing_date,
        confidence: transcript.ai_confidence_score,
        themes: transcript.metadata?.analysis?.themes || []
      },
      generatedStories: stories || [],
      hasAnalysis: !!transcript.metadata?.analysis
    })

  } catch (error: any) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
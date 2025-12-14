import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

interface TitleSuggestion {
  title: string;
  type: 'descriptive' | 'emotional' | 'thematic' | 'quote';
  confidence: number;
  sourceQuote?: string;
}

// POST - Generate title suggestions from transcript
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { transcriptId, storyId, transcriptText, maxSuggestions = 5 } = body;

    let text = transcriptText;

    // If transcriptId provided, fetch the transcript
    if (transcriptId && !text) {
      const { data: transcript, error: transcriptError } = await supabase
        .from('transcripts')
        .select('content, transcript_text')
        .eq('id', transcriptId)
        .single();

      if (transcriptError || !transcript) {
        return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
      }

      text = transcript.content || transcript.transcript_text;
    }

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Insufficient transcript text for title generation' }, { status: 400 });
    }

    // Use OpenAI to generate title suggestions
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are helping to create story titles for the Empathy Ledger platform, which collects and honors personal stories.

Given the following transcript excerpt, generate ${maxSuggestions} title suggestions. Each title should:
- Be concise (2-7 words)
- Capture the essence or emotion of the story
- Be respectful and dignified
- Not include the storyteller's name unless it's a direct quote title

Transcript excerpt (first 3000 characters):
"""
${text.slice(0, 3000)}
"""

Provide exactly ${maxSuggestions} title suggestions in this JSON format:
[
  {
    "title": "The title text",
    "type": "descriptive|emotional|thematic|quote",
    "confidence": 0.0-1.0,
    "sourceQuote": "exact quote if type is 'quote', otherwise omit"
  }
]

Types:
- descriptive: Describes what the story is about
- emotional: Captures the emotional tone
- thematic: Based on themes in the story
- quote: A powerful direct quote from the transcript (must include sourceQuote)

Return only the JSON array, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    let suggestions: TitleSuggestion[] = [];

    try {
      // Parse the JSON response
      const parsed = JSON.parse(content.trim());
      suggestions = parsed.map((s: TitleSuggestion) => ({
        title: s.title,
        type: s.type || 'descriptive',
        confidence: typeof s.confidence === 'number' ? s.confidence : 0.7,
        sourceQuote: s.sourceQuote,
      }));
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: try to extract titles from response
      const lines = content.split('\n').filter(line => line.trim());
      suggestions = lines.slice(0, maxSuggestions).map(line => ({
        title: line.replace(/^[\d\.\-\*]\s*/, '').replace(/["']/g, '').trim(),
        type: 'descriptive' as const,
        confidence: 0.5,
      }));
    }

    // Store suggestions if storyId provided
    if (storyId && suggestions.length > 0) {
      const { error: insertError } = await supabase
        .from('title_suggestions')
        .insert({
          story_id: storyId,
          transcript_id: transcriptId || null,
          suggestions: suggestions,
          status: 'pending',
        });

      if (insertError) {
        console.error('Error storing suggestions:', insertError);
      }
    }

    // Log AI usage for billing/tracking
    try {
      await supabase.from('ai_usage_events').insert({
        user_id: user.id,
        agent_name: 'title-generator',
        model: 'gpt-4o-mini',
        model_provider: 'openai',
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json({
      suggestions,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      }
    });
  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 });
  }
}

// GET - Get existing title suggestions for a story
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get('storyId');

  if (!storyId) {
    return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
  }

  const { data: suggestions, error } = await supabase
    .from('title_suggestions')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ suggestions: null });
  }

  return NextResponse.json({ suggestions });
}

// PATCH - Select a title suggestion
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { suggestionId, selectedTitle, storyId } = body;

    // Update suggestion record
    if (suggestionId) {
      await supabase
        .from('title_suggestions')
        .update({
          selected_title: selectedTitle,
          selected_at: new Date().toISOString(),
          selected_by: user.id,
          status: 'selected',
        })
        .eq('id', suggestionId);
    }

    // Update story title
    if (storyId && selectedTitle) {
      const { error: storyError } = await supabase
        .from('stories')
        .update({ title: selectedTitle })
        .eq('id', storyId);

      if (storyError) {
        return NextResponse.json({ error: 'Failed to update story title' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, selectedTitle });
  } catch (error) {
    console.error('Error selecting title:', error);
    return NextResponse.json({ error: 'Failed to select title' }, { status: 500 });
  }
}

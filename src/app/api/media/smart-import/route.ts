import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

interface GroupedFile {
  filename: string;
  fileType: 'video' | 'audio' | 'transcript' | 'image' | 'document';
  size: number;
  hash: string;
  uploadedAt: string;
  mediaAssetId?: string;
  url?: string;
}

interface SuggestedStory {
  suggestedTitle: string;
  storytellerName?: string;
  baseName: string;
  files: GroupedFile[];
  confidence: number;
}

// POST - Create a new import session
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { organizationId } = body;

    // Create import session
    const { data: session, error: sessionError } = await supabase
      .from('media_import_sessions')
      .insert({
        user_id: user.id,
        organization_id: organizationId || null,
        status: 'pending',
        files: [],
        grouped_stories: [],
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating import session:', sessionError);
      return NextResponse.json({ error: 'Failed to create import session' }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Smart import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Add files to session and auto-group
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, files, action } = body;

    // Get existing session
    const { data: session, error: sessionError } = await supabase
      .from('media_import_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action === 'add_files') {
      // Add new files to session
      const existingFiles = session.files || [];
      const newFiles = files.map((file: GroupedFile) => ({
        ...file,
        uploadedAt: new Date().toISOString(),
      }));
      const allFiles = [...existingFiles, ...newFiles];

      // Auto-group files
      const groupedStories = autoGroupFiles(allFiles);

      // Update session
      const { data: updatedSession, error: updateError } = await supabase
        .from('media_import_sessions')
        .update({
          files: allFiles,
          grouped_stories: groupedStories,
          status: 'grouping',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating session:', updateError);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
      }

      return NextResponse.json({ session: updatedSession });
    }

    if (action === 'finalize') {
      // User has confirmed groupings, create stories
      const { groupedStories } = body;

      const createdStories = [];
      const errors = [];

      for (const group of groupedStories) {
        try {
          // Create story
          const { data: story, error: storyError } = await supabase
            .from('stories')
            .insert({
              title: group.suggestedTitle || 'Untitled Story',
              author_id: user.id,
              storyteller_name: group.storytellerName || null,
              status: 'draft',
              organization_id: session.organization_id,
            })
            .select()
            .single();

          if (storyError) {
            errors.push({ group: group.baseName, error: storyError.message });
            continue;
          }

          // Link media assets to story
          for (const file of group.files) {
            if (file.mediaAssetId) {
              await supabase
                .from('media_assets')
                .update({ story_id: story.id })
                .eq('id', file.mediaAssetId);
            }
          }

          createdStories.push(story);
        } catch (err) {
          errors.push({ group: group.baseName, error: String(err) });
        }
      }

      // Update session as completed
      const { data: finalSession, error: finalError } = await supabase
        .from('media_import_sessions')
        .update({
          status: 'completed',
          stories_created: createdStories.length,
          media_linked: groupedStories.reduce((acc: number, g: SuggestedStory) => acc + g.files.length, 0),
          errors: errors,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      return NextResponse.json({
        session: finalSession,
        createdStories,
        errors
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Smart import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to auto-group files by similarity
function autoGroupFiles(files: GroupedFile[]): SuggestedStory[] {
  const groups: Map<string, SuggestedStory> = new Map();

  for (const file of files) {
    const baseName = extractBaseName(file.filename);

    if (!groups.has(baseName)) {
      groups.set(baseName, {
        suggestedTitle: generateTitle(baseName),
        storytellerName: extractStorytellerName(baseName),
        baseName,
        files: [],
        confidence: 0.5,
      });
    }

    const group = groups.get(baseName)!;
    group.files.push(file);

    // Increase confidence if we have multiple file types
    const hasVideo = group.files.some(f => f.fileType === 'video');
    const hasAudio = group.files.some(f => f.fileType === 'audio');
    const hasTranscript = group.files.some(f => f.fileType === 'transcript');

    if ((hasVideo || hasAudio) && hasTranscript) {
      group.confidence = 0.9;
    } else if (group.files.length > 1) {
      group.confidence = 0.7;
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.confidence - a.confidence);
}

// Extract base name from filename (removing extension and common suffixes)
function extractBaseName(filename: string): string {
  // Remove extension
  let name = filename.replace(/\.[^.]+$/, '');

  // Remove common suffixes like _audio, _video, _transcript, _v1, etc.
  name = name.replace(/[-_](audio|video|transcript|text|srt|vtt|v\d+|final|edit|raw)$/gi, '');

  // Remove timestamps like _20240101 or -20240101
  name = name.replace(/[-_]\d{6,14}$/g, '');

  // Normalize spacing
  name = name.replace(/[-_]+/g, ' ').trim();

  return name.toLowerCase();
}

// Generate a clean title from base name
function generateTitle(baseName: string): string {
  return baseName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Try to extract storyteller name from filename
function extractStorytellerName(baseName: string): string | undefined {
  // Look for patterns like "John_Smith_Interview" or "Interview_with_John_Smith"
  const interviewMatch = baseName.match(/^(.+?)[-_]interview/i);
  if (interviewMatch) {
    return interviewMatch[1].replace(/[-_]/g, ' ').trim();
  }

  const withMatch = baseName.match(/interview[-_]with[-_](.+)/i);
  if (withMatch) {
    return withMatch[1].replace(/[-_]/g, ' ').trim();
  }

  return undefined;
}

// GET - Get session status
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    // Get specific session
    const { data: session, error } = await supabase
      .from('media_import_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  }

  // Get all sessions for user
  const { data: sessions, error } = await supabase
    .from('media_import_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}

// DELETE - Cancel/delete a session
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('media_import_sessions')
    .update({ status: 'cancelled' })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error cancelling session:', error);
    return NextResponse.json({ error: 'Failed to cancel session' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

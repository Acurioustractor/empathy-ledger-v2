/**
 * Single Story API - Content Hub Syndication
 * GET /api/v1/content-hub/stories/:id - Get full story content
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAccessLevel(request: Request): Promise<string> {
  const apiKey = request.headers.get('X-API-Key');
  const authHeader = request.headers.get('Authorization');

  if (!apiKey && !authHeader) return 'anonymous';
  if (apiKey) return 'ecosystem';
  if (authHeader?.startsWith('Bearer ')) return 'community';
  return 'anonymous';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessLevel = await getAccessLevel(request);
  const supabase = createSupabaseClient();

  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      profiles:storyteller_id(display_name, bio),
      media_assets(url, alt_text)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  // Check visibility access
  if (story.visibility === 'private') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  if (story.visibility === 'community' && accessLevel === 'anonymous') {
    return NextResponse.json({ error: 'Community access required' }, { status: 403 });
  }

  return NextResponse.json({
    id: story.id,
    title: story.title,
    summary: story.summary,
    content: story.content,
    authorName: story.profiles?.display_name || 'Anonymous',
    authorBio: story.profiles?.bio,
    authorId: story.storyteller_id,
    publishedAt: story.published_at,
    themes: story.cultural_themes || [],
    featuredMediaUrl: story.media_assets?.[0]?.url,
    visibility: story.visibility,
    syndicationEnabled: story.syndication_enabled
  });
}

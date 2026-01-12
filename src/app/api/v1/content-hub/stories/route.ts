/**
 * Stories API - Content Hub Syndication
 * GET /api/v1/content-hub/stories - List published stories
 * GET /api/v1/content-hub/stories/:id - Single story (handled in [id]/route.ts)
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
  if (apiKey) return 'ecosystem'; // ACT project with API key
  if (authHeader?.startsWith('Bearer ')) return 'community';
  return 'anonymous';
}

export async function GET(request: Request) {
  const accessLevel = await getAccessLevel(request);
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const theme = url.searchParams.get('theme');

  const supabase = createSupabaseClient();

  let query = supabase
    .from('stories')
    .select(`
      id,
      title,
      summary,
      storyteller_id,
      storytellers(display_name),
      created_at,
      themes,
      privacy_level,
      is_public
    `, { count: 'exact' })
    .eq('community_status', 'published')
    .order('created_at', { ascending: false });

  // Visibility filter based on access level
  if (accessLevel === 'anonymous') {
    query = query.eq('is_public', true);
  } else if (accessLevel === 'community') {
    query = query.or('is_public.eq.true,privacy_level.eq.community');
  }

  // Theme filter - themes is JSONB so use containedBy
  if (theme) {
    query = query.contains('themes', [theme]);
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stories = (data || []).map((story: any) => ({
    id: story.id,
    title: story.title,
    summary: story.summary,
    authorName: story.storytellers?.display_name || 'Anonymous',
    authorId: story.storyteller_id,
    publishedAt: story.created_at,
    themes: story.themes || [],
    visibility: story.privacy_level,
    isPublic: story.is_public
  }));

  return NextResponse.json({
    stories,
    pagination: {
      page,
      limit,
      total: count || stories.length,
      hasMore: stories.length === limit
    }
  });
}

/**
 * Search API - Content Hub Syndication
 * GET /api/v1/content-hub/search - Full-text search across content
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

export async function GET(request: Request) {
  const accessLevel = await getAccessLevel(request);
  const url = new URL(request.url);

  const query = url.searchParams.get('q');
  const contentType = url.searchParams.get('type'); // stories, articles, media, all
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const supabase = createSupabaseClient();
  const results: {
    stories: any[];
    articles: any[];
    media: any[];
  } = { stories: [], articles: [], media: [] };

  // Determine visibility filter
  const visibilityFilter = accessLevel === 'anonymous'
    ? ['public']
    : ['public', 'community'];

  // Search stories
  if (!contentType || contentType === 'stories' || contentType === 'all') {
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, summary, published_at, visibility')
      .eq('status', 'published')
      .in('visibility', visibilityFilter)
      .textSearch('search_vector', query.split(' ').join(' & '))
      .limit(limit);

    results.stories = (stories || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      publishedAt: s.published_at,
      type: 'story'
    }));
  }

  // Search articles
  if (!contentType || contentType === 'articles' || contentType === 'all') {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, published_at, visibility')
      .eq('status', 'published')
      .in('visibility', visibilityFilter)
      .textSearch('search_vector', query.split(' ').join(' & '))
      .limit(limit);

    results.articles = (articles || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      publishedAt: a.published_at,
      type: 'article'
    }));
  }

  // Search media
  if (!contentType || contentType === 'media' || contentType === 'all') {
    const { data: media } = await supabase
      .from('media_assets')
      .select('id, url, title, alt_text, visibility')
      .eq('status', 'active')
      .in('visibility', visibilityFilter)
      .textSearch('search_vector', query.split(' ').join(' & '))
      .limit(limit);

    results.media = (media || []).map((m: any) => ({
      id: m.id,
      url: m.url,
      title: m.title,
      altText: m.alt_text,
      type: 'media'
    }));
  }

  const totalResults = results.stories.length + results.articles.length + results.media.length;

  return NextResponse.json({
    query,
    results,
    total: totalResults,
    accessLevel
  });
}

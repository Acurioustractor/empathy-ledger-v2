/**
 * Single Article API - Content Hub Syndication
 * GET /api/v1/content-hub/articles/:slug - Get full article content
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function extractFirstImage(content?: string | null) {
  if (!content) return null;
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (mdMatch?.[1]) return mdMatch[1];
  return null;
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const accessLevel = await getAccessLevel(request);
  const supabase = createSupabaseClient();

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      storytellers:author_storyteller_id(display_name, bio)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Check visibility
  if (article.visibility === 'private') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  if (article.visibility === 'community' && accessLevel === 'anonymous') {
    return NextResponse.json({ error: 'Community access required' }, { status: 403 });
  }

  // Increment view count
  await supabase
    .from('articles')
    .update({ views_count: (article.views_count || 0) + 1 })
    .eq('id', article.id);

  // Get featured image URL if exists
  let featuredImageUrl =
    article.import_metadata?.featuredImageUrl || extractFirstImage(article.content) || null;
  if (article.featured_image_id) {
    const { data: media } = await supabase
      .from('media_assets')
      .select('url, alt_text')
      .eq('id', article.featured_image_id)
      .single();
    featuredImageUrl = media?.url;
  }

  return NextResponse.json({
    id: article.id,
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    content: article.content,
    authorName: article.author_name || article.storytellers?.display_name || 'Staff',
    authorBio: article.storytellers?.bio,
    articleType: article.article_type,
    primaryProject: article.primary_project,
    relatedProjects: article.related_projects || [],
    publishedAt: article.published_at,
    tags: article.tags || [],
    themes: article.themes || [],
    featuredImageUrl,
    visibility: article.visibility,
    metaTitle: article.meta_title,
    metaDescription: article.meta_description
  });
}

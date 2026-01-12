/**
 * Articles API - Content Hub Syndication
 * GET /api/v1/content-hub/articles - List published articles
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

function extractFirstImage(content: string | null | undefined) {
  if (!content) return null;
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (mdMatch?.[1]) return mdMatch[1];
  return null;
}

function resolveAssetUrl(url: string | null | undefined, sourceUrl?: string | null) {
  if (!url) return null;
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/images/')) return `${appBase}${url}`;
  if (url.startsWith('/') && sourceUrl) {
    try {
      const origin = new URL(sourceUrl).origin;
      return `${origin}${url}`;
    } catch {
      return url;
    }
  }
  return url;
}

export async function GET(request: Request) {
  const accessLevel = await getAccessLevel(request);
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const type = url.searchParams.get('type');
  const project = url.searchParams.get('project');
  const tag = url.searchParams.get('tag');
  const theme = url.searchParams.get('theme');
  const destination = url.searchParams.get('destination');
  const publishedAfter = url.searchParams.get('after');
  const publishedBefore = url.searchParams.get('before');

  const supabase = createSupabaseClient();

  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      subtitle,
      excerpt,
      author_name,
      author_storyteller_id,
      article_type,
      primary_project,
      published_at,
      tags,
      themes,
      syndication_destinations,
      visibility,
      syndication_enabled,
      featured_image_id,
      content,
      source_url,
      import_metadata
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('syndication_enabled', true)
    .order('published_at', { ascending: false });

  // Visibility filter
  if (accessLevel === 'anonymous') {
    query = query.eq('visibility', 'public');
  } else if (accessLevel === 'community') {
    query = query.in('visibility', ['public', 'community']);
  }

  // Additional filters
  if (type) query = query.eq('article_type', type);
  if (project) query = query.eq('primary_project', project);
  if (tag) query = query.contains('tags', [tag]);
  if (theme) query = query.contains('themes', [theme]);
  if (destination) query = query.contains('syndication_destinations', [destination]);
  if (publishedAfter) query = query.gte('published_at', publishedAfter);
  if (publishedBefore) query = query.lte('published_at', publishedBefore);

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve featured image URLs in batch
  const featuredImageIds = Array.from(
    new Set(
      (data || [])
        .map((article: any) => article.featured_image_id)
        .filter(Boolean)
    )
  );
  const featuredImagesById: Record<string, { url: string; alt_text: string | null }> = {};

  if (featuredImageIds.length > 0) {
    const { data: featuredImages } = await supabase
      .from('media_assets')
      .select('id, url, alt_text')
      .in('id', featuredImageIds);

    for (const image of featuredImages || []) {
      featuredImagesById[image.id] = { url: image.url, alt_text: image.alt_text };
    }
  }

  // Get CTAs for all articles in one query
  const articleIds = (data || []).map((a: any) => a.id);
  const ctasByArticle: Record<string, any[]> = {};

  if (articleIds.length > 0) {
    const { data: allCtas } = await supabase
      .from('article_ctas')
      .select(`
        article_id,
        position,
        display_order,
        custom_button_text,
        custom_url,
        cta_templates(slug, cta_type, button_text, description, icon, style, url_template, action_type)
      `)
      .in('article_id', articleIds)
      .eq('is_active', true)
      .order('position')
      .order('display_order');

    // Group CTAs by article
    for (const cta of allCtas || []) {
      if (!ctasByArticle[cta.article_id]) {
        ctasByArticle[cta.article_id] = [];
      }
      ctasByArticle[cta.article_id].push({
        position: cta.position,
        ctaType: cta.cta_templates?.cta_type,
        buttonText: cta.custom_button_text || cta.cta_templates?.button_text,
        description: cta.cta_templates?.description,
        icon: cta.cta_templates?.icon,
        style: cta.cta_templates?.style,
        urlTemplate: cta.custom_url || cta.cta_templates?.url_template,
        actionType: cta.cta_templates?.action_type
      });
    }
  }

  const articles = (data || []).map((article: any) => {
    const featuredFromMedia = article.featured_image_id
      ? featuredImagesById[article.featured_image_id]?.url || null
      : null
    const featuredFromImport = article.import_metadata?.featuredImageUrl || null
    const featuredFromContent = extractFirstImage(article.content)
    const featuredImageUrl = featuredFromMedia || featuredFromImport || featuredFromContent
    const resolvedFeaturedImageUrl = resolveAssetUrl(featuredImageUrl, article.source_url)

    return ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    authorName: article.author_name || 'Staff',
    articleType: article.article_type,
    primaryProject: article.primary_project,
    publishedAt: article.published_at,
    tags: article.tags || [],
    themes: article.themes || [],
    visibility: article.visibility,
    syndicationDestinations: article.syndication_destinations || [],
    featuredImageUrl: resolvedFeaturedImageUrl,
    featuredImageAlt: article.featured_image_id ? featuredImagesById[article.featured_image_id]?.alt_text || null : null,
    ctas: ctasByArticle[article.id] || []
    });
  });

  return NextResponse.json({
    articles,
    pagination: {
      page,
      limit,
      total: count || articles.length,
      hasMore: articles.length === limit
    }
  });
}

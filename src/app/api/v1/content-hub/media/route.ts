/**
 * Media Library API - Content Hub Syndication
 * GET /api/v1/content-hub/media - Browse media library
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

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const mediaType = url.searchParams.get('type'); // image, video, audio
  const theme = url.searchParams.get('theme');

  const supabase = createSupabaseClient();

  let query = supabase
    .from('media_assets')
    .select(`
      id,
      url,
      title,
      alt_text,
      media_type,
      width,
      height,
      visibility,
      uploader_id,
      storytellers:uploader_id(name)
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Visibility filter
  if (accessLevel === 'anonymous') {
    query = query.eq('visibility', 'public');
  } else if (accessLevel === 'community') {
    query = query.in('visibility', ['public', 'community']);
  }

  // Additional filters
  if (mediaType) query = query.eq('media_type', mediaType);

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get themes for media if requested
  let mediaWithThemes = data || [];
  if (theme) {
    const mediaIds = mediaWithThemes.map((m: any) => m.id);
    const { data: themes } = await supabase
      .from('media_narrative_themes')
      .select('media_asset_id, primary_theme, emotional_tone')
      .in('media_asset_id', mediaIds);

    const themeMap = new Map(
      (themes || []).map((t: any) => [t.media_asset_id, t])
    );

    mediaWithThemes = mediaWithThemes.filter((m: any) => {
      const mediaTheme = themeMap.get(m.id);
      return mediaTheme?.primary_theme === theme;
    });
  }

  const media = mediaWithThemes.map((item: any) => ({
    id: item.id,
    url: item.url,
    title: item.title,
    altText: item.alt_text,
    mediaType: item.media_type,
    width: item.width,
    height: item.height,
    uploaderName: item.storytellers?.name
  }));

  return NextResponse.json({
    media,
    pagination: {
      page,
      limit,
      total: count || media.length,
      hasMore: media.length === limit
    }
  });
}

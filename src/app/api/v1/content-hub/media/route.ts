/**
 * Media Library API - Content Hub Syndication
 * GET /api/v1/content-hub/media - Browse media library
 *
 * ACT Ecosystem API - Shared content across all ACT sites:
 * - JusticeHub, ACT Farm, The Harvest, Goods on Country, ACT Placemat, ACT Studio
 *
 * Query Parameters:
 * - organization_id: Filter by organization UUID
 * - project_code: Filter by ACT ecosystem project (e.g., 'justicehub', 'act-farm')
 * - type: Filter by media type (image, video, audio)
 * - theme: Filter by narrative theme
 * - elder_approved: Filter to elder-approved content only (true/false)
 * - page, limit: Pagination
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

  // Pagination
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  // Content filters
  const mediaType = url.searchParams.get('type'); // image, video, audio
  const theme = url.searchParams.get('theme');

  // ACT Ecosystem filters
  const organizationId = url.searchParams.get('organization_id');
  const projectCode = url.searchParams.get('project_code');
  const elderApproved = url.searchParams.get('elder_approved');
  const culturalTags = url.searchParams.get('cultural_tags'); // comma-separated

  const supabase = createSupabaseClient();

  let query = supabase
    .from('media_assets')
    .select(`
      id,
      url,
      thumbnail_url,
      title,
      description,
      alt_text,
      media_type,
      width,
      height,
      duration,
      visibility,
      organization_id,
      project_code,
      elder_approved,
      consent_obtained,
      cultural_tags,
      cultural_sensitivity,
      attribution_text,
      created_at,
      uploader_id,
      storytellers:uploader_id(name)
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Visibility filter based on access level
  if (accessLevel === 'anonymous') {
    query = query.eq('visibility', 'public');
  } else if (accessLevel === 'community') {
    query = query.in('visibility', ['public', 'community']);
  }
  // 'ecosystem' level can see all visibility levels

  // ACT Ecosystem filters
  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }
  if (projectCode) {
    query = query.eq('project_code', projectCode);
  }
  if (elderApproved === 'true') {
    query = query.eq('elder_approved', true);
  }
  if (culturalTags) {
    const tags = culturalTags.split(',').map(t => t.trim());
    query = query.overlaps('cultural_tags', tags);
  }

  // Content type filter
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
    thumbnailUrl: item.thumbnail_url,
    title: item.title,
    description: item.description,
    altText: item.alt_text,
    mediaType: item.media_type,
    width: item.width,
    height: item.height,
    duration: item.duration,
    // ACT Ecosystem metadata
    organizationId: item.organization_id,
    projectCode: item.project_code,
    // Cultural safety
    elderApproved: item.elder_approved,
    consentObtained: item.consent_obtained,
    culturalTags: item.cultural_tags || [],
    culturalSensitivity: item.cultural_sensitivity,
    attributionText: item.attribution_text,
    // Provenance
    uploaderName: item.storytellers?.name,
    createdAt: item.created_at
  }));

  return NextResponse.json({
    media,
    pagination: {
      page,
      limit,
      total: count || media.length,
      hasMore: media.length === limit
    },
    // ACT Ecosystem metadata
    ecosystem: {
      source: 'empathy-ledger',
      version: 'v1',
      accessLevel,
      filters: {
        organizationId: organizationId || null,
        projectCode: projectCode || null,
        mediaType: mediaType || null,
        theme: theme || null,
        elderApproved: elderApproved === 'true' || null
      }
    }
  });
}

/**
 * Syndication API - Content Hub
 * POST /api/v1/content-hub/syndicate - Register syndication relationship
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function validateApiKey(request: Request): Promise<{ valid: boolean; projectId?: string }> {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return { valid: false };
  }

  // For now, we accept any non-empty API key
  // In production, validate against stored API keys
  return { valid: true, projectId: 'act-ecosystem' };
}

export async function POST(request: Request) {
  const { valid, projectId } = await validateApiKey(request);

  if (!valid) {
    return NextResponse.json(
      { error: 'API key required for syndication' },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { contentType, contentId, destinationType, attributionText, requestedBy } = body;

  // Validate required fields
  if (!contentType || !contentId || !destinationType || !attributionText) {
    return NextResponse.json(
      {
        error: 'Missing required fields',
        required: ['contentType', 'contentId', 'destinationType', 'attributionText']
      },
      { status: 400 }
    );
  }

  // Validate content type
  const validContentTypes = ['article', 'story', 'media_asset', 'gallery'];
  if (!validContentTypes.includes(contentType)) {
    return NextResponse.json(
      { error: `Invalid contentType. Must be one of: ${validContentTypes.join(', ')}` },
      { status: 400 }
    );
  }

  // Validate destination type
  const validDestinations = [
    'justicehub', 'act_farm', 'harvest', 'goods', 'placemat', 'studio',
    'linkedin_company', 'linkedin_personal', 'youtube', 'bluesky', 'google_business',
    'external_partner', 'news_outlet', 'academic'
  ];
  if (!validDestinations.includes(destinationType)) {
    return NextResponse.json(
      { error: `Invalid destinationType. Must be one of: ${validDestinations.join(', ')}` },
      { status: 400 }
    );
  }

  const supabase = createSupabaseClient();

  // Check if content exists and is syndicatable
  const table = contentType === 'article' ? 'articles' :
                contentType === 'story' ? 'stories' :
                contentType === 'media_asset' ? 'media_assets' : 'galleries';

  const { data: content, error: contentError } = await supabase
    .from(table)
    .select('id, syndication_enabled, visibility')
    .eq('id', contentId)
    .single();

  if (contentError || !content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  // Check if syndication is enabled (for tables that have this field)
  if ('syndication_enabled' in content && !content.syndication_enabled) {
    return NextResponse.json(
      { error: 'Content is not available for syndication' },
      { status: 403 }
    );
  }

  // Create syndication record
  const { data, error } = await supabase
    .from('content_syndication')
    .insert({
      content_type: contentType,
      content_id: contentId,
      destination_type: destinationType,
      attribution_text: attributionText,
      syndication_consent_granted: true, // API key implies consent
      consent_granted_at: new Date().toISOString(),
      syndication_request_by: requestedBy || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    // Check for unique constraint violation (already syndicated)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Content already syndicated to this destination' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    syndicationId: data.id,
    status: 'pending',
    message: 'Syndication registered successfully',
    attribution: attributionText
  }, { status: 201 });
}

// GET endpoint to check syndication status
export async function GET(request: Request) {
  const url = new URL(request.url);
  const contentId = url.searchParams.get('contentId');
  const destinationType = url.searchParams.get('destination');

  if (!contentId) {
    return NextResponse.json({ error: 'contentId required' }, { status: 400 });
  }

  const supabase = createSupabaseClient();

  let query = supabase
    .from('content_syndication')
    .select('*')
    .eq('content_id', contentId);

  if (destinationType) {
    query = query.eq('destination_type', destinationType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    syndications: data || [],
    total: data?.length || 0
  });
}

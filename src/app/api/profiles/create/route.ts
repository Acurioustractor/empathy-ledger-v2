import { NextRequest, NextResponse } from 'next/server';

import { randomUUID } from 'crypto';

import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ Missing Supabase environment variables for profile creation', {
        hasUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(supabaseServiceRoleKey)
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        },
        { status: 500 }
      )
    }

    // Use service role for profile creation to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const body = await request.json();

    const {
      display_name,
      full_name,
      first_name,
      last_name,
      bio,
      avatar_media_id,
      cover_media_id,
      email,
      phone_number,
      tenant_id,
      is_storyteller,
      organization_id,
    } = body;

    // Validate required fields
    if (!display_name) {
      return NextResponse.json(
        { success: false, error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Get tenant_id from organization if provided
    let resolvedTenantId = tenant_id;
    if (!resolvedTenantId && organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('tenant_id')
        .eq('id', organization_id)
        .single();

      if (org?.tenant_id) {
        resolvedTenantId = org.tenant_id;
        console.log('📍 Resolved tenant_id from organization:', resolvedTenantId);
      }
    }

    if (!resolvedTenantId) {
      return NextResponse.json(
        { success: false, error: 'tenant_id is required (provide tenant_id or organization_id)' },
        { status: 400 }
      );
    }

    // Convert media IDs to URLs
    let avatarUrl: string | null = null;
    let coverUrl: string | null = null;

    if (avatar_media_id) {
      const { data: avatarMedia } = await supabase
        .from('media_assets')
        .select('cdn_url')
        .eq('id', avatar_media_id)
        .single();

      if (avatarMedia?.cdn_url) {
        avatarUrl = avatarMedia.cdn_url;
        console.log('✅ Retrieved avatar URL:', avatarUrl);
      } else {
        console.warn('⚠️  Avatar media ID provided but no media found:', avatar_media_id);
      }
    }

    if (cover_media_id) {
      const { data: coverMedia } = await supabase
        .from('media_assets')
        .select('cdn_url')
        .eq('id', cover_media_id)
        .single();

      if (coverMedia?.cdn_url) {
        coverUrl = coverMedia.cdn_url;
        console.log('✅ Retrieved cover URL:', coverUrl);
      } else {
        console.warn('⚠️  Cover media ID provided but no media found:', cover_media_id);
      }
    }

    // Always generate an ID up front so we can derive fallback fields (e.g. email)
    const profileId = randomUUID()

    const normalizedEmail = typeof email === 'string' && email.trim() !== ''
      ? email.trim().toLowerCase()
      : `storyteller-${profileId}@placeholder.local`

    // Create profile using direct insert (more reliable than RPC)
    const profileData: any = {
      id: profileId, // Explicitly set UUID to avoid database default issues
      display_name: display_name,
      full_name: full_name || display_name,
      first_name: first_name || null,
      last_name: last_name || null,
      bio: bio || null,
      profile_image_url: avatarUrl,
      avatar_media_id: avatar_media_id || null,
      cover_media_id: cover_media_id || null,
      email: normalizedEmail,
      phone_number: phone_number || null,
      tenant_id: resolvedTenantId,
      is_storyteller: is_storyteller || false,
      tenant_roles: is_storyteller ? ['storyteller'] : [],
      profile_status: email ? 'pending_activation' : 'active',
    };

    console.log('📝 Creating profile with data:', JSON.stringify(profileData, null, 2));
    console.log('🔑 Using service role key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    console.log('📊 Insert result - data:', data ? 'Success' : 'null');
    console.log('📊 Insert result - error:', error);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'A profile with this email already exists. Try using "Add existing storyteller" instead.',
            code: error.code,
          },
          { status: 409 }
        )
      }

      console.error('❌ Error creating profile:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to create profile',
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    const profile = data;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

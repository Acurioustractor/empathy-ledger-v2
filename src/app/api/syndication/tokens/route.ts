import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth/api-auth'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/syndication/tokens?storyId=xxx
 *
 * Returns embed tokens for a story.
 * Requires authentication - only story owner can view tokens.
 */
export async function GET(request: NextRequest) {
  // Authenticate
  const { user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get('storyId')

  if (!storyId) {
    return NextResponse.json({ error: 'storyId required' }, { status: 400 })
  }

  const supabase = createSupabaseClient()

  // Verify user owns this story or is admin
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, storyteller_id')
    .eq('id', storyId)
    .single()

  if (storyError || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  // Check authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOwner = story.storyteller_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('embed_tokens')
    .select('id, token, status, allowed_domains, expires_at, usage_count, last_used_at, created_at')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false })

  if (tokensError) {
    console.error('Error fetching tokens:', tokensError)
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }

  // Mask tokens for security (only show first 8 and last 4 chars)
  const maskedTokens = (tokens || []).map(token => ({
    ...token,
    token: token.token ? `${token.token.slice(0, 8)}...${token.token.slice(-4)}` : null,
    fullToken: token.token // Include full token for authenticated owner
  }))

  return NextResponse.json({
    tokens: maskedTokens,
    total: tokens?.length || 0
  })
}

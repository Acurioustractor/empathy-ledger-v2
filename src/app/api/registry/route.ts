export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import { extractBearerToken, verifyAppToken, validateApiKey } from '@/lib/external/auth'

type SyndicatedStoryRow = {
  story_id: string | null
  title: string | null
  content: string | null
  themes: unknown
  story_date: string | null
  share_media: boolean | null
  story_type: string | null
}

type StoryMediaRow = {
  id: string
  story_image_url: string | null
  media_url: string | null
  media_urls: unknown
}

type ExternalAccessPayload = {
  app_id: string
  app_name: string
  allowed_story_types: string[]
}

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const truncate = (value: string | null, max = 260) => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 3).trimEnd()}...`
}

const normalizeTags = (value: unknown) => {
  if (!Array.isArray(value)) return undefined
  const tags = value.filter((item): item is string => typeof item === 'string')
  return tags.length > 0 ? tags : undefined
}

const resolveMediaUrl = (row: StoryMediaRow) => {
  if (row.story_image_url) return row.story_image_url
  if (row.media_url) return row.media_url
  if (Array.isArray(row.media_urls)) {
    const first = row.media_urls.find((item) => typeof item === 'string')
    return typeof first === 'string' ? first : undefined
  }
  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const bearerToken = extractBearerToken(authHeader)
    const apiKeyHeader = request.headers.get('x-api-key')
    const token = bearerToken || apiKeyHeader

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    let payload: ExternalAccessPayload | null = await verifyAppToken(token)
    if (!payload) {
      const app = await validateApiKey(token)
      if (!app) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      payload = {
        app_id: app.id,
        app_name: app.app_name,
        allowed_story_types: app.allowed_story_types || [],
      }
    }

    const url = new URL(request.url)
    const limit = clamp(parseNumber(url.searchParams.get('limit'), 40), 1, 100)
    const offset = Math.max(parseNumber(url.searchParams.get('offset'), 0), 0)
    const storyType = url.searchParams.get('type')

    const supabase = createSupabaseServiceClient()

    let query = (supabase as any)
      .from('syndicated_stories')
      .select(
        'story_id, title, content, themes, story_date, share_media, story_type'
      )
      .eq('app_id', payload.app_id)
      .order('story_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (storyType) {
      query = query.eq('story_type', storyType)
    }

    if (payload.allowed_story_types?.length) {
      query = query.in('story_type', payload.allowed_story_types)
    }

    const { data, error } = await query

    if (error) {
      if (
        error.code === '42P01' ||
        (error.message && error.message.includes('does not exist'))
      ) {
        return NextResponse.json({ items: [], warning: 'Syndication not ready.' })
      }

      console.error('Registry syndication query failed:', error)
      return NextResponse.json(
        { error: 'Failed to fetch syndicated stories.' },
        { status: 500 }
      )
    }

    const rows = (data || []) as SyndicatedStoryRow[]
    const mediaStoryIds = rows
      .filter((row) => row.share_media && row.story_id)
      .map((row) => row.story_id as string)

    const mediaMap = new Map<string, string>()

    if (mediaStoryIds.length > 0) {
      const { data: mediaRows, error: mediaError } = await (supabase as any)
        .from('stories')
        .select('id, story_image_url, media_url, media_urls')
        .in('id', mediaStoryIds)

      if (mediaError) {
        console.error('Registry media lookup failed:', mediaError)
      } else {
        ;(mediaRows || []).forEach((row: StoryMediaRow) => {
          const mediaUrl = resolveMediaUrl(row)
          if (mediaUrl) {
            mediaMap.set(row.id, mediaUrl)
          }
        })
      }
    }

    const items = rows
      .filter((row) => row.story_id && row.title)
      .map((row) => ({
        id: row.story_id as string,
        type: row.story_type ?? 'story',
        title: row.title ?? 'Untitled story',
        summary: truncate(row.content),
        image_url: row.story_id ? mediaMap.get(row.story_id) : undefined,
        canonical_url: undefined,
        tags: normalizeTags(row.themes),
        status: 'published',
        published_at: row.story_date ?? null,
      }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Registry API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

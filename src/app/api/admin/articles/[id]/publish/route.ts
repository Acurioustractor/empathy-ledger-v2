// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/admin/articles/:id/publish
 * Publish an article
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = params

    // Check current status and get full article details from stories table
    const { data: current, error: fetchError } = await supabase
      .from('stories')
      .select('status, syndication_enabled, syndication_destinations, author_storyteller_id, organization_id, slug, article_type')
      .eq('id', id)
      .not('article_type', 'is', null)  // Ensure it's an article-type story
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Publish (stories table doesn't have published_at, but we set status)
    const { data: article, error } = await supabase
      .from('stories')
      .update({
        status: 'published'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error publishing article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create syndication records for selected destinations
    const syndicationResults = []
    if (current.syndication_enabled && current.syndication_destinations && current.syndication_destinations.length > 0) {
      console.log(`Creating syndication records for ${current.syndication_destinations.length} destinations`)

      for (const destination of current.syndication_destinations) {
        try {
          // Check if syndication site exists
          const { data: site } = await supabase
            .from('syndication_sites')
            .select('id')
            .eq('slug', destination)
            .single()

          if (!site) {
            console.warn(`Syndication site not found: ${destination}`)
            syndicationResults.push({
              destination,
              status: 'skipped',
              reason: 'Site not registered'
            })
            continue
          }

          // Check if syndication record already exists
          const { data: existing } = await supabase
            .from('content_syndication')
            .select('id')
            .eq('content_id', id)
            .eq('destination_site_id', site.id)
            .single()

          if (existing) {
            console.log(`Syndication record already exists for ${destination}`)
            syndicationResults.push({
              destination,
              status: 'exists',
              reason: 'Already syndicated'
            })
            continue
          }

          // Create content_syndication record
          const { error: syndicationError } = await supabase
            .from('content_syndication')
            .insert({
              content_type: 'article',
              content_id: id,
              destination_type: destination,
              destination_site_id: site.id,
              status: 'pending', // Will be processed by webhook/cron job
              storyteller_id: current.author_storyteller_id,
              organization_id: current.organization_id,
              attribution_text: 'Originally published on Empathy Ledger',
              attribution_link: `https://empathyledger.com/articles/${current.slug}`
            })

          if (syndicationError) {
            console.error(`Error creating syndication for ${destination}:`, syndicationError)
            syndicationResults.push({
              destination,
              status: 'error',
              reason: syndicationError.message
            })
          } else {
            syndicationResults.push({
              destination,
              status: 'created'
            })
          }
        } catch (err) {
          console.error(`Error processing syndication for ${destination}:`, err)
          syndicationResults.push({
            destination,
            status: 'error',
            reason: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status
      },
      syndication: {
        enabled: current.syndication_enabled || false,
        destinations: syndicationResults
      }
    })

  } catch (error) {
    console.error('Error publishing article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish article' },
      { status: 500 }
    )
  }
}

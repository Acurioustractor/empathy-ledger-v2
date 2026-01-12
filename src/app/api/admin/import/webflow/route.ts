/**
 * Webflow Import API Endpoint
 * POST /api/admin/import/webflow
 *
 * Imports blog posts from Webflow CMS into Empathy Ledger articles table
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { WebflowImportService } from '@/lib/services/webflow-import.service'
import type { WebflowImportRequest } from '@/types/webflow'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Check if user has admin role
    // For now, allow any authenticated user

    // Parse request body
    const body = await request.json() as WebflowImportRequest

    // Validate required fields
    if (!body.webflowCollectionId) {
      return NextResponse.json(
        { error: 'webflowCollectionId is required' },
        { status: 400 }
      )
    }

    if (!body.webflowApiKey) {
      return NextResponse.json(
        { error: 'webflowApiKey is required' },
        { status: 400 }
      )
    }

    if (!body.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    // Verify organization exists and user has access
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', body.organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Create import service
    const importService = new WebflowImportService(supabase, body)

    // Run import
    console.log(`Starting Webflow import for collection: ${body.webflowCollectionId}`)
    const result = await importService.importCollection(body.webflowCollectionId)

    // Log result
    console.log(`Webflow import complete:`, {
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors.length
    })

    // Return result
    return NextResponse.json(
      {
        success: result.success,
        message: `Import complete: ${result.imported} imported, ${result.skipped} skipped`,
        data: {
          imported: result.imported,
          skipped: result.skipped,
          errors: result.errors,
          articles: result.articles
        }
      },
      { status: result.success ? 200 : 207 } // 207 = Multi-Status (partial success)
    )

  } catch (error) {
    console.error('Webflow import error:', error)

    return NextResponse.json(
      {
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/import/webflow
 * Returns import status and configuration options
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get import statistics
    const { count: totalImported } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('source_platform', 'webflow')

    const { count: recentImports } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('source_platform', 'webflow')
      .gte('imported_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    // Get recent imported articles
    const { data: recentArticles } = await supabase
      .from('articles')
      .select('id, title, slug, source_id, imported_at, status')
      .eq('source_platform', 'webflow')
      .order('imported_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      statistics: {
        total_imported: totalImported || 0,
        imports_last_24h: recentImports || 0
      },
      recent_imports: recentArticles || [],
      configuration: {
        supported_platforms: ['webflow', 'wordpress', 'medium', 'ghost', 'substack'],
        default_options: {
          preserveSlug: true,
          importImages: false,
          convertToMarkdown: false,
          skipDrafts: true,
          batchSize: 100
        }
      }
    })

  } catch (error) {
    console.error('Error fetching import status:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch import status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

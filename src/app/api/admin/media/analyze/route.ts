// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createPhotoAnalyzer, PhotoAnalysisResult } from '@/lib/media-intelligence/photo-analyzer'

/**
 * POST /api/admin/media/analyze
 *
 * Trigger AI analysis on a media asset with consent gate.
 * This endpoint connects the SmartGallery UI to the PhotoAnalyzer service.
 *
 * Request body:
 * - mediaId: string - The media asset ID to analyze
 * - consentGranted: boolean - Whether user has granted consent for AI analysis
 *
 * Returns:
 * - Analysis results including detected objects, scene classification, tags, etc.
 * - Or error if consent not granted or analysis fails
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Get request body
    const body = await request.json()
    const { mediaId, consentGranted } = body as {
      mediaId: string
      consentGranted: boolean
    }

    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId is required' },
        { status: 400 }
      )
    }

    // CONSENT GATE - Critical check
    if (!consentGranted) {
      return NextResponse.json(
        { error: 'AI analysis requires explicit consent. Please grant consent before analyzing.' },
        { status: 403 }
      )
    }

    // Get the media asset details
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select(`
        id,
        url,
        filename,
        uploaded_by,
        storytellers:storyteller_id(id, name)
      `)
      .eq('id', mediaId)
      .single()

    if (mediaError || !mediaAsset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      )
    }

    // Check if already analyzed
    const { data: existingAnalysis } = await supabase
      .from('media_ai_analysis')
      .select('id, processing_status, detected_objects, auto_tags, scene_classification')
      .eq('media_asset_id', mediaId)
      .single()

    if (existingAnalysis?.processing_status === 'completed') {
      // Return existing analysis
      return NextResponse.json({
        success: true,
        cached: true,
        analysis: {
          mediaAssetId: mediaId,
          detectedObjects: existingAnalysis.detected_objects || [],
          sceneClassification: existingAnalysis.scene_classification,
          autoTags: existingAnalysis.auto_tags || []
        }
      })
    }

    // Create or get the photo analyzer
    let analyzer: ReturnType<typeof createPhotoAnalyzer>

    try {
      analyzer = createPhotoAnalyzer()
    } catch (initError) {
      console.error('Failed to initialize PhotoAnalyzer:', initError)
      return NextResponse.json(
        { error: 'Media intelligence service unavailable. Check API keys.' },
        { status: 503 }
      )
    }

    // Grant consent in the database first
    const storytellerId = (mediaAsset.storytellers as any)?.id || mediaAsset.uploaded_by
    await analyzer.grantConsent(mediaId, storytellerId, mediaAsset.uploaded_by)

    // Run the analysis
    const result: PhotoAnalysisResult = await analyzer.analyzePhoto({
      mediaAssetId: mediaId,
      storytellerId: storytellerId,
      imageUrl: mediaAsset.url,
      consentGranted: true
    })

    // If cultural review is required, flag it
    if (result.culturalReviewRequired) {
      await supabase
        .from('media_ai_analysis')
        .update({
          cultural_review_status: 'pending',
          cultural_review_required: true
        })
        .eq('media_asset_id', mediaId)
    }

    return NextResponse.json({
      success: true,
      cached: false,
      analysis: {
        mediaAssetId: result.mediaAssetId,
        detectedObjects: result.detectedObjects,
        sceneClassification: result.sceneClassification,
        sceneConfidence: result.sceneConfidence,
        autoTags: result.autoTags,
        culturalReviewRequired: result.culturalReviewRequired,
        emotionalTone: result.emotionalTone
      }
    })

  } catch (error) {
    console.error('Error analyzing media:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/media/analyze
 *
 * Get analysis status/results for a media asset
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId query parameter is required' },
        { status: 400 }
      )
    }

    // Get analysis record
    const { data: analysis, error } = await supabase
      .from('media_ai_analysis')
      .select(`
        id,
        media_asset_id,
        ai_consent_granted,
        detected_objects,
        scene_classification,
        scene_confidence,
        auto_tags,
        verified_tags,
        cultural_review_required,
        cultural_review_status,
        processing_status,
        processing_error,
        processed_at,
        ai_model_version
      `)
      .eq('media_asset_id', mediaId)
      .single()

    if (error || !analysis) {
      // No analysis record - hasn't been analyzed yet
      return NextResponse.json({
        status: 'not_analyzed',
        mediaId
      })
    }

    return NextResponse.json({
      status: analysis.processing_status,
      mediaId,
      consentGranted: analysis.ai_consent_granted,
      analysis: analysis.processing_status === 'completed' ? {
        detectedObjects: analysis.detected_objects || [],
        sceneClassification: analysis.scene_classification,
        sceneConfidence: analysis.scene_confidence,
        autoTags: analysis.auto_tags || [],
        verifiedTags: analysis.verified_tags || [],
        culturalReviewRequired: analysis.cultural_review_required,
        culturalReviewStatus: analysis.cultural_review_status,
        processedAt: analysis.processed_at,
        modelVersion: analysis.ai_model_version
      } : null,
      error: analysis.processing_error
    })

  } catch (error) {
    console.error('Error getting analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get analysis' },
      { status: 500 }
    )
  }
}

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params

    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select(`
        *,
        profiles!transcripts_storyteller_id_fkey (
          full_name,
          display_name
        )
      `)
      .eq('id', transcriptId)
      .single()

    if (error || !transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      transcript
    })

  } catch (error) {
    console.error('❌ Error fetching transcript:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params
    const body = await request.json()
    const { ai_summary, key_quotes } = body

    console.log('📝 Updating AI analysis for transcript:', transcriptId)

    const { data, error } = await supabase
      .from('transcripts')
      .update({
        ai_summary,
        key_quotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating AI analysis:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update AI analysis' },
        { status: 500 }
      )
    }

    console.log('✅ AI analysis updated successfully')

    return NextResponse.json({
      success: true,
      transcript: data
    })
  } catch (error) {
    console.error('❌ Error in transcript PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update AI analysis' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params
    const body = await request.json()

    console.log('📝 Updating transcript:', transcriptId)

    // Validate required fields
    if (!body.title || !body.transcript_content) {
      return NextResponse.json(
        { success: false, error: 'Title and transcript content are required' },
        { status: 400 }
      )
    }

    // Check if transcript exists
    const { data: existingTranscript, error: fetchError } = await supabase
      .from('transcripts')
      .select('id, title, storyteller_id')
      .eq('id', transcriptId)
      .single()

    if (fetchError || !existingTranscript) {
      console.error('❌ Transcript not found:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // Update the transcript
    const { data, error } = await supabase
      .from('transcripts')
      .update({
        title: body.title,
        transcript_content: body.transcript_content,
        status: body.status || 'completed',
        source_video_url: body.source_video_url || null,
        audio_url: body.audio_url || null,
        language: body.language || 'en',
        word_count: body.word_count || 0,
        character_count: body.character_count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating transcript:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update transcript' },
        { status: 500 }
      )
    }

    console.log('✅ Transcript updated successfully:', body.title)

    return NextResponse.json({
      success: true,
      transcript: data,
      message: 'Transcript updated successfully'
    })

  } catch (error) {
    console.error('❌ Error in transcript PUT:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params
    console.log('🗑️ Removing transcript:', transcriptId)

    // Check if transcript exists
    const { data: transcript, error: fetchError } = await supabase
      .from('transcripts')
      .select('id, title')
      .eq('id', transcriptId)
      .single()

    if (fetchError || !transcript) {
      console.error('❌ Transcript not found:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Transcript not found' },
        { status: 404 }
      )
    }

    // Delete the transcript
    const { error: deleteError } = await supabase
      .from('transcripts')
      .delete()
      .eq('id', transcriptId)

    if (deleteError) {
      console.error('❌ Error deleting transcript:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete transcript' },
        { status: 500 }
      )
    }

    console.log('✅ Transcript deleted successfully:', transcript.title)

    return NextResponse.json({
      success: true,
      message: 'Transcript deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error in transcript DELETE:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
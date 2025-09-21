import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Getting transcripts for project:', projectId)

    // Get project details first to verify access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Project not found:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all transcripts associated with this project
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        transcript_content,
        text,
        storyteller_id,
        recording_date,
        duration_seconds,
        duration,
        word_count,
        character_count,
        processing_status,
        transcript_quality,
        cultural_sensitivity,
        requires_elder_review,
        elder_reviewed_at,
        audio_url,
        video_url,
        source_video_url,
        source_video_title,
        ai_confidence_score,
        created_at,
        updated_at,
        profiles!transcripts_storyteller_id_fkey (
          id,
          display_name,
          full_name,
          is_elder
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError)
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
    }

    // Transform data for frontend
    const transformedTranscripts = (transcripts || []).map(transcript => ({
      id: transcript.id,
      title: transcript.title,
      content: transcript.transcript_content || transcript.text,
      storytellerId: transcript.storyteller_id,
      storyteller: transcript.profiles ? {
        id: transcript.profiles.id,
        name: transcript.profiles.display_name || transcript.profiles.full_name,
        isElder: transcript.profiles.is_elder
      } : null,
      recordingDate: transcript.recording_date,
      duration: transcript.duration_seconds || transcript.duration,
      wordCount: transcript.word_count,
      characterCount: transcript.character_count,
      status: transcript.processing_status,
      quality: transcript.transcript_quality,
      culturalSensitivity: transcript.cultural_sensitivity,
      requiresElderReview: transcript.requires_elder_review,
      elderReviewed: !!transcript.elder_reviewed_at,
      audioUrl: transcript.audio_url,
      videoUrl: transcript.video_url || transcript.source_video_url,
      videoTitle: transcript.source_video_title,
      confidence: transcript.ai_confidence_score,
      createdAt: transcript.created_at,
      updatedAt: transcript.updated_at
    }))

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        tenantId: project.tenant_id,
        organizationId: project.organization_id
      },
      transcripts: transformedTranscripts,
      total: transformedTranscripts.length,
      stats: {
        totalTranscripts: transformedTranscripts.length,
        completed: transformedTranscripts.filter(t => t.status === 'completed').length,
        processing: transformedTranscripts.filter(t => t.status === 'processing').length,
        elderReviewed: transformedTranscripts.filter(t => t.elderReviewed).length,
        pendingReview: transformedTranscripts.filter(t => t.requiresElderReview && !t.elderReviewed).length,
        totalDuration: transformedTranscripts.reduce((sum, t) => sum + (t.duration || 0), 0),
        totalWords: transformedTranscripts.reduce((sum, t) => sum + (t.wordCount || 0), 0)
      }
    })

  } catch (error) {
    console.error('Project transcripts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch project transcripts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Creating transcript for project:', projectId)

    // Get project details and verify access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const transcriptData = await request.json()
    console.log('Received transcript data:', transcriptData)

    if (!transcriptData.title) {
      return NextResponse.json({ error: 'Transcript title is required' }, { status: 400 })
    }

    // Create transcript linked to project
    const { data: newTranscript, error: transcriptError } = await supabase
      .from('transcripts')
      .insert([{
        title: transcriptData.title,
        transcript_content: transcriptData.content || '',
        text: transcriptData.content || '',
        storyteller_id: transcriptData.storytellerId || null,
        project_id: projectId, // Link to project
        tenant_id: project.tenant_id,
        recording_date: transcriptData.recordingDate || null,
        duration_seconds: transcriptData.duration || null,
        duration: transcriptData.duration || null,
        audio_url: transcriptData.audioUrl || null,
        video_url: transcriptData.videoUrl || null,
        source_video_url: transcriptData.videoUrl || null,
        source_video_title: transcriptData.videoTitle || null,
        cultural_sensitivity: transcriptData.culturalSensitivity || 'standard',
        requires_elder_review: transcriptData.requiresElderReview || false,
        processing_status: transcriptData.status || 'completed',
        transcript_quality: transcriptData.quality || 'good',
        ai_processing_consent: true,
        processing_consent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        id,
        title,
        transcript_content,
        text,
        storyteller_id,
        recording_date,
        duration_seconds,
        duration,
        processing_status,
        created_at
      `)
      .single()

    if (transcriptError) {
      console.error('Error creating transcript:', transcriptError)
      return NextResponse.json({ error: 'Failed to create transcript' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Transcript created successfully',
      transcript: {
        id: newTranscript.id,
        title: newTranscript.title,
        content: newTranscript.transcript_content || newTranscript.text,
        storytellerId: newTranscript.storyteller_id,
        recordingDate: newTranscript.recording_date,
        duration: newTranscript.duration_seconds || newTranscript.duration,
        status: newTranscript.processing_status,
        createdAt: newTranscript.created_at
      }
    })

  } catch (error) {
    console.error('Create project transcript error:', error)
    return NextResponse.json({ error: 'Failed to create transcript' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    const { transcriptId, ...updateData } = await request.json()

    if (!transcriptId) {
      return NextResponse.json({ error: 'Transcript ID is required' }, { status: 400 })
    }

    // Verify transcript belongs to this project
    const { data: existingTranscript, error: fetchError } = await supabase
      .from('transcripts')
      .select('id, project_id')
      .eq('id', transcriptId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existingTranscript) {
      return NextResponse.json({ error: 'Transcript not found in this project' }, { status: 404 })
    }

    // Update transcript
    const { data: updatedTranscript, error: updateError } = await supabase
      .from('transcripts')
      .update({
        title: updateData.title,
        transcript_content: updateData.content,
        text: updateData.content,
        recording_date: updateData.recordingDate,
        duration_seconds: updateData.duration,
        duration: updateData.duration,
        audio_url: updateData.audioUrl,
        video_url: updateData.videoUrl,
        source_video_url: updateData.videoUrl,
        source_video_title: updateData.videoTitle,
        cultural_sensitivity: updateData.culturalSensitivity,
        requires_elder_review: updateData.requiresElderReview,
        processing_status: updateData.status,
        transcript_quality: updateData.quality,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating transcript:', updateError)
      return NextResponse.json({ error: 'Failed to update transcript' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Transcript updated successfully',
      transcript: updatedTranscript
    })

  } catch (error) {
    console.error('Update project transcript error:', error)
    return NextResponse.json({ error: 'Failed to update transcript' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const transcriptId = searchParams.get('transcriptId')

    if (!transcriptId) {
      return NextResponse.json({ error: 'Transcript ID is required' }, { status: 400 })
    }

    // Verify transcript belongs to this project
    const { data: existingTranscript, error: fetchError } = await supabase
      .from('transcripts')
      .select('id, project_id')
      .eq('id', transcriptId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existingTranscript) {
      return NextResponse.json({ error: 'Transcript not found in this project' }, { status: 404 })
    }

    // Delete transcript
    const { error: deleteError } = await supabase
      .from('transcripts')
      .delete()
      .eq('id', transcriptId)

    if (deleteError) {
      console.error('Error deleting transcript:', deleteError)
      return NextResponse.json({ error: 'Failed to delete transcript' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Transcript deleted successfully' })

  } catch (error) {
    console.error('Delete project transcript error:', error)
    return NextResponse.json({ error: 'Failed to delete transcript' }, { status: 500 })
  }
}
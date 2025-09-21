import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params
    const { projectId } = await request.json()

    const supabase = createSupabaseServerClient()

    // Update the transcript with the new project assignment
    const { error } = await supabase
      .from('transcripts')
      .update({
        project_id: projectId,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)

    if (error) {
      console.error('Error assigning project to transcript:', error)
      return NextResponse.json({ error: 'Failed to assign project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in assign-project route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
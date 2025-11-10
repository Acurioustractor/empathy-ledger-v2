import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()

    const { updates } = body

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    console.log(`📝 Bulk assigning storytellers to ${updates.length} transcripts`)

    let successCount = 0
    const errors: Array<{ transcript_id: string; error: string }> = []

    // Process each update
    for (const update of updates) {
      const { transcript_id, storyteller_id } = update

      if (!transcript_id) {
        errors.push({ transcript_id: 'unknown', error: 'Missing transcript_id' })
        continue
      }

      try {
        const { error } = await supabase
          .from('transcripts')
          .update({
            storyteller_id: storyteller_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', transcript_id)

        if (error) {
          console.error(`❌ Failed to update transcript ${transcript_id}:`, error)
          errors.push({ transcript_id, error: error.message })
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`❌ Error updating transcript ${transcript_id}:`, err)
        errors.push({
          transcript_id,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    console.log(`✅ Bulk assignment complete: ${successCount}/${updates.length} successful`)

    return NextResponse.json({
      success: true,
      updated: successCount,
      total: updates.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully assigned ${successCount} storyteller${successCount !== 1 ? 's' : ''}`
    })

  } catch (error) {
    console.error('❌ Bulk assign error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bulk assign storytellers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

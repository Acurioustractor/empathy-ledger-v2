import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { storytellerId, settings, timestamp } = await request.json()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this storyteller profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', storytellerId)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own settings' },
        { status: 403 }
      )
    }

    // Update privacy settings in profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        privacy_settings: settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storytellerId)

    if (updateError) {
      console.error('Privacy settings update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    // Log privacy change to audit log
    const { error: auditError } = await supabase
      .from('privacy_changes')
      .insert({
        profile_id: storytellerId,
        change_type: 'settings_update',
        old_value: null, // Could fetch previous value if needed
        new_value: settings,
        changed_at: timestamp,
        changed_by: user.id,
      })

    if (auditError) {
      console.error('Audit log error:', auditError)
      // Don't fail the request if audit fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
    })
  } catch (error) {
    console.error('Privacy settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

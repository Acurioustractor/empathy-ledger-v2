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

    // Update ALMA settings in profiles table
    // Store in consent_preferences and cultural_permissions JSONB fields
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        consent_preferences: settings.aiConsent,
        cultural_permissions: {
          sacred_knowledge: settings.sacredKnowledge,
          elder_review: settings.elderReview,
          cultural_safety: settings.culturalSafety,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', storytellerId)

    if (updateError) {
      console.error('ALMA settings update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update ALMA settings' },
        { status: 500 }
      )
    }

    // Log cultural safety change to audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'alma_settings_update',
        resource_type: 'profile',
        resource_id: storytellerId,
        details: {
          settings_updated: Object.keys(settings),
          timestamp,
        },
        created_at: new Date().toISOString(),
      })

    if (auditError) {
      console.error('Audit log error:', auditError)
      // Don't fail the request if audit fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'ALMA settings updated successfully',
    })
  } catch (error) {
    console.error('ALMA settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

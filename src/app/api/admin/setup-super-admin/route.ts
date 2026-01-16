// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/admin/setup-super-admin
 * One-time setup to grant super-admin permissions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    const { profileId, setupKey } = body

    // Security: Require a setup key (in production, this should be an env var)
    // For now, using a simple check
    if (setupKey !== 'empathy-ledger-super-admin-setup-2026') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    // 1. Set super-admin flag on profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_super_admin: true })
      .eq('id', profileId)

    if (profileError) {
      console.error('Error setting super-admin flag:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 2. Grant all super-admin permissions
    const permissionTypes = [
      'manage_all_organizations',
      'cross_org_publishing',
      'content_moderation',
      'super_admin_dashboard',
      'manage_syndication',
      'social_media_publishing',
      'analytics_access'
    ]

    const permissions = permissionTypes.map(type => ({
      profile_id: profileId,
      permission_type: type,
      granted_at: new Date().toISOString(),
      is_active: true
    }))

    const { error: permissionsError } = await supabase
      .from('super_admin_permissions')
      .upsert(permissions, {
        onConflict: 'profile_id,permission_type',
        ignoreDuplicates: false
      })

    if (permissionsError) {
      console.error('Error granting permissions:', permissionsError)
      return NextResponse.json({ error: permissionsError.message }, { status: 500 })
    }

    // 3. Log the setup action
    const { error: logError } = await supabase
      .from('super_admin_audit_log')
      .insert({
        admin_profile_id: profileId,
        action_type: 'setup',
        target_type: 'super_admin_role',
        target_id: profileId,
        action_metadata: {
          permissions_granted: permissionTypes,
          setup_timestamp: new Date().toISOString()
        },
        success: true
      })

    if (logError) {
      console.error('Error logging setup:', logError)
      // Don't fail the request if logging fails
    }

    // 4. Fetch the updated profile to confirm
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, email, is_super_admin')
      .eq('id', profileId)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
    }

    return NextResponse.json({
      success: true,
      message: 'Super-admin access granted successfully',
      profile: profile || { id: profileId },
      permissions: permissionTypes
    })

  } catch (error) {
    console.error('Error in super-admin setup:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup super-admin' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/setup-super-admin
 * List all profiles to help identify which one to grant super-admin to
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { searchParams } = new URL(request.url)
    const setupKey = searchParams.get('key')

    // Security check
    if (setupKey !== 'empathy-ledger-super-admin-setup-2026') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch super-admin permissions count for each profile
    const { data: permissions } = await supabase
      .from('super_admin_permissions')
      .select('profile_id, permission_type, is_active')
      .eq('is_active', true)

    const permissionCounts = permissions?.reduce((acc, perm) => {
      acc[perm.profile_id] = (acc[perm.profile_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const profilesWithPermissions = profiles?.map(p => ({
      ...p,
      super_admin_permissions_count: permissionCounts[p.id] || 0
    }))

    return NextResponse.json({
      profiles: profilesWithPermissions,
      total: profiles?.length || 0,
      instructions: {
        message: 'To grant super-admin access, POST to this endpoint with:',
        body: {
          profileId: '<profile-id-from-list>',
          setupKey: 'empathy-ledger-super-admin-setup-2026'
        }
      }
    })

  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

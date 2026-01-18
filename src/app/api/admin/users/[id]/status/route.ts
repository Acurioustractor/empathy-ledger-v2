// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { requireAdminAuth } from '@/lib/middleware/admin-auth'



export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { status } = body

    if (!status || !['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the user status
    const { data, error } = await supabase
      .from('profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user status:', error)
      return Response.json({ error: 'Failed to update user status' }, { status: 500 })
    }

    // If suspending user, we might want to revoke their session
    if (status === 'suspended') {
      try {
        // Sign out all sessions for this user
        await supabase.auth.admin.signOut(id, 'global')
      } catch (signOutError) {
        console.warn('Could not sign out user sessions:', signOutError)
        // Don't fail the request if signout fails
      }
    }

    return Response.json({ 
      success: true, 
      data: {
        id: data.id,
        status: data.status,
        updated_at: data.updated_at
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
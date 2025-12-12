/**
 * Magic Link Authentication Service
 *
 * Provides passwordless authentication for storytellers via:
 * 1. Email magic links
 * 2. QR codes (operator shows on their device, storyteller scans)
 *
 * Flow:
 * - Operator creates story with storyteller contact
 * - System generates unique token
 * - Token can be sent via email OR displayed as QR code
 * - Storyteller clicks/scans → auto-login → sees their story
 */

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'
import crypto from 'crypto'

export interface StoryInvitation {
  id: string
  storyId: string
  storytellerId: string | null
  storytellerEmail: string | null
  storytellerPhone: string | null
  storytellerName: string
  token: string
  magicLinkUrl: string
  qrCodeData: string
  expiresAt: Date
  sentVia: 'email' | 'sms' | 'qr' | 'none'
  acceptedAt: Date | null
  createdBy: string
}

export interface CreateInvitationInput {
  storyId: string
  storytellerName: string
  storytellerEmail?: string
  storytellerPhone?: string
  createdBy: string
  sendEmail?: boolean
  expiresInDays?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

class MagicLinkService {
  private readonly defaultExpiryDays = 7
  private readonly tokenLength = 32

  /**
   * Create a new invitation for a storyteller to review their story
   */
  async createInvitation(input: CreateInvitationInput): Promise<StoryInvitation | null> {
    const supabase = createSupabaseServiceClient()

    // Generate secure token
    const token = this.generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || this.defaultExpiryDays))

    // Build magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
    const magicLinkUrl = `${baseUrl}/auth/magic?token=${token}`

    // QR code data is just the URL
    const qrCodeData = magicLinkUrl

    try {
      // Check if storyteller profile exists or needs to be created
      let storytellerId: string | null = null

      if (input.storytellerEmail) {
        // Look for existing profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingProfile } = await (supabase as any)
          .from('profiles')
          .select('id')
          .eq('email', input.storytellerEmail)
          .single()

        if (existingProfile) {
          storytellerId = existingProfile.id
        }
      }

      // Create invitation record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('story_review_invitations')
        .insert({
          story_id: input.storyId,
          storyteller_id: storytellerId,
          storyteller_email: input.storytellerEmail || null,
          storyteller_phone: input.storytellerPhone || null,
          storyteller_name: input.storytellerName,
          token,
          expires_at: expiresAt.toISOString(),
          sent_via: input.sendEmail ? 'email' : 'none',
          created_by: input.createdBy
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        return null
      }

      // Send email if requested
      if (input.sendEmail && input.storytellerEmail) {
        await this.sendInvitationEmail(
          input.storytellerEmail,
          input.storytellerName,
          magicLinkUrl,
          input.storyId
        )

        // Update sent_via
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('story_review_invitations')
          .update({ sent_via: 'email', sent_at: new Date().toISOString() })
          .eq('id', data.id)
      }

      return {
        id: data.id,
        storyId: data.story_id,
        storytellerId: data.storyteller_id,
        storytellerEmail: data.storyteller_email,
        storytellerPhone: data.storyteller_phone,
        storytellerName: data.storyteller_name,
        token: data.token,
        magicLinkUrl,
        qrCodeData,
        expiresAt: new Date(data.expires_at),
        sentVia: data.sent_via,
        acceptedAt: data.accepted_at ? new Date(data.accepted_at) : null,
        createdBy: data.created_by
      }
    } catch (error) {
      console.error('Error in createInvitation:', error)
      return null
    }
  }

  /**
   * Validate a magic link token and return the invitation
   */
  async validateToken(token: string): Promise<{
    valid: boolean
    invitation?: StoryInvitation
    error?: string
  }> {
    const supabase = createSupabaseServiceClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('story_review_invitations')
        .select(`
          *,
          stories:story_id (
            id,
            title,
            storyteller_id
          )
        `)
        .eq('token', token)
        .single()

      if (error || !data) {
        return { valid: false, error: 'Invalid or expired link' }
      }

      // Check expiry
      if (new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'This link has expired' }
      }

      // Check if already used (optional - allow re-use for convenience)
      // if (data.accepted_at) {
      //   return { valid: false, error: 'This link has already been used' }
      // }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
      const magicLinkUrl = `${baseUrl}/auth/magic?token=${token}`

      return {
        valid: true,
        invitation: {
          id: data.id,
          storyId: data.story_id,
          storytellerId: data.storyteller_id,
          storytellerEmail: data.storyteller_email,
          storytellerPhone: data.storyteller_phone,
          storytellerName: data.storyteller_name,
          token: data.token,
          magicLinkUrl,
          qrCodeData: magicLinkUrl,
          expiresAt: new Date(data.expires_at),
          sentVia: data.sent_via,
          acceptedAt: data.accepted_at ? new Date(data.accepted_at) : null,
          createdBy: data.created_by
        }
      }
    } catch (error) {
      console.error('Error validating token:', error)
      return { valid: false, error: 'Failed to validate link' }
    }
  }

  /**
   * Accept an invitation - creates/links user account and marks as accepted
   */
  async acceptInvitation(token: string, userId: string): Promise<{
    success: boolean
    storyId?: string
    error?: string
  }> {
    const supabase = createSupabaseServiceClient()

    try {
      // Validate token first
      const validation = await this.validateToken(token)
      if (!validation.valid || !validation.invitation) {
        return { success: false, error: validation.error }
      }

      const invitation = validation.invitation

      // Update invitation as accepted
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('story_review_invitations')
        .update({
          accepted_at: new Date().toISOString(),
          storyteller_id: userId
        })
        .eq('id', invitation.id)

      // Get story details including tenant/org for profile creation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: story } = await (supabase as any)
        .from('stories')
        .select('storyteller_id, tenant_id, organization_id')
        .eq('id', invitation.storyId)
        .single()

      // Link story to this user if not already linked
      if (story && !story.storyteller_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('stories')
          .update({ storyteller_id: userId })
          .eq('id', invitation.storyId)
      }

      // Check if user profile exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id, display_name, is_storyteller')
        .eq('id', userId)
        .single()

      if (!profile) {
        // CREATE new profile for this user
        // This is critical for new users who sign up via magic link
        console.log('Creating new profile for storyteller:', userId, invitation.storytellerName)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: createError } = await (supabase as any)
          .from('profiles')
          .insert({
            id: userId,
            email: invitation.storytellerEmail,
            display_name: invitation.storytellerName,
            is_storyteller: true,
            tenant_id: story?.tenant_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createError) {
          console.error('Error creating profile:', createError)
          // Don't fail the invitation acceptance, just log the error
        }
      } else {
        // UPDATE existing profile if needed
        const updates: AnyRecord = {}
        if (!profile.display_name && invitation.storytellerName) {
          updates.display_name = invitation.storytellerName
        }
        if (!profile.is_storyteller) {
          updates.is_storyteller = true
        }
        if (Object.keys(updates).length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('profiles')
            .update(updates)
            .eq('id', userId)
        }
      }

      return { success: true, storyId: invitation.storyId }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: 'Failed to accept invitation' }
    }
  }

  /**
   * Get invitation by story ID (for showing QR code)
   */
  async getInvitationForStory(storyId: string): Promise<StoryInvitation | null> {
    const supabase = createSupabaseServiceClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('story_review_invitations')
        .select('*')
        .eq('story_id', storyId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return null
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
      const magicLinkUrl = `${baseUrl}/auth/magic?token=${data.token}`

      return {
        id: data.id,
        storyId: data.story_id,
        storytellerId: data.storyteller_id,
        storytellerEmail: data.storyteller_email,
        storytellerPhone: data.storyteller_phone,
        storytellerName: data.storyteller_name,
        token: data.token,
        magicLinkUrl,
        qrCodeData: magicLinkUrl,
        expiresAt: new Date(data.expires_at),
        sentVia: data.sent_via,
        acceptedAt: data.accepted_at ? new Date(data.accepted_at) : null,
        createdBy: data.created_by
      }
    } catch (error) {
      console.error('Error getting invitation:', error)
      return null
    }
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex')
  }

  /**
   * Send invitation email via Supabase or custom email service
   */
  private async sendInvitationEmail(
    email: string,
    name: string,
    magicLinkUrl: string,
    storyId: string
  ): Promise<void> {
    // For now, use Supabase's built-in email
    // In production, you might use a custom email service for better templates
    const supabase = createSupabaseServiceClient()

    try {
      // Option 1: Use Supabase magic link (creates user if needed)
      // This sends a proper auth email
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: magicLinkUrl,
          data: {
            display_name: name,
            story_id: storyId,
            is_storyteller: true
          }
        }
      })

      console.log(`Invitation email sent to ${email}`)
    } catch (error) {
      console.error('Error sending invitation email:', error)
      // Don't throw - email failure shouldn't block invitation creation
    }
  }

  /**
   * Resend an invitation
   */
  async resendInvitation(invitationId: string): Promise<boolean> {
    const supabase = createSupabaseServiceClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('story_review_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (!data || !data.storyteller_email) {
        return false
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
      const magicLinkUrl = `${baseUrl}/auth/magic?token=${data.token}`

      await this.sendInvitationEmail(
        data.storyteller_email,
        data.storyteller_name,
        magicLinkUrl,
        data.story_id
      )

      // Update sent timestamp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('story_review_invitations')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', invitationId)

      return true
    } catch (error) {
      console.error('Error resending invitation:', error)
      return false
    }
  }
}

// Export singleton
export const magicLinkService = new MagicLinkService()
export default magicLinkService

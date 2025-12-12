/**
 * SMS Service
 *
 * Sends SMS messages via Twilio or other providers.
 * Used for sending magic links to storytellers.
 *
 * Required environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

export interface SendSMSInput {
  to: string
  message: string
}

export interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

class SMSService {
  private accountSid: string | undefined
  private authToken: string | undefined
  private fromNumber: string | undefined

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID
    this.authToken = process.env.TWILIO_AUTH_TOKEN
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER
  }

  /**
   * Check if SMS is configured
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber)
  }

  /**
   * Send an SMS message
   */
  async send(input: SendSMSInput): Promise<SendSMSResult> {
    if (!this.isConfigured()) {
      console.warn('SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER')
      return {
        success: false,
        error: 'SMS service not configured'
      }
    }

    // Normalize phone number (basic formatting)
    const toNumber = this.normalizePhoneNumber(input.to)
    if (!toNumber) {
      return {
        success: false,
        error: 'Invalid phone number'
      }
    }

    try {
      // Twilio API endpoint
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`

      // Create Basic auth header
      const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')

      // Send via Twilio REST API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: toNumber,
          From: this.fromNumber!,
          Body: input.message
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Twilio error:', result)
        return {
          success: false,
          error: result.message || 'Failed to send SMS'
        }
      }

      return {
        success: true,
        messageId: result.sid
      }
    } catch (error) {
      console.error('SMS send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send a magic link to a storyteller
   */
  async sendMagicLink(params: {
    to: string
    storytellerName: string
    magicLinkUrl: string
    organizationName?: string
  }): Promise<SendSMSResult> {
    const { to, storytellerName, magicLinkUrl, organizationName } = params

    // Create friendly message
    const orgPart = organizationName ? ` with ${organizationName}` : ''
    const message = `Hi ${storytellerName}! Your story${orgPart} is ready to view. Tap to access: ${magicLinkUrl}`

    // Ensure message fits SMS limits (160 chars for single, 1600 max)
    if (message.length > 1600) {
      // Truncate the message if too long
      const shortMessage = `Hi ${storytellerName}! Your story is ready: ${magicLinkUrl}`
      return this.send({ to, message: shortMessage })
    }

    return this.send({ to, message })
  }

  /**
   * Normalize a phone number to E.164 format
   * Handles Australian numbers by default, extend as needed
   */
  private normalizePhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '')

    // Handle Australian numbers
    if (digits.startsWith('0') && digits.length === 10) {
      // Convert 0400 xxx xxx to +61400 xxx xxx
      digits = '61' + digits.substring(1)
    }

    // Handle numbers without country code (assume AU)
    if (digits.length === 9 && digits.startsWith('4')) {
      digits = '61' + digits
    }

    // Must have country code now
    if (digits.length < 10) {
      return null
    }

    // Add + prefix
    return '+' + digits
  }
}

// Export singleton instance
export const smsService = new SMSService()
export default smsService

import nodemailer from 'nodemailer'
import { getAuditService } from './audit.service'

/**
 * Email template types for GDPR-related notifications
 */
export type EmailTemplateType =
  | 'deletion_request_received'
  | 'deletion_request_completed'
  | 'data_export_ready'
  | 'consent_withdrawal_confirmation'
  | 'consent_granted_confirmation'
  | 'story_shared_notification'
  | 'distribution_revoked_notification'

/**
 * Email recipient data
 */
export interface EmailRecipient {
  email: string
  name?: string
}

/**
 * Email template data
 */
export interface EmailTemplateData {
  recipientName?: string
  storyTitle?: string
  requestId?: string
  downloadUrl?: string
  expiresAt?: string
  reason?: string
  platformName?: string
  additionalInfo?: string
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * EmailService
 * Handles GDPR-compliant email notifications for the platform.
 * Uses SMTP for reliable delivery with audit logging.
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private fromEmail: string
  private fromName: string
  private isConfigured: boolean = false

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@empathyledger.org'
    this.fromName = process.env.FROM_NAME || 'Empathy Ledger'

    // Check if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
      this.isConfigured = true
    } else {
      console.warn('Email service: SMTP not configured. Emails will be logged but not sent.')
    }
  }

  /**
   * Check if email service is properly configured
   */
  isReady(): boolean {
    return this.isConfigured
  }

  /**
   * Send an email using a template
   */
  async sendTemplateEmail(
    template: EmailTemplateType,
    recipient: EmailRecipient,
    data: EmailTemplateData,
    tenantId?: string
  ): Promise<EmailSendResult> {
    const { subject, html, text } = this.renderTemplate(template, data)

    return this.sendEmail(recipient, subject, html, text, tenantId)
  }

  /**
   * Send a raw email
   */
  async sendEmail(
    recipient: EmailRecipient,
    subject: string,
    html: string,
    text?: string,
    tenantId?: string
  ): Promise<EmailSendResult> {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: recipient.name ? `"${recipient.name}" <${recipient.email}>` : recipient.email,
      subject,
      html,
      text: text || this.htmlToText(html)
    }

    // Log email attempt
    console.log(`📧 Sending email: ${subject} to ${recipient.email}`)

    if (!this.isConfigured || !this.transporter) {
      console.log('📧 Email would be sent (SMTP not configured):')
      console.log(`  To: ${recipient.email}`)
      console.log(`  Subject: ${subject}`)

      // Still log for audit purposes
      await this.logEmailSent(recipient.email, subject, 'simulated', tenantId)

      return {
        success: true,
        messageId: `simulated-${Date.now()}`
      }
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)

      await this.logEmailSent(recipient.email, subject, info.messageId, tenantId)

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send GDPR deletion request received notification
   */
  async sendDeletionRequestReceived(
    recipient: EmailRecipient,
    requestId: string,
    tenantId?: string
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail(
      'deletion_request_received',
      recipient,
      { requestId, recipientName: recipient.name },
      tenantId
    )
  }

  /**
   * Send GDPR deletion request completed notification
   */
  async sendDeletionRequestCompleted(
    recipient: EmailRecipient,
    requestId: string,
    tenantId?: string
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail(
      'deletion_request_completed',
      recipient,
      { requestId, recipientName: recipient.name },
      tenantId
    )
  }

  /**
   * Send data export ready notification
   */
  async sendDataExportReady(
    recipient: EmailRecipient,
    downloadUrl: string,
    expiresAt: string,
    tenantId?: string
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail(
      'data_export_ready',
      recipient,
      { downloadUrl, expiresAt, recipientName: recipient.name },
      tenantId
    )
  }

  /**
   * Send consent withdrawal confirmation
   */
  async sendConsentWithdrawalConfirmation(
    recipient: EmailRecipient,
    storyTitle: string,
    reason: string,
    tenantId?: string
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail(
      'consent_withdrawal_confirmation',
      recipient,
      { storyTitle, reason, recipientName: recipient.name },
      tenantId
    )
  }

  /**
   * Send distribution revoked notification
   */
  async sendDistributionRevokedNotification(
    recipient: EmailRecipient,
    storyTitle: string,
    platformName: string,
    reason?: string,
    tenantId?: string
  ): Promise<EmailSendResult> {
    return this.sendTemplateEmail(
      'distribution_revoked_notification',
      recipient,
      { storyTitle, platformName, reason, recipientName: recipient.name },
      tenantId
    )
  }

  /**
   * Render email template
   */
  private renderTemplate(
    template: EmailTemplateType,
    data: EmailTemplateData
  ): { subject: string; html: string; text: string } {
    const templates: Record<EmailTemplateType, { subject: string; html: string; text: string }> = {
      deletion_request_received: {
        subject: 'Your Data Deletion Request Has Been Received',
        html: this.wrapInLayout(`
          <h1>Data Deletion Request Received</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>We have received your request to delete your data from Empathy Ledger.</p>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
          <p>Your request will be processed within 30 days as required by GDPR regulations. You will receive a confirmation email once your data has been deleted.</p>
          <p>If you did not make this request, please contact us immediately.</p>
        `),
        text: `Data Deletion Request Received\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\nWe have received your request to delete your data.\n\nRequest ID: ${data.requestId}\n\nYour request will be processed within 30 days.`
      },

      deletion_request_completed: {
        subject: 'Your Data Has Been Deleted',
        html: this.wrapInLayout(`
          <h1>Data Deletion Complete</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>Your data deletion request has been processed and your data has been removed from our systems.</p>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
          <p>This action is permanent and cannot be undone. If you wish to use Empathy Ledger again in the future, you will need to create a new account.</p>
          <p>Thank you for being part of our community.</p>
        `),
        text: `Data Deletion Complete\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\nYour data has been deleted.\n\nRequest ID: ${data.requestId}`
      },

      data_export_ready: {
        subject: 'Your Data Export is Ready for Download',
        html: this.wrapInLayout(`
          <h1>Your Data Export is Ready</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>Your data export request has been completed. You can download your data using the link below:</p>
          <p><a href="${data.downloadUrl}" style="background-color: #4A5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Your Data</a></p>
          <p><strong>Important:</strong> This download link will expire on ${data.expiresAt}. Please download your data before this date.</p>
          <p>The export includes all your personal data stored in our systems, including stories, profile information, and consent records.</p>
        `),
        text: `Your Data Export is Ready\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\nDownload your data at: ${data.downloadUrl}\n\nThis link expires on ${data.expiresAt}.`
      },

      consent_withdrawal_confirmation: {
        subject: 'Consent Withdrawal Confirmed',
        html: this.wrapInLayout(`
          <h1>Consent Withdrawal Confirmed</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>Your consent for the following story has been withdrawn:</p>
          <p><strong>Story:</strong> "${data.storyTitle}"</p>
          <p><strong>Reason:</strong> ${data.reason || 'Not specified'}</p>
          <p>This story will no longer be distributed externally. Any existing distributions have been notified of the revocation.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        `),
        text: `Consent Withdrawal Confirmed\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\nConsent withdrawn for: "${data.storyTitle}"\n\nReason: ${data.reason || 'Not specified'}`
      },

      consent_granted_confirmation: {
        subject: 'Consent Granted Successfully',
        html: this.wrapInLayout(`
          <h1>Consent Granted</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>You have successfully granted consent for your story:</p>
          <p><strong>Story:</strong> "${data.storyTitle}"</p>
          <p>Your story can now be distributed according to the terms you agreed to. You can withdraw your consent at any time through your Story Vault.</p>
        `),
        text: `Consent Granted\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\nConsent granted for: "${data.storyTitle}"`
      },

      story_shared_notification: {
        subject: 'Your Story Has Been Shared',
        html: this.wrapInLayout(`
          <h1>Your Story Was Shared</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>Your story has been shared to a new platform:</p>
          <p><strong>Story:</strong> "${data.storyTitle}"</p>
          <p><strong>Platform:</strong> ${data.platformName}</p>
          <p>You can manage your story's distribution and revoke access at any time through your Story Vault.</p>
        `),
        text: `Story Shared\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\n"${data.storyTitle}" shared to ${data.platformName}`
      },

      distribution_revoked_notification: {
        subject: 'Story Distribution Revoked',
        html: this.wrapInLayout(`
          <h1>Distribution Revoked</h1>
          <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
          <p>A distribution of your story has been revoked:</p>
          <p><strong>Story:</strong> "${data.storyTitle}"</p>
          <p><strong>Platform:</strong> ${data.platformName}</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
          <p>The platform has been notified to remove your content.</p>
        `),
        text: `Distribution Revoked\n\nHello${data.recipientName ? ` ${data.recipientName}` : ''},\n\n"${data.storyTitle}" revoked from ${data.platformName}`
      }
    }

    return templates[template]
  }

  /**
   * Wrap email content in consistent layout
   */
  private wrapInLayout(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Empathy Ledger</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f7f7f7; border-radius: 8px; padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #4A5568; margin: 0;">Empathy Ledger</h2>
          </div>
          ${content}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="font-size: 12px; color: #718096; text-align: center;">
            This is an automated message from Empathy Ledger.<br>
            Please do not reply directly to this email.
          </p>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Convert HTML to plain text (basic)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Log email sent for audit purposes
   */
  private async logEmailSent(
    recipient: string,
    subject: string,
    messageId: string,
    tenantId?: string
  ): Promise<void> {
    try {
      const auditService = getAuditService()
      await auditService.log({
        tenant_id: tenantId || null,
        entity_type: 'email',
        entity_id: messageId,
        action: 'email_sent' as any,
        action_category: 'gdpr',
        actor_id: null,
        actor_type: 'system',
        new_state: {
          recipient,
          subject,
          sent_at: new Date().toISOString()
        },
        change_summary: `Email sent: "${subject}" to ${recipient}`
      })
    } catch (error) {
      console.error('Failed to log email send:', error)
    }
  }
}

// ==========================================================================
// FACTORY FUNCTION
// ==========================================================================

let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}

export default EmailService

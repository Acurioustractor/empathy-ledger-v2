import { createClient } from '@supabase/supabase-js'

// Get email config at runtime, not build time
function getEmailConfig() {
  return {
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'resend',
    FROM_EMAIL: process.env.EMAIL_FROM || 'notifications@empathyledger.org',
    FROM_NAME: process.env.EMAIL_FROM_NAME || 'Empathy Ledger',
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
  }
}

export type EmailTemplateType =
  | 'story_submitted'
  | 'story_approved'
  | 'story_published'
  | 'story_rejected'
  | 'changes_requested'
  | 'review_assigned'
  | 'elder_escalation'
  | 'consent_pending'
  | 'community_mention'
  | 'weekly_digest'

export interface EmailRecipient {
  email: string
  name?: string
  userId?: string
}

interface ChangeRequest {
  category: string
  description: string
  required: boolean
}

export interface StoryNotificationData {
  storyId: string
  storyTitle: string
  storySlug?: string
  authorName: string
  authorEmail: string
  reviewerName?: string
  reviewerEmail?: string
  culturalGuidance?: string
  requestedChanges?: ChangeRequest[]
  rejectionReason?: string
  escalationReason?: string
  organizationName?: string
  projectName?: string
}

interface EmailPayload {
  to: EmailRecipient[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function sendEmail(payload: EmailPayload): Promise<{
  success: boolean
  error?: string
  messageId?: string
}> {
  try {
    const config = getEmailConfig()
    if (config.EMAIL_PROVIDER === 'resend') {
      return await sendViaResend(payload)
    }
    if (config.EMAIL_PROVIDER === 'sendgrid') {
      return await sendViaSendGrid(payload)
    }
    throw new Error(`Unsupported email provider: ${config.EMAIL_PROVIDER}`)
  } catch (error) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function sendViaResend(payload: EmailPayload) {
  const config = getEmailConfig()
  if (!config.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to: payload.to.map((r) => r.email),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Resend API error')
  }

  return { success: true, messageId: data.id }
}

async function sendViaSendGrid(payload: EmailPayload) {
  const config = getEmailConfig()
  if (!config.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.SENDGRID_API_KEY}`
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: payload.to.map((r) => ({ email: r.email, name: r.name }))
        }
      ],
      from: { email: config.FROM_EMAIL, name: config.FROM_NAME },
      reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
      subject: payload.subject,
      content: [{ type: 'text/html', value: payload.html }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }

  return {
    success: true,
    messageId: response.headers.get('x-message-id') || undefined
  }
}

export async function notifyStorySubmitted(data: StoryNotificationData) {
  const config = getEmailConfig()
  const reviewers = await getReviewers(data.storyId)

  if (reviewers.length === 0) {
    console.warn('No reviewers found for story:', data.storyId)
    return { success: true, skipped: true }
  }

  const subject = `New Story Ready for Review: ${data.storyTitle}`
  const html = renderEmailTemplate('story_submitted', {
    storyTitle: data.storyTitle,
    authorName: data.authorName,
    organizationName: data.organizationName,
    reviewUrl: `${config.BASE_URL}/admin/reviews/${data.storyId}`,
    queueUrl: `${config.BASE_URL}/admin/reviews`
  })

  return sendEmail({
    to: reviewers.map((r) => ({ email: r.email, name: r.name })),
    subject,
    html
  })
}

export async function notifyStoryApproved(data: StoryNotificationData) {
  const config = getEmailConfig()
  const subject = `Your Story Has Been Approved: ${data.storyTitle}`
  const html = renderEmailTemplate('story_approved', {
    storyTitle: data.storyTitle,
    authorName: data.authorName,
    reviewerName: data.reviewerName,
    culturalGuidance: data.culturalGuidance,
    storyUrl: data.storySlug ? `${config.BASE_URL}/stories/${data.storySlug}` : undefined
  })

  return sendEmail({
    to: [{ email: data.authorEmail, name: data.authorName }],
    subject,
    html
  })
}

export async function notifyStoryPublished(data: StoryNotificationData) {
  const config = getEmailConfig()
  const subject = `Your Story is Now Live: ${data.storyTitle}`
  const storyUrl = `${config.BASE_URL}/stories/${data.storySlug}`
  const html = renderEmailTemplate('story_published', {
    storyTitle: data.storyTitle,
    authorName: data.authorName,
    storyUrl,
    shareUrl: storyUrl
  })

  return sendEmail({
    to: [{ email: data.authorEmail, name: data.authorName }],
    subject,
    html
  })
}

export async function notifyChangesRequested(data: StoryNotificationData) {
  const config = getEmailConfig()
  const subject = `Changes Requested for Your Story: ${data.storyTitle}`
  const html = renderEmailTemplate('changes_requested', {
    storyTitle: data.storyTitle,
    authorName: data.authorName,
    reviewerName: data.reviewerName,
    requestedChanges: data.requestedChanges,
    editUrl: `${config.BASE_URL}/stories/${data.storyId}/edit`
  })

  return sendEmail({
    to: [{ email: data.authorEmail, name: data.authorName }],
    subject,
    html
  })
}

export async function notifyStoryRejected(data: StoryNotificationData) {
  const config = getEmailConfig()
  const subject = `Story Review Decision: ${data.storyTitle}`
  const html = renderEmailTemplate('story_rejected', {
    storyTitle: data.storyTitle,
    authorName: data.authorName,
    reviewerName: data.reviewerName,
    rejectionReason: data.rejectionReason,
    supportUrl: `${config.BASE_URL}/support`
  })

  return sendEmail({
    to: [{ email: data.authorEmail, name: data.authorName }],
    subject,
    html
  })
}

export async function notifyReviewAssigned(data: StoryNotificationData) {
  if (!data.reviewerEmail) {
    return { success: true, skipped: true }
  }

  const config = getEmailConfig()
  const subject = `Story Review Assigned to You: ${data.storyTitle}`
  const html = renderEmailTemplate('review_assigned', {
    storyTitle: data.storyTitle,
    reviewerName: data.reviewerName,
    authorName: data.authorName,
    reviewUrl: `${config.BASE_URL}/admin/reviews/${data.storyId}`
  })

  return sendEmail({
    to: [{ email: data.reviewerEmail, name: data.reviewerName }],
    subject,
    html
  })
}

export async function notifyElderEscalation(data: StoryNotificationData) {
  const config = getEmailConfig()
  const elders = await getElderCouncil()

  if (elders.length === 0) {
    console.warn('No elder council members found')
    return { success: true, skipped: true }
  }

  const subject = `Story Escalated for Elder Review: ${data.storyTitle}`
  const html = renderEmailTemplate('elder_escalation', {
    storyTitle: data.storyTitle,
    escalationReason: data.escalationReason,
    reviewUrl: `${config.BASE_URL}/admin/reviews/${data.storyId}`
  })

  return sendEmail({
    to: elders.map((e) => ({ email: e.email, name: e.name })),
    subject,
    html
  })
}

async function getReviewers(storyId: string) {
  const supabase = getSupabaseClient()

  const { data: story } = await supabase
    .from('stories')
    .select('organization_id')
    .eq('id', storyId)
    .single()

  if (!story?.organization_id) return []

  const { data: members } = await supabase
    .from('organization_members')
    .select(
      `
      user_id,
      profiles:user_id (
        id,
        email,
        display_name
      )
    `
    )
    .eq('organization_id', story.organization_id)
    .in('role', ['elder', 'admin', 'reviewer'])

  return (
    members?.map((m: any) => ({
      id: m.profiles.id,
      email: m.profiles.email,
      name: m.profiles.display_name
    })) || []
  )
}

async function getElderCouncil() {
  const supabase = getSupabaseClient()

  const { data: elders } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .eq('role', 'elder')
    .eq('is_active', true)

  return (
    elders?.map((e) => ({
      id: e.id,
      email: e.email,
      name: e.display_name
    })) || []
  )
}

const EMAIL_STYLES = {
  container:
    'max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
  header: 'background: #1c1917; padding: 24px; text-align: center;',
  logo: 'color: white; font-size: 24px; font-weight: bold; text-decoration: none;',
  body: 'background: white; padding: 32px 24px;',
  heading: 'font-size: 24px; color: #1c1917; margin: 0 0 16px 0;',
  text: 'font-size: 16px; color: #44403c; line-height: 1.6; margin: 0 0 16px 0;',
  button:
    'display: inline-block; background: #1c1917; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;',
  footer:
    'background: #f5f5f4; padding: 24px; text-align: center; font-size: 14px; color: #78716c;'
}

type TemplateData = Record<string, any>

function wrapEmailContent(content: string): string {
  const config = getEmailConfig()
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; background: #f5f5f4;">
      <div style="${EMAIL_STYLES.container}">
        <div style="${EMAIL_STYLES.header}">
          <a href="${config.BASE_URL}" style="${EMAIL_STYLES.logo}">Empathy Ledger</a>
        </div>
        <div style="${EMAIL_STYLES.body}">
          ${content}
        </div>
        <div style="${EMAIL_STYLES.footer}">
          <p style="margin: 0 0 8px 0;">
            This email was sent by <a href="${config.BASE_URL}">Empathy Ledger</a>
          </p>
          <p style="margin: 0;">
            <a href="${config.BASE_URL}/unsubscribe" style="color: #78716c;">Unsubscribe</a> |
            <a href="${config.BASE_URL}/preferences" style="color: #78716c;">Email Preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

const TEMPLATES: Record<EmailTemplateType, (data: TemplateData) => string> = {
  story_submitted: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">New Story Ready for Review</h1>
    <p style="${EMAIL_STYLES.text}">Hello,</p>
    <p style="${EMAIL_STYLES.text}">
      <strong>${data.authorName}</strong> has submitted a new story for review:
    </p>
    <p style="${EMAIL_STYLES.text}">
      <strong>"${data.storyTitle}"</strong>
    </p>
    ${data.organizationName ? `<p style="${EMAIL_STYLES.text}">Organization: ${data.organizationName}</p>` : ''}
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.reviewUrl}" style="${EMAIL_STYLES.button}">Review Story</a>
    </p>
    <p style="${EMAIL_STYLES.text}">
      You can also view the full review queue at:
      <a href="${data.queueUrl}">Review Queue</a>
    </p>
  `,

  story_approved: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">Your Story Has Been Approved!</h1>
    <p style="${EMAIL_STYLES.text}">Kia ora ${data.authorName},</p>
    <p style="${EMAIL_STYLES.text}">
      Great news! Your story <strong>"${data.storyTitle}"</strong> has been approved by ${data.reviewerName || 'the review team'}.
    </p>
    ${
      data.culturalGuidance
        ? `
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;">
      <strong>Cultural Guidance:</strong>
      <p style="margin: 8px 0 0 0;">${data.culturalGuidance}</p>
    </div>
    `
        : ''
    }
    ${
      data.storyUrl
        ? `
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.storyUrl}" style="${EMAIL_STYLES.button}">View Your Story</a>
    </p>
    `
        : ''
    }
    <p style="${EMAIL_STYLES.text}">
      Thank you for sharing your story with the community.
    </p>
  `,

  story_published: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">Your Story is Now Live!</h1>
    <p style="${EMAIL_STYLES.text}">Kia ora ${data.authorName},</p>
    <p style="${EMAIL_STYLES.text}">
      Your story <strong>"${data.storyTitle}"</strong> has been published and is now visible to the community.
    </p>
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.storyUrl}" style="${EMAIL_STYLES.button}">View Your Story</a>
    </p>
    <p style="${EMAIL_STYLES.text}">
      Share your story with others:
      <br />
      <a href="${data.shareUrl}">${data.shareUrl}</a>
    </p>
    <p style="${EMAIL_STYLES.text}">
      Thank you for contributing to our collective memory and healing.
    </p>
  `,

  changes_requested: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">Changes Requested for Your Story</h1>
    <p style="${EMAIL_STYLES.text}">Kia ora ${data.authorName},</p>
    <p style="${EMAIL_STYLES.text}">
      ${data.reviewerName || 'The review team'} has reviewed your story <strong>"${data.storyTitle}"</strong>
      and is requesting some changes before publication.
    </p>
    ${
      data.requestedChanges?.length > 0
        ? `
    <div style="background: #f5f5f4; padding: 16px; margin: 16px 0; border-radius: 6px;">
      <strong>Requested Changes:</strong>
      <ul style="margin: 8px 0; padding-left: 20px;">
        ${data.requestedChanges
          .map(
            (change: ChangeRequest) => `
          <li style="margin: 8px 0;">
            <strong>${change.category}${change.required ? ' (Required)' : ' (Suggested)'}</strong>
            <br />
            ${change.description}
          </li>
        `
          )
          .join('')}
      </ul>
    </div>
    `
        : ''
    }
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.editUrl}" style="${EMAIL_STYLES.button}">Edit Your Story</a>
    </p>
    <p style="${EMAIL_STYLES.text}">
      If you have questions about these changes, please reply to this email or contact the review team.
    </p>
  `,

  story_rejected: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">Story Review Decision</h1>
    <p style="${EMAIL_STYLES.text}">Kia ora ${data.authorName},</p>
    <p style="${EMAIL_STYLES.text}">
      After careful consideration, ${data.reviewerName || 'the review team'} has decided that your story
      <strong>"${data.storyTitle}"</strong> cannot be published at this time.
    </p>
    ${
      data.rejectionReason
        ? `
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0;">
      <strong>Reason:</strong>
      <p style="margin: 8px 0 0 0;">${data.rejectionReason}</p>
    </div>
    `
        : ''
    }
    <p style="${EMAIL_STYLES.text}">
      We understand this may be disappointing. If you have questions or would like to discuss this decision,
      please contact our support team.
    </p>
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.supportUrl}" style="${EMAIL_STYLES.button}">Contact Support</a>
    </p>
  `,

  review_assigned: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">Story Review Assigned to You</h1>
    <p style="${EMAIL_STYLES.text}">Kia ora ${data.reviewerName},</p>
    <p style="${EMAIL_STYLES.text}">
      A story has been assigned to you for review:
    </p>
    <p style="${EMAIL_STYLES.text}">
      <strong>"${data.storyTitle}"</strong> by ${data.authorName}
    </p>
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.reviewUrl}" style="${EMAIL_STYLES.button}">Start Review</a>
    </p>
    <p style="${EMAIL_STYLES.text}">
      Please review this story when you have time. Thank you for your service to the community.
    </p>
  `,

  elder_escalation: (data) => `
    <h1 style="${EMAIL_STYLES.heading}">Story Escalated for Elder Review</h1>
    <p style="${EMAIL_STYLES.text}">Kia ora,</p>
    <p style="${EMAIL_STYLES.text}">
      A story has been escalated to the Elder Council for review:
    </p>
    <p style="${EMAIL_STYLES.text}">
      <strong>"${data.storyTitle}"</strong>
    </p>
    ${
      data.escalationReason
        ? `
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;">
      <strong>Escalation Reason:</strong>
      <p style="margin: 8px 0 0 0;">${data.escalationReason}</p>
    </div>
    `
        : ''
    }
    <p style="${EMAIL_STYLES.text}">
      <a href="${data.reviewUrl}" style="${EMAIL_STYLES.button}">Review Story</a>
    </p>
    <p style="${EMAIL_STYLES.text}">
      Your cultural guidance and wisdom are needed for this matter.
    </p>
  `,

  consent_pending: () => `<p style="${EMAIL_STYLES.text}">Consent notification</p>`,
  community_mention: () => `<p style="${EMAIL_STYLES.text}">Community mention</p>`,
  weekly_digest: () => `<p style="${EMAIL_STYLES.text}">Weekly digest</p>`
}

function renderEmailTemplate(type: EmailTemplateType, data: TemplateData): string {
  const templateFn = TEMPLATES[type]
  if (!templateFn) {
    return wrapEmailContent(`<p style="${EMAIL_STYLES.text}">Notification from Empathy Ledger</p>`)
  }
  const content = templateFn(data)
  return wrapEmailContent(content)
}

export async function logEmailNotification({
  userId,
  email,
  type,
  subject,
  status,
  messageId,
  error
}: {
  userId?: string
  email: string
  type: EmailTemplateType
  subject: string
  status: 'sent' | 'failed' | 'bounced'
  messageId?: string
  error?: string
}) {
  const supabase = getSupabaseClient()

  await supabase.from('email_notifications').insert({
    user_id: userId,
    email,
    notification_type: type,
    subject,
    status,
    message_id: messageId,
    error_message: error,
    sent_at: new Date().toISOString()
  })
}

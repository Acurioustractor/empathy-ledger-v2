import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const provider = request.headers.get('x-email-provider') || 'resend'

    console.log('Email webhook received:', { provider, body })

    const isValid = await validateWebhookSignature(request, provider, body)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = parseEvent(provider, body)
    if (!event) {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { error: insertError } = await supabase.from('email_webhook_events').insert({
      message_id: event.messageId,
      event_type: event.type,
      email: event.email,
      raw_payload: body,
      received_at: new Date().toISOString()
    })

    if (insertError) {
      console.error('Failed to store webhook event:', insertError)
      return NextResponse.json({ error: 'Storage failed' }, { status: 500 })
    }

    await handleWebhookEvent(supabase, event)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

type EmailEventType = 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'

interface EmailWebhookEvent {
  messageId: string
  type: EmailEventType
  email: string
  timestamp: string
  metadata?: any
}

const SENDGRID_EVENT_MAP: Record<string, EmailEventType> = {
  delivered: 'delivered',
  open: 'opened',
  click: 'clicked',
  bounce: 'bounced',
  dropped: 'bounced',
  spamreport: 'complained',
  unsubscribe: 'unsubscribed'
}

function parseEvent(provider: string, body: any): EmailWebhookEvent | null {
  if (provider === 'resend') {
    return {
      messageId: body.data.email_id,
      type: body.type,
      email: body.data.to,
      timestamp: body.created_at,
      metadata: body.data
    }
  }

  if (provider === 'sendgrid') {
    const event = Array.isArray(body) ? body[0] : body
    return {
      messageId: event.sg_message_id,
      type: SENDGRID_EVENT_MAP[event.event] || 'delivered',
      email: event.email,
      timestamp: new Date(event.timestamp * 1000).toISOString(),
      metadata: event
    }
  }

  return null
}

async function validateWebhookSignature(
  request: NextRequest,
  provider: string,
  _body: any
): Promise<boolean> {
  if (provider === 'resend') {
    const signature = request.headers.get('svix-signature')
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.warn('RESEND_WEBHOOK_SECRET not configured, skipping validation')
      return true
    }

    return !!signature
  }

  if (provider === 'sendgrid') {
    return true
  }

  return false
}

async function handleWebhookEvent(supabase: any, event: EmailWebhookEvent) {
  const handlers: Record<EmailEventType, () => Promise<void>> = {
    bounced: () => handleBounce(supabase, event.email),
    complained: () => handleSpamComplaint(supabase, event.email),
    unsubscribed: () => handleUnsubscribe(supabase, event.email),
    opened: () => trackEmailOpen(event.messageId),
    clicked: () => trackEmailClick(event.messageId),
    delivered: async () => {}
  }

  const handler = handlers[event.type]
  if (handler) {
    await handler()
  }
}

async function getUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  return profile?.id || null
}

async function unsubscribeUser(supabase: any, userId: string) {
  await supabase.from('email_preferences').upsert({
    user_id: userId,
    unsubscribed: true,
    unsubscribed_at: new Date().toISOString()
  })
}

async function handleBounce(supabase: any, email: string) {
  console.warn('Email bounced:', email)

  const userId = await getUserIdByEmail(supabase, email)
  if (!userId) return

  const { data: notifications } = await supabase
    .from('email_notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'bounced')

  if (notifications && notifications.length >= 3) {
    await unsubscribeUser(supabase, userId)
    console.log('Auto-unsubscribed user after 3 bounces:', email)
  }
}

async function handleSpamComplaint(supabase: any, email: string) {
  console.warn('Spam complaint received:', email)

  const userId = await getUserIdByEmail(supabase, email)
  if (!userId) return

  await unsubscribeUser(supabase, userId)
  console.log('Auto-unsubscribed user after spam complaint:', email)
}

async function handleUnsubscribe(supabase: any, email: string) {
  const userId = await getUserIdByEmail(supabase, email)
  if (!userId) return

  await unsubscribeUser(supabase, userId)
  console.log('User unsubscribed:', email)
}

async function trackEmailOpen(messageId: string) {
  console.log('Email opened:', messageId)
}

async function trackEmailClick(messageId: string) {
  console.log('Email clicked:', messageId)
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Fetch user's notifications
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // notifications table is new and not yet in generated types
  const db = supabase as any;
  let query = db
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  // Filter out expired notifications
  query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  const { data: notifications, count, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }

  // Get unread count
  const { count: unreadCount } = await db
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  return NextResponse.json({
    notifications,
    total: count,
    unreadCount: unreadCount || 0,
  });
}

// POST - Create a notification (usually from server-side)
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user can create notifications (admin/system)
  const { data: profile } = await supabase
    .from('profiles')
    .select('super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.super_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      recipientId,
      recipientIds, // Array for bulk notifications
      type,
      title,
      message,
      priority = 'normal',
      actionUrl,
      actionLabel,
      metadata = {},
      expiresAt,
      sendEmail = false,
    } = body;

    const recipients = recipientIds || [recipientId];
    const notifications = recipients.map((id: string) => ({
      recipient_id: id,
      type,
      title,
      message,
      priority,
      action_url: actionUrl || null,
      action_label: actionLabel || null,
      metadata,
      expires_at: expiresAt || null,
    }));

    // notifications table is new and not yet in generated types
    const db = supabase as any;
    const { data: created, error: insertError } = await db
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Error creating notifications:', insertError);
      return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
    }

    // If sendEmail is true, queue email notifications
    if (sendEmail && recipients.length > 0) {
      // Get recipient emails
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', recipients);

      // Queue emails (this would integrate with your email service)
      // For now, we'll log it - in production, use Resend, SendGrid, etc.
      console.log('Email notifications queued for:', profiles?.map(p => p.email));
    }

    return NextResponse.json({
      created: created?.length || 0,
      notifications: created,
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId, notificationIds, markAllRead } = body;

    // notifications table is new and not yet in generated types
    const db = supabase as any;

    if (markAllRead) {
      // Mark all unread notifications as read
      const { error } = await db
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
      }
    } else {
      // Mark specific notifications as read
      const ids = notificationIds || [notificationId];
      const { error } = await db
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('recipient_id', user.id)
        .in('id', ids);

      if (error) {
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete notifications
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('id');

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  }

  // notifications table is new and not yet in generated types
  const db = supabase as any;
  const { error } = await db
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('recipient_id', user.id);

  if (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

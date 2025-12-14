import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// POST - Create and optionally send an admin message
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('super_admin, display_name')
    .eq('id', user.id)
    .single();

  if (!profile?.super_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      subject,
      messageBody,
      messageType = 'announcement',
      targetType,
      targetOrganizationId,
      targetProjectId,
      targetUserIds,
      targetFilter,
      channels = ['in_app'],
      scheduledAt,
      sendImmediately = false,
    } = body;

    // admin_messages and message_recipients tables are new and not yet in generated types
    const db = supabase as any;

    // Create the message
    const { data: message, error: messageError } = await db
      .from('admin_messages')
      .insert({
        sender_id: user.id,
        sender_name: profile.display_name || 'Admin',
        subject,
        body: messageBody,
        message_type: messageType,
        target_type: targetType,
        target_organization_id: targetOrganizationId || null,
        target_project_id: targetProjectId || null,
        target_user_ids: targetUserIds || null,
        target_filter: targetFilter || null,
        channels,
        scheduled_at: scheduledAt || null,
        status: sendImmediately ? 'sending' : 'draft',
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // If sending immediately, deliver to recipients
    if (sendImmediately) {
      const recipientIds = await getRecipientIds(supabase, {
        targetType,
        targetOrganizationId,
        targetProjectId,
        targetUserIds,
        targetFilter,
      });

      // Create recipient records
      const recipientRecords = recipientIds.map((id: string) => ({
        message_id: message.id,
        recipient_id: id,
      }));

      if (recipientRecords.length > 0) {
        await db
          .from('message_recipients')
          .insert(recipientRecords);

        // Also create notifications for each recipient
        const notifications = recipientIds.map((id: string) => ({
          recipient_id: id,
          type: messageType,
          title: subject,
          message: messageBody.substring(0, 200),
          action_url: `/messages/${message?.id}`,
          action_label: 'View Message',
          priority: messageType === 'action_required' ? 'high' : 'normal',
        }));

        await db.from('notifications').insert(notifications);
      }

      // Update message status
      await db
        .from('admin_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipient_count: recipientIds.length,
        })
        .eq('id', message?.id);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List admin messages
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.super_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // admin_messages table is new and not yet in generated types
  const db = supabase as any;
  let query = db
    .from('admin_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: messages, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  return NextResponse.json({ messages });
}

// DELETE - Delete a draft message
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.super_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('id');

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
  }

  // admin_messages table is new and not yet in generated types
  const db = supabase as any;
  // Only allow deleting draft messages
  const { error } = await db
    .from('admin_messages')
    .delete()
    .eq('id', messageId)
    .eq('status', 'draft');

  if (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Helper function to get recipient IDs based on targeting
interface TargetingOptions {
  targetType: string;
  targetOrganizationId?: string;
  targetProjectId?: string;
  targetUserIds?: string[];
  targetFilter?: Record<string, unknown>;
}

async function getRecipientIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options: TargetingOptions
): Promise<string[]> {
  const { targetType, targetOrganizationId, targetUserIds } = options;

  switch (targetType) {
    case 'all':
      // Get all active users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);
      return (allUsers || []).map(u => u.id);

    case 'organization':
      if (!targetOrganizationId) return [];
      const { data: orgMembers } = await supabase
        .from('profile_organizations')
        .select('profile_id')
        .eq('organization_id', targetOrganizationId)
        .eq('is_active', true);
      return (orgMembers || []).map(m => m.profile_id);

    case 'individual':
      return targetUserIds || [];

    case 'storytellers':
      const { data: storytellers } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_storyteller', true)
        .eq('is_active', true);
      return (storytellers || []).map(s => s.id);

    default:
      return targetUserIds || [];
  }
}

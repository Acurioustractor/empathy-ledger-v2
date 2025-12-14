import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// POST - Log an activity
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      action,
      actionCategory,
      entityType,
      entityId,
      entityTitle,
      details,
      organizationId,
      requiresAttention,
    } = body;

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single();

    const userName = profile?.display_name || profile?.email || 'Unknown User';

    // Insert activity log (activity_log table is new and not yet in generated types)
    const db = supabase as any;
    const { data: activity, error } = await db
      .from('activity_log')
      .insert({
        user_id: user.id,
        user_name: userName,
        user_role: 'user', // Could be enhanced to detect role
        action,
        action_category: actionCategory,
        entity_type: entityType,
        entity_id: entityId || null,
        entity_title: entityTitle || null,
        details: details || {},
        organization_id: organizationId || null,
        requires_attention: requiresAttention || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch activity logs
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

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const entityType = searchParams.get('entityType');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const requiresAttention = searchParams.get('requiresAttention') === 'true';

  // activity_log table is new and not yet in generated types
  const db = supabase as any;
  let query = db
    .from('activity_log')
    .select('*', { count: 'exact' });

  // Non-admins can only see their own activity
  if (!profile?.super_admin) {
    query = query.eq('user_id', user.id);
  }

  if (category) {
    query = query.eq('action_category', category);
  }

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  if (requiresAttention) {
    query = query.eq('requires_attention', true).is('attention_resolved_at', null);
  }

  const { data: activities, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }

  return NextResponse.json({
    activities,
    total: count,
    hasMore: (count || 0) > offset + limit,
  });
}

// PATCH - Resolve attention flag
export async function PATCH(request: Request) {
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

  try {
    const body = await request.json();
    const { activityId } = body;

    // activity_log table is new and not yet in generated types
    const db = supabase as any;
    const { error } = await db
      .from('activity_log')
      .update({
        attention_resolved_at: new Date().toISOString(),
        attention_resolved_by: user.id,
      })
      .eq('id', activityId);

    if (error) {
      return NextResponse.json({ error: 'Failed to resolve attention' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving attention:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

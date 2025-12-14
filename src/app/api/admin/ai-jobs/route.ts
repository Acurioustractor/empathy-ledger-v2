import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest/client';

export const runtime = 'nodejs';

// POST - Create a new AI analysis job
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      jobType,
      entityType,
      entityId,
      priority = 5,
      triggerReason = 'manual',
      runImmediately = false,
    } = body;

    // ai_analysis_jobs table is new and not yet in generated types
    const db = supabase as any;

    // Create the job record
    const { data: job, error: jobError } = await db
      .from('ai_analysis_jobs')
      .insert({
        job_type: jobType,
        entity_type: entityType,
        entity_id: entityId,
        priority,
        triggered_by: user.id,
        trigger_reason: triggerReason,
        status: runImmediately ? 'processing' : 'pending',
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // If running immediately, trigger the Inngest event
    if (runImmediately && jobType === 'transcript') {
      await inngest.send({
        name: 'transcript/analyze',
        data: {
          transcriptId: entityId,
          jobId: job?.id,
        },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('AI job creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List AI analysis jobs
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // ai_analysis_jobs table is new and not yet in generated types
  const db = supabase as any;
  let query = db
    .from('ai_analysis_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: jobs, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }

  return NextResponse.json({ jobs });
}

// PATCH - Update job status (retry, cancel)
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId, action } = body;

    // ai_analysis_jobs table is new and not yet in generated types
    const db = supabase as any;

    if (action === 'retry') {
      // Reset job for retry
      const { error } = await db
        .from('ai_analysis_jobs')
        .update({
          status: 'pending',
          error_message: null,
          retry_count: 0,
          started_at: null,
          completed_at: null,
        })
        .eq('id', jobId);

      if (error) {
        return NextResponse.json({ error: 'Failed to retry job' }, { status: 500 });
      }
    }

    if (action === 'cancel') {
      const { error } = await db
        .from('ai_analysis_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId)
        .in('status', ['pending', 'processing']);

      if (error) {
        return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Job update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

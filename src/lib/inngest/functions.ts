import { inngest } from './client';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Create Supabase admin client for background jobs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// AI Analysis Functions
// ============================================

// Process a single transcript for analysis
export const analyzeTranscript = inngest.createFunction(
  { id: 'analyze-transcript', name: 'Analyze Transcript' },
  { event: 'transcript/analyze' },
  async ({ event, step }) => {
    const { transcriptId, jobId } = event.data;

    // Update job status
    await step.run('mark-started', async () => {
      await supabaseAdmin
        .from('ai_analysis_jobs')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    });

    // Fetch transcript
    const transcript = await step.run('fetch-transcript', async () => {
      const { data, error } = await supabaseAdmin
        .from('transcripts')
        .select('*')
        .eq('id', transcriptId)
        .single();

      if (error) throw new Error(`Failed to fetch transcript: ${error.message}`);
      return data;
    });

    // Analyze with OpenAI
    const analysis = await step.run('analyze-with-ai', async () => {
      const text = transcript.content || transcript.transcript_text;
      if (!text) throw new Error('No transcript text available');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing interview transcripts for the Empathy Ledger platform.
            Extract themes, emotions, key quotes, and insights from the transcript.
            Be culturally sensitive and respectful of Indigenous stories and traditions.`
          },
          {
            role: 'user',
            content: `Analyze this transcript and provide:
1. Main themes (3-5)
2. Key emotions expressed
3. Notable quotes (2-3 powerful quotes)
4. Summary (2-3 sentences)
5. Potential story title suggestions (3)

Transcript:
${text.slice(0, 6000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return {
        raw: response.choices[0]?.message?.content,
        usage: response.usage,
      };
    });

    // Parse and store results
    await step.run('store-results', async () => {
      // Update transcript with analysis
      await supabaseAdmin
        .from('transcripts')
        .update({
          ai_analysis: analysis.raw,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', transcriptId);

      // Mark job complete
      await supabaseAdmin
        .from('ai_analysis_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: { analysis: analysis.raw, usage: analysis.usage },
        })
        .eq('id', jobId);

      // Log AI usage
      await supabaseAdmin.from('ai_usage_events').insert({
        agent_name: 'transcript-analyzer',
        model: 'gpt-4o',
        model_provider: 'openai',
        prompt_tokens: analysis.usage?.prompt_tokens || 0,
        completion_tokens: analysis.usage?.completion_tokens || 0,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    });

    return { success: true, transcriptId };
  }
);

// Scheduled job to process pending analysis jobs
export const processAnalysisQueue = inngest.createFunction(
  {
    id: 'process-analysis-queue',
    name: 'Process Analysis Queue',
    throttle: { limit: 10, period: '1m' }, // Max 10 per minute
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    // Fetch pending jobs
    const pendingJobs = await step.run('fetch-pending', async () => {
      const { data } = await supabaseAdmin
        .from('ai_analysis_jobs')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .lt('retry_count', 3)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(5);

      return data || [];
    });

    // Process each job
    const results = [];
    for (const job of pendingJobs) {
      try {
        // Trigger the appropriate handler
        if (job.job_type === 'transcript') {
          await inngest.send({
            name: 'transcript/analyze',
            data: {
              transcriptId: job.entity_id,
              jobId: job.id,
            },
          });
          results.push({ jobId: job.id, status: 'triggered' });
        }
        // Add more job types as needed
      } catch (error) {
        await supabaseAdmin
          .from('ai_analysis_jobs')
          .update({
            retry_count: job.retry_count + 1,
            error_message: String(error),
          })
          .eq('id', job.id);
        results.push({ jobId: job.id, status: 'error', error: String(error) });
      }
    }

    return { processed: results.length, results };
  }
);

// Scheduled job to refresh stale analyses
export const refreshStaleAnalyses = inngest.createFunction(
  {
    id: 'refresh-stale-analyses',
    name: 'Refresh Stale Analyses',
  },
  { cron: '0 3 * * *' }, // Daily at 3 AM
  async ({ step }) => {
    // Find stories with stale analysis (> 30 days old)
    const staleStories = await step.run('find-stale', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabaseAdmin
        .from('stories')
        .select('id, title')
        .lt('ai_analyzed_at', thirtyDaysAgo.toISOString())
        .eq('status', 'published')
        .limit(20);

      return data || [];
    });

    // Queue refresh jobs
    const queued = await step.run('queue-refreshes', async () => {
      const jobs = staleStories.map(story => ({
        job_type: 'story',
        entity_type: 'story',
        entity_id: story.id,
        priority: 8, // Low priority
        trigger_reason: 'stale_refresh',
      }));

      if (jobs.length > 0) {
        await supabaseAdmin.from('ai_analysis_jobs').insert(jobs);
      }

      return jobs.length;
    });

    return { staleCount: staleStories.length, queued };
  }
);

// Daily platform stats update
export const updatePlatformStats = inngest.createFunction(
  {
    id: 'update-platform-stats',
    name: 'Update Platform Stats',
  },
  { cron: '0 * * * *' }, // Hourly
  async ({ step }) => {
    await step.run('update-stats', async () => {
      // Call the database function to update stats
      await supabaseAdmin.rpc('update_platform_stats');
    });

    return { success: true, updatedAt: new Date().toISOString() };
  }
);

// Export all functions
export const functions = [
  analyzeTranscript,
  processAnalysisQueue,
  refreshStaleAnalyses,
  updatePlatformStats,
];

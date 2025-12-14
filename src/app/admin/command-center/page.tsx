'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface PlatformStats {
  total_stories: number;
  total_storytellers: number;
  total_organizations: number;
  total_projects: number;
  stories_last_7_days: number;
  stories_last_30_days: number;
  pending_reviews: number;
  pending_elder_reviews: number;
  ai_jobs_pending: number;
  ai_jobs_failed_24h: number;
}

interface ActivityItem {
  id: string;
  created_at: string;
  user_name: string;
  action: string;
  action_category: string;
  entity_type: string;
  entity_title: string;
  requires_attention: boolean;
}

interface AIJob {
  id: string;
  job_type: string;
  entity_type: string;
  status: string;
  priority: number;
  created_at: string;
  started_at: string | null;
  error_message: string | null;
}

export default function CommandCenterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [aiJobs, setAIJobs] = useState<AIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if user is super admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('super_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.super_admin) {
        router.push('/');
        return;
      }

      setIsSuperAdmin(true);
    }

    if (!authLoading && user) {
      checkAdmin();
    } else if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router, supabase]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!isSuperAdmin) return;

    // Cast supabase to any for new tables not yet in generated types
    const db = supabase as any;

    try {
      // Fetch platform stats
      const { data: statsData } = await db
        .from('platform_stats_cache')
        .select('*')
        .eq('id', 'global')
        .single();

      if (statsData) {
        setStats(statsData as PlatformStats);
      } else {
        // Calculate stats on the fly if cache doesn't exist
        const [storiesRes, storytellersRes, orgsRes, projectsRes] = await Promise.all([
          db.from('stories').select('id', { count: 'exact', head: true }),
          db.from('profiles').select('id', { count: 'exact', head: true }).eq('is_storyteller', true),
          db.from('tenants').select('id', { count: 'exact', head: true }),
          db.from('projects').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          total_stories: storiesRes.count || 0,
          total_storytellers: storytellersRes.count || 0,
          total_organizations: orgsRes.count || 0,
          total_projects: projectsRes.count || 0,
          stories_last_7_days: 0,
          stories_last_30_days: 0,
          pending_reviews: 0,
          pending_elder_reviews: 0,
          ai_jobs_pending: 0,
          ai_jobs_failed_24h: 0,
        });
      }

      // Fetch recent activity
      const { data: activityData } = await db
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities((activityData || []) as ActivityItem[]);

      // Fetch AI jobs
      const { data: jobsData } = await db
        .from('ai_analysis_jobs')
        .select('*')
        .in('status', ['pending', 'processing', 'failed'])
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(10);

      setAIJobs((jobsData || []) as AIJob[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, supabase]);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Trigger stats refresh
  const refreshStats = async () => {
    const db = supabase as any;
    try {
      await db.rpc('update_platform_stats');
      fetchData();
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // Retry failed AI job
  const retryJob = async (jobId: string) => {
    const db = supabase as any;
    try {
      await db
        .from('ai_analysis_jobs')
        .update({
          status: 'pending',
          error_message: null,
          retry_count: 0,
        })
        .eq('id', jobId);
      fetchData();
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Command Center
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Super Admin Dashboard
            </p>
          </div>
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Refresh Stats
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Stories"
            value={stats?.total_stories || 0}
            trend={stats?.stories_last_7_days}
            trendLabel="this week"
          />
          <StatCard
            label="Storytellers"
            value={stats?.total_storytellers || 0}
          />
          <StatCard
            label="Organizations"
            value={stats?.total_organizations || 0}
          />
          <StatCard
            label="Projects"
            value={stats?.total_projects || 0}
          />
        </div>

        {/* Alerts Row */}
        {(stats?.pending_reviews || 0) > 0 || (stats?.pending_elder_reviews || 0) > 0 || (stats?.ai_jobs_failed_24h || 0) > 0 ? (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(stats?.pending_reviews || 0) > 0 && (
              <AlertCard
                type="warning"
                title="Pending Reviews"
                count={stats?.pending_reviews || 0}
                action={() => router.push('/admin/reviews')}
              />
            )}
            {(stats?.pending_elder_reviews || 0) > 0 && (
              <AlertCard
                type="info"
                title="Elder Reviews"
                count={stats?.pending_elder_reviews || 0}
                action={() => router.push('/admin/reviews?type=elder')}
              />
            )}
            {(stats?.ai_jobs_failed_24h || 0) > 0 && (
              <AlertCard
                type="error"
                title="Failed AI Jobs"
                count={stats?.ai_jobs_failed_24h || 0}
              />
            )}
          </div>
        ) : null}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No recent activity
                </p>
              ) : (
                activities.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))
              )}
            </div>
          </div>

          {/* AI Jobs Queue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AI Analysis Queue
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {aiJobs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No pending jobs
                </p>
              ) : (
                aiJobs.map((job) => (
                  <AIJobRow key={job.id} job={job} onRetry={() => retryJob(job.id)} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              label="Send Announcement"
              icon="📢"
              onClick={() => router.push('/admin/messages/new')}
            />
            <QuickAction
              label="View Audit Log"
              icon="📋"
              onClick={() => router.push('/admin/audit-log')}
            />
            <QuickAction
              label="Manage Storytellers"
              icon="👥"
              onClick={() => router.push('/admin/storytellers')}
            />
            <QuickAction
              label="AI Analysis Settings"
              icon="🤖"
              onClick={() => router.push('/admin/settings?tab=ai')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({
  label,
  value,
  trend,
  trendLabel,
}: {
  label: string;
  value: number;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </p>
      {trend !== undefined && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          +{trend} {trendLabel}
        </p>
      )}
    </div>
  );
}

// Component: Alert Card
function AlertCard({
  type,
  title,
  count,
  action,
}: {
  type: 'warning' | 'info' | 'error';
  title: string;
  count: number;
  action?: () => void;
}) {
  const colors = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  };

  return (
    <div
      className={`rounded-lg border p-4 ${colors[type]} ${action ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={action}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        <span className="text-2xl font-bold">{count}</span>
      </div>
    </div>
  );
}

// Component: Activity Row
function ActivityRow({ activity }: { activity: ActivityItem }) {
  const timeAgo = getTimeAgo(activity.created_at);

  return (
    <div className={`flex items-start gap-3 p-2 rounded-lg ${activity.requires_attention ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
        {getActivityIcon(activity.action_category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium">{activity.user_name || 'System'}</span>{' '}
          <span className="text-gray-500 dark:text-gray-400">{activity.action}</span>{' '}
          {activity.entity_title && (
            <span className="font-medium">{activity.entity_title}</span>
          )}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
      </div>
    </div>
  );
}

// Component: AI Job Row
function AIJobRow({ job, onRetry }: { job: AIJob; onRetry: () => void }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[job.status as keyof typeof statusColors] || ''}`}>
            {job.status}
          </span>
          <span className="text-sm text-gray-900 dark:text-white font-medium">
            {job.job_type}
          </span>
        </div>
        {job.error_message && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
            {job.error_message}
          </p>
        )}
      </div>
      {job.status === 'failed' && (
        <button
          onClick={onRetry}
          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Component: Quick Action Button
function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
        {label}
      </span>
    </button>
  );
}

// Helper: Get activity icon based on category
function getActivityIcon(category: string): string {
  const icons: Record<string, string> = {
    story: '📖',
    transcript: '📝',
    media: '🎬',
    consent: '✅',
    user: '👤',
    organization: '🏢',
    system: '⚙️',
  };
  return icons[category] || '📌';
}

// Helper: Get time ago string
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

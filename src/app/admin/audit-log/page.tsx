'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ActivityFeed } from '@/components/admin/ActivityFeed';

interface ActivityItem {
  id: string;
  created_at: string;
  user_name: string;
  user_role: string;
  action: string;
  action_category: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  details: Record<string, unknown>;
  changes: Record<string, unknown>;
  requires_attention: boolean;
  attention_resolved_at: string | null;
  organization_id: string | null;
}

interface Stats {
  total: number;
  today: number;
  needsAttention: number;
}

export default function AuditLogPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, needsAttention: 0 });
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  // Filters
  const [category, setCategory] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 50;

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

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!isSuperAdmin) return;

    setLoading(true);

    // Note: activity_log table is new and not yet in generated types
    const db = supabase as any;
    let query = db
      .from('activity_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (category) {
      query = query.eq('action_category', category);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('created_at', today.toISOString());
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities((data || []) as ActivityItem[]);
      setStats(prev => ({ ...prev, total: count || 0 }));
    }

    setLoading(false);
  }, [isSuperAdmin, supabase, category, entityType, dateRange, page, pageSize]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!isSuperAdmin) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const db = supabase as any;

    const { count: todayCount } = await db
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: attentionCount } = await db
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('requires_attention', true)
      .is('attention_resolved_at', null);

    setStats(prev => ({
      ...prev,
      today: todayCount || 0,
      needsAttention: attentionCount || 0,
    }));
  }, [isSuperAdmin, supabase]);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [fetchActivities, fetchStats]);

  // Resolve attention
  const resolveAttention = async (activityId: string) => {
    const db = supabase as any;
    const { error } = await db
      .from('activity_log')
      .update({
        attention_resolved_at: new Date().toISOString(),
        attention_resolved_by: user?.id,
      })
      .eq('id', activityId);

    if (!error) {
      fetchActivities();
      fetchStats();
      setSelectedActivity(null);
    }
  };

  // Export to CSV
  const exportCSV = async () => {
    const db = supabase as any;
    let query = db
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (category) query = query.eq('action_category', category);
    if (entityType) query = query.eq('entity_type', entityType);

    const { data } = await query;
    if (!data) return;

    const headers = ['Date', 'User', 'Action', 'Category', 'Entity Type', 'Entity', 'Details'];
    const rows = (data as ActivityItem[]).map((a: ActivityItem) => [
      new Date(a.created_at).toISOString(),
      a.user_name || 'System',
      a.action,
      a.action_category,
      a.entity_type,
      a.entity_title || '',
      JSON.stringify(a.details),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (authLoading || !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600"></div>
      </div>
    );
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'story', label: 'Stories' },
    { value: 'transcript', label: 'Transcripts' },
    { value: 'media', label: 'Media' },
    { value: 'consent', label: 'Consent' },
    { value: 'user', label: 'Users' },
    { value: 'organization', label: 'Organizations' },
    { value: 'system', label: 'System' },
  ];

  const entityTypes = [
    { value: '', label: 'All Types' },
    { value: 'story', label: 'Story' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'media_asset', label: 'Media Asset' },
    { value: 'profile', label: 'Profile' },
    { value: 'organization', label: 'Organization' },
    { value: 'project', label: 'Project' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white">
              Audit Log
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Complete activity history and system changes
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-terracotta-600 text-white rounded-lg hover:bg-terracotta-700 transition"
          >
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Total Events</p>
            <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-white">
              {stats.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Today</p>
            <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-white">
              {stats.today.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-5">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Needs Attention</p>
            <p className={`mt-1 text-3xl font-bold ${stats.needsAttention > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-stone-900 dark:text-white'}`}>
              {stats.needsAttention}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-stone-300 dark:border-gray-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white"
            >
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-stone-300 dark:border-gray-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white"
            >
              {entityTypes.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-stone-300 dark:border-gray-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50 transition ${
                      activity.requires_attention && !activity.attention_resolved_at
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-stone-900 dark:text-white">
                          <span className="font-medium">{activity.user_name || 'System'}</span>{' '}
                          <span className="text-stone-500 dark:text-stone-400">{activity.action}</span>{' '}
                          {activity.entity_title && (
                            <span className="font-medium">{activity.entity_title}</span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                          {new Date(activity.created_at).toLocaleString()} | {activity.action_category} | {activity.entity_type}
                        </p>
                      </div>
                      {activity.requires_attention && !activity.attention_resolved_at && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full">
                          Needs attention
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-stone-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, stats.total)} of {stats.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 text-sm bg-stone-100 dark:bg-stone-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * pageSize >= stats.total}
                    className="px-3 py-1 text-sm bg-stone-100 dark:bg-stone-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                  Activity Details
                </h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-stone-400 hover:text-stone-500"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-500 dark:text-stone-400">User</label>
                  <p className="text-stone-900 dark:text-white">{selectedActivity.user_name || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Action</label>
                  <p className="text-stone-900 dark:text-white">{selectedActivity.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Entity</label>
                  <p className="text-stone-900 dark:text-white">
                    {selectedActivity.entity_type}: {selectedActivity.entity_title || selectedActivity.entity_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Timestamp</label>
                  <p className="text-stone-900 dark:text-white">{new Date(selectedActivity.created_at).toLocaleString()}</p>
                </div>

                {selectedActivity.details && Object.keys(selectedActivity.details).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Details</label>
                    <pre className="mt-1 p-2 bg-stone-100 dark:bg-stone-700 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedActivity.details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedActivity.changes && Object.keys(selectedActivity.changes).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Changes</label>
                    <pre className="mt-1 p-2 bg-stone-100 dark:bg-stone-700 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedActivity.changes, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedActivity.requires_attention && !selectedActivity.attention_resolved_at && (
                  <button
                    onClick={() => resolveAttention(selectedActivity.id)}
                    className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

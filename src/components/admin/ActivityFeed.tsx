'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

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
  requires_attention: boolean;
  organization_id: string | null;
}

interface ActivityFeedProps {
  limit?: number;
  category?: string;
  entityType?: string;
  organizationId?: string;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onItemClick?: (item: ActivityItem) => void;
}

export function ActivityFeed({
  limit = 20,
  category,
  entityType,
  organizationId,
  showFilters = false,
  autoRefresh = true,
  refreshInterval = 30000,
  onItemClick,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const supabase = createSupabaseClient();

  const fetchActivities = useCallback(async () => {
    // Note: activity_log table is new and not yet in generated types
    let query = (supabase as any)
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (selectedCategory) {
      query = query.eq('action_category', selectedCategory);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities((data || []) as ActivityItem[]);
    }
    setLoading(false);
  }, [supabase, limit, selectedCategory, entityType, organizationId]);

  useEffect(() => {
    fetchActivities();

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchActivities, autoRefresh, refreshInterval]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = (supabase as any)
      .channel('activity_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        (payload: { new: ActivityItem }) => {
          // Add new activity to the top
          setActivities((prev) => [payload.new, ...prev.slice(0, limit - 1)]);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [supabase, limit]);

  const categories = [
    { value: '', label: 'All' },
    { value: 'story', label: 'Stories' },
    { value: 'transcript', label: 'Transcripts' },
    { value: 'media', label: 'Media' },
    { value: 'consent', label: 'Consent' },
    { value: 'user', label: 'Users' },
    { value: 'organization', label: 'Organizations' },
    { value: 'system', label: 'System' },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                selectedCategory === cat.value
                  ? 'bg-terracotta-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-8">
            No activity to show
          </p>
        ) : (
          activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onClick={onItemClick ? () => onItemClick(activity) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
  onClick,
}: {
  activity: ActivityItem;
  onClick?: () => void;
}) {
  const timeAgo = getTimeAgo(activity.created_at);
  const icon = getActivityIcon(activity.action_category);
  const actionColor = getActionColor(activity.action);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition ${
        activity.requires_attention
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
          : 'hover:bg-stone-50 dark:hover:bg-stone-700/50'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-900 dark:text-white">
          <span className="font-medium">{activity.user_name || 'System'}</span>{' '}
          <span className={`${actionColor}`}>{activity.action}</span>{' '}
          {activity.entity_title && (
            <>
              <span className="text-stone-500 dark:text-stone-400">
                {activity.entity_type}:
              </span>{' '}
              <span className="font-medium">{activity.entity_title}</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-stone-500 dark:text-stone-400">{timeAgo}</span>
          {activity.requires_attention && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full">
              Needs attention
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(category: string): string {
  const icons: Record<string, string> = {
    story: '📖',
    transcript: '📝',
    media: '🎬',
    consent: '✅',
    user: '👤',
    organization: '🏢',
    system: '⚙️',
    project: '📁',
    review: '👁️',
  };
  return icons[category] || '📌';
}

function getActionColor(action: string): string {
  if (action.includes('create') || action.includes('add')) {
    return 'text-green-600 dark:text-green-400';
  }
  if (action.includes('delete') || action.includes('remove')) {
    return 'text-red-600 dark:text-red-400';
  }
  if (action.includes('update') || action.includes('edit')) {
    return 'text-sage-600 dark:text-sage-400';
  }
  return 'text-stone-600 dark:text-stone-400';
}

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

export default ActivityFeed;

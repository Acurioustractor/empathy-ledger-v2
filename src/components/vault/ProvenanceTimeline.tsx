'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  PenLine,
  Share2,
  Ban,
  Shield,
  ShieldCheck,
  ShieldOff,
  Archive,
  ArchiveRestore,
  Eye,
  Code2,
  UserCheck,
  Download,
  Trash2,
  Clock,
  History
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface AuditLogEntry {
  id: string
  action: string
  actionCategory?: string
  entityType: string
  entityId: string
  actorId?: string
  actorType?: string
  changeSummary?: string
  previousState?: any
  newState?: any
  createdAt: string
}

interface ProvenanceTimelineProps {
  storyId: string
  storyTitle?: string
  auditLogs: AuditLogEntry[]
  isLoading?: boolean
  className?: string
}

const actionConfig: Record<string, {
  icon: React.ElementType
  label: string
  color: string
  bgColor: string
}> = {
  create: {
    icon: PenLine,
    label: 'Created',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950/30'
  },
  update: {
    icon: PenLine,
    label: 'Updated',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/30'
  },
  share: {
    icon: Share2,
    label: 'Shared',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950/30'
  },
  revoke: {
    icon: Ban,
    label: 'Revoked',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30'
  },
  consent_grant: {
    icon: ShieldCheck,
    label: 'Consent Granted',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950/30'
  },
  consent_withdraw: {
    icon: ShieldOff,
    label: 'Consent Withdrawn',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30'
  },
  consent_verify: {
    icon: Shield,
    label: 'Consent Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950/30'
  },
  archive: {
    icon: Archive,
    label: 'Archived',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950/30'
  },
  restore: {
    icon: ArchiveRestore,
    label: 'Restored',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950/30'
  },
  view: {
    icon: Eye,
    label: 'Viewed',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-950/30'
  },
  token_generate: {
    icon: Code2,
    label: 'Embed Token Generated',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950/30'
  },
  token_revoke: {
    icon: Ban,
    label: 'Embed Token Revoked',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30'
  },
  elder_approve: {
    icon: UserCheck,
    label: 'Elder Approved',
    color: 'text-sage-600',
    bgColor: 'bg-sage-100 dark:bg-sage-950/30'
  },
  anonymize: {
    icon: Trash2,
    label: 'Anonymized',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30'
  },
  export: {
    icon: Download,
    label: 'Data Exported',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/30'
  }
}

const categoryLabels: Record<string, string> = {
  lifecycle: 'Lifecycle',
  distribution: 'Distribution',
  revocation: 'Revocation',
  consent: 'Consent',
  gdpr: 'GDPR',
  cultural: 'Cultural Review',
  webhook: 'Webhook'
}

export function ProvenanceTimeline({
  storyId,
  storyTitle,
  auditLogs,
  isLoading = false,
  className
}: ProvenanceTimelineProps) {
  const groupedByDate = auditLogs.reduce((groups, log) => {
    const date = new Date(log.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(log)
    return groups
  }, {} as Record<string, AuditLogEntry[]>)

  const dateGroups = Object.entries(groupedByDate).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  )

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Story Timeline
        </CardTitle>
        {storyTitle && (
          <CardDescription>Complete history of "{storyTitle}"</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="h-5 w-5 animate-pulse text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading history...</span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No history available</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {dateGroups.map(([date, logs]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {formatDate(date)}
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-4">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                    {logs.map((log, index) => {
                      const config = actionConfig[log.action] || {
                        icon: PenLine,
                        label: log.action,
                        color: 'text-gray-600',
                        bgColor: 'bg-gray-100 dark:bg-gray-950/30'
                      }
                      const Icon = config.icon

                      return (
                        <div key={log.id} className="relative">
                          {/* Timeline dot */}
                          <div className={cn(
                            'absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center',
                            config.bgColor
                          )}>
                            <Icon className={cn('h-3 w-3', config.color)} />
                          </div>

                          {/* Content */}
                          <div className="ml-2 p-3 rounded-lg border bg-card">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{config.label}</span>
                                  {log.actionCategory && (
                                    <Badge variant="outline" size="sm">
                                      {categoryLabels[log.actionCategory] || log.actionCategory}
                                    </Badge>
                                  )}
                                </div>
                                {log.changeSummary && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {log.changeSummary}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            {/* Actor info */}
                            {log.actorId && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                By: {log.actorType === 'system' ? 'System' : 'User'}
                              </div>
                            )}

                            {/* State changes */}
                            {(log.previousState || log.newState) && (
                              <div className="mt-2 pt-2 border-t text-xs">
                                {log.previousState && log.newState && (
                                  <div className="flex gap-4">
                                    <div className="text-muted-foreground">
                                      <span className="font-medium">Before:</span>{' '}
                                      {summarizeState(log.previousState)}
                                    </div>
                                    <div className="text-muted-foreground">
                                      <span className="font-medium">After:</span>{' '}
                                      {summarizeState(log.newState)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function summarizeState(state: any): string {
  if (!state) return 'N/A'
  if (typeof state === 'string') return state

  const keys = Object.keys(state)
  if (keys.length === 0) return 'N/A'
  if (keys.length === 1) {
    const value = state[keys[0]]
    return `${keys[0]}: ${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}`
  }
  return `${keys.length} fields changed`
}

export default ProvenanceTimeline

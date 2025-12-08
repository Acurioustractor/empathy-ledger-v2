'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Radio,
  Code2,
  Share2,
  Eye,
  Ban,
  AlertTriangle,
  Activity,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VaultSummary } from '@/lib/hooks/useStoryVault'

interface RevokeRadarProps {
  summary?: VaultSummary
  recentActivity?: Array<{
    id: string
    type: 'view' | 'embed' | 'distribution' | 'revocation'
    storyTitle: string
    timestamp: string
    platform?: string
  }>
  onRevokeAll?: () => void
  className?: string
}

export function RevokeRadar({
  summary,
  recentActivity = [],
  onRevokeAll,
  className
}: RevokeRadarProps) {
  const totalActive = (summary?.totalEmbeds || 0) + (summary?.totalDistributions || 0)
  const hasActiveShares = totalActive > 0

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-muted-foreground" />
            Active Shares Radar
          </CardTitle>
          {hasActiveShares && onRevokeAll && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onRevokeAll}
              className="h-8"
            >
              <Ban className="mr-1 h-3 w-3" />
              Pull All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active shares visualization */}
        <div className="relative">
          {/* Radar circles background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-dashed border-muted-foreground/20" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-muted-foreground/20" />
            <div className="absolute w-16 h-16 rounded-full border border-dashed border-muted-foreground/20" />
          </div>

          {/* Stats overlay */}
          <div className="relative grid grid-cols-3 gap-4 py-8">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  summary?.totalEmbeds ? 'bg-purple-100 dark:bg-purple-950/30' : 'bg-muted'
                )}>
                  <Code2 className={cn(
                    'h-6 w-6',
                    summary?.totalEmbeds ? 'text-purple-600' : 'text-muted-foreground'
                  )} />
                </div>
                {(summary?.totalEmbeds || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                    {summary?.totalEmbeds}
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-medium">Embeds</div>
              <div className="text-xs text-muted-foreground">
                {summary?.totalEmbeds || 0} active
              </div>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  summary?.totalDistributions ? 'bg-sky-100 dark:bg-sky-950/30' : 'bg-muted'
                )}>
                  <Share2 className={cn(
                    'h-6 w-6',
                    summary?.totalDistributions ? 'text-sky-600' : 'text-muted-foreground'
                  )} />
                </div>
                {(summary?.totalDistributions || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">
                    {summary?.totalDistributions}
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-medium">Shares</div>
              <div className="text-xs text-muted-foreground">
                {summary?.totalDistributions || 0} active
              </div>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  summary?.totalViews ? 'bg-green-100 dark:bg-green-950/30' : 'bg-muted'
                )}>
                  <Eye className={cn(
                    'h-6 w-6',
                    summary?.totalViews ? 'text-green-600' : 'text-muted-foreground'
                  )} />
                </div>
              </div>
              <div className="mt-2 text-sm font-medium">Views</div>
              <div className="text-xs text-muted-foreground">
                {(summary?.totalViews || 0).toLocaleString()} total
              </div>
            </div>
          </div>
        </div>

        {/* Consent status */}
        {summary && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {summary.storiesWithoutConsent > 0 ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : (
                <Activity className="h-4 w-4 text-success" />
              )}
              <span className="text-sm">Consent Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="success" size="sm">
                    {summary.storiesWithConsent} verified
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Stories with verified storyteller consent</TooltipContent>
              </Tooltip>
              {summary.storiesWithoutConsent > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="warning" size="sm">
                      {summary.storiesWithoutConsent} pending
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Stories awaiting consent verification</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-1">
              {recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-1.5 px-2 text-sm rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    {activity.type === 'view' && <Eye className="h-3 w-3 text-muted-foreground" />}
                    {activity.type === 'embed' && <Code2 className="h-3 w-3 text-purple-500" />}
                    {activity.type === 'distribution' && <Share2 className="h-3 w-3 text-sky-500" />}
                    {activity.type === 'revocation' && <Ban className="h-3 w-3 text-red-500" />}
                    <span className="truncate">{activity.storyTitle}</span>
                    {activity.platform && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" size="sm" className="text-xs">
                            {activity.platform}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Distributed via {activity.platform}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasActiveShares && recentActivity.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Radio className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No active shares</p>
            <p className="text-xs">Your stories are not currently distributed externally</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default RevokeRadar

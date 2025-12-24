'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Code2,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  Rss,
  Mail,
  Webhook,
  ExternalLink,
  Ban,
  Eye,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformStats {
  count: number
  views: number
  active: number
}

interface Distribution {
  id: string
  platform: string
  platformPostId?: string
  distributionUrl?: string
  embedDomain?: string
  status: string
  viewCount: number
  clickCount: number
  lastViewedAt?: string
  revokedAt?: string
  revocationReason?: string
  expiresAt?: string
  createdAt: string
  notes?: string
}

interface DistributionMapProps {
  storyId: string
  storyTitle?: string
  summary?: {
    total: number
    active: number
    revoked: number
    totalViews: number
  }
  byPlatform?: Record<string, PlatformStats>
  distributions?: Distribution[]
  onRevokeDistribution?: (distributionId: string) => void
  onViewDistribution?: (distributionId: string) => void
  className?: string
}

const platformConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  embed: { icon: Code2, label: 'Embed', color: 'text-clay-600' },
  twitter: { icon: Twitter, label: 'Twitter/X', color: 'text-sky-500' },
  facebook: { icon: Facebook, label: 'Facebook', color: 'text-sage-600' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'text-sage-700' },
  website: { icon: Globe, label: 'Website', color: 'text-green-600' },
  blog: { icon: Globe, label: 'Blog', color: 'text-orange-600' },
  api: { icon: Webhook, label: 'API', color: 'text-terracotta-600' },
  rss: { icon: Rss, label: 'RSS Feed', color: 'text-orange-500' },
  newsletter: { icon: Mail, label: 'Newsletter', color: 'text-pink-600' },
  custom: { icon: Globe, label: 'Custom', color: 'text-stone-600' }
}

const statusConfig = {
  active: { icon: CheckCircle2, label: 'Active', variant: 'success' as const },
  revoked: { icon: XCircle, label: 'Revoked', variant: 'destructive' as const },
  expired: { icon: Clock, label: 'Expired', variant: 'secondary' as const },
  flagged: { icon: XCircle, label: 'Flagged', variant: 'warning' as const },
  removed_externally: { icon: XCircle, label: 'Removed', variant: 'destructive' as const }
}

export function DistributionMap({
  storyId,
  storyTitle,
  summary,
  byPlatform,
  distributions = [],
  onRevokeDistribution,
  onViewDistribution,
  className
}: DistributionMapProps) {
  const totalActive = summary?.active || 0
  const totalRevoked = summary?.revoked || 0
  const totalViews = summary?.totalViews || 0

  // Calculate distribution by platform
  const platformEntries = byPlatform
    ? Object.entries(byPlatform).filter(([_, stats]) => stats.count > 0)
    : []

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          Distribution Map
        </CardTitle>
        {storyTitle && (
          <CardDescription>Where "{storyTitle}" is shared</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary stats */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{totalActive}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{totalRevoked}</div>
              <div className="text-xs text-muted-foreground">Revoked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-600">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>
        )}

        {/* Platform breakdown */}
        {platformEntries.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">By Platform</h4>
            <div className="space-y-2">
              {platformEntries.map(([platform, stats]) => {
                const config = platformConfig[platform] || platformConfig.custom
                const Icon = config.icon
                const percentage = summary?.total ? (stats.count / summary.total) * 100 : 0

                return (
                  <div key={platform} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', config.color)} />
                        <span>{config.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{stats.active} active</span>
                        <span>{stats.views.toLocaleString()} views</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Distribution list */}
        {distributions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">All Distributions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {distributions.map((dist) => {
                const platformConf = platformConfig[dist.platform] || platformConfig.custom
                const PlatformIcon = platformConf.icon
                const statusConf = statusConfig[dist.status as keyof typeof statusConfig] || statusConfig.active
                const StatusIcon = statusConf.icon

                return (
                  <div
                    key={dist.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      dist.status !== 'active' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <PlatformIcon className={cn('h-5 w-5', platformConf.color)} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{platformConf.label}</span>
                          <Badge variant={statusConf.variant} size="sm">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConf.label}
                          </Badge>
                        </div>
                        {dist.embedDomain && (
                          <div className="text-xs text-muted-foreground">
                            {dist.embedDomain}
                          </div>
                        )}
                        {dist.distributionUrl && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {dist.distributionUrl}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {dist.viewCount.toLocaleString()}
                        </div>
                        {dist.clickCount > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MousePointerClick className="h-3 w-3" />
                            {dist.clickCount.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {dist.distributionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(dist.distributionUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {dist.status === 'active' && onRevokeDistribution && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => onRevokeDistribution(dist.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {distributions.length === 0 && !byPlatform && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No distributions yet</p>
            <p className="text-sm">Share your story to see it appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DistributionMap

'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConsentStatusBadge } from './ConsentStatusBadge'
import { RevokeConsentDialog } from './RevokeConsentDialog'
import { Globe, Users, Lock, ShieldAlert, BarChart3, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type ConsentStatus = 'approved' | 'pending' | 'revoked' | 'expired'
type CulturalPermissionLevel = 'public' | 'community' | 'restricted' | 'sacred'

interface ConsentStatusCardProps {
  consentId: string
  storyId: string
  storyTitle: string
  siteName: string
  siteSlug: string
  siteLogoUrl?: string
  siteDomains: string[]
  status: ConsentStatus
  culturalPermissionLevel: CulturalPermissionLevel
  createdAt: string
  viewCount?: number
  lastAccessedAt?: string | null
  onRevoked?: () => void
  className?: string
}

const culturalLevels = {
  public: {
    color: 'text-sage-700',
    bgColor: 'bg-sage-50',
    borderColor: 'border-sage-200',
    icon: Globe,
    label: 'Public',
    description: 'Safe to share widely'
  },
  community: {
    color: 'text-clay-700',
    bgColor: 'bg-clay-50',
    borderColor: 'border-clay-200',
    icon: Users,
    label: 'Community',
    description: 'Indigenous communities only'
  },
  restricted: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Lock,
    label: 'Restricted',
    description: 'Requires elder approval'
  },
  sacred: {
    color: 'text-ember-700',
    bgColor: 'bg-ember-50',
    borderColor: 'border-ember-200',
    icon: ShieldAlert,
    label: 'Sacred',
    description: 'Not for external sharing'
  }
} as const

export function ConsentStatusCard({
  consentId,
  storyId,
  storyTitle,
  siteName,
  siteSlug,
  siteLogoUrl,
  siteDomains,
  status,
  culturalPermissionLevel,
  createdAt,
  viewCount = 0,
  lastAccessedAt,
  onRevoked,
  className
}: ConsentStatusCardProps) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const culturalConfig = culturalLevels[culturalPermissionLevel]
  const CulturalIcon = culturalConfig.icon

  const canRevoke = status === 'approved' || status === 'pending'

  return (
    <>
      <Card className={cn('transition-all hover:shadow-md', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={`${siteName} logo`}
                  className="h-10 w-10 rounded-md object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-lg font-semibold text-muted-foreground">
                    {siteName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{siteName}</h3>
                <p className="text-sm text-muted-foreground">
                  {siteDomains[0] || `${siteSlug}.org`}
                </p>
              </div>
            </div>
            <ConsentStatusBadge status={status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Story title */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Story</p>
            <p className="text-sm mt-1">{storyTitle}</p>
          </div>

          {/* Cultural permission level */}
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border',
              culturalConfig.bgColor,
              culturalConfig.borderColor
            )}
          >
            <CulturalIcon className={cn('h-4 w-4', culturalConfig.color)} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', culturalConfig.color)}>
                {culturalConfig.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {culturalConfig.description}
              </p>
            </div>
          </div>

          {/* Created date */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Consent granted
            </p>
            <p className="text-sm mt-1">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>

          {/* Usage stats (if active) */}
          {status === 'approved' && (
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{viewCount}</span>
                <span className="text-muted-foreground">views</span>
              </div>
              {lastAccessedAt && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-sm text-muted-foreground">
                    Last accessed{' '}
                    {formatDistanceToNow(new Date(lastAccessedAt), { addSuffix: true })}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Revoked message */}
          {status === 'revoked' && (
            <div className="rounded-lg bg-sky-50 p-3 border border-sky-200">
              <p className="text-sm text-sky-900">
                ✨ You revoked access to this story. {siteName} can no longer
                display it.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              // TODO: Navigate to story analytics page
              window.location.href = `/stories/${storyId}/analytics`
            }}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>

          {canRevoke && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-ember-700 hover:bg-ember-50 hover:text-ember-900 hover:border-ember-300"
              onClick={() => setShowRevokeDialog(true)}
            >
              Revoke Access
            </Button>
          )}

          {siteDomains.length > 0 && status === 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={`https://${siteDomains[0]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>

      <RevokeConsentDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        consentId={consentId}
        siteName={siteName}
        storyTitle={storyTitle}
        onRevoked={onRevoked}
      />
    </>
  )
}

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Check, Crown, Clock, AlertCircle } from 'lucide-react'
import PermissionTierBadge from './permission-tier-badge'
import { PermissionTier, needsConsentRenewal } from '@/types/database/permission-tiers'
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  permissionTier: PermissionTier
  elderReviewed?: boolean
  elderReviewedAt?: string | null
  consentVerifiedAt?: string | null
  status?: string
  className?: string
  variant?: 'full' | 'compact'
}

export default function TrustBadges({
  permissionTier,
  elderReviewed = false,
  elderReviewedAt,
  consentVerifiedAt,
  status,
  className,
  variant = 'full',
}: TrustBadgesProps) {
  const isPublic = permissionTier === 'public' || permissionTier === 'archive'
  const isPublished = status === 'published'
  const consentNeedsRenewal = needsConsentRenewal(consentVerifiedAt || null)

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
        <PermissionTierBadge tier={permissionTier} size="sm" />
        {elderReviewed && <ElderBadge size="sm" />}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Permission Tier */}
      <PermissionTierBadge tier={permissionTier} />

      {/* Elder Reviewed */}
      {elderReviewed && (
        <ElderBadge elderReviewedAt={elderReviewedAt} />
      )}

      {/* Public Sharing Approved */}
      {isPublic && isPublished && (
        <ConsentBadge />
      )}

      {/* Recently Updated */}
      {consentVerifiedAt && !consentNeedsRenewal && (
        <RecentlyVerifiedBadge verifiedAt={consentVerifiedAt} />
      )}

      {/* Consent Needs Renewal */}
      {isPublic && consentNeedsRenewal && (
        <ConsentRenewalBadge />
      )}
    </div>
  )
}

function ElderBadge({
  elderReviewedAt,
  size = 'md'
}: {
  elderReviewedAt?: string | null
  size?: 'sm' | 'md'
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
        sizeClasses[size]
      )}
    >
      <Crown className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      Elder Reviewed
    </Badge>
  )

  if (!elderReviewedAt) {
    return badge
  }

  const reviewDate = new Date(elderReviewedAt)
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(reviewDate)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Reviewed and approved by community Elders
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formattedDate}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ConsentBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 text-sm px-2.5 py-1"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Public Sharing Approved
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Storyteller has approved this story for public sharing
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function RecentlyVerifiedBadge({ verifiedAt }: { verifiedAt: string }) {
  const verifiedDate = new Date(verifiedAt)
  const now = new Date()
  const daysAgo = Math.floor((now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="bg-sage-100 text-sage-800 border-sage-200 dark:bg-sage-900/30 dark:text-sage-300 dark:border-sage-700 text-sm px-2.5 py-1"
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            Updated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Consent last verified {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(verifiedDate)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ConsentRenewalBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 text-sm px-2.5 py-1"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Consent Needs Renewal
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            It's been over 30 days since consent was last verified.
            <br />
            Please review and confirm your sharing preferences.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

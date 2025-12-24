'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Shield, ExternalLink } from 'lucide-react'
import { PermissionTier } from '@/types/database/permission-tiers'
import { cn } from '@/lib/utils'

interface ConsentFooterProps {
  storyId: string
  storyTitle: string
  storytellerName: string
  permissionTier: PermissionTier
  consentVerifiedAt: string
  elderReviewed?: boolean
  sharedBy?: {
    name: string
    id: string
  }
  className?: string
}

export default function ConsentFooter({
  storyId,
  storyTitle,
  storytellerName,
  permissionTier,
  consentVerifiedAt,
  elderReviewed = false,
  sharedBy,
  className,
}: ConsentFooterProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(consentVerifiedAt))

  const isArchive = permissionTier === 'archive'
  const isPublic = permissionTier === 'public' || isArchive

  return (
    <footer
      className={cn(
        'border-t border-border bg-muted/30 px-6 py-8',
        className
      )}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main consent statement */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              This Story is Shared with Permission
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong className="text-foreground">{storytellerName}</strong> approved
                  this story for {permissionTier === 'archive' ? 'permanent archival' : 'public sharing'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p>
                  Last consent verified: <strong className="text-foreground">{formattedDate}</strong>
                </p>
              </div>
              {!isArchive && (
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p>
                    Can be withdrawn at any time by the storyteller
                  </p>
                </div>
              )}
              {elderReviewed && (
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p>
                    Reviewed and approved by community Elders for cultural appropriateness
                  </p>
                </div>
              )}
              {sharedBy && (
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p>
                    Shared by: <strong className="text-foreground">{sharedBy.name}</strong>{' '}
                    (with permission)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sharing guidelines */}
        {isPublic && (
          <div className="border-t border-border pt-6">
            <h4 className="font-semibold text-foreground mb-3 text-sm">
              When Sharing This Story Elsewhere:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>
                  Include attribution: "{storytellerName}, shared with permission via Empathy Ledger"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>
                  Link back to the original story or Empathy Ledger
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>
                  Include this consent notice and date
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                <span>
                  Do not edit the story or take quotes out of context
                </span>
              </li>
              {!isArchive && (
                <li className="flex items-start gap-2">
                  <span className="text-foreground">•</span>
                  <span>
                    Remove immediately if the storyteller withdraws consent
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Archive notice */}
        {isArchive && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Historical Archive:</strong> This story is part of a permanent public
              record. The storyteller has given explicit consent for permanent archival and
              understands that this story cannot be withdrawn.
            </p>
          </div>
        )}

        {/* Learn more */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Empathy Ledger is committed to ethical storytelling
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/ethical-guidelines"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Learn about our ethical storytelling practices
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Report concerns: <a href="mailto:safety@empathy-ledger.org" className="text-primary hover:underline">safety@empathy-ledger.org</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Simple variant for embedded/compact views
 */
export function ConsentFooterCompact({
  storytellerName,
  consentVerifiedAt,
  className,
}: {
  storytellerName: string
  consentVerifiedAt: string
  className?: string
}) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(new Date(consentVerifiedAt))

  return (
    <div
      className={cn(
        'border-t border-border bg-muted/30 px-4 py-3 text-center',
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        <Check className="w-3 h-3 inline-block mr-1 text-green-600 dark:text-green-400" />
        Story shared with permission from <strong>{storytellerName}</strong> (Consent verified {formattedDate})
      </p>
    </div>
  )
}

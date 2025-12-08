'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  Share2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Archive,
  MoreVertical,
  ExternalLink,
  Ban,
  Code2,
  Globe,
  Lock,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VaultStory } from '@/lib/hooks/useStoryVault'

interface StoryOwnershipCardProps {
  story: VaultStory
  isSelected?: boolean
  onSelect?: (storyId: string) => void
  onViewDetails?: (storyId: string) => void
  onRevoke?: (storyId: string) => void
  onArchive?: (storyId: string) => void
  onRestore?: (storyId: string) => void
  onManageEmbeds?: (storyId: string) => void
  onManageDistributions?: (storyId: string) => void
}

const privacyIcons = {
  public: Globe,
  community: Users,
  organization: Building,
  private: Lock
}

const privacyLabels = {
  public: 'Public',
  community: 'Community',
  organization: 'Organization',
  private: 'Private'
}

export function StoryOwnershipCard({
  story,
  isSelected = false,
  onSelect,
  onViewDetails,
  onRevoke,
  onArchive,
  onRestore,
  onManageEmbeds,
  onManageDistributions
}: StoryOwnershipCardProps) {
  const PrivacyIcon = privacyIcons[story.privacyLevel as keyof typeof privacyIcons] || Lock

  const getConsentStatus = () => {
    if (!story.hasConsent) {
      return { icon: ShieldAlert, label: 'No Consent', variant: 'destructive' as const }
    }
    if (!story.consentVerified) {
      return { icon: Shield, label: 'Pending Verification', variant: 'warning' as const }
    }
    return { icon: ShieldCheck, label: 'Verified', variant: 'success' as const }
  }

  const consentStatus = getConsentStatus()
  const ConsentIcon = consentStatus.icon

  const hasActiveDistributions = story.activeEmbeds > 0 || story.activeDistributions > 0

  return (
    <Card
      variant="story"
      size="sm"
      className={cn(
        'relative transition-all duration-200',
        story.isArchived && 'opacity-60',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(story.id)}
            aria-label={`Select ${story.title}`}
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className={cn('flex-1', onSelect && 'ml-8')}>
            <CardTitle className="text-lg line-clamp-1">
              {story.title || 'Untitled Story'}
            </CardTitle>
            {story.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {story.excerpt}
              </p>
            )}
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(story.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onManageEmbeds && story.embedsEnabled && (
                <DropdownMenuItem onClick={() => onManageEmbeds(story.id)}>
                  <Code2 className="mr-2 h-4 w-4" />
                  Manage Embeds ({story.activeEmbeds})
                </DropdownMenuItem>
              )}
              {onManageDistributions && (
                <DropdownMenuItem onClick={() => onManageDistributions(story.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Manage Distributions ({story.activeDistributions})
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {hasActiveDistributions && onRevoke && (
                <DropdownMenuItem
                  onClick={() => onRevoke(story.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Revoke All
                </DropdownMenuItem>
              )}
              {!story.isArchived && onArchive && (
                <DropdownMenuItem onClick={() => onArchive(story.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Story
                </DropdownMenuItem>
              )}
              {story.isArchived && onRestore && (
                <DropdownMenuItem onClick={() => onRestore(story.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Restore Story
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {story.isArchived && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" size="sm">
                  <Archive className="mr-1 h-3 w-3" />
                  Archived
                </Badge>
              </TooltipTrigger>
              <TooltipContent>This story has been archived and is not visible to others</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={consentStatus.variant} size="sm">
                <ConsentIcon className="mr-1 h-3 w-3" />
                {consentStatus.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {consentStatus.label === 'Consent Granted'
                ? 'Storyteller has provided explicit consent for this story'
                : consentStatus.label === 'Consent Pending'
                ? 'Waiting for storyteller consent to share this story'
                : 'Consent has been revoked for this story'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" size="sm">
                <PrivacyIcon className="mr-1 h-3 w-3" />
                {privacyLabels[story.privacyLevel as keyof typeof privacyLabels] || 'Unknown'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {story.privacyLevel === 'public' && 'Anyone can view this story'}
              {story.privacyLevel === 'private' && 'Only you can view this story'}
              {story.privacyLevel === 'community' && 'Only community members can view this story'}
              {story.privacyLevel === 'organization' && 'Only organization members can view this story'}
            </TooltipContent>
          </Tooltip>
          {story.elderApprovalStatus === 'approved' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="sage-soft" size="sm">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Elder Approved
                </Badge>
              </TooltipTrigger>
              <TooltipContent>This story has been reviewed and approved by a community elder</TooltipContent>
            </Tooltip>
          )}
          {story.elderApprovalStatus === 'pending' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="warning" size="sm">
                  <Clock className="mr-1 h-3 w-3" />
                  Awaiting Elder Review
                </Badge>
              </TooltipTrigger>
              <TooltipContent>This story is waiting to be reviewed by a community elder</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Distribution stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-semibold text-clay-700 dark:text-clay-300">
              {story.activeEmbeds}
            </div>
            <div className="text-xs text-muted-foreground">Embeds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-sage-700 dark:text-sage-300">
              {story.activeDistributions}
            </div>
            <div className="text-xs text-muted-foreground">Shares</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-sky-700 dark:text-sky-300">
              {story.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
        </div>

        {/* Sharing controls summary */}
        <div className="flex items-center justify-between pt-2 border-t text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Code2 className={cn(
                'h-4 w-4',
                story.embedsEnabled ? 'text-success' : 'text-muted-foreground'
              )} />
              <span className="text-muted-foreground">
                Embeds {story.embedsEnabled ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className={cn(
                'h-4 w-4',
                story.sharingEnabled ? 'text-success' : 'text-muted-foreground'
              )} />
              <span className="text-muted-foreground">
                Sharing {story.sharingEnabled ? 'On' : 'Off'}
              </span>
            </div>
          </div>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(story.id)}
              className="h-7 text-xs"
            >
              Details
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StoryOwnershipCard

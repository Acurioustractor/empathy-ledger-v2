'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  PermissionTier,
  getPermissionTierConfig,
  getPermissionTierClassName,
} from '@/types/database/permission-tiers'
import { cn } from '@/lib/utils'

interface PermissionTierBadgeProps {
  tier: PermissionTier
  showTooltip?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PermissionTierBadge({
  tier,
  showTooltip = true,
  className,
  size = 'md',
}: PermissionTierBadgeProps) {
  const config = getPermissionTierConfig(tier)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        getPermissionTierClassName(tier),
        sizeClasses[size],
        className
      )}
    >
      <span className="mr-1">{config.emoji}</span>
      <span>{config.label}</span>
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">{config.label}</p>
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

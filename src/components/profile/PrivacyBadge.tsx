'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Users, Lock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PrivacyLevel = 'public' | 'community' | 'private' | 'restricted'

interface PrivacyBadgeProps {
  level: PrivacyLevel
  className?: string
  showLabel?: boolean
}

const privacyConfig = {
  public: {
    icon: Globe,
    label: 'Public',
    description: 'Visible to everyone',
    className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  },
  community: {
    icon: Users,
    label: 'Community',
    description: 'Visible to community members',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  private: {
    icon: Lock,
    label: 'Private',
    description: 'Only visible to you',
    className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  },
  restricted: {
    icon: EyeOff,
    label: 'Restricted',
    description: 'Only with permission',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
}

export function PrivacyBadge({
  level,
  className,
  showLabel = true
}: PrivacyBadgeProps) {
  const config = privacyConfig[level]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      title={config.description}
      aria-label={`Privacy level: ${config.label}. ${config.description}`}
    >
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {showLabel && config.label}
    </Badge>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CulturalProtocolStatus = 'active' | 'review-required' | 'pending' | 'none'

interface ProtocolsBadgeProps {
  status: CulturalProtocolStatus
  linkToSettings?: boolean
  settingsUrl?: string
  className?: string
  showLabel?: boolean
}

const protocolConfig = {
  active: {
    icon: Shield,
    label: 'Cultural Protocols Active',
    description: 'Cultural protocols and consent preferences are configured',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  'review-required': {
    icon: AlertTriangle,
    label: 'Elder Review Required',
    description: 'Content requires Elder review before publishing',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  pending: {
    icon: Eye,
    label: 'Protocols Pending',
    description: 'Cultural protocols are being reviewed',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  none: {
    icon: CheckCircle2,
    label: 'No Protocols Set',
    description: 'Cultural protocols have not been configured',
    className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  },
}

export function ProtocolsBadge({
  status,
  linkToSettings = false,
  settingsUrl,
  className,
  showLabel = true
}: ProtocolsBadgeProps) {
  const config = protocolConfig[status]
  const Icon = config.icon

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        linkToSettings && 'cursor-pointer',
        className
      )}
      title={config.description}
      aria-label={`Cultural protocols status: ${config.label}. ${config.description}`}
    >
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {showLabel && config.label}
    </Badge>
  )

  if (linkToSettings && settingsUrl) {
    return (
      <Link href={settingsUrl} className="inline-block">
        {badgeContent}
      </Link>
    )
  }

  return badgeContent
}
